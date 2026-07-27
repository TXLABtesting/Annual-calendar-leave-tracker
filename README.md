# Annual leave calendar · 2026

Shared team leave calendar. Everyone who opens the link sees the same data —
book leave, track balances, spot overlaps.

Built from a [Claude Design](https://claude.ai/design) handoff; the original
prototype and the design conversation are in `project/` (see
[`project/HANDOFF.md`](project/HANDOFF.md)).

```
app/       React + Vite frontend
api/       serverless API — used by the Vercel deployment
server/    self-hosted API — one Node process, SQLite, no dependencies
shared/    roster and validation rules, used by every runtime
```

## Deploying on Vercel

The repo is Vercel-ready: `vercel.json` builds `app/` and exposes `api/` as
serverless functions.

**You must connect a database.** Vercel functions have no persistent disk, so
without one the app loads but has nowhere to keep bookings and reports
*"No database is connected"*.

1. In the Vercel project: **Storage → Create Database → Redis (Upstash)**.
2. **Connect** it to the project. That injects `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` automatically — nothing to copy by hand.
3. **Redeploy** so the functions pick up the new variables.

The sample calendar loads itself on first read, so the page won't be empty.

## Self-hosting instead

Better if staff leave data shouldn't sit on third-party infrastructure — a
relevant question for a government entity. One process, SQLite, no npm
dependencies at all:

```bash
cd app && npm install && npm run build && cd ..
node server/index.mjs                       # http://localhost:8787
```

Or with Docker, which is the same thing packaged:

```bash
docker build -t leave-calendar .
docker run -p 8787:8787 -v leave-data:/srv/server/data leave-calendar
```

**Mount the volume.** The SQLite file *is* the calendar; without persistent
storage it's wiped on every redeploy.

See [`server/README.md`](server/README.md) for configuration and the API, and
[`app/README.md`](app/README.md) for how the calendar behaves.

## Local development

```bash
node server/index.mjs                       # terminal 1 — API on :8787
cd app && npm install && npm run dev        # terminal 2 — :5173, proxies /api
npm test                                    # API tests, no dependencies needed
```

## Two backends, one set of rules

`api/` and `server/` exist because serverless and self-hosted have genuinely
different constraints — Redis versus SQLite, no disk versus a disk. They both
import `shared/leave-rules.mjs` for the roster and validation, so they can't
disagree about what a valid booking is. Pick one; you don't need both.

## Known limits

- **No login, no permissions, no audit trail.** Anyone with the link can add,
  edit, or delete anyone's leave, and nothing records who did it. That was the
  brief for this phase. Treat the link as the only access control it has.
  `server/README.md` describes the columns already in place for adding roles
  and approvals.
- **Changes appear within about 5 seconds**, not instantly — clients poll,
  because serverless can't hold a push connection open. `app/src/lib/api.ts`
  explains the trade-off and is where you'd change the interval.
