import classNames from 'classnames'
import dayjs, { type Dayjs } from 'dayjs'
import React, { memo } from 'react'

type TimeSlotProps = {
  date: Dayjs
  disabled: boolean
  disablePast: boolean
  debug: boolean
  onClick: (date: Dayjs) => void
  className?: string
  pastClassName?: string
}

export const TimeSlot: React.FC<TimeSlotProps> = memo(
  ({ date, disabled, disablePast, debug, onClick, className, pastClassName }) => {
    const isPast = disablePast && dayjs().isAfter(date)
    const isClickable = !disabled && !isPast

    return (
      <div
        className={classNames(
          'h-full min-w-10 flex-1 border-r border-white',
          { 'cursor-pointer': isClickable },
          isPast && (pastClassName ?? ' bg-red-100'),
          className,
        )}
        onClick={() => isClickable && onClick(date)}
      >
        {debug && <div className="text-center text-xs">{date.format('HH:mm')}</div>}
      </div>
    )
  },
)

TimeSlot.displayName = 'TimeSlot'
