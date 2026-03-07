import type { ReactNode } from 'react'
import type { Dayjs } from 'dayjs'

export type TimeRange = [Dayjs, Dayjs]

export type SchedulerClassNames = {
  root?: string
  track?: string
  slot?: string
  slotPast?: string
  selection?: string
  selectionError?: string
  resizeHandleLeft?: string
  resizeHandleRight?: string
  disabledInterval?: string
}

export type TimeLineRangeProps = {
  id: string
  selectedInterval?: TimeRange | null
  disabledIntervals?: TimeRange[]
  onChange?: (range: TimeRange, hasError: boolean) => void
  startDate?: Dayjs
  endDate?: Dayjs
  boundsStart?: Dayjs
  boundsEnd?: Dayjs
  interval?: number
  minimumInterval?: number
  fixedDuration?: number
  disabled?: boolean
  disablePast?: boolean
  debug?: boolean
  className?: string
  classNames?: SchedulerClassNames
  renderResizeHandle?: (dir: 'left' | 'right') => ReactNode
  renderIntervalContent?: (interval: TimeRange, isSmall: boolean) => ReactNode
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

/** `single-resource`: 1 resource × 7 days. `multi-resource`: N resources × 1 day. */
export type SchedulerView = 'single-resource' | 'multi-resource'

export type SchedulerResource = {
  id: string
  label: string
  disabled?: boolean
  disabledIntervals?: TimeRange[]
  classNames?: SchedulerClassNames
}

/** Selection key format: `${resourceId}:${YYYY-MM-DD}` */
export type SchedulerSelections = Record<string, TimeRange | null>

export type SchedulerProps = {
  view: SchedulerView
  /** Anchor date. In multi-resource — the displayed day. In single-resource — any day of the displayed week. */
  date: Dayjs
  resources: SchedulerResource[]
  /** Used in single-resource view to pick which resource's week is shown. */
  activeResourceId?: string
  selections?: SchedulerSelections
  onChange?: (resourceId: string, date: Dayjs, range: TimeRange, hasError: boolean) => void
  startHour?: number
  endHour?: number
  interval?: number
  minimumInterval?: number
  fixedDuration?: number
  disabled?: boolean
  disablePast?: boolean
  debug?: boolean
  className?: string
  classNames?: SchedulerClassNames
  renderResizeHandle?: (dir: 'left' | 'right') => ReactNode
  renderIntervalContent?: (interval: TimeRange, isSmall: boolean) => ReactNode
  renderRowLabel?: (row: { resource: SchedulerResource; date: Dayjs }) => ReactNode
}
