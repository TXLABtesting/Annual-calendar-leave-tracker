import { activeDriver, isSetupProblem, listLeaves, send, visibleStorageVars } from './_store.js'

// Diagnostics: whether the deployment built, which database it detected, and
// whether that database actually answers. Reports the detected driver even when
// the connection fails, since "which one did it pick" is the first thing you
// want to know when it isn't working.
export default async function handler(_req, res) {
  res.setHeader('cache-control', 'no-store')

  const database = activeDriver()

  try {
    const leaves = (await listLeaves()).length
    send(res, 200, { ok: true, database, leaves })
  } catch (error) {
    // Variable names (never values) so a misnamed or half-connected store can be
    // identified without reading the Vercel dashboard.
    send(res, 503, {
      ok: false,
      database,
      error: error.message,
      setup: isSetupProblem(error.message),
      storageVarsSeen: visibleStorageVars(),
    })
  }
}
