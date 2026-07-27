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

/**
 * Subscribes to server-pushed updates. The server sends the full list on
 * connect and after every change, so `onSync` is the single source of truth.
 * Returns an unsubscribe function.
 */
export function subscribe(onSync: (leaves: Leave[]) => void, onState: (live: boolean) => void): () => void {
  let source: EventSource | null = null
  let retry: number | undefined
  let closed = false

  const connect = () => {
    if (closed) return
    source = new EventSource(`${BASE}/api/stream`)

    source.addEventListener('sync', (event) => {
      try {
        onSync((JSON.parse((event as MessageEvent).data) as { leaves: Leave[] }).leaves)
        onState(true)
      } catch {
        // A malformed frame shouldn't tear down a working connection.
      }
    })

    source.onopen = () => onState(true)

    source.onerror = () => {
      onState(false)
      source?.close()
      // EventSource retries on its own, but only for some failures and with no
      // backoff control — reconnecting explicitly is more predictable.
      if (!closed) retry = window.setTimeout(connect, 3000)
    }
  }

  connect()

  return () => {
    closed = true
    window.clearTimeout(retry)
    source?.close()
  }
}
