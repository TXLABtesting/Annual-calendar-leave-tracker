import { activeDriver, listLeaves, send, SETUP_MESSAGE } from './_store.js'

// Diagnostics: whether the deployment built, which database it detected, and
// whether that database actually answers. Reports the detected driver even when
// the connection fails, since "which one did it pick" is the first thing you
// want to know when it isn't working.
export default async function handler(_req, res) {
  res.setHeader('cache-control', 'no-store')

  const database = activeDriver()
  if (!database) {
    return send(res, 503, { ok: false, database: null, error: SETUP_MESSAGE, setup: true })
  }

  try {
    send(res, 200, { ok: true, database, leaves: (await listLeaves()).length })
  } catch (error) {
    send(res, 503, { ok: false, database, error: error.message, setup: false })
  }
}
