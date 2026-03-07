import type { Dayjs } from 'dayjs'
import type { RefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { TimeRange } from '../types'
import { getSlotPosition, getSlotWidth } from '../utils'

type UseRndStateProps = {
  selectedInterval: TimeRange | null
  startDate: Dayjs
  interval: number
  minimumInterval: number
  timeLineRef: RefObject<HTMLDivElement | null>
}

export function useRndState({
  selectedInterval,
  startDate,
  interval,
  timeLineRef,
}: UseRndStateProps) {
  const [width, setWidth] = useState(0)
  const [posX, setPosX] = useState(0)
  const [selectedIntervalPreview, setSelectedIntervalPreview] = useState<TimeRange | null>(null)

  // Update position and width when selected interval changes
  useEffect(() => {
    if (!selectedInterval || !timeLineRef.current) return

    const slotWidth = getSlotWidth(timeLineRef.current)
    const position = getSlotPosition(timeLineRef.current, selectedInterval[0], startDate, interval)
    const duration = selectedInterval[1].diff(selectedInterval[0], 'minute')
    const newWidth = (duration / interval) * slotWidth

    setPosX(position)
    setWidth(newWidth)
  }, [selectedInterval, startDate, interval, timeLineRef])

  const updatePosition = useCallback((x: number) => {
    setPosX(x)
  }, [])

  const updateWidth = useCallback((w: number) => {
    setWidth(w)
  }, [])

  const updatePreview = useCallback((preview: TimeRange | null) => {
    setSelectedIntervalPreview(preview)
  }, [])

  const clearPreview = useCallback(() => {
    setSelectedIntervalPreview(null)
  }, [])

  return {
    width,
    posX,
    selectedIntervalPreview,
    updatePosition,
    updateWidth,
    updatePreview,
    clearPreview,
  }
}
