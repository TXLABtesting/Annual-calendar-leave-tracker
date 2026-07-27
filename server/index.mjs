// Shared leave calendar API.
//
// Zero dependencies on purpose: node:http and node:sqlite are both built in, so
// deploying this needs nothing from npm — no install step, no supply chain, no
// native build. Node 22+.
//
// One process serves both the JSON API and the built frontend, so the whole app
// is a single link. Clients hold an SSE connection and receive the full leave
// list whenever anything changes; with a team-sized dataset that is far simpler
// than diffing and removes any chance of clients drifting apart.

import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const PORT = Number(process.env.PORT ?? 8787)
const DB_PATH = process.env.DB_PATH ?? join(HERE, 'data', 'leave.db')
const STATIC_DIR = resolve(process.env.STATIC_DIR ?? join(HERE, '..', 'app', 'dist'))

// Same roster file the frontend imports, so the two can't drift. The server
// uses it to reject leave for people who don't exist rather than storing rows
// nothing can render.
const ROSTER_PATH = process.env.ROSTER_PATH ?? join(HERE, '..', 'shared', 'team.json')
const MEMBER_IDS = new Set(
  JSON.parse(readFileSync(ROSTER_PATH, 'utf8')).members.map((member) => member.id),
)

const SEED = [
  { empId: 'hana', start: '2026-02-09', end: '2026-02-13', note: 'Annual family travel' },
  { empId: 'mohammed', start: '2026-04-06', end: '2026-04-10', note: '' },
  { empId: 'khawla', start: '2026-07-13', end: '2026-07-24', note: 'Summer leave' },
  { empId: 'ayoub', start: '2026-07-16', end: '2026-07-17', note: '' },
  { empId: 'faisal', start: '2026-09-21', end: '2026-09-25', note: '' },
]

// ---------------------------------------------------------------- database ---

import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
mkdirSync(dirname(DB_PATH), { recursive: true })

const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode = WAL')

// `status` and `created_by` are unused today. They exist now so adding
// approvals and per-user permissions later is a code change, not a migration
// against live data.
db.exec(`
  CREATE TABLE IF NOT EXISTS leaves (
    id          TEXT PRIMARY KEY,
    emp_id      TEXT NOT NULL,
    start_date  TEXT NOT NULL,
    end_date    TEXT NOT NULL,
    note        TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'approved',
    created_by  TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS leaves_emp ON leaves (emp_id);
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`)

const getMeta = db.prepare('SELECT value FROM meta WHERE key = ?')
const setMeta = db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')

const insert = db.prepare(`
  INSERT INTO leaves (id, emp_id, start_date, end_date, note, status, created_by, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, 'approved', ?, ?, ?)
`)
const selectAll = db.prepare('SELECT * FROM leaves ORDER BY start_date, emp_id')
const deleteOne = db.prepare('DELETE FROM leaves WHERE id = ?')
const updateOne = db.prepare('UPDATE leaves SET start_date = ?, end_date = ?, note = ?, updated_at = ? WHERE id = ?')

// Seed once, on a genuinely fresh database. Guarded by a flag rather than an
// empty-table check so a team that deliberately deletes everything doesn't get
// the sample data back on next restart.
if (!getMeta.get('seeded')) {
  const now = new Date().toISOString()
  for (const leave of SEED) {
    insert.run(randomUUID(), leave.empId, leave.start, leave.end, leave.note, null, now, now)
  }
  setMeta.run('seeded', now)
  console.log(`[db] seeded ${SEED.length} sample leaves`)
}

const toLeave = (row) => ({
  id: row.id,
  empId: row.emp_id,
  start: row.start_date,
  end: row.end_date,
  note: row.note,
})

const allLeaves = () => selectAll.all().map(toLeave)

// ------------------------------------------------------------- validation ---

const ISO = /^\d{4}-\d{2}-\d{2}$/

/** Returns an error string, or null when the payload is usable. */
function validate(body) {
  if (!body || typeof body !== 'object') return 'Expected a JSON object.'
  const { empId, start, end, note } = body
  if (typeof empId !== 'string' || !MEMBER_IDS.has(empId)) return 'Unknown team member.'
  if (typeof start !== 'string' || !ISO.test(start)) return 'start must be YYYY-MM-DD.'
  if (typeof end !== 'string' || !ISO.test(end)) return 'end must be YYYY-MM-DD.'
  if (start > end) return 'end must be on or after start.'
  if (note != null && typeof note !== 'string') return 'note must be a string.'
  // Cheap guard against dates that parse but aren't real (2026-02-31).
  for (const date of [start, end]) {
    if (new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) return `${date} is not a real date.`
  }
  return null
}

// -------------------------------------------------------------------- SSE ---

/** @type {Set<import('node:http').ServerResponse>} */
const clients = new Set()

function broadcast() {
  const frame = `event: sync\ndata: ${JSON.stringify({ leaves: allLeaves() })}\n\n`
  for (const client of clients) {
    // A client that vanished mid-write is dropped on its 'close' handler; the
    // try here just stops one dead socket from breaking the loop.
    try { client.write(frame) } catch { clients.delete(client) }
  }
}

// ------------------------------------------------------------------ static ---

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

async function serveStatic(req, res, pathname) {
  if (!existsSync(STATIC_DIR)) {
    return send(res, 404, { error: 'Frontend not built. Run `npm run build` in app/.' })
  }
  // normalize + prefix check keeps `../` out of the served tree.
  const target = resolve(join(STATIC_DIR, normalize(decodeURIComponent(pathname))))
  const file = target.startsWith(STATIC_DIR) && existsSync(target) && extname(target)
    ? target
    : join(STATIC_DIR, 'index.html')

  try {
    const body = await readFile(file)
    const type = MIME[extname(file)] ?? 'application/octet-stream'
    // Hashed asset filenames are safe to cache hard; index.html must not be.
    const cache = file.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable'
    res.writeHead(200, { 'content-type': type, 'cache-control': cache })
    res.end(body)
  } catch {
    send(res, 404, { error: 'Not found' })
  }
}

// ------------------------------------------------------------------ routes ---

function send(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(payload) })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 64_000) { reject(new Error('Payload too large.')); req.destroy() }
    })
    req.on('end', () => {
      try { resolveBody(raw ? JSON.parse(raw) : {}) } catch { reject(new Error('Invalid JSON.')) }
    })
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)

  // Same-origin in production; permissive so the app can also run from the Vite
  // dev server on another port.
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-headers', 'content-type')
  res.setHeader('access-control-allow-methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') return res.writeHead(204).end()

  try {
    if (pathname === '/api/health') {
      return send(res, 200, { ok: true, leaves: allLeaves().length })
    }

    if (pathname === '/api/leaves' && req.method === 'GET') {
      return send(res, 200, { leaves: allLeaves() })
    }

    if (pathname === '/api/leaves' && req.method === 'POST') {
      const body = await readBody(req)
      const error = validate(body)
      if (error) return send(res, 400, { error })
      const now = new Date().toISOString()
      const id = randomUUID()
      insert.run(id, body.empId, body.start, body.end, body.note ?? '', body.createdBy ?? null, now, now)
      broadcast()
      return send(res, 201, { leave: { id, empId: body.empId, start: body.start, end: body.end, note: body.note ?? '' } })
    }

    const match = pathname.match(/^\/api\/leaves\/([\w-]+)$/)
    if (match && req.method === 'DELETE') {
      const { changes } = deleteOne.run(match[1])
      if (!changes) return send(res, 404, { error: 'No such leave.' })
      broadcast()
      return send(res, 200, { ok: true })
    }

    if (match && req.method === 'PATCH') {
      const body = await readBody(req)
      const current = selectAll.all().find((row) => row.id === match[1])
      if (!current) return send(res, 404, { error: 'No such leave.' })
      const merged = { empId: current.emp_id, start: body.start ?? current.start_date, end: body.end ?? current.end_date, note: body.note ?? current.note }
      const error = validate(merged)
      if (error) return send(res, 400, { error })
      updateOne.run(merged.start, merged.end, merged.note, new Date().toISOString(), match[1])
      broadcast()
      return send(res, 200, { leave: { id: match[1], ...merged } })
    }

    if (pathname === '/api/stream') {
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        // Stops nginx and friends from buffering the stream into uselessness.
        'x-accel-buffering': 'no',
      })
      res.write(`event: sync\ndata: ${JSON.stringify({ leaves: allLeaves() })}\n\n`)
      clients.add(res)
      // Proxies drop idle connections; a comment every 25s keeps them open.
      const beat = setInterval(() => { try { res.write(': beat\n\n') } catch {} }, 25_000)
      req.on('close', () => { clearInterval(beat); clients.delete(res) })
      return
    }

    if (pathname.startsWith('/api/')) return send(res, 404, { error: 'Unknown endpoint.' })

    if (req.method === 'GET') return serveStatic(req, res, pathname)
    return send(res, 405, { error: 'Method not allowed.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error.'
    const status = /JSON|large/.test(message) ? 400 : 500
    if (status === 500) console.error('[error]', error)
    return send(res, status, { error: message })
  }
})

server.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`)
  console.log(`[server] database ${DB_PATH}`)
  console.log(`[server] serving ${existsSync(STATIC_DIR) ? STATIC_DIR : '(frontend not built yet)'}`)
})

// Close SQLite cleanly so WAL is checkpointed on container shutdown.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    for (const client of clients) { try { client.end() } catch {} }
    server.close(() => { db.close(); process.exit(0) })
  })
}
