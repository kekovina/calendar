import type { Dayjs } from 'dayjs'
import type { RefObject } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { SchedulerEvent } from '../types'
import { computeIntervalCssStyles, getSlotWidth } from '../utils'

type UseEventsProps = {
  events: SchedulerEvent[]
  timeLineRef: RefObject<HTMLDivElement | null>
  interval: number
  startDate: Dayjs
}

export function useDisabledIntervals({ events, timeLineRef, interval, startDate }: UseEventsProps) {
  const [slotWidth, setSlotWidth] = useState(0)

  useEffect(() => {
    if (!timeLineRef.current) return

    const updateSlotWidth = () => {
      const width = getSlotWidth(timeLineRef.current)
      if (width > 0) setSlotWidth(width)
    }

    updateSlotWidth()

    const observer = new ResizeObserver(updateSlotWidth)
    observer.observe(timeLineRef.current)
    return () => observer.disconnect()
  }, [timeLineRef])

  return useMemo(() => {
    if (!timeLineRef.current || slotWidth === 0) return []

    const dayStart = startDate.startOf('day')
    const dayEnd = startDate.endOf('day')

    return events
      .map((event) => {
        const [start, end] = event.range

        if (end.isBefore(dayStart) || start.isAfter(dayEnd)) return null

        const clippedStart = start.isBefore(dayStart) ? dayStart : start
        const clippedEnd = end.isAfter(dayEnd) ? dayEnd : end

        const styles = computeIntervalCssStyles({
          interval: [clippedStart, clippedEnd],
          timeLineRef: timeLineRef.current,
          step: interval,
          startDate,
        })

        return {
          id: event.id ?? `${start.valueOf()}-${end.valueOf()}`,
          left: styles.x,
          width: styles.width,
          label: event.label,
          className: event.className,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [events, timeLineRef, interval, startDate, slotWidth])
}
