import { type Dayjs } from 'dayjs'
import { type RefObject, useCallback, useState } from 'react'
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
  onChange?: (options: { range: TimeRange; hasError: boolean }) => void
  onCrossDragDrop?: (options: { clientX: number; clientY: number; range: TimeRange }) => void
  onCrossDragMove?: (options: { clientX: number; clientY: number; interval: TimeRange }) => void
  onError: (error: boolean) => void
  updatePosition: (v: number) => void
  updateWidth: (v: number) => void
  updatePreview: (preview: TimeRange | null) => void
  clearPreview: () => void
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
  onCrossDragMove,
  onError,
  updatePosition,
  updateWidth,
  updatePreview,
  clearPreview,
}: UseRndHandlersProps) {
  const isVertical = direction === 'vertical'
  const [isCrossDragging, setIsCrossDragging] = useState(false)

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
      if (crossDragEnabled) {
        const rect = timeLineRef.current.getBoundingClientRect()
        const evt = _e as MouseEvent
        const crossMousePos = isVertical ? evt.clientX : evt.clientY
        const crossStart = isVertical ? rect.left : rect.top
        const crossEnd = isVertical ? rect.right : rect.bottom
        const isOutside = crossMousePos < crossStart || crossMousePos > crossEnd
        setIsCrossDragging(isOutside)
        if (onCrossDragMove) {
          onCrossDragMove({ clientX: evt.clientX, clientY: evt.clientY, interval: currentInterval })
        }
      }

      updatePreview(currentInterval)
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
      onCrossDragMove,
      updatePreview,
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

      // Cross-timeline drag: detect by mouse position leaving the row container
      setIsCrossDragging(false)

      if (crossDragEnabled && onCrossDragDrop) {
        const rect = timeLineRef.current.getBoundingClientRect()
        const evt = _e as MouseEvent
        const crossMousePos = isVertical ? evt.clientX : evt.clientY
        const crossStart = isVertical ? rect.left : rect.top
        const crossEnd = isVertical ? rect.right : rect.bottom
        if (crossMousePos < crossStart || crossMousePos > crossEnd) {
          onCrossDragDrop({ clientX: evt.clientX, clientY: evt.clientY, range: [newStart, newEnd] })
          clearPreview()
          return
        }
      }

      const hasError = validateInterval(newStart, newEnd)
      onError(hasError)
      onChange?.({ range: [newStart, newEnd], hasError })
      updatePosition(pos)
      clearPreview()
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
      onChange?.({ range: [newStart, newEnd], hasError })
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
    isCrossDragging,
  }
}
