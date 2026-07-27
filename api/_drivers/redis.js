// Upstash Redis over its REST API — plain fetch, no dependencies.
//
// Each leave is one field in a hash, so writes are atomic per entry: two people
// booking at the same moment can't clobber each other.

const KEY = 'leave-calendar-2026'
const SEEDED_KEY = 'leave-calendar-2026:seeded'

/**
 * Finds REST credentials without hard-coding variable names.
 *
 * Vercel injects different names depending on how the store was created — plain
 * `KV_REST_API_*`, `UPSTASH_REDIS_REST_*`, or those same names behind a prefix
 * chosen when the integration was connected (`STORAGE_KV_REST_API_URL` and so
 * on). Rather than guess, match on shape: an http(s) URL whose variable name ends
 * in a REST-URL suffix, paired with the same name ending in TOKEN.
 */
export function detect(env) {
  const urlKeys = Object.keys(env).filter(
    (key) => /REST(_API)?_URL$/.test(key) && /^https?:\/\//.test(env[key] ?? ''),
  )

  for (const urlKey of urlKeys) {
    // KV_REST_API_URL → KV_REST_API_TOKEN; UPSTASH_REDIS_REST_URL → …_REST_TOKEN
    const candidates = [
      urlKey.replace(/_URL$/, '_TOKEN'),
      urlKey.replace(/_REST(_API)?_URL$/, '_REST_API_TOKEN'),
      urlKey.replace(/_REST(_API)?_URL$/, '_REST_TOKEN'),
    ]
    for (const tokenKey of candidates) {
      // Read-only tokens can't write the calendar, so never pick one.
      if (env[tokenKey] && !/READ_ONLY/.test(tokenKey)) {
        return { url: env[urlKey], token: env[tokenKey] }
      }
    }
  }
  return null
}

/**
 * True when a Redis store is attached but only as a `redis://` connection
 * string. That's a TCP URL; this driver speaks the REST API, so the difference
 * is worth naming rather than reporting "no database".
 */
export function detectTcpOnly(env) {
  return Object.keys(env).some((key) => /^rediss?:\/\//.test(env[key] ?? ''))
}

export const label = 'Redis (Upstash)'

export function create({ url, token }, fail) {
  const command = async (...args) => {
    let response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify(args),
      })
    } catch {
      fail('Could not reach the Redis store.')
    }
    if (response.status === 401 || response.status === 403) {
      fail('Redis rejected the credentials — check the token is a read/write one.')
    }
    if (!response.ok) fail(`Redis error (${response.status}).`)
    const body = await response.json()
    if (body.error) fail(`Redis error: ${body.error}`)
    return body.result
  }

  return {
    async list() {
      // HGETALL returns a flat [field, value, field, value, …] array.
      const flat = (await command('HGETALL', KEY)) ?? []
      const out = []
      for (let i = 1; i < flat.length; i += 2) out.push(flat[i])
      return out
    },
    async get(id) {
      return (await command('HGET', KEY, id)) ?? null
    },
    async put(id, json) {
      await command('HSET', KEY, id, json)
    },
    async remove(id) {
      return (await command('HDEL', KEY, id)) > 0
    },
    /** SETNX is atomic, so concurrent cold starts can't both seed. */
    async claimSeed() {
      return (await command('SETNX', SEEDED_KEY, new Date().toISOString())) === 1
    },
  }
}
