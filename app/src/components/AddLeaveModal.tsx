import { useEffect, useRef } from 'react'
import type { LeaveDraft, Member } from '../types'
import { formatShort, pluralWorkingDays } from '../lib/dates'
import { Icon } from './Icon'

interface AddLeaveModalProps {
  draft: LeaveDraft
  members: Member[]
  /** Working days in the drafted range, or `null` if the range isn't usable yet. */
  workingDays: number | null
  onChange: (patch: Partial<LeaveDraft>) => void
  onClose: () => void
  onSave: () => void
}

export function AddLeaveModal({
  draft, members, workingDays, onChange, onClose, onSave,
}: AddLeaveModalProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const valid = Boolean(draft.empId && draft.start && draft.end && draft.start <= draft.end)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    dialog.current?.querySelector('select')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  let summary = 'Select a team member and dates.'
  if (workingDays !== null && draft.start && draft.end) {
    summary = `${formatShort(draft.start)} to ${formatShort(draft.end)} · ${pluralWorkingDays(workingDays)} (weekends and public holidays excluded)`
  } else if (draft.start && draft.end) {
    summary = 'The end date must be on or after the start date.'
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-leave-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__head">
          <h2 className="modal__title" id="add-leave-title">
            Add leave
          </h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>

        <label className="field">
          Team member
          <select value={draft.empId} onChange={(event) => onChange({ empId: event.target.value })}>
            <option value="">Select a team member</option>
            {members.map((member) => (
              <option value={member.id} key={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <div className="field__pair">
          <label className="field">
            From
            <input
              type="date"
              value={draft.start}
              min="2026-01-01"
              max="2026-12-31"
              onChange={(event) => onChange({ start: event.target.value })}
            />
          </label>
          <label className="field">
            To
            <input
              type="date"
              value={draft.end}
              min="2026-01-01"
              max="2026-12-31"
              onChange={(event) => onChange({ end: event.target.value })}
            />
          </label>
        </div>

        <div className="modal__summary">{summary}</div>

        <label className="field">
          Note (optional)
          <textarea
            rows={2}
            value={draft.note}
            placeholder="e.g. Annual family travel"
            onChange={(event) => onChange({ note: event.target.value })}
          />
        </label>

        <div className="modal__actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-save" onClick={onSave} disabled={!valid}>
            <Icon name="check" weight="bold" />
            Save leave
          </button>
        </div>
      </div>
    </div>
  )
}
