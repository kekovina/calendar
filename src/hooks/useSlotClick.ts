import dayjs, { type Dayjs } from 'dayjs'
import { type RefObject, useCallback } from 'react'
import type { TimeRange } from '../types'
import { getSlotPosition, getSlotWidth } from '../utils'

type UseSlotClickProps = {
  disabled: boolean
  disablePast: boolean
  minimumInterval: number
  startDate: Dayjs
  endDate: Dayjs
  interval: number
  fixedDuration?: number
  timeLineRef: RefObject<HTMLDivElement | null>
  validateInterval: (start: Dayjs, end: Dayjs) => boolean
  onChange?: (range: TimeRange, hasError: boolean) => void
  onError: (error: boolean) => void
  updatePosition: (x: number) => void
  updateWidth: (w: number) => void
}

export function useSlotClick({
  disabled,
  disablePast,
  minimumInterval,
  startDate,
  endDate,
  interval,
  fixedDuration,
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

      const hasError = validateInterval(start, end)
      onError(hasError)

      const normalizedRange: TimeRange = [
        start.second(0).millisecond(0),
        end.second(0).millisecond(0),
      ]
      onChange?.(normalizedRange, hasError)

      const slotWidth = getSlotWidth(timeLineRef.current)
      updatePosition(getSlotPosition(timeLineRef.current, date, startDate, interval))
      updateWidth(slotWidth * (duration / interval))
    },
    [
      disabled,
      disablePast,
      minimumInterval,
      startDate,
      endDate,
      interval,
      fixedDuration,
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
