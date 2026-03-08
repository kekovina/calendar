import type { ReactNode } from 'react'
import type { Dayjs } from 'dayjs'

export type TimeRange = [Dayjs, Dayjs]

export type SchedulerEvent = {
  id?: string
  range: TimeRange
  label?: string
  className?: string
}

export type SchedulerClassNames = {
  root?: string
  track?: string
  slot?: string
  slotPast?: string
  selection?: string
  selectionError?: string
  resizeHandleLeft?: string
  resizeHandleRight?: string
  eventBlock?: string
}

export type SchedulerDirection = 'horizontal' | 'vertical'

export type TimeLineRangeProps = {
  id: string
  selectedInterval?: TimeRange | null
  events?: SchedulerEvent[]
  onChange?: (range: TimeRange, hasError: boolean) => void
  startDate?: Dayjs
  endDate?: Dayjs
  boundsStart?: Dayjs
  boundsEnd?: Dayjs
  /** Slot step in minutes. */
  interval?: number
  /** Minimum event duration in minutes. Must be a positive multiple of `interval`. Defaults to `interval`. */
  minimumInterval?: number
  fixedDuration?: number
  disabled?: boolean
  disablePast?: boolean
  direction?: SchedulerDirection
  debug?: boolean
  className?: string
  classNames?: SchedulerClassNames
  renderResizeHandle?: (dir: 'left' | 'right') => ReactNode
  renderIntervalContent?: (interval: TimeRange, isSmall: boolean) => ReactNode
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

export type SchedulerView = 'single-resource' | 'multi-resource'

export type SchedulerResource = {
  id: string
  label: string
  disabled?: boolean
  events?: SchedulerEvent[]
  classNames?: SchedulerClassNames
}

export type SchedulerSelections = Record<string, TimeRange | null>

export type SchedulerProps = {
  view: SchedulerView
  date: Dayjs
  resources: SchedulerResource[]
  activeResourceId?: string
  selections?: SchedulerSelections
  onChange?: (resourceId: string, date: Dayjs, range: TimeRange, hasError: boolean) => void
  startHour?: number
  endHour?: number
  /** Slot step in minutes. */
  interval?: number
  /** Minimum event duration in minutes. Must be a positive multiple of `interval`. Defaults to `interval`. */
  minimumInterval?: number
  fixedDuration?: number
  disabled?: boolean
  disablePast?: boolean
  direction?: SchedulerDirection
  debug?: boolean
  className?: string
  classNames?: SchedulerClassNames
  renderResizeHandle?: (dir: 'left' | 'right') => ReactNode
  renderIntervalContent?: (interval: TimeRange, isSmall: boolean) => ReactNode
  renderRowLabel?: (row: { resource: SchedulerResource; date: Dayjs }) => ReactNode
}
