/** An ISO calendar date, `YYYY-MM-DD`. */
export type IsoDate = string

export interface Member {
  id: string
  name: string
  dept: string
  /** Solid brand colour — used for the member's own leave days, ring and figures. */
  color: string
  /** Tinted companion to `color` — used when the day belongs to an unselected member. */
  soft: string
  /** Annual leave balance in days. Fractional values are supported. */
  balance: number
  photo?: string
}

export interface Leave {
  /** Server-issued UUID. Client-generated ids would collide across browsers. */
  id: string
  empId: string
  start: IsoDate
  end: IsoDate
  note: string
}

/** Whether the browser currently has a live link to the shared calendar. */
export type Connection = 'connecting' | 'live' | 'offline'

/** Draft state of the add-leave modal. */
export interface LeaveDraft {
  empId: string
  start: IsoDate | ''
  end: IsoDate | ''
  note: string
}
