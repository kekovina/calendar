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
