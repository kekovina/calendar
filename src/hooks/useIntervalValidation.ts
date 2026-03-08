import dayjs, { type Dayjs } from 'dayjs'
import { useCallback } from 'react'
import type { SchedulerEvent } from '../types'

export function useIntervalValidation(events: SchedulerEvent[], disablePast: boolean) {
  const validateInterval = useCallback(
    (start: Dayjs, end: Dayjs): boolean => {
      const s = start.startOf('minute')
      const e = end.startOf('minute')
      const hasOverlap = events.some(({ range: [eventStart, eventEnd] }) => {
        const es = eventStart.startOf('minute')
        const ee = eventEnd.startOf('minute')
        return (s >= es && s < ee) || (e > es && e <= ee) || (s < es && e > ee)
      })

      const isInPast = disablePast && (dayjs().isAfter(start) || dayjs().isAfter(end))

      return hasOverlap || isInPast
    },
    [events, disablePast],
  )

  return { validateInterval }
}
