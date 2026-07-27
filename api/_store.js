// Storage for the Vercel deployment.
//
// Vercel runs serverless functions: no persistent disk, and no long-lived
// process. SQLite (as used by server/index.mjs for self-hosting) cannot work
// here — the filesystem is thrown away between invocations. So the calendar
// lives in Redis instead.
//
// Talks to Upstash over its REST API with plain fetch, so this stays
// dependency-free. Each leave is one field in a Redis hash, which makes writes
// atomic per entry: two people booking at the same moment can't clobber each
// other the way a read-modify-write of one big JSON blob would.

import { randomUUID } from 'node:crypto'
import { SEED } from '../shared/leave-rules.mjs'

const KEY = 'leave-calendar-2026'
const SEEDED_KEY = 'leave-calendar-2026:seeded'

// Vercel's KV integration and a direct Upstash connection use different names.
// Read at call time, not module load: env vars are injected at runtime, and a
// module-scope read would bake in whatever existed when the bundle first ran.
const credentials = () => ({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN,
})

export class StoreError extends Error {}

export const isConfigured = () => {
  const { url, token } = credentials()
  return Boolean(url && token)
}

async function command(...args) {
  const { url, token } = credentials()
  if (!url || !token) {
    throw new StoreError(
      'No database is connected. In Vercel: Storage → create a Redis (Upstash) store → connect it to this project, then redeploy.',
    )
  }
  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(args),
    })
  } catch {
    throw new StoreError('Could not reach the database.')
  }
  if (!response.ok) {
    throw new StoreError(`Database error (${response.status}).`)
  }
  const body = await response.json()
  if (body.error) throw new StoreError(`Database error: ${body.error}`)
  return body.result
}

const parse = (raw) => {
  try {
    return JSON.parse(raw)
  } catch {
    return null // A corrupt field shouldn't take down the whole calendar.
  }
}

export async function listLeaves() {
  await seedOnce()
  const flat = (await command('HGETALL', KEY)) ?? []
  const leaves = []
  // HGETALL returns [field, value, field, value, …].
  for (let i = 1; i < flat.length; i += 2) {
    const leave = parse(flat[i])
    if (leave) leaves.push(leave)
  }
  return leaves.sort((a, b) => (a.start === b.start ? a.empId.localeCompare(b.empId) : a.start < b.start ? -1 : 1))
}

export async function addLeave({ empId, start, end, note = '', createdBy = null }) {
  const now = new Date().toISOString()
  const leave = { id: randomUUID(), empId, start, end, note }
  // status and createdBy are stored but unused — they're the seam for adding
  // approvals and per-user permissions without migrating existing records.
  await command('HSET', KEY, leave.id, JSON.stringify({ ...leave, status: 'approved', createdBy, createdAt: now, updatedAt: now }))
  return leave
}

export async function getLeave(id) {
  const raw = await command('HGET', KEY, id)
  return raw ? parse(raw) : null
}

export async function updateLeave(id, patch) {
  const current = await getLeave(id)
  if (!current) return null
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
  await command('HSET', KEY, id, JSON.stringify(next))
  return { id, empId: next.empId, start: next.start, end: next.end, note: next.note }
}

/** Returns false when the id wasn't there. */
export async function removeLeave(id) {
  return (await command('HDEL', KEY, id)) > 0
}

/**
 * Loads the sample calendar exactly once, ever. SETNX makes it atomic, so
 * concurrent cold starts can't each seed and produce duplicates — and a team
 * that deliberately empties the calendar doesn't get the samples back.
 */
async function seedOnce() {
  const claimed = await command('SETNX', SEEDED_KEY, new Date().toISOString())
  if (claimed !== 1) return
  for (const leave of SEED) await addLeave(leave)
}

/** Shared JSON response helper. */
export function send(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8')
  res.send(JSON.stringify(body))
}

/** Wraps a handler so store failures become clean 4xx/5xx JSON, not stack traces. */
export function guard(handler) {
  return async (req, res) => {
    // No caching: this data changes constantly and every client polls it.
    res.setHeader('cache-control', 'no-store')
    try {
      await handler(req, res)
    } catch (error) {
      if (error instanceof StoreError) return send(res, 503, { error: error.message })
      console.error(error)
      send(res, 500, { error: 'Server error.' })
    }
  }
}
