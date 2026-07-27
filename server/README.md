# Leave calendar server

The shared store behind the calendar. Everyone who opens the link reads and
writes the same data.

**No dependencies.** `node:http` and `node:sqlite` are both built into Node 22,
so there is nothing to `npm install` — no lockfile, no native build, no supply
chain to review. The whole server is one file.

## Running it

```bash
node server/index.mjs          # http://localhost:8787
```

It serves the API *and* the built frontend from `app/dist`, so one process and
one port is the entire deployment. Build the frontend first (`cd app && npm run
build`) or you'll get a 404 telling you so.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8787` | Port to listen on |
| `DB_PATH` | `server/data/leave.db` | SQLite file — **must be on persistent storage** |
| `STATIC_DIR` | `../app/dist` | Built frontend to serve |

## API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/leaves` | All leave entries |
| `POST` | `/api/leaves` | Create one — `{empId, start, end, note}` |
| `PATCH` | `/api/leaves/:id` | Change dates or note |
| `DELETE` | `/api/leaves/:id` | Remove one |
| `GET` | `/api/stream` | SSE; pushes the full list on connect and after every change |
| `GET` | `/api/health` | Liveness probe |

Dates are `YYYY-MM-DD`. The server validates every write — unknown member,
backwards range, and impossible dates like `2026-02-31` are all rejected with a
400, so a malformed request can't corrupt the calendar even if it bypasses the
UI.

Ids are server-issued UUIDs. Clients never invent them: two browsers generating
ids independently would eventually collide.

## How syncing works

Every browser holds one SSE connection. After any change the server broadcasts
the complete leave list to all of them. For a team-sized calendar that is far
simpler than sending diffs, and it makes drift between clients impossible —
there is one authoritative list and everyone renders it.

Clients reconnect on their own with a 3-second retry, and the server sends a
keep-alive comment every 25 seconds so proxies don't close idle streams.

## Deploying

```bash
docker build -t leave-calendar .
docker run -p 8787:8787 -v leave-data:/srv/server/data leave-calendar
```

**Mount a volume.** The SQLite file is the calendar; without persistent storage
it disappears when the container is replaced. On a PaaS, attach a disk and point
`DB_PATH` at it — several platforms give containers an ephemeral filesystem by
default, which will silently lose data on every deploy.

Back it up by copying the file: `sqlite3 leave.db ".backup backup.db"`, or just
use the app's Export button for a JSON snapshot.

## Built to extend

There is deliberately **no authentication** — that was the brief for this phase.
Anyone with the link can view and change everything.

Two columns exist but are unused, so adding the next phase is a code change
rather than a migration against live data:

- `status` — defaults to `'approved'`. An approval workflow sets `'pending'` and
  filters on it.
- `created_by` — null today. Populate it once you know who is acting, then
  authorise per-member edits against it.

For roles and permissions you'd add a `users` table, put a session or SSO check
in front of the mutating routes, and gate on `created_by` plus role. The read
path and the sync mechanism don't need to change.
