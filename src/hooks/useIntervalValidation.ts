import dayjs, { type Dayjs } from 'dayjs'
import { useCallback } from 'react'
import type { SchedulerEvent } from '../types'

export function useIntervalValidation(events: SchedulerEvent[], disablePast: boolean) {
  const validateInterval = useCallback(
    (start: Dayjs, end: Dayjs): boolean => {
      const hasOverlap = events.some(
        ({ range: [eventStart, eventEnd] }) =>
          (start >= eventStart && start < eventEnd) ||
          (end > eventStart && end <= eventEnd) ||
          (start < eventStart && end > eventEnd),
      )

      const isInPast = disablePast && (dayjs().isAfter(start) || dayjs().isAfter(end))

      return hasOverlap || isInPast
    },
    [events, disablePast],
  )

  return { validateInterval }
}
