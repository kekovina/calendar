import { useMemo } from 'react'
import type { Dayjs } from 'dayjs'
import { generateDateArray } from '../utils'

export function useTimeIntervals(startDate: Dayjs, endDate: Dayjs, interval: number) {
  return useMemo(
    () => generateDateArray(startDate, endDate, interval),
    [startDate, endDate, interval],
  )
}
