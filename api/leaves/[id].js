import { validateLeave } from '../../shared/leave-rules.mjs'
import { getLeave, guard, removeLeave, send, updateLeave } from '../_store.js'

export default guard(async (req, res) => {
  const { id } = req.query

  if (req.method === 'DELETE') {
    const removed = await removeLeave(id)
    return removed ? send(res, 200, { ok: true }) : send(res, 404, { error: 'No such leave.' })
  }

  if (req.method === 'PATCH') {
    const current = await getLeave(id)
    if (!current) return send(res, 404, { error: 'No such leave.' })
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {})
    const merged = {
      empId: current.empId,
      start: body.start ?? current.start,
      end: body.end ?? current.end,
      note: body.note ?? current.note,
    }
    const error = validateLeave(merged)
    if (error) return send(res, 400, { error })
    return send(res, 200, { leave: await updateLeave(id, merged) })
  }

  send(res, 405, { error: 'Method not allowed.' })
})
