import { type Dayjs } from 'dayjs'
import { type RefObject, useCallback } from 'react'
import type { DraggableData, RndDragCallback, RndResizeCallback } from 'react-rnd'
import type { SchedulerDirection, TimeRange } from '../types'
import { computeIntervalByPosition, getSlotSize } from '../utils'

type UseRndHandlersProps = {
  timeLineRef: RefObject<HTMLDivElement | null>
  startDate: Dayjs
  interval: number
  selectedInterval: TimeRange | null
  boundsStart?: Dayjs
  boundsEnd?: Dayjs
  direction?: SchedulerDirection
  crossDragEnabled?: boolean
  validateInterval: (start: Dayjs, end: Dayjs) => boolean
  onChange?: (range: TimeRange, hasError: boolean) => void
  onCrossDragDrop?: (clientX: number, clientY: number, range: TimeRange) => void
  onError: (error: boolean) => void
  updatePosition: (v: number) => void
  updateWidth: (v: number) => void
  updatePreview: (preview: TimeRange | null) => void
  clearPreview: () => void
  updateCrossCompensation: (v: number) => void
  clearCrossCompensation: () => void
}

function clampPos(
  pos: number,
  blockSize: number,
  boundsStart: Dayjs | undefined,
  boundsEnd: Dayjs | undefined,
  startDate: Dayjs,
  interval: number,
  slotSize: number,
): number {
  let clamped = pos
  if (boundsStart) {
    const min = (boundsStart.diff(startDate, 'minute') / interval) * slotSize
    clamped = Math.max(clamped, min)
  }
  if (boundsEnd) {
    const max = (boundsEnd.diff(startDate, 'minute') / interval) * slotSize - blockSize
    clamped = Math.min(clamped, max)
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
  direction = 'horizontal',
  crossDragEnabled = false,
  validateInterval,
  onChange,
  onCrossDragDrop,
  onError,
  updatePosition,
  updateWidth,
  updatePreview,
  clearPreview,
  updateCrossCompensation,
  clearCrossCompensation,
}: UseRndHandlersProps) {
  const isVertical = direction === 'vertical'

  const handleDrag: RndDragCallback = useCallback(
    (_e, data: DraggableData) => {
      if (!timeLineRef.current) return

      const slotSize = getSlotSize(timeLineRef.current, direction)
      const duration = selectedInterval
        ? selectedInterval[1].diff(selectedInterval[0], 'minute')
        : 0
      const blockSize = (duration / interval) * slotSize
      const rawPos = isVertical ? data.y : data.x
      const pos = clampPos(rawPos, blockSize, boundsStart, boundsEnd, startDate, interval, slotSize)

      const currentInterval = computeIntervalByPosition(
        timeLineRef.current,
        pos,
        blockSize,
        startDate,
        interval,
        direction,
      )
      updatePreview(currentInterval)

      if (crossDragEnabled) {
        const rect = timeLineRef.current.getBoundingClientRect()
        const rawCross = isVertical ? data.x : data.y
        const crossAxisSize = isVertical ? rect.width : rect.height
        const clamped = Math.abs(rawCross) > crossAxisSize * 0.4 ? rawCross : 0
        updateCrossCompensation(clamped - rawCross)
      }
    },
    [
      timeLineRef,
      startDate,
      interval,
      selectedInterval,
      boundsStart,
      boundsEnd,
      direction,
      isVertical,
      crossDragEnabled,
      updatePreview,
      updateCrossCompensation,
    ],
  )

  const handleDragStop: RndDragCallback = useCallback(
    (_e, data: DraggableData) => {
      if (!timeLineRef.current || !selectedInterval) return

      const slotSize = getSlotSize(timeLineRef.current, direction)
      const duration = selectedInterval[1].diff(selectedInterval[0], 'minute')
      const blockSize = (duration / interval) * slotSize
      const rawPos = isVertical ? data.y : data.x
      const pos = clampPos(rawPos, blockSize, boundsStart, boundsEnd, startDate, interval, slotSize)

      const newStartIndex = Math.round(pos / slotSize)
      const newStart = startDate.clone().add(newStartIndex * interval, 'minute')
      const newEnd = newStart.clone().add(duration, 'minute')

      // Cross-timeline drag: activate only when cross-axis displacement exceeds 40% of container size
      if (crossDragEnabled && onCrossDragDrop) {
        const rect = timeLineRef.current.getBoundingClientRect()
        const crossAxisDisplacement = Math.abs(isVertical ? data.x : data.y)
        const crossAxisSize = isVertical ? rect.width : rect.height
        if (crossAxisDisplacement > crossAxisSize * 0.4) {
          const evt = _e as MouseEvent
          onCrossDragDrop(evt.clientX, evt.clientY, [newStart, newEnd])
          clearPreview()
          clearCrossCompensation()
          return
        }
      }

      const hasError = validateInterval(newStart, newEnd)
      onError(hasError)
      onChange?.([newStart, newEnd], hasError)
      updatePosition(pos)
      clearPreview()
      clearCrossCompensation()
    },
    [
      timeLineRef,
      startDate,
      interval,
      selectedInterval,
      boundsStart,
      boundsEnd,
      direction,
      isVertical,
      crossDragEnabled,
      validateInterval,
      onChange,
      onCrossDragDrop,
      onError,
      updatePosition,
      clearPreview,
      clearCrossCompensation,
    ],
  )

  const handleResize: RndResizeCallback = useCallback(
    (_e, _dir, ref, _delta, position) => {
      if (!timeLineRef.current) return

      const rect = ref.getBoundingClientRect()
      const pos = isVertical ? position.y : position.x
      const blockSize = isVertical ? rect.height : rect.width

      const currentInterval = computeIntervalByPosition(
        timeLineRef.current,
        pos,
        blockSize,
        startDate,
        interval,
        direction,
      )
      updatePreview(currentInterval)
    },
    [timeLineRef, startDate, interval, direction, isVertical, updatePreview],
  )

  const handleResizeStop: RndResizeCallback = useCallback(
    (_e, _dir, ref, _delta, position) => {
      if (!timeLineRef.current) return

      const slotSize = getSlotSize(timeLineRef.current, direction)
      const pos = isVertical ? position.y : position.x
      const newStartIndex = Math.round(pos / slotSize)
      const newStart = startDate.clone().add(newStartIndex * interval, 'minute')

      const offsetSize = isVertical ? ref.offsetHeight : ref.offsetWidth
      const rectSize = isVertical
        ? ref.getBoundingClientRect().height
        : ref.getBoundingClientRect().width
      const newSizeInMinutes = Math.round((offsetSize / slotSize) * interval)
      const newEnd = newStart.clone().add(newSizeInMinutes, 'minute')

      const hasError = validateInterval(newStart, newEnd)
      onError(hasError)
      onChange?.([newStart, newEnd], hasError)
      updateWidth(rectSize)
      updatePosition(pos)
      clearPreview()
    },
    [
      timeLineRef,
      startDate,
      interval,
      direction,
      isVertical,
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
