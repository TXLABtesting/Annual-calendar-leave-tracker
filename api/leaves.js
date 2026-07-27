import { validateLeave } from '../shared/leave-rules.mjs'
import { addLeave, guard, listLeaves, send } from './_store.js'

export default guard(async (req, res) => {
  if (req.method === 'GET') {
    return send(res, 200, { leaves: await listLeaves() })
  }

  if (req.method === 'POST') {
    // Vercel parses JSON bodies, but a string arrives when content-type is off.
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {})
    const error = validateLeave(body)
    if (error) return send(res, 400, { error })
    return send(res, 201, { leave: await addLeave(body) })
  }

  send(res, 405, { error: 'Method not allowed.' })
})
