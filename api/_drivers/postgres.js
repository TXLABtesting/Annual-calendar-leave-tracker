// Postgres — covers Neon, Supabase and Vercel Postgres, all of which expose a
// connection string under one of the names below.
//
// `pg` is imported dynamically so the other drivers keep working even if the
// package isn't installed.

const TABLE = 'leaves'

export function detect(env) {
  const url =
    env.POSTGRES_URL ??
    env.POSTGRES_PRISMA_URL ??
    env.DATABASE_URL ??
    env.POSTGRES_URL_NON_POOLING
  return url ? { url } : null
}

export const label = 'Postgres'

export function create({ url }, fail) {
  let ready = null

  // One short-lived connection per invocation: serverless has no safe place to
  // keep a pool, and a team-sized calendar doesn't need one.
  const connect = async () => {
    let pg
    try {
      pg = await import('pg')
    } catch {
      fail("Postgres is configured but the 'pg' package isn't installed.")
    }
    const client = new (pg.default ?? pg).Client({
      connectionString: url,
      // Hosted Postgres uses certificates this environment doesn't carry a
      // root for; the connection is still encrypted.
      ssl: { rejectUnauthorized: false },
    })
    try {
      await client.connect()
    } catch (error) {
      fail(`Could not reach Postgres: ${error.message}`)
    }
    return client
  }

  const run = async (sql, params = []) => {
    const client = await connect()
    try {
      return await client.query(sql, params)
    } catch (error) {
      fail(`Postgres error: ${error.message}`)
    } finally {
      await client.end().catch(() => {})
    }
  }

  const ensureSchema = async () => {
    ready ??= run(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id   TEXT PRIMARY KEY,
        data JSONB NOT NULL
      );
      CREATE TABLE IF NOT EXISTS leave_meta (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `)
    await ready
  }

  return {
    async list() {
      await ensureSchema()
      const { rows } = await run(`SELECT data FROM ${TABLE}`)
      return rows.map((row) => JSON.stringify(row.data))
    },
    async get(id) {
      await ensureSchema()
      const { rows } = await run(`SELECT data FROM ${TABLE} WHERE id = $1`, [id])
      return rows[0] ? JSON.stringify(rows[0].data) : null
    },
    async put(id, json) {
      await ensureSchema()
      await run(
        `INSERT INTO ${TABLE} (id, data) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
        [id, json],
      )
    },
    async remove(id) {
      await ensureSchema()
      const { rowCount } = await run(`DELETE FROM ${TABLE} WHERE id = $1`, [id])
      return rowCount > 0
    },
    /** ON CONFLICT DO NOTHING makes the claim atomic across concurrent starts. */
    async claimSeed() {
      await ensureSchema()
      const { rowCount } = await run(
        `INSERT INTO leave_meta (key, value) VALUES ('seeded', $1)
         ON CONFLICT (key) DO NOTHING`,
        [new Date().toISOString()],
      )
      return rowCount > 0
    },
  }
}
