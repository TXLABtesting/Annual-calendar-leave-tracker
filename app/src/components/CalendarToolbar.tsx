import type { Member } from '../types'
import { Icon } from './Icon'

interface CalendarToolbarProps {
  showAll: boolean
  rangeLabel: string
  onPrev: () => void
  onNext: () => void
  onToggle: () => void
}

export function CalendarToolbar({ showAll, rangeLabel, onPrev, onNext, onToggle }: CalendarToolbarProps) {
  return (
    <div className="toolbar">
      {showAll ? (
        <div className="toolbar__heading">Full year</div>
      ) : (
        <div className="toolbar__stepper">
          <button type="button" className="btn-icon" onClick={onPrev} aria-label="Previous month">
            <Icon name="caret-left" weight="bold" />
          </button>
          <div className="toolbar__range">{rangeLabel}</div>
          <button type="button" className="btn-icon" onClick={onNext} aria-label="Next month">
            <Icon name="caret-right" weight="bold" />
          </button>
        </div>
      )}

      <button
        type="button"
        className={`toolbar__toggle${showAll ? '' : ' toolbar__toggle--on'}`}
        onClick={onToggle}
      >
        <Icon name={showAll ? 'calendar-blank' : 'squares-four'} weight="bold" />
        {showAll ? 'Current month' : 'All months'}
      </button>
    </div>
  )
}

const CONSTANT_KEYS = [
  { label: 'Conflict', color: '#EF8F6B' },
  { label: 'Public holiday', color: '#E6EEFB' },
  { label: 'Weekend', color: '#F1F5F7' },
]

interface LegendProps {
  /** The member the calendar is filtered to, if any. */
  selected?: Member
  /** A few member tints, to stand in for "whoever is off". */
  tints: string[]
}

export function Legend({ selected, tints }: LegendProps) {
  return (
    <div className="legend">
      {selected ? (
        <span className="legend__item">
          <span className="legend__swatch" style={{ background: selected.color }} />
          {selected.name} on leave — everyone else hidden
        </span>
      ) : (
        <>
          <span className="legend__item">
            <span className="legend__swatch" style={{ background: '#0E7C7B' }} />
            Selected member on leave
          </span>
          <span className="legend__item">
            <span className="legend__stack">
              {tints.map((tint) => (
                <span className="legend__swatch" style={{ background: tint }} key={tint} />
              ))}
            </span>
            On leave
          </span>
        </>
      )}

      {CONSTANT_KEYS.map((entry) => (
        <span className="legend__item" key={entry.label}>
          <span className="legend__swatch" style={{ background: entry.color }} />
          {entry.label}
        </span>
      ))}

      <span className="legend__item">
        <span className="legend__swatch legend__swatch--uncounted" />
        Inside leave, not deducted
      </span>
    </div>
  )
}
