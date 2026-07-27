import type { Leave } from '../types'

export const STORAGE_KEY = 'moca-leave-calendar-2026'

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

/** The minimum an entry must carry; `id` and `note` are filled in if absent. */
interface RawLeave {
  empId: string
  start: string
  end: string
  id?: unknown
  note?: unknown
}

function isRawLeave(value: unknown): value is RawLeave {
  if (!value || typeof value !== 'object') return false
  const l = value as Record<string, unknown>
  return (
    typeof l.empId === 'string' &&
    typeof l.start === 'string' &&
    ISO_RE.test(l.start) &&
    typeof l.end === 'string' &&
    ISO_RE.test(l.end) &&
    l.start <= l.end
  )
}

/** Coerces unknown input into well-formed leaves, filling in id and note. */
export function parseLeaves(input: unknown): Leave[] | null {
  const raw = Array.isArray(input)
    ? input
    : input && typeof input === 'object' && Array.isArray((input as { leaves?: unknown }).leaves)
      ? (input as { leaves: unknown[] }).leaves
      : null
  if (!raw) return null
  if (!raw.every(isRawLeave)) return null
  return raw.map((leave, index) => ({
    id: typeof leave.id === 'number' ? leave.id : Date.now() + index,
    empId: leave.empId,
    start: leave.start,
    end: leave.end,
    note: typeof leave.note === 'string' ? leave.note : '',
  }))
}

export function loadLeaves(): Leave[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? parseLeaves(JSON.parse(saved)) : null
  } catch {
    return null
  }
}

export function saveLeaves(leaves: Leave[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves))
  } catch {
    // Private-browsing or quota errors are non-fatal — the session still works.
  }
}

export function exportLeaves(leaves: Leave[]): void {
  const payload = { app: STORAGE_KEY, year: 2026, exportedAt: new Date().toISOString(), leaves }
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'team-leave-2026.json'
  link.click()
  URL.revokeObjectURL(url)
}

export async function readLeaveFile(file: File): Promise<Leave[]> {
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error("That file isn't valid JSON.")
  }
  const leaves = parseLeaves(parsed)
  if (!leaves) throw new Error("That file doesn't contain leave data.")
  return leaves
}
