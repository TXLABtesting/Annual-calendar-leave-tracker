import type { CSSProperties } from 'react'
import type { IsoDate, Leave, Member } from '../types'
import { MONTH_NAMES, daysInMonth, eachDay, iso, isWeekend, weekdayIndex } from './dates'
import type { DayMap } from './leave'
import { initialsOf } from './leave'

export interface DayCell {
  /** `null` for the leading blanks that pad the month to a Monday start. */
  date: IsoDate | null
  label: string
  className: string
  style: CSSProperties
  title: string
}

export interface MonthFace {
  id: string
  name: string
  title: string
  initials: string
  style: CSSProperties
  selected: boolean
}

export interface MonthModel {
  index: number
  name: string
  cells: DayCell[]
  faces: MonthFace[]
  summary: string
}

export interface CalendarOptions {
  year: number
  members: Member[]
  leaves: Leave[]
  dayMap: DayMap
  holidays: Record<string, string>
  selectedId: string | null
  /** Days currently under an in-progress drag, keyed by ISO date. */
  dragging: Set<IsoDate> | null
  today: IsoDate
  shadeWeekends?: boolean
  showHolidays?: boolean
}

/** Expands a drag's two anchors into the set of days it covers. */
export function dragRange(a: IsoDate, b: IsoDate): Set<IsoDate> {
  const [from, to] = a <= b ? [a, b] : [b, a]
  const days = new Set<IsoDate>()
  eachDay(from, to, (key) => days.add(key))
  return days
}

/** Shared with the legend and .day--conflict in index.css. */
const CONFLICT = '#EF8F6B'

export function buildMonths(options: CalendarOptions): MonthModel[] {
  const {
    year, members, leaves, dayMap, holidays, selectedId, dragging, today,
    shadeWeekends = true, showHolidays = true,
  } = options

  const byId = new Map(members.map((member) => [member.id, member]))
  const nameOf = (id: string) => byId.get(id)?.name ?? id

  return MONTH_NAMES.map((name, month) => ({
    index: month,
    name,
    cells: buildCells({ year, month, dayMap, holidays, selectedId, dragging, today, shadeWeekends, showHolidays, byId, nameOf }),
    ...buildFaces({ year, month, leaves, byId, selectedId }),
  }))
}

interface CellContext {
  year: number
  month: number
  dayMap: DayMap
  holidays: Record<string, string>
  selectedId: string | null
  dragging: Set<IsoDate> | null
  today: IsoDate
  shadeWeekends: boolean
  showHolidays: boolean
  byId: Map<string, Member>
  nameOf: (id: string) => string
}

function buildCells(ctx: CellContext): DayCell[] {
  const { year, month, dayMap, holidays, selectedId, dragging, today, shadeWeekends, showHolidays, byId, nameOf } = ctx

  const first = new Date(year, month, 1)
  const lead = weekdayIndex(first)
  const total = daysInMonth(year, month)

  const cells: DayCell[] = []
  for (let i = 0; i < lead; i += 1) {
    cells.push({ date: null, label: '', className: 'day day--blank', style: {}, title: '' })
  }

  for (let day = 1; day <= total; day += 1) {
    const date = iso(year, month, day)
    const weekend = isWeekend(new Date(year, month, day))
    const holiday = showHolidays ? holidays[date] : undefined
    const off = dayMap[date] ?? []

    // Each rule below supersedes the one before it, so the most specific
    // meaning for the day is what ends up on screen.
    let variant = ''
    const style: CSSProperties = {}
    let title = ''
    // Whose leave covers this day, if anyone — used to mark days that sit
    // inside a range without being deducted.
    let accent: string | undefined

    if (weekend && shadeWeekends) variant = 'day--weekend'

    if (holiday) {
      variant = 'day--holiday'
      title = holiday
    }

    // With someone selected the grid filters down to their days alone —
    // teammates' leave is hidden, so those days render as ordinary dates.
    if (selectedId) {
      const others = off.filter((id) => id !== selectedId)
      const selectedIsOff = off.includes(selectedId)
      const selected = byId.get(selectedId)

      if (selectedIsOff && selected) {
        variant = 'day--own'
        accent = selected.color
        style.background = selected.color
        style.color = undefined
        title = `${selected.name} on leave`
      }
      if (selectedIsOff && others.length) {
        variant = 'day--conflict'
        accent = CONFLICT
        style.background = undefined
        style.color = undefined
        title = `Conflict: ${off.map(nameOf).join(', ')}`
      }
      if (dragging?.has(date) && selected) {
        variant = 'day--drag'
        accent = selected.color
        style.background = selected.color
        style.color = undefined
      }
    } else if (off.length >= 2) {
      variant = 'day--conflict'
      accent = CONFLICT
      title = `Conflict: ${off.map(nameOf).join(', ')}${holiday ? ` · ${holiday}` : ''}`
    } else if (off.length === 1) {
      const owner = off[0] ? byId.get(off[0]) : undefined
      if (owner) {
        variant = ''
        accent = owner.color
        style.background = owner.soft
        style.color = owner.color
        style.fontWeight = 700
        title = owner.name + (holiday ? ` · ${holiday}` : '')
      }
    }

    // Weekends and public holidays inside a leave range are covered by it but
    // never deducted, so they render exactly like any other non-working day —
    // plain and greyed out. Only the tooltip mentions the leave.
    if (accent && (weekend || holiday)) {
      variant = holiday ? 'day--holiday' : shadeWeekends ? 'day--weekend' : ''
      style.background = undefined
      style.color = undefined
      style.fontWeight = undefined
      title = `${title || (holiday ?? 'Weekend')} · not deducted`
    }

    const className = ['day', variant, date === today ? 'day--today' : '']
      .filter(Boolean)
      .join(' ')

    cells.push({ date, label: String(day), className, style, title })
  }

  return cells
}

interface FaceContext {
  year: number
  month: number
  leaves: Leave[]
  byId: Map<string, Member>
  selectedId: string | null
}

/** The stacked avatar row under a month — one face per person off that month. */
function buildFaces({ year, month, leaves, byId, selectedId }: FaceContext): { faces: MonthFace[]; summary: string } {
  const monthStart = iso(year, month, 1)
  const monthEnd = iso(year, month, daysInMonth(year, month))

  const seen = new Set<string>()
  const faces: MonthFace[] = []

  for (const leave of leaves) {
    if (leave.start > monthEnd || leave.end < monthStart || seen.has(leave.empId)) continue
    const member = byId.get(leave.empId)
    if (!member) continue
    seen.add(member.id)

    const selected = selectedId === member.id
    const style: CSSProperties = {
      boxShadow: selected ? `0 0 0 2px ${member.color}` : '0 0 0 2px #FFFFFF',
    }
    if (!selected && selectedId) style.opacity = 0.4
    if (member.photo) {
      style.backgroundImage = `url('${encodeURI(member.photo)}')`
    } else {
      style.background = member.soft
      style.color = member.color
    }

    faces.push({
      id: member.id,
      name: member.name,
      title: `${selected ? 'Showing only ' : 'Click to show only '}${member.name}'s leave`,
      initials: member.photo ? '' : initialsOf(member.name),
      style,
      selected,
    })
  }

  return {
    faces,
    summary: `${faces.length} ${faces.length === 1 ? 'person' : 'people'} on leave`,
  }
}
