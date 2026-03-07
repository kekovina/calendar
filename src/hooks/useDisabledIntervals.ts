import type { Dayjs } from 'dayjs'
import type { RefObject } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { TimeRange } from '../types'
import { computeIntervalCssStyles, getSlotWidth } from '../utils'

type UseDisabledIntervalsProps = {
  disabledIntervals: TimeRange[]
  timeLineRef: RefObject<HTMLDivElement | null>
  interval: number
  startDate: Dayjs
}

export function useDisabledIntervals({
  disabledIntervals,
  timeLineRef,
  interval,
  startDate,
}: UseDisabledIntervalsProps) {
  const [slotWidth, setSlotWidth] = useState(0)

  // Update slot width when timeline is ready
  useEffect(() => {
    if (!timeLineRef.current) return

    const updateSlotWidth = () => {
      const width = getSlotWidth(timeLineRef.current)
      if (width > 0) {
        setSlotWidth(width)
      }
    }

    // Check immediately
    updateSlotWidth()

    // Also observe for changes
    const observer = new ResizeObserver(updateSlotWidth)
    observer.observe(timeLineRef.current)

    return () => observer.disconnect()
  }, [timeLineRef])

  const disabledIntervalsData = useMemo(() => {
    if (!timeLineRef.current || slotWidth === 0) return []

    const dayStart = startDate.startOf('day')
    const dayEnd = startDate.endOf('day')

    return disabledIntervals
      .map(([start, end]) => {
        // Skip intervals that don't overlap with current day
        if (end.isBefore(dayStart) || start.isAfter(dayEnd)) {
          return null
        }

        // Clip interval to day boundaries
        const clippedStart = start.isBefore(dayStart) ? dayStart : start
        const clippedEnd = end.isAfter(dayEnd) ? dayEnd : end

        const styles = computeIntervalCssStyles({
          interval: [clippedStart, clippedEnd],
          timeLineRef: timeLineRef.current,
          step: interval,
          startDate,
        })

        return {
          id: `${start.valueOf()}-${end.valueOf()}`,
          left: styles.x,
          width: styles.width,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [disabledIntervals, timeLineRef, interval, startDate, slotWidth])

  return disabledIntervalsData
}
