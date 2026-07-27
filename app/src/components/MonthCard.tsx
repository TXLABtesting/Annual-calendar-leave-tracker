import type { IsoDate } from '../types'
import type { MonthModel } from '../lib/calendar'
import { WEEKDAY_LABELS } from '../lib/dates'

interface MonthCardProps {
  month: MonthModel
  /** True while a member is selected, which switches days from click to drag. */
  dragMode: boolean
  onDayDown: (date: IsoDate) => void
  onDayEnter: (date: IsoDate) => void
  onDayClick: (date: IsoDate) => void
  onFaceClick: (memberId: string) => void
}

export function MonthCard({
  month, dragMode, onDayDown, onDayEnter, onDayClick, onFaceClick,
}: MonthCardProps) {
  return (
    <section className="month" aria-label={month.name}>
      <h2 className="month__name">{month.name}</h2>

      <div className="month__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <div className="month__weekday" key={label}>
            {label}
          </div>
        ))}
      </div>

      <div className="month__grid">
        {month.cells.map((cell, index) =>
          cell.date === null ? (
            <div className={cell.className} key={`blank-${index}`} />
          ) : (
            <button
              type="button"
              key={cell.date}
              className={cell.className}
              style={cell.style}
              title={cell.title}
              aria-label={`${cell.label} ${month.name}${cell.title ? ` — ${cell.title}` : ''}`}
              onMouseDown={(event) => {
                if (!dragMode) return
                // Stop the text-selection drag so the range drag reads cleanly.
                event.preventDefault()
                onDayDown(cell.date as IsoDate)
              }}
              onMouseEnter={() => onDayEnter(cell.date as IsoDate)}
              onClick={() => onDayClick(cell.date as IsoDate)}
            >
              {cell.label}
            </button>
          ),
        )}
      </div>

      {month.faces.length > 0 && (
        <div className="month__footer">
          <div className="month__faces">
            {month.faces.map((face) => (
              <button
                type="button"
                key={face.id}
                className="month__face"
                style={face.style}
                title={face.title}
                aria-label={face.title}
                aria-pressed={face.selected}
                onClick={() => onFaceClick(face.id)}
              >
                {face.initials}
              </button>
            ))}
          </div>
          <span className="month__count">{month.summary}</span>
        </div>
      )}
    </section>
  )
}
