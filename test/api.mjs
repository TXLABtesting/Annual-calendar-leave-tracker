// Exercises the Vercel serverless handlers against a stand-in Upstash REST
// server, so the storage layer is verified without needing a real deployment.
import { createServer } from 'node:http'

// --- fake Upstash: implements only the commands _store.js actually issues ---
const hash = new Map()
const plain = new Map()

const fake = createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    const [cmd, key, ...rest] = JSON.parse(raw)
    let result
    switch (cmd.toUpperCase()) {
      case 'HGETALL':
        result = [...(hash.get(key) ?? new Map())].flat()
        break
      case 'HSET':
        if (!hash.has(key)) hash.set(key, new Map())
        hash.get(key).set(rest[0], rest[1])
        result = 1
        break
      case 'HGET':
        result = hash.get(key)?.get(rest[0]) ?? null
        break
      case 'HDEL':
        result = hash.get(key)?.delete(rest[0]) ? 1 : 0
        break
      case 'SETNX':
        if (plain.has(key)) result = 0
        else { plain.set(key, rest[0]); result = 1 }
        break
      default:
        return res.writeHead(400).end(JSON.stringify({ error: `unsupported ${cmd}` }))
    }
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ result }))
  })
})

await new Promise((r) => fake.listen(9911, r))
process.env.KV_REST_API_URL = 'http://localhost:9911'
process.env.KV_REST_API_TOKEN = 'test-token'

// Import AFTER env is set — _store.js reads it at module load.
const { default: leavesHandler } = await import('../api/leaves.js')
const { default: leafHandler } = await import('../api/leaves/[id].js')

// --- minimal req/res doubles matching what Vercel passes in ---
const call = async (handler, { method = 'GET', body, query = {} } = {}) => {
  const res = {
    _status: 200, _body: '', _headers: {},
    status(s) { this._status = s; return this },
    setHeader(k, v) { this._headers[k] = v; return this },
    send(b) { this._body = b; return this },
  }
  await handler({ method, body, query, headers: {} }, res)
  return { status: res._status, body: res._body ? JSON.parse(res._body) : null }
}

const errs = []
const check = async (label, fn, expected) => {
  let got
  try { got = await fn() } catch (e) { got = `threw: ${e.message}` }
  const ok = typeof expected === 'function' ? expected(got) : JSON.stringify(got) === JSON.stringify(expected)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: ${JSON.stringify(got)}`)
  if (!ok) errs.push(`${label} → ${JSON.stringify(got)}`)
}

await check('GET seeds on first read', async () => (await call(leavesHandler)).body.leaves.length, 5)
await check('second GET does not reseed', async () => (await call(leavesHandler)).body.leaves.length, 5)
await check('results are date-sorted', async () => {
  const { leaves } = (await call(leavesHandler)).body
  return leaves.map((l) => l.start).every((d, i, a) => i === 0 || a[i - 1] <= d)
}, true)

const created = await call(leavesHandler, {
  method: 'POST', body: { empId: 'maitha', start: '2026-10-05', end: '2026-10-09', note: 'test' },
})
await check('POST returns 201 with a uuid', () => created.status, 201)
await check('POST id is a uuid', () => /^[0-9a-f-]{36}$/.test(created.body.leave.id), true)
await check('POST is visible in GET', async () => (await call(leavesHandler)).body.leaves.length, 6)

await check('POST rejects unknown member', async () =>
  (await call(leavesHandler, { method: 'POST', body: { empId: 'ghost', start: '2026-01-01', end: '2026-01-02' } })).body.error,
  'Unknown team member.')
await check('POST rejects impossible date', async () =>
  (await call(leavesHandler, { method: 'POST', body: { empId: 'ali', start: '2026-02-31', end: '2026-02-31' } })).body.error,
  '2026-02-31 is not a real date.')
await check('POST accepts a string body', async () =>
  (await call(leavesHandler, { method: 'POST', body: JSON.stringify({ empId: 'riad', start: '2026-03-02', end: '2026-03-03' }) })).status,
  201)

const id = created.body.leave.id
await check('PATCH updates dates', async () =>
  (await call(leafHandler, { method: 'PATCH', query: { id }, body: { end: '2026-10-12' } })).body.leave.end,
  '2026-10-12')
await check('PATCH validates the merged result', async () =>
  (await call(leafHandler, { method: 'PATCH', query: { id }, body: { start: '2026-11-01' } })).body.error,
  'end must be on or after start.')
await check('PATCH on a missing id is 404', async () =>
  (await call(leafHandler, { method: 'PATCH', query: { id: 'nope' }, body: {} })).status, 404)

await check('DELETE removes it', async () =>
  (await call(leafHandler, { method: 'DELETE', query: { id } })).body.ok, true)
await check('DELETE is reflected in GET', async () =>
  (await call(leavesHandler)).body.leaves.some((l) => l.id === id), false)
await check('DELETE on a missing id is 404', async () =>
  (await call(leafHandler, { method: 'DELETE', query: { id: 'nope' } })).status, 404)

await check('unsupported method is 405', async () => (await call(leavesHandler, { method: 'PUT' })).status, 405)

// With no database configured the app must say so, not fail opaquely.
delete process.env.KV_REST_API_URL
delete process.env.KV_REST_API_TOKEN
const { default: unconfigured } = await import('../api/leaves.js')
const missing = await call(unconfigured)
await check('missing database returns 503', () => missing.status, 503)
await check('missing database explains the fix', () => missing.body.error,
  (m) => typeof m === 'string' && m.includes('Storage'))

console.log(errs.length ? `\n${errs.length} PROBLEM(S):\n` + errs.join('\n') : '\nAll checks passed.')
fake.close()
process.exit(errs.length ? 1 : 0)
