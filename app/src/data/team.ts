import type { Member } from '../types'
import roster from '../../../shared/team.json'

// The roster lives in shared/team.json so the server can validate against the
// same list the UI renders. Edit that file, not this one.
export const YEAR = roster.year

export const TEAM: Member[] = roster.members

export const HOLIDAYS: Record<string, string> = {
  '2026-01-01': "New Year's Day",
  '2026-03-19': 'Eid Al Fitr',
  '2026-03-20': 'Eid Al Fitr',
  '2026-03-21': 'Eid Al Fitr',
  '2026-05-26': 'Arafat Day',
  '2026-05-27': 'Eid Al Adha',
  '2026-05-28': 'Eid Al Adha',
  '2026-05-29': 'Eid Al Adha',
  '2026-06-16': 'Islamic New Year',
  '2026-08-25': "Prophet's Birthday",
  '2026-12-02': 'National Day',
  '2026-12-03': 'National Day',
}

// Sample leave now lives in server/index.mjs — the server seeds it into the
// shared database on first run, so every browser sees the same starting state.
