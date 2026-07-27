import type { Leave, Member } from '../types'

export const YEAR = 2026

export const TEAM: Member[] = [
  { id: 'ali', name: 'Ali Essa', dept: 'Manager', color: '#0E7C7B', soft: '#DDF0EF', balance: 22.5, photo: 'team/ali-essa.jpg' },
  { id: 'shamlan', name: 'Shamlan AlAmeri', dept: 'Strategy', color: '#C64B7A', soft: '#F9E1EA', balance: 42.5, photo: 'team/shamlan-alameri.jpg' },
  { id: 'ayoub', name: 'Ayoub Bari', dept: 'Strategy', color: '#3E6FC4', soft: '#E6EEFB', balance: 22.5, photo: 'team/ayoub-bari.jpg' },
  { id: 'hana', name: 'Hana Omer', dept: 'Communications', color: '#C67A32', soft: '#F6E7DA', balance: 12, photo: 'team/hana-omer.jpg' },
  { id: 'maitha', name: 'Maitha Al Farhan', dept: 'Human resources', color: '#D26AA0', soft: '#FBE7F1', balance: 22.5, photo: 'team/maitha-al-farhan.jpg' },
  { id: 'khawla', name: 'Khawla Al Suwaidi', dept: 'Finance', color: '#2E9E7B', soft: '#DDF1E9', balance: 29.84, photo: 'team/khawla-al-suwaidi.jpg' },
  { id: 'mohammed', name: 'Mohamed Abuhindi', dept: 'Information technology', color: '#4C6EF0', soft: '#E4E9FC', balance: 8, photo: 'team/mohamed-abuhindi.jpg' },
  { id: 'riad', name: 'Riad Fares Elwan', dept: 'Operations', color: '#0E8FA6', soft: '#DBF0F5', balance: 22.5, photo: 'team/riad-fares-elwan.jpg' },
  { id: 'khadija', name: 'Khadija Al Shehhi', dept: 'Projects', color: '#B5842A', soft: '#F5EBD5', balance: 30, photo: 'team/khadija-al-shehhi.jpg' },
  // No photo or department was supplied for these two — initials stand in for the
  // avatar. Faisal's balance came from the chat; "You" is a placeholder to edit.
  { id: 'faisal', name: 'Faisal', dept: 'Team', color: '#7C5AC6', soft: '#ECE4FA', balance: 22.5 },
  { id: 'me', name: 'You', dept: 'Team', color: '#465C7A', soft: '#E4EAF1', balance: 30 },
]

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

/** Preloaded on first run, before anything is saved to localStorage. */
export const SEED_LEAVES: Leave[] = [
  { id: 1, empId: 'hana', start: '2026-02-09', end: '2026-02-13', note: 'Annual family travel' },
  { id: 2, empId: 'mohammed', start: '2026-04-06', end: '2026-04-10', note: '' },
  { id: 3, empId: 'khawla', start: '2026-07-13', end: '2026-07-24', note: 'Summer leave' },
  { id: 4, empId: 'ayoub', start: '2026-07-16', end: '2026-07-17', note: '' },
  { id: 5, empId: 'faisal', start: '2026-09-21', end: '2026-09-25', note: '' },
]
