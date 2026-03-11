import dayjs, { type Dayjs } from 'dayjs'
import { useCallback } from 'react'
import type { SchedulerEvent, SelectionError } from '../types'
import { hasOverlapWithEvents } from '../utils'

export function useIntervalValidation(events: SchedulerEvent[], disablePast: boolean) {
  const validateInterval = useCallback(
    (start: Dayjs, end: Dayjs): SelectionError => {
      if (hasOverlapWithEvents(start, end, events)) return 'overlap'

      const isInPast = disablePast && (dayjs().isAfter(start) || dayjs().isAfter(end))
      if (isInPast) return 'past'

      return null
    },
    [events, disablePast],
  )

  return { validateInterval }
}
