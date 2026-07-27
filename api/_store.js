// Storage for the Vercel deployment.
//
// Vercel runs serverless functions: no persistent disk, and no long-lived
// process. SQLite (as used by server/index.mjs for self-hosting) cannot work
// here — the filesystem is thrown away between invocations. So the calendar
// lives in whichever database is connected to the project.
//
// Several are supported because Vercel's Storage tab offers several, and
// picking a different one shouldn't leave the app dead. Whichever is connected
// is detected from its environment variables; no configuration needed.

import { randomUUID } from 'node:crypto'
import { SEED } from '../shared/leave-rules.mjs'
import * as redis from './_drivers/redis.js'
import * as postgres from './_drivers/postgres.js'

const DRIVERS = [redis, postgres]

export class StoreError extends Error {}

const fail = (message) => {
  throw new StoreError(message)
}

export const SETUP_MESSAGE =
  'No database is connected yet. In Vercel: Storage → Create Database → ' +
  'either Redis (Upstash) or Postgres (Neon) → Connect to this project → Redeploy. ' +
  'Vercel Blob and Edge Config are not supported.'

/** Picks the first driver whose environment variables are present. */
function resolveDriver() {
  for (const driver of DRIVERS) {
    const config = driver.detect(process.env)
    if (config) return { ...driver, store: driver.create(config, fail) }
  }
  return null
}

/** Which database is in use, for diagnostics. */
export const activeDriver = () => resolveDriver()?.label ?? null

const store = () => resolveDriver()?.store ?? fail(SETUP_MESSAGE)

const parse = (raw) => {
  try {
    return JSON.parse(raw)
  } catch {
    return null // A corrupt record shouldn't take down the whole calendar.
  }
}

/** Only the fields clients care about — internal bookkeeping stays server-side. */
const shape = ({ id, empId, start, end, note }) => ({ id, empId, start, end, note })

export async function listLeaves() {
  const db = store()
  await seedOnce(db)
  const leaves = (await db.list()).map(parse).filter(Boolean)
  leaves.sort((a, b) => (a.start === b.start ? a.empId.localeCompare(b.empId) : a.start < b.start ? -1 : 1))
  return leaves.map(shape)
}

export async function addLeave({ empId, start, end, note = '', createdBy = null }, db = store()) {
  const now = new Date().toISOString()
  const leave = { id: randomUUID(), empId, start, end, note }
  // status and createdBy are stored but unused — the seam for adding approvals
  // and per-user permissions without migrating existing records.
  await db.put(leave.id, JSON.stringify({ ...leave, status: 'approved', createdBy, createdAt: now, updatedAt: now }))
  return leave
}

export async function getLeave(id) {
  const raw = await store().get(id)
  return raw ? parse(raw) : null
}

export async function updateLeave(id, patch) {
  const db = store()
  const raw = await db.get(id)
  const current = raw ? parse(raw) : null
  if (!current) return null
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
  await db.put(id, JSON.stringify(next))
  return shape(next)
}

/** Returns false when the id wasn't there. */
export async function removeLeave(id) {
  return store().remove(id)
}

/**
 * Loads the sample calendar exactly once, ever. The claim is atomic in every
 * driver, so concurrent cold starts can't each seed and produce duplicates —
 * and a team that deliberately empties the calendar doesn't get samples back.
 */
async function seedOnce(db) {
  if (!(await db.claimSeed())) return
  for (const leave of SEED) await addLeave(leave, db)
}

/** Shared JSON response helper. */
export function send(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8')
  res.send(JSON.stringify(body))
}

/** Wraps a handler so store failures become clean JSON, not stack traces. */
export function guard(handler) {
  return async (req, res) => {
    // No caching: this data changes constantly and every client polls it.
    res.setHeader('cache-control', 'no-store')
    try {
      await handler(req, res)
    } catch (error) {
      if (error instanceof StoreError) {
        // `setup` lets the UI show persistent instructions rather than a toast
        // that vanishes before anyone can act on it.
        return send(res, 503, { error: error.message, setup: error.message === SETUP_MESSAGE })
      }
      console.error(error)
      send(res, 500, { error: 'Server error.' })
    }
  }
}
