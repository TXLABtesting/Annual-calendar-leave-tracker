// Validation shared by both backends — the self-hosted server (server/index.mjs)
// and the Vercel serverless functions (api/). Kept in one place so the two can
// never disagree about what a valid booking is.

// A JSON import rather than readFileSync: bundlers inline it, so this survives
// being packaged into a serverless function with no filesystem to read from.
import ROSTER from './team.json' with { type: 'json' }

export const MEMBER_IDS = new Set(ROSTER.members.map((member) => member.id))

const ISO = /^\d{4}-\d{2}-\d{2}$/

/** Returns an error string, or null when the payload is usable. */
export function validateLeave(body) {
  if (!body || typeof body !== 'object') return 'Expected a JSON object.'
  const { empId, start, end, note } = body
  if (typeof empId !== 'string' || !MEMBER_IDS.has(empId)) return 'Unknown team member.'
  if (typeof start !== 'string' || !ISO.test(start)) return 'start must be YYYY-MM-DD.'
  if (typeof end !== 'string' || !ISO.test(end)) return 'end must be YYYY-MM-DD.'
  if (start > end) return 'end must be on or after start.'
  if (note != null && typeof note !== 'string') return 'note must be a string.'
  // Catches dates that match the pattern but don't exist, like 2026-02-31.
  for (const date of [start, end]) {
    if (new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) {
      return `${date} is not a real date.`
    }
  }
  return null
}

/** Sample leave loaded into an empty calendar on first run. */
export const SEED = [
  { empId: 'hana', start: '2026-02-09', end: '2026-02-13', note: 'Annual family travel' },
  { empId: 'mohammed', start: '2026-04-06', end: '2026-04-10', note: '' },
  { empId: 'khawla', start: '2026-07-13', end: '2026-07-24', note: 'Summer leave' },
  { empId: 'ayoub', start: '2026-07-16', end: '2026-07-17', note: '' },
  { empId: 'faisal', start: '2026-09-21', end: '2026-09-25', note: '' },
]
