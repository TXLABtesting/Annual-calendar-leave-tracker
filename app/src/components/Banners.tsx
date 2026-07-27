import type { Conflict } from '../lib/leave'
import { describeConflict } from '../lib/leave'
import { Icon } from './Icon'

interface SelectionBannerProps {
  name: string
  onDone: () => void
}

export function SelectionBanner({ name, onDone }: SelectionBannerProps) {
  return (
    <div className="banner-select">
      <Icon name="cursor-click" weight="bold" />
      <span className="banner-select__text">
        Adding leave for <strong>{name}</strong> — click a day or drag across days on the calendar.
      </span>
      <button type="button" className="btn-link" onClick={onDone}>
        Done
      </button>
    </div>
  )
}

interface ConflictBannerProps {
  conflicts: Conflict[]
  nameOf: (id: string) => string
}

export function ConflictBanner({ conflicts, nameOf }: ConflictBannerProps) {
  return (
    <div className="banner-conflict">
      <div className="banner-conflict__title">
        <Icon name="warning-circle" weight="fill" />
        <span>Overlapping leave ({conflicts.length})</span>
      </div>
      {conflicts.map((conflict) => {
        const row = describeConflict(conflict, nameOf)
        return (
          <div className="banner-conflict__row" key={`${conflict.start}-${conflict.end}`}>
            <span className="banner-conflict__range">{row.range}</span>
            <span className="banner-conflict__names">{row.names}</span>
            <span className="banner-conflict__days">{row.days}</span>
          </div>
        )
      })}
    </div>
  )
}
