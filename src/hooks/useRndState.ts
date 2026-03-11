import type { Dayjs } from 'dayjs'
import type { RefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { SchedulerDirection, TimeRange } from '../types'
import { getSlotPosition, getSlotSize } from '../utils'

type UseRndStateProps = {
  selectedInterval: TimeRange | null
  startDate: Dayjs
  interval: number
  timeLineRef: RefObject<HTMLDivElement | null>
  direction?: SchedulerDirection
}

export function useRndState({
  selectedInterval,
  startDate,
  interval,
  timeLineRef,
  direction = 'horizontal',
}: UseRndStateProps) {
  // `size` = width in horizontal, height in vertical
  // `pos`  = x in horizontal, y in vertical
  const [size, setSize] = useState(0)
  const [pos, setPos] = useState(0)
  const [selectedIntervalPreview, setSelectedIntervalPreview] = useState<TimeRange | null>(null)

  useEffect(() => {
    if (!selectedInterval || !timeLineRef.current) return

    const slotSize = getSlotSize(timeLineRef.current, direction)
    const position = getSlotPosition(
      timeLineRef.current,
      selectedInterval[0],
      startDate,
      interval,
      direction,
    )
    const duration = selectedInterval[1].diff(selectedInterval[0], 'minute')

    setPos(position)
    setSize((duration / interval) * slotSize)
  }, [selectedInterval, startDate, interval, timeLineRef, direction])

  const updatePosition = useCallback((v: number) => setPos(v), [])
  const updateWidth = useCallback((v: number) => setSize(v), [])
  const updatePreview = useCallback((preview: TimeRange | null) => {
    setSelectedIntervalPreview(preview)
  }, [])
  const clearPreview = useCallback(() => setSelectedIntervalPreview(null), [])

  return {
    // expose as posX/width so callers can map to the right axis based on direction
    posX: pos,
    width: size,
    selectedIntervalPreview,
    updatePosition,
    updateWidth,
    updatePreview,
    clearPreview,
  }
}
