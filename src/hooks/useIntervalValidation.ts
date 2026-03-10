import dayjs, { type Dayjs } from 'dayjs'
import { useCallback } from 'react'
import type { SchedulerEvent, SelectionError } from '../types'

export function useIntervalValidation(events: SchedulerEvent[], disablePast: boolean) {
  const validateInterval = useCallback(
    (start: Dayjs, end: Dayjs): SelectionError => {
      const s = start.startOf('minute')
      const e = end.startOf('minute')
      const hasOverlap = events.some(({ range: [eventStart, eventEnd] }) => {
        const es = eventStart.startOf('minute')
        const ee = eventEnd.startOf('minute')
        return (s >= es && s < ee) || (e > es && e <= ee) || (s < es && e > ee)
      })
      if (hasOverlap) return 'overlap'

      const isInPast = disablePast && (dayjs().isAfter(start) || dayjs().isAfter(end))
      if (isInPast) return 'past'

      return null
    },
    [events, disablePast],
  )

  return { validateInterval }
}
