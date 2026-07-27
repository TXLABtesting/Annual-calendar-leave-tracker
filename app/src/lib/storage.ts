import type { Leave } from '../types'

/**
 * The calendar itself now lives on the server. localStorage is kept only as a
 * read cache, so a reload while the server is unreachable still shows the last
 * known state instead of an empty page. It is never a source of truth.
 */
export const CACHE_KEY = 'moca-leave-calendar-2026'

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

/** A leave as it arrives from a file — the server assigns the real id. */
export type LeaveInput = Omit<Leave, 'id'>

interface RawLeave {
  empId: string
  start: string
  end: string
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

/** Coerces unknown input into well-formed leave drafts. */
export function parseLeaves(input: unknown): LeaveInput[] | null {
  const raw = Array.isArray(input)
    ? input
    : input && typeof input === 'object' && Array.isArray((input as { leaves?: unknown }).leaves)
      ? (input as { leaves: unknown[] }).leaves
      : null
  if (!raw) return null
  if (!raw.every(isRawLeave)) return null
  return raw.map((leave) => ({
    empId: leave.empId,
    start: leave.start,
    end: leave.end,
    note: typeof leave.note === 'string' ? leave.note : '',
  }))
}

export function readCache(): Leave[] | null {
  try {
    const saved = localStorage.getItem(CACHE_KEY)
    if (!saved) return null
    const parsed = JSON.parse(saved) as unknown
    return Array.isArray(parsed) ? (parsed as Leave[]) : null
  } catch {
    return null
  }
}

export function writeCache(leaves: Leave[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(leaves))
  } catch {
    // Private browsing or quota — the app works fine without a cache.
  }
}

export function exportLeaves(leaves: Leave[]): void {
  const payload = { app: CACHE_KEY, year: 2026, exportedAt: new Date().toISOString(), leaves }
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'team-leave-2026.json'
  link.click()
  URL.revokeObjectURL(url)
}

export async function readLeaveFile(file: File): Promise<LeaveInput[]> {
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
