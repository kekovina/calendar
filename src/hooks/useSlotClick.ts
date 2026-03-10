import dayjs, { type Dayjs } from 'dayjs'
import { type RefObject, useCallback } from 'react'
import type { SchedulerDirection, SelectionError, TimeRange } from '../types'
import { getSlotPosition, getSlotSize } from '../utils'

type UseSlotClickProps = {
  disabled: boolean
  disablePast: boolean
  minimumInterval: number
  startDate: Dayjs
  endDate: Dayjs
  interval: number
  fixedDuration?: number
  direction?: SchedulerDirection
  timeLineRef: RefObject<HTMLDivElement | null>
  validateInterval: (start: Dayjs, end: Dayjs) => SelectionError
  onChange?: (options: { range: TimeRange; error: SelectionError }) => void
  onError: (error: SelectionError) => void
  updatePosition: (v: number) => void
  updateWidth: (v: number) => void
}

export function useSlotClick({
  disabled,
  disablePast,
  minimumInterval,
  startDate,
  endDate,
  interval,
  fixedDuration,
  direction = 'horizontal',
  timeLineRef,
  validateInterval,
  onChange,
  onError,
  updatePosition,
  updateWidth,
}: UseSlotClickProps) {
  const handleClick = useCallback(
    (date: Dayjs) => {
      if (disabled || (disablePast && dayjs().isAfter(date)) || !timeLineRef.current) return

      const remainingTime = endDate.diff(date, 'minute')
      const duration = fixedDuration ?? minimumInterval
      const newRange: TimeRange =
        remainingTime < duration
          ? [endDate.subtract(duration, 'minute'), endDate]
          : [date, date.clone().add(duration, 'minute')]

      const [start, end] = newRange
      if (!start || !end) return

      const error = validateInterval(start, end)
      onError(error)

      const normalizedRange: TimeRange = [
        start.second(0).millisecond(0),
        end.second(0).millisecond(0),
      ]
      onChange?.({ range: normalizedRange, error })

      const slotSize = getSlotSize(timeLineRef.current, direction)
      updatePosition(getSlotPosition(timeLineRef.current, date, startDate, interval, direction))
      updateWidth(slotSize * (duration / interval))
    },
    [
      disabled,
      disablePast,
      minimumInterval,
      startDate,
      endDate,
      interval,
      fixedDuration,
      direction,
      timeLineRef,
      validateInterval,
      onChange,
      onError,
      updatePosition,
      updateWidth,
    ],
  )

  return { handleClick }
}
