import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Connection, IsoDate, Leave, LeaveDraft } from './types'
import { HOLIDAYS, TEAM, YEAR } from './data/team'
import { MONTH_NAMES, todayIso, workdays } from './lib/dates'
import { buildDayMap, findConflicts } from './lib/leave'
import { buildMonths, dragRange } from './lib/calendar'
import { exportLeaves, readCache, readLeaveFile, writeCache } from './lib/storage'
import type { Subscription } from './lib/api'
import { createLeave, deleteLeave, replaceAll, subscribe } from './lib/api'
import { Header } from './components/Header'
import { MemberCard } from './components/MemberCard'
import { MonthCard } from './components/MonthCard'
import { CalendarToolbar, Legend } from './components/CalendarToolbar'
import { ConflictBanner, SelectionBanner, SetupBanner } from './components/Banners'
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
  // Server-owned. The cache only fills the gap before the first sync arrives,
  // and keeps a reload from showing an empty page while the server is down.
  const [leaves, setLeaves] = useState<Leave[]>(() => readCache() ?? [])
  const [connection, setConnection] = useState<Connection>('connecting')
  // Set when the deployment has no database connected — a configuration state
  // that persists until fixed, so it gets a banner rather than a toast.
  const [setupMessage, setSetupMessage] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [draft, setDraft] = useState<LeaveDraft | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [curMonth, setCurMonth] = useState(() => {
    const now = new Date()
    return now.getFullYear() === YEAR ? Math.min(now.getMonth(), LAST_WINDOW_START) : 7
  })
  const [toast, setToast] = useState<Toast | null>(null)

  // One subscription for the page's lifetime, kept in a ref so mutations can
  // trigger an immediate re-read instead of waiting for the next poll.
  const sync = useRef<Subscription | null>(null)
  useEffect(() => {
    sync.current = subscribe(
      (next) => {
        setLeaves(next)
        writeCache(next)
      },
      (live, setup) => {
        setConnection(live ? 'live' : 'offline')
        setSetupMessage(live ? null : (setup ?? null))
      },
    )
    return () => sync.current?.stop()
  }, [])

  /** Runs a mutation and surfaces failures instead of letting them vanish. */
  const mutate = useCallback(async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action()
      // Re-read rather than patching local state: the server is the only source
      // of truth, so this is the same path everyone else's changes arrive by.
      sync.current?.refresh()
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : failure, error: true })
    }
  }, [])

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

  const removeLeave = (id: string) => mutate(() => deleteLeave(id), 'Could not remove that leave.')

  const saveDraft = () => {
    if (!draft || !draft.empId || !draft.start || !draft.end || draft.start > draft.end) return
    const entry = {
      empId: draft.empId,
      start: draft.start as IsoDate,
      end: draft.end as IsoDate,
      note: draft.note,
    }
    setDraft(null)
    void mutate(() => createLeave(entry), 'Could not save that leave.')
  }

  const handleImport = async (file: File) => {
    try {
      const imported = await readLeaveFile(file)
      const unknown = imported.filter((leave) => !TEAM.some((member) => member.id === leave.empId))
      if (unknown.length === imported.length) {
        throw new Error("None of those entries match this team — nothing imported.")
      }
      if (
        !window.confirm(
          `Replace the shared calendar with ${imported.length} imported entries?\n\n` +
            'This changes what everyone sees, not just your browser.',
        )
      ) {
        return
      }
      // The server rejects unknown members, so drop them before sending rather
      // than failing the whole import on one bad row.
      await replaceAll(leaves, imported.filter((leave) => !unknown.includes(leave)))
      sync.current?.refresh()
      setSelectedId(null)
      setToast({
        message: unknown.length
          ? `Imported ${imported.length - unknown.length} entries · skipped ${unknown.length} for unknown members`
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
        connection={connection}
        offToday={(dayMap[today] ?? []).length}
        onAdd={() => setDraft({ empId: selectedId ?? '', start: '', end: '', note: '' })}
        onExport={() => {
          exportLeaves(leaves)
          setToast({ message: 'Exported team-leave-2026.json' })
        }}
        onImport={handleImport}
      />

      {setupMessage && <SetupBanner message={setupMessage} />}

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
