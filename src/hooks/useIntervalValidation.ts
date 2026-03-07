import dayjs, { type Dayjs } from 'dayjs'
import { useCallback } from 'react'
import type { TimeRange } from '../types'

export function useIntervalValidation(disabledIntervals: TimeRange[], disablePast: boolean) {
  const validateInterval = useCallback(
    (start: Dayjs, end: Dayjs): boolean => {
      const hasOverlap = disabledIntervals.some(
        ([disabledStart, disabledEnd]) =>
          (start >= disabledStart && start < disabledEnd) ||
          (end > disabledStart && end <= disabledEnd) ||
          (start < disabledStart && end > disabledEnd),
      )

      const isInPast = disablePast && (dayjs().isAfter(start) || dayjs().isAfter(end))

      return hasOverlap || isInPast
    },
    [disabledIntervals, disablePast],
  )

  return { validateInterval }
}
