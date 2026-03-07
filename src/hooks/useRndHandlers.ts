import { type Dayjs } from 'dayjs'
import { type RefObject, useCallback } from 'react'
import type { DraggableData, RndDragCallback, RndResizeCallback } from 'react-rnd'
import type { TimeRange } from '../types'
import { computeIntervalByPosition, getSlotWidth } from '../utils'

type UseRndHandlersProps = {
  timeLineRef: RefObject<HTMLDivElement | null>
  startDate: Dayjs
  interval: number
  selectedInterval: TimeRange | null
  boundsStart?: Dayjs
  boundsEnd?: Dayjs
  validateInterval: (start: Dayjs, end: Dayjs) => boolean
  onChange?: (range: TimeRange, hasError: boolean) => void
  onError: (error: boolean) => void
  updatePosition: (x: number) => void
  updateWidth: (w: number) => void
  updatePreview: (preview: TimeRange | null) => void
  clearPreview: () => void
}

function clampX(
  x: number,
  blockWidth: number,
  boundsStart: Dayjs | undefined,
  boundsEnd: Dayjs | undefined,
  startDate: Dayjs,
  interval: number,
  slotWidth: number,
): number {
  let clamped = x
  if (boundsStart) {
    const minX = (boundsStart.diff(startDate, 'minute') / interval) * slotWidth
    clamped = Math.max(clamped, minX)
  }
  if (boundsEnd) {
    const maxX = (boundsEnd.diff(startDate, 'minute') / interval) * slotWidth - blockWidth
    clamped = Math.min(clamped, maxX)
  }
  return clamped
}

export function useRndHandlers({
  timeLineRef,
  startDate,
  interval,
  selectedInterval,
  boundsStart,
  boundsEnd,
  validateInterval,
  onChange,
  onError,
  updatePosition,
  updateWidth,
  updatePreview,
  clearPreview,
}: UseRndHandlersProps) {
  const handleDrag: RndDragCallback = useCallback(
    (_e, data: DraggableData) => {
      if (!timeLineRef.current) return

      const slotWidth = getSlotWidth(timeLineRef.current)
      const duration = selectedInterval
        ? selectedInterval[1].diff(selectedInterval[0], 'minute')
        : 0
      const width = (duration / interval) * slotWidth
      const x = clampX(data.x, width, boundsStart, boundsEnd, startDate, interval, slotWidth)

      const currentInterval = computeIntervalByPosition(
        timeLineRef.current,
        x,
        width,
        startDate,
        interval,
      )
      updatePreview(currentInterval)
    },
    [timeLineRef, startDate, interval, selectedInterval, boundsStart, boundsEnd, updatePreview],
  )

  const handleDragStop: RndDragCallback = useCallback(
    (_e, data: DraggableData) => {
      if (!timeLineRef.current || !selectedInterval) return

      const slotWidth = getSlotWidth(timeLineRef.current)
      const duration = selectedInterval[1].diff(selectedInterval[0], 'minute')
      const width = (duration / interval) * slotWidth
      const x = clampX(data.x, width, boundsStart, boundsEnd, startDate, interval, slotWidth)

      const newStartIndex = Math.round(x / slotWidth)
      const newStart = startDate.clone().add(newStartIndex * interval, 'minute')
      const newEnd = newStart.clone().add(duration, 'minute')

      const hasError = validateInterval(newStart, newEnd)
      onError(hasError)
      onChange?.([newStart, newEnd], hasError)
      updatePosition(x)
      clearPreview()
    },
    [
      timeLineRef,
      startDate,
      interval,
      selectedInterval,
      boundsStart,
      boundsEnd,
      validateInterval,
      onChange,
      onError,
      updatePosition,
      clearPreview,
    ],
  )

  const handleResize: RndResizeCallback = useCallback(
    (_e, _dir, ref, _delta, position) => {
      if (!timeLineRef.current) return

      const currentInterval = computeIntervalByPosition(
        timeLineRef.current,
        position.x,
        ref.getBoundingClientRect().width,
        startDate,
        interval,
      )
      updatePreview(currentInterval)
    },
    [timeLineRef, startDate, interval, updatePreview],
  )

  const handleResizeStop: RndResizeCallback = useCallback(
    (_e, _dir, ref, _delta, position) => {
      if (!timeLineRef.current) return

      const slotWidth = getSlotWidth(timeLineRef.current)
      const newStartIndex = Math.round(position.x / slotWidth)
      const newStart = startDate.clone().add(newStartIndex * interval, 'minute')

      const newWidthInMinutes = Math.round((ref.offsetWidth / slotWidth) * interval)
      const newEnd = newStart.clone().add(newWidthInMinutes, 'minute')

      const hasError = validateInterval(newStart, newEnd)
      onError(hasError)
      onChange?.([newStart, newEnd], hasError)
      updateWidth(ref.getBoundingClientRect().width)
      updatePosition(position.x)
      clearPreview()
    },
    [
      timeLineRef,
      startDate,
      interval,
      validateInterval,
      onChange,
      onError,
      updateWidth,
      updatePosition,
      clearPreview,
    ],
  )

  return {
    handleDrag,
    handleDragStop,
    handleResize,
    handleResizeStop,
  }
}
