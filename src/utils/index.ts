import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { TimeRange } from '../types'

interface IntervalStyles {
  x: number
  width: number
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

export const getSlotWidth = (timeLineRef: HTMLDivElement | null) => {
  if (!timeLineRef?.childNodes?.length) {
    return 0
  }
  const slotWidth = (
    timeLineRef.childNodes[timeLineRef.childNodes.length - 1] as HTMLElement
  ).getBoundingClientRect().width
  return slotWidth
}

export const computeIntervalByPosition = (
  timeLineRef: HTMLDivElement | null,
  position: number,
  width: number,
  startDate: Dayjs,
  step: number = 30,
): TimeRange => {
  if (!timeLineRef?.childNodes?.length) {
    return [dayjs(), dayjs()]
  }
  const slotWidth = getSlotWidth(timeLineRef)

  const slotIndex = Math.round(position / slotWidth)

  const slotStart = startDate.clone().add(slotIndex * step, 'minute')
  const slotEnd = slotStart.clone().add((width / slotWidth) * step, 'minute')
  return [slotStart, slotEnd]
}

export const getSlotPosition = (
  timeLineRef: HTMLDivElement | null,
  startTime: Dayjs,
  startDate: Dayjs,
  step: number = 30,
) => {
  const slotSize = getSlotWidth(timeLineRef)
  const slotIndex = startTime.diff(startDate, 'minute') / step
  return slotIndex * slotSize
}

export const computeIntervalCssStyles = ({
  interval,
  timeLineRef,
  step,
  startDate,
}: {
  interval: TimeRange
  timeLineRef: HTMLDivElement | null
  step: number
  startDate: Dayjs
}): IntervalStyles => {
  const [start, end] = interval
  const duration = Math.ceil(end.diff(start, 'minute') / step)

  return {
    x: getSlotPosition(timeLineRef, interval[0], startDate, step),
    width: getSlotWidth(timeLineRef) * duration,
  }
}
