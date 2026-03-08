import type { Dayjs } from 'dayjs'
import type { RefObject } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { SchedulerDirection, SchedulerEvent } from '../types'
import { computeIntervalCssStyles, getSlotSize } from '../utils'

type UseEventsProps = {
  events: SchedulerEvent[]
  timeLineRef: RefObject<HTMLDivElement | null>
  interval: number
  startDate: Dayjs
  direction?: SchedulerDirection
}

export function useDisabledIntervals({
  events,
  timeLineRef,
  interval,
  startDate,
  direction = 'horizontal',
}: UseEventsProps) {
  const [slotSize, setSlotSize] = useState(0)

  useEffect(() => {
    if (!timeLineRef.current) return

    const update = () => {
      const size = getSlotSize(timeLineRef.current, direction)
      if (size > 0) setSlotSize(size)
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(timeLineRef.current)
    return () => observer.disconnect()
  }, [timeLineRef, direction])

  return useMemo(() => {
    if (!timeLineRef.current || slotSize === 0) return []

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
          direction,
        })

        return {
          id: event.id ?? `${start.valueOf()}-${end.valueOf()}`,
          position: styles.position,
          size: styles.size,
          label: event.label,
          className: event.className,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [events, timeLineRef, interval, startDate, slotSize, direction])
}
