import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { SchedulerDirection, SchedulerEvent, TimeRange } from '../types'

export const hasOverlapWithEvents = (
  start: Dayjs,
  end: Dayjs,
  events: SchedulerEvent[],
): boolean => {
  const s = start.startOf('minute')
  const e = end.startOf('minute')
  return events.some(({ range: [eventStart, eventEnd] }) => {
    const es = eventStart.startOf('minute')
    const ee = eventEnd.startOf('minute')
    return (s >= es && s < ee) || (e > es && e <= ee) || (s < es && e > ee)
  })
}

export const generateDateArray = (
  start: string | Dayjs,
  end: string | Dayjs,
  stepMinutes: number,
) => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  const dates = []

  let current = startDate
  while (current.isBefore(endDate) || current.isSame(endDate)) {
    dates.push(current)
    current = current.add(stepMinutes, 'minute')
  }

  return dates
}

export const getSlotSize = (
  timeLineRef: HTMLDivElement | null,
  direction: SchedulerDirection = 'horizontal',
): number => {
  if (!timeLineRef?.childNodes?.length) return 0
  const lastChild = timeLineRef.childNodes[timeLineRef.childNodes.length - 1] as HTMLElement
  const rect = lastChild.getBoundingClientRect()
  return direction === 'vertical' ? rect.height : rect.width
}

/** @deprecated use getSlotSize */
export const getSlotWidth = (timeLineRef: HTMLDivElement | null) =>
  getSlotSize(timeLineRef, 'horizontal')

export const computeIntervalByPosition = (
  timeLineRef: HTMLDivElement | null,
  position: number,
  size: number,
  startDate: Dayjs,
  step: number = 30,
  direction: SchedulerDirection = 'horizontal',
): TimeRange => {
  if (!timeLineRef?.childNodes?.length) return [dayjs(), dayjs()]
  const slotSize = getSlotSize(timeLineRef, direction)
  const slotIndex = Math.round(position / slotSize)
  const slotStart = startDate.clone().add(slotIndex * step, 'minute')
  const durationMinutes = Math.round((size / slotSize) * step)
  const slotEnd = slotStart.clone().add(durationMinutes, 'minute')
  return [slotStart, slotEnd]
}

export const getSlotPosition = (
  timeLineRef: HTMLDivElement | null,
  startTime: Dayjs,
  startDate: Dayjs,
  step: number = 30,
  direction: SchedulerDirection = 'horizontal',
): number => {
  const slotSize = getSlotSize(timeLineRef, direction)
  const slotIndex = startTime.diff(startDate, 'minute') / step
  return slotIndex * slotSize
}

export const computeIntervalCssStyles = ({
  interval,
  timeLineRef,
  step,
  startDate,
  direction = 'horizontal',
}: {
  interval: TimeRange
  timeLineRef: HTMLDivElement | null
  step: number
  startDate: Dayjs
  direction?: SchedulerDirection
}): { position: number; size: number } => {
  const [start, end] = interval
  const duration = Math.ceil(end.diff(start, 'minute') / step)
  const slotSize = getSlotSize(timeLineRef, direction)
  return {
    position: getSlotPosition(timeLineRef, start, startDate, step, direction),
    size: slotSize * duration,
  }
}
