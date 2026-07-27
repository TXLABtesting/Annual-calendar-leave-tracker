import type { Leave } from '../types'

/**
 * Client for the shared calendar API.
 *
 * In production the frontend is served by the same process as the API, so a
 * relative base works. VITE_API_BASE overrides it when the two are hosted
 * separately.
 */
const BASE = import.meta.env.VITE_API_BASE ?? ''

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    })
  } catch {
    // fetch only rejects on network failure, which is the case worth naming.
    throw new ApiError("Can't reach the calendar server.")
  }
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T
  if (!response.ok) throw new ApiError(body.error ?? `Request failed (${response.status}).`)
  return body
}

export const fetchLeaves = () => request<{ leaves: Leave[] }>('/api/leaves').then((r) => r.leaves)

export const createLeave = (draft: Omit<Leave, 'id'>) =>
  request<{ leave: Leave }>('/api/leaves', { method: 'POST', body: JSON.stringify(draft) }).then((r) => r.leave)

export const deleteLeave = (id: string) =>
  request<{ ok: true }>(`/api/leaves/${id}`, { method: 'DELETE' })

/** Replaces the whole calendar, one request per entry — used by JSON import. */
export async function replaceAll(existing: Leave[], incoming: Omit<Leave, 'id'>[]): Promise<void> {
  await Promise.all(existing.map((leave) => deleteLeave(leave.id)))
  // Sequential so the server's broadcast ordering stays sane and a mid-way
  // failure leaves a partial import rather than an interleaved mess.
  for (const leave of incoming) await createLeave(leave)
}

/** How often to re-read the shared calendar, in milliseconds. */
const POLL_MS = 5000

export interface Subscription {
  /** Re-read immediately — used after this browser makes a change. */
  refresh: () => void
  stop: () => void
}

/**
 * Keeps the local copy in step with the shared calendar by polling.
 *
 * Polling rather than a push stream because the production deployment runs on
 * serverless functions: there is no long-lived process to hold connections open,
 * and no shared memory between invocations to broadcast from. The cost is that
 * someone else's change appears within POLL_MS instead of instantly.
 *
 * Polling pauses while the tab is hidden and resumes with an immediate read, so
 * background tabs don't burn invocations and a returning user sees fresh data.
 */
export function subscribe(
  onSync: (leaves: Leave[]) => void,
  onState: (live: boolean) => void,
): Subscription {
  let timer: number | undefined
  let stopped = false
  let inFlight = false

  const tick = async () => {
    if (stopped || inFlight || document.hidden) return
    inFlight = true
    try {
      onSync(await fetchLeaves())
      onState(true)
    } catch {
      onState(false)
    } finally {
      inFlight = false
    }
  }

  const schedule = () => {
    window.clearInterval(timer)
    timer = window.setInterval(tick, POLL_MS)
  }

  const onVisibility = () => {
    if (document.hidden) {
      window.clearInterval(timer)
    } else {
      void tick()
      schedule()
    }
  }

  void tick()
  schedule()
  document.addEventListener('visibilitychange', onVisibility)

  return {
    refresh: () => void tick(),
    stop: () => {
      stopped = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    },
  }
}
