import type { IsoDate } from '../types'

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

/** Monday-first weekday initials, matching the calendar grid. */
export const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

export function iso(year: number, month: number, day: number): IsoDate {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Parses an ISO date into a *local* midnight Date, sidestepping UTC drift. */
export function parseIso(value: IsoDate): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function isoOf(date: Date): IsoDate {
  return iso(date.getFullYear(), date.getMonth(), date.getDate())
}

export function todayIso(): IsoDate {
  return isoOf(new Date())
}

/** Weekday index with Monday as 0 — so Saturday is 5 and Sunday is 6. */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

export function isWeekend(date: Date): boolean {
  return weekdayIndex(date) >= 5
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Runs `visit` over every date from `start` to `end`, both inclusive. */
export function eachDay(start: IsoDate, end: IsoDate, visit: (key: IsoDate, date: Date) => void): void {
  const cursor = parseIso(start)
  const last = parseIso(end)
  while (cursor <= last) {
    visit(isoOf(cursor), cursor)
    cursor.setDate(cursor.getDate() + 1)
  }
}

/** Days that actually draw down the balance: weekdays that are not public holidays. */
export function workdays(start: IsoDate, end: IsoDate, holidays: Record<string, string>): number {
  let count = 0
  eachDay(start, end, (key, date) => {
    if (!isWeekend(date) && !holidays[key]) count += 1
  })
  return count
}

/** `2026-02-09` → `9 Feb`. */
export function formatShort(value: IsoDate): string {
  const date = parseIso(value)
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`
}

export function formatRange(start: IsoDate, end: IsoDate): string {
  return start === end ? formatShort(start) : `${formatShort(start)} – ${formatShort(end)}`
}

/** Trims trailing zeros so 22.50 reads as 22.5 and 12.00 as 12. */
export function formatDays(value: number): string {
  return Number(value.toFixed(2)).toString()
}

export function pluralDays(count: number): string {
  return `${count} day${count === 1 ? '' : 's'}`
}

export function pluralWorkingDays(count: number): string {
  return `${count} working day${count === 1 ? '' : 's'}`
}
