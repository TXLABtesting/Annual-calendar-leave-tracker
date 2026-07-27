// Upstash Redis over its REST API — plain fetch, no dependencies.
//
// Each leave is one field in a hash, so writes are atomic per entry: two people
// booking at the same moment can't clobber each other.

const KEY = 'leave-calendar-2026'
const SEEDED_KEY = 'leave-calendar-2026:seeded'

export function detect(env) {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
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
