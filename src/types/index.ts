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
  previewInterval?: TimeRange | null
  previewError?: boolean
  events?: SchedulerEvent[]
  onChange?: (range: TimeRange, hasError: boolean) => void
  /** Called when the selection is dragged and released outside this timeline's bounds. */
  onCrossDragDrop?: (clientX: number, clientY: number, range: TimeRange) => void
  /** Called on every drag event when crossDragEnabled, to allow previewing on the target row. */
  onCrossDragMove?: (clientX: number, clientY: number, interval: TimeRange) => void
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
  /** Allow dragging the selection into adjacent timelines. */
  crossDragEnabled?: boolean
  /** CSS selector for the element that constrains cross-timeline drag bounds. */
  crossDragBounds?: string
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

export type CrossDragPayload = {
  resourceId: string
  date: Dayjs
}

export type SchedulerProps = {
  view: SchedulerView
  date: Dayjs
  resources: SchedulerResource[]
  activeResourceId?: string
  selections?: SchedulerSelections
  onChange?: (resourceId: string, date: Dayjs, range: TimeRange | null, hasError: boolean) => void
  /** Allow only one active selection across all rows at a time. */
  singleSelection?: boolean
  /** Called when a selection is dropped onto a different timeline row/column. */
  onCrossDrag?: (
    from: CrossDragPayload,
    to: CrossDragPayload,
    range: TimeRange,
    hasError: boolean,
  ) => void
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
  /** Allow dragging selections between timeline rows/columns. */
  crossDrag?: boolean
  debug?: boolean
  className?: string
  classNames?: SchedulerClassNames
  renderResizeHandle?: (dir: 'left' | 'right') => ReactNode
  renderIntervalContent?: (interval: TimeRange, isSmall: boolean) => ReactNode
  renderRowLabel?: (row: { resource: SchedulerResource; date: Dayjs }) => ReactNode
}
