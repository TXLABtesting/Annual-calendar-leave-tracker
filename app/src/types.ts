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
  id: number
  empId: string
  start: IsoDate
  end: IsoDate
  note: string
}

/** Draft state of the add-leave modal. */
export interface LeaveDraft {
  empId: string
  start: IsoDate | ''
  end: IsoDate | ''
  note: string
}
