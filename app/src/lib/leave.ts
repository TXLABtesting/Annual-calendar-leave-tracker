import type { IsoDate, Leave } from '../types'
import { eachDay, formatRange, iso, pluralDays } from './dates'

/** Maps every leave day in the year to the ids of everyone off that day. */
export type DayMap = Record<IsoDate, string[]>

export interface Conflict {
  start: IsoDate
  end: IsoDate
  ids: string[]
  days: number
}

export function buildDayMap(leaves: Leave[]): DayMap {
  const map: DayMap = {}
  for (const leave of leaves) {
    eachDay(leave.start, leave.end, (key) => {
      ;(map[key] ??= []).push(leave.empId)
    })
  }
  return map
}

/** Collapses runs of consecutive days on which two or more people are off. */
export function findConflicts(dayMap: DayMap, year: number): Conflict[] {
  const keys: IsoDate[] = []
  eachDay(iso(year, 0, 1), iso(year, 11, 31), (key) => keys.push(key))

  const conflicts: Conflict[] = []
  let run: { start: IsoDate; end: IsoDate; ids: Set<string>; days: number } | null = null
  const close = (open: NonNullable<typeof run>) =>
    conflicts.push({ start: open.start, end: open.end, ids: [...open.ids], days: open.days })

  for (const key of keys) {
    const off = dayMap[key] ?? []
    if (off.length >= 2) {
      if (run) {
        run.end = key
        run.days += 1
        for (const id of off) run.ids.add(id)
      } else {
        run = { start: key, end: key, ids: new Set(off), days: 1 }
      }
    } else if (run) {
      close(run)
      run = null
    }
  }
  if (run) close(run)

  return conflicts
}

export function describeConflict(conflict: Conflict, nameOf: (id: string) => string) {
  return {
    range: formatRange(conflict.start, conflict.end),
    names: conflict.ids.map(nameOf).join(', '),
    days: pluralDays(conflict.days),
  }
}

/** Two-letter monogram, used when a member has no photo. */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
