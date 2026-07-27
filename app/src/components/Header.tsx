import { useRef } from 'react'
import { Icon } from './Icon'

interface HeaderProps {
  offToday: number
  onAdd: () => void
  onExport: () => void
  onImport: (file: File) => void
}

export function Header({ offToday, onAdd, onExport, onImport }: HeaderProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <header className="header">
      <div>
        <div className="header__eyebrow">Human resources</div>
        <h1 className="header__title">Team leave · 2026</h1>
      </div>

      <div className="header__actions">
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onImport(file)
            // Reset so picking the same file twice still fires a change.
            event.target.value = ''
          }}
        />
        <button
          type="button"
          className="btn-icon btn-icon--lg"
          onClick={() => fileInput.current?.click()}
          title="Import leave data from a JSON file"
          aria-label="Import leave data"
        >
          <Icon name="upload-simple" />
        </button>
        <button
          type="button"
          className="btn-icon btn-icon--lg"
          onClick={onExport}
          title="Export leave data as a JSON file"
          aria-label="Export leave data"
        >
          <Icon name="download-simple" />
        </button>

        <div className="header__stat">
          <Icon name="users-three" weight="fill" />
          <span>
            Off today: <strong>{offToday}</strong>
          </span>
        </div>

        <button type="button" className="btn-primary" onClick={onAdd}>
          <Icon name="plus" weight="bold" />
          Add leave
        </button>
      </div>
    </header>
  )
}
