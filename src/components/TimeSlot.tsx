import classNames from 'classnames'
import dayjs, { type Dayjs } from 'dayjs'
import React, { memo } from 'react'
import type { SchedulerDirection } from '../types'

type TimeSlotProps = {
  date: Dayjs
  disabled: boolean
  disablePast: boolean
  debug: boolean
  direction?: SchedulerDirection
  onClick: (date: Dayjs) => void
  className?: string
  pastClassName?: string
}

export const TimeSlot: React.FC<TimeSlotProps> = memo(
  ({
    date,
    disabled,
    disablePast,
    debug,
    direction = 'horizontal',
    onClick,
    className,
    pastClassName,
  }) => {
    const isPast = disablePast && dayjs().isAfter(date)
    const isClickable = !disabled && !isPast
    const isVertical = direction === 'vertical'

    return (
      <div
        className={classNames(
          'flex-1',
          isVertical
            ? 'w-full min-h-10 border-b border-white'
            : 'h-full min-w-10 border-r border-white',
          { 'cursor-pointer': isClickable },
          isPast && (pastClassName ?? 'bg-red-100'),
          className,
        )}
        onClick={() => isClickable && onClick(date)}
      >
        {debug && (
          <div className={classNames('text-xs', isVertical ? 'text-left px-1' : 'text-center')}>
            {date.format('HH:mm')}
          </div>
        )}
      </div>
    )
  },
)

TimeSlot.displayName = 'TimeSlot'
