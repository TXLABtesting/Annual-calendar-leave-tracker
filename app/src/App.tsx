import { useCallback, useEffect, useMemo, useState } from 'react'
import type { IsoDate, Leave, LeaveDraft } from './types'
import { HOLIDAYS, SEED_LEAVES, TEAM, YEAR } from './data/team'
import { MONTH_NAMES, todayIso, workdays } from './lib/dates'
import { buildDayMap, findConflicts } from './lib/leave'
import { buildMonths, dragRange } from './lib/calendar'
import { exportLeaves, loadLeaves, readLeaveFile, saveLeaves } from './lib/storage'
import { Header } from './components/Header'
import { MemberCard } from './components/MemberCard'
import { MonthCard } from './components/MonthCard'
import { CalendarToolbar, Legend } from './components/CalendarToolbar'
import { ConflictBanner, SelectionBanner } from './components/Banners'
import { AddLeaveModal } from './components/AddLeaveModal'

/** How many months the compact view shows: the current one plus the next two. */
const WINDOW = 3
const LAST_WINDOW_START = 12 - WINDOW

/** Sample of member tints for the legend's "On leave" swatch. */
const LEGEND_TINTS = TEAM.slice(0, 3).map((member) => member.soft)

interface Drag {
  a: IsoDate
  b: IsoDate
}

interface Toast {
  message: string
  error?: boolean
}

export default function App() {
  const [leaves, setLeaves] = useState<Leave[]>(() => loadLeaves() ?? SEED_LEAVES)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [draft, setDraft] = useState<LeaveDraft | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [curMonth, setCurMonth] = useState(() => {
    const now = new Date()
    return now.getFullYear() === YEAR ? Math.min(now.getMonth(), LAST_WINDOW_START) : 7
  })
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => saveLeaves(leaves), [leaves])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  // Releasing the mouse anywhere ends a drag and opens the modal prefilled
  // with the range that was swept out.
  useEffect(() => {
    if (!drag) return
    const onUp = () => {
      const [start, end] = drag.a <= drag.b ? [drag.a, drag.b] : [drag.b, drag.a]
      setDraft({ empId: selectedId ?? '', start, end, note: '' })
      setDrag(null)
    }
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [drag, selectedId])

  const today = todayIso()
  const dayMap = useMemo(() => buildDayMap(leaves), [leaves])
  const conflicts = useMemo(() => findConflicts(dayMap, YEAR), [dayMap])
  const nameOf = useCallback((id: string) => TEAM.find((m) => m.id === id)?.name ?? id, [])
  const workdaysOf = useCallback((leave: Leave) => workdays(leave.start, leave.end, HOLIDAYS), [])

  const dragging = useMemo(() => (drag ? dragRange(drag.a, drag.b) : null), [drag])

  const months = useMemo(
    () =>
      buildMonths({
        year: YEAR,
        members: TEAM,
        leaves,
        dayMap,
        holidays: HOLIDAYS,
        selectedId,
        dragging,
        today,
      }),
    [leaves, dayMap, selectedId, dragging, today],
  )

  const visibleMonths = showAll ? months : months.slice(curMonth, curMonth + WINDOW)

  const rangeLabel = useMemo(() => {
    const last = visibleMonths[visibleMonths.length - 1]
    if (!last || last.index === curMonth) return `${MONTH_NAMES[curMonth]} ${YEAR}`
    return `${MONTH_NAMES[curMonth]} – ${MONTH_NAMES[last.index]} ${YEAR}`
  }, [visibleMonths, curMonth])

  const memberStats = useMemo(
    () =>
      TEAM.map((member) => {
        const mine = leaves
          .filter((leave) => leave.empId === member.id)
          .sort((a, b) => (a.start < b.start ? -1 : 1))
        return {
          member,
          leaves: mine,
          used: mine.reduce((sum, leave) => sum + workdaysOf(leave), 0),
        }
      }),
    [leaves, workdaysOf],
  )

  const selectMember = (id: string) => {
    setSelectedId((current) => (current === id ? null : id))
    setDrag(null)
  }

  const removeLeave = (id: number) => setLeaves((current) => current.filter((leave) => leave.id !== id))

  const saveDraft = () => {
    if (!draft || !draft.empId || !draft.start || !draft.end || draft.start > draft.end) return
    setLeaves((current) => [
      ...current,
      { id: Date.now(), empId: draft.empId, start: draft.start as IsoDate, end: draft.end as IsoDate, note: draft.note },
    ])
    setDraft(null)
  }

  const handleImport = async (file: File) => {
    try {
      const imported = await readLeaveFile(file)
      const unknown = imported.filter((leave) => !TEAM.some((member) => member.id === leave.empId))
      if (!window.confirm(`Replace the current calendar with ${imported.length} imported leave entries?`)) return
      setLeaves(imported)
      setSelectedId(null)
      setToast({
        message: unknown.length
          ? `Imported ${imported.length} entries · ${unknown.length} reference unknown members and won't show`
          : `Imported ${imported.length} leave entries`,
      })
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Import failed.', error: true })
    }
  }

  const selectedName = selectedId ? nameOf(selectedId) : ''
  const draftWorkingDays =
    draft && draft.start && draft.end && draft.start <= draft.end
      ? workdays(draft.start, draft.end, HOLIDAYS)
      : null

  return (
    <div className="page">
      <Header
        offToday={(dayMap[today] ?? []).length}
        onAdd={() => setDraft({ empId: selectedId ?? '', start: '', end: '', note: '' })}
        onExport={() => {
          exportLeaves(leaves)
          setToast({ message: 'Exported team-leave-2026.json' })
        }}
        onImport={handleImport}
      />

      <div className="shell">
        <aside className="sidebar">
          <div className="sidebar__title">Team members</div>
          <div className="sidebar__hint">
            Pick a member, then click or drag days on the calendar to add their leave.
          </div>
          {memberStats.map((stats) => (
            <MemberCard
              key={stats.member.id}
              member={stats.member}
              used={stats.used}
              leaves={stats.leaves}
              workdaysOf={workdaysOf}
              selected={selectedId === stats.member.id}
              onSelect={() => selectMember(stats.member.id)}
              onRemoveLeave={removeLeave}
            />
          ))}
        </aside>

        <main className="main">
          {selectedId && (
            <SelectionBanner
              name={selectedName}
              onDone={() => {
                setSelectedId(null)
                setDrag(null)
              }}
            />
          )}

          {conflicts.length > 0 && <ConflictBanner conflicts={conflicts} nameOf={nameOf} />}

          <CalendarToolbar
            showAll={showAll}
            rangeLabel={rangeLabel}
            onPrev={() => setCurMonth((m) => Math.max(0, m - 1))}
            onNext={() => setCurMonth((m) => Math.min(LAST_WINDOW_START, m + 1))}
            onToggle={() => setShowAll((value) => !value)}
          />

          <Legend
            selected={TEAM.find((member) => member.id === selectedId)}
            tints={LEGEND_TINTS}
          />

          <div className="months">
            {visibleMonths.map((month) => (
              <MonthCard
                key={month.index}
                month={month}
                dragMode={Boolean(selectedId)}
                onDayDown={(date) => setDrag({ a: date, b: date })}
                onDayEnter={(date) => setDrag((current) => (current ? { ...current, b: date } : null))}
                onDayClick={(date) => {
                  // Without a selected member a day click opens the modal directly;
                  // with one, the drag handler owns the interaction.
                  if (!selectedId) setDraft({ empId: '', start: date, end: date, note: '' })
                }}
                onFaceClick={selectMember}
              />
            ))}
          </div>
        </main>
      </div>

      {draft && (
        <AddLeaveModal
          draft={draft}
          members={TEAM}
          workingDays={draftWorkingDays}
          onChange={(patch) => setDraft((current) => (current ? { ...current, ...patch } : current))}
          onClose={() => setDraft(null)}
          onSave={saveDraft}
        />
      )}

      {toast && (
        <div className={`toast${toast.error ? ' toast--error' : ''}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  )
}
