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

export type SelectionError = 'overlap' | 'past' | null

// ─── Render option types ───────────────────────────────────────────────────────

export type RenderResizeHandleOptions = {
  dir: 'left' | 'right'
  direction: SchedulerDirection
}

export type RenderIntervalContentOptions = {
  interval: TimeRange
  isSmall: boolean
  error: SelectionError
  direction: SchedulerDirection
}

export type RenderLabelOptions = {
  direction: SchedulerDirection
}

export type RenderEventOptions = {
  event: SchedulerEvent
  direction: SchedulerDirection
}

export type RenderRowLabelOptions = {
  resource: SchedulerResource
  date: Dayjs
  direction: SchedulerDirection
}

// ─── Handler option types ──────────────────────────────────────────────────────

export type OnChangeOptions = {
  range: TimeRange
  error: SelectionError
}

export type OnCrossDragDropOptions = {
  clientX: number
  clientY: number
  range: TimeRange
}

export type OnCrossDragMoveOptions = {
  clientX: number
  clientY: number
  interval: TimeRange
}

export type OnSchedulerChangeOptions = {
  resourceId: string
  date: Dayjs
  range: TimeRange | null
  error: SelectionError
}

export type OnCrossDragOptions = {
  from: CrossDragPayload
  to: CrossDragPayload
  range: TimeRange
  error: SelectionError
}

export type OnEventClickOptions = {
  event: SchedulerEvent
  direction: SchedulerDirection
}

export type RenderOverlayOptions = {
  direction: SchedulerDirection
}

export type TimeLineRangeProps = {
  id: string
  selectedInterval?: TimeRange | null
  previewInterval?: TimeRange | null
  previewError?: SelectionError
  events?: SchedulerEvent[]
  onChange?: (options: OnChangeOptions) => void
  /** Called when the selection is dragged and released outside this timeline's bounds. */
  onCrossDragDrop?: (options: OnCrossDragDropOptions) => void
  /** Called on every drag event when crossDragEnabled, to allow previewing on the target row. */
  onCrossDragMove?: (options: OnCrossDragMoveOptions) => void
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
  renderResizeHandle?: (options: RenderResizeHandleOptions) => ReactNode
  renderIntervalContent?: (options: RenderIntervalContentOptions) => ReactNode
  renderLabel?: (options: RenderLabelOptions) => ReactNode
  renderEvent?: (options: RenderEventOptions) => ReactNode
  onEventClick?: (options: OnEventClickOptions) => void
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
  onChange?: (options: OnSchedulerChangeOptions) => void
  /** Allow only one active selection across all rows at a time. */
  singleSelection?: boolean
  /** Called when a selection is dropped onto a different timeline row/column. */
  onCrossDrag?: (options: OnCrossDragOptions) => void
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
  renderResizeHandle?: (options: RenderResizeHandleOptions) => ReactNode
  renderIntervalContent?: (options: RenderIntervalContentOptions) => ReactNode
  renderRowLabel?: (options: RenderRowLabelOptions) => ReactNode
  renderEvent?: (options: RenderEventOptions) => ReactNode
  onEventClick?: (options: OnEventClickOptions) => void
  isLoading?: boolean
  loadingText?: string
  renderOverlay?: (options: RenderOverlayOptions) => ReactNode
}
