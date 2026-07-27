# Team leave · 2026

Annual leave calendar for the team — see the whole year, book leave per person,
track balances and spot overlaps. Implemented from the Claude Design handoff in
`../project/Leave Calendar 2026.dc.html` ("Soft Data" direction).

The calendar is **shared**: everyone who opens the link sees the same data, and
a change made by one person appears for everyone else within a second. It is
backed by [`../server`](../server/README.md).

## Running it

Two processes in development — the API, and Vite with a proxy onto it:

```bash
node ../server/index.mjs      # terminal 1 — API on :8787
npm install && npm run dev    # terminal 2 — http://localhost:5173
```

For production one process serves both:

```bash
npm run build                 # type-check + bundle into dist/
node ../server/index.mjs      # serves the API and dist/ on :8787
```

## How it works

The calendar defaults to a three-month window — the current month plus the next
two — with a toggle for the full year. Each team member has their own colour;
their leave days are filled with it, days where two or more people overlap turn
orange, weekends are shaded and UAE public holidays are tinted blue.

**Booking leave.** Two ways, both from the design:

- Click any day with nobody selected → the modal opens on that date.
- Select a member in the sidebar (or click their face under a month), then click
  or drag across days → the modal opens prefilled with that range.

Selecting a member **filters the calendar to their days alone** — everyone else's
leave disappears until you deselect — and expands their card to show the usage
bar and their booked leave. Days where their leave collides with a teammate's
still show in the conflict colour, with the names in the tooltip.

Balances count **working days** only: weekends and public holidays in a range
don't draw down the balance. Each card shows days remaining above the full
entitlement (`19.84` / `of 29.84 days`); the figure turns red if someone books
past their balance.

## Data

Leave lives in SQLite on the server, not in the browser. The page holds an SSE
connection and re-renders whenever anyone changes anything; `localStorage` is
kept only as a read cache so a reload during an outage still shows the last
known calendar.

A pill in the header states the connection: **Shared · live**, **Connecting…**,
or **Offline**. While offline the calendar still renders, but writes fail with a
visible error rather than pretending to save — the one thing worse than losing a
booking is believing it saved.

The header's export/import buttons still produce and read
`team-leave-2026.json`. Import now **replaces the shared calendar for everyone**,
so it asks for confirmation and says so; entries naming unknown members are
skipped rather than failing the whole import.

## Layout

```
src/
  data/team.ts        roster, balances, UAE public holidays
  lib/api.ts          REST client and the SSE subscription
  lib/dates.ts        ISO date helpers, working-day counting, formatting
  lib/leave.ts        day map, overlap detection
  lib/calendar.ts     builds the month grids — cell appearance and avatar rows
  lib/storage.ts      offline read cache plus JSON import/export
  components/         Header, MemberCard, MonthCard, AddLeaveModal, Banners…
  index.css           all static styling; per-member colours are applied inline
```

## Things to know

- **There is no login, and no permissions.** Anyone with the link can book,
  edit, or delete leave for anybody — including the manager's — and there is no
  record of who did it. That was the brief for this phase. Treat the link as the
  only access control it has, and don't put it anywhere public. `server/README.md`
  describes the columns already in place for adding roles and approvals.
- **The roster is `shared/team.json`** — one file, read by both the frontend and
  the server (which rejects bookings for anyone not in it). Add or edit people
  there; `src/data/team.ts` just types and re-exports it.
- **Roster.** Nine members came from the design file. Faisal (22.5 days) and a
  placeholder **"You"** entry were added from the chat transcripts — the design
  file referenced a `faisal` leave that had nowhere to render. Neither has a
  photo or a stated department, so they show initials and `Team`. Khadija's
  balance of 30 is also a placeholder. Correct all of these in `shared/team.json`.
- **Balances in `shared/team.json` are entitlements**, and the card counts down
  from them. The figures from the chat (Khawla 29.84, Shamlan 42.5, and so on)
  are treated as each person's full allowance for the year, so booked leave
  subtracts from them. If those numbers were meant to be what's *already left*,
  delete the sample leave and raise the entitlements to match.
- **Public holidays for 2026 are estimates** for the Islamic dates (Eid Al Fitr,
  Eid Al Adha, Islamic New Year, the Prophet's Birthday), since they depend on
  the moon sighting. Confirm against the official UAE calendar before the year
  starts and update `HOLIDAYS` in `src/data/team.ts`.
- **Fonts and icons are bundled**, not fetched from a CDN, so the app works
  offline and behind a restrictive network. The 14 Phosphor glyphs in use are
  extracted into `src/components/icon-paths.ts`; add a name to
  `scripts/build-icons.mjs` and run `npm run icons` to pull in more.
- **Design tokens** from the UAE Government Design System are vendored at
  `src/styles/aegov-colors-and-type.css` for reference. The Google Fonts
  `@import` at the top was replaced by the bundled faces.
