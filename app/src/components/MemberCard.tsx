import type { Leave, Member } from '../types'
import { formatDays, formatRange, pluralWorkingDays } from '../lib/dates'
import { initialsOf } from '../lib/leave'
import { Icon } from './Icon'

export interface MemberStats {
  member: Member
  /** Working days already booked across the year. */
  used: number
  leaves: Leave[]
  workdaysOf: (leave: Leave) => number
}

interface MemberCardProps extends MemberStats {
  selected: boolean
  onSelect: () => void
  onRemoveLeave: (id: string) => void
}

export function MemberCard({
  member, used, leaves, workdaysOf, selected, onSelect, onRemoveLeave,
}: MemberCardProps) {
  const pct = Math.min(100, Math.round((used / member.balance) * 100))
  const balance = formatDays(member.balance)
  const remaining = member.balance - used
  const overbooked = remaining < 0

  return (
    <div
      className={`member${selected ? ' member--selected' : ''}`}
      style={
        selected
          ? { boxShadow: `0 0 0 2px ${member.color}, 0 8px 20px rgba(20, 48, 58, 0.10)` }
          : undefined
      }
    >
      <button type="button" className="member__row" onClick={onSelect} aria-expanded={selected}>
        <span
          className="member__avatar"
          style={
            member.photo
              ? {
                  backgroundImage: `url('${encodeURI(member.photo)}')`,
                  boxShadow: selected ? `0 0 0 2px ${member.color}` : undefined,
                }
              : {
                  background: selected ? member.color : member.soft,
                  color: selected ? '#FFFFFF' : member.color,
                }
          }
          aria-hidden="true"
        >
          {member.photo ? '' : initialsOf(member.name)}
        </span>

        <span className="member__identity">
          <span className="member__name">{member.name}</span>
          <span className="member__dept">{member.dept}</span>
        </span>

        <span className="member__balance">
          <span
            className="member__days"
            style={{ color: overbooked ? 'var(--danger)' : member.color }}
          >
            {formatDays(remaining)}
          </span>
          <span className="member__days-label">of {balance} days</span>
        </span>
      </button>

      {/* Decorative: the row button already carries the accessible name, so a
          screen reader would otherwise hear this twice. */}
      <span className="member__hint" aria-hidden="true">
        {selected
          ? 'Now click or drag across days on the calendar'
          : 'Click to select, then drag across calendar days'}
      </span>

      {selected && (
        <div className="member__detail">
          <div className="member__usage">
            <span>
              Used {used} of {balance} days
            </span>
          </div>
          <div className="member__track">
            <div
              className="member__bar"
              style={{ width: `${pct}%`, background: pct >= 90 ? 'var(--danger)' : member.color }}
            />
          </div>

          {leaves.map((leave) => {
            const days = workdaysOf(leave)
            return (
              <div className="leave" key={leave.id}>
                <Icon name="calendar-dots" weight="fill" style={{ color: member.color }} />
                <div className="leave__body">
                  <div className="leave__range">{formatRange(leave.start, leave.end)}</div>
                  <div className="leave__meta">
                    {pluralWorkingDays(days)}
                    {leave.note ? ` · ${leave.note}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  className="leave__delete"
                  title="Remove this leave"
                  aria-label={`Remove leave ${formatRange(leave.start, leave.end)}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemoveLeave(leave.id)
                  }}
                >
                  <Icon name="trash" />
                </button>
              </div>
            )
          })}

          {leaves.length === 0 && <div className="member__empty">No leave recorded yet.</div>}
        </div>
      )}
    </div>
  )
}
