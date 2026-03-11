import classNames from 'classnames'
import type { Dayjs } from 'dayjs'
import React from 'react'
import type { SchedulerDirection } from '../../types'

type TimeLabelProps = {
  date: Dayjs
  isFirst: boolean
  format?: string
  direction?: SchedulerDirection
  className?: string
}

export const TimeLabel: React.FC<TimeLabelProps> = ({
  date,
  isFirst,
  format = 'HH:mm',
  direction = 'horizontal',
  className,
}) => {
  if (direction === 'vertical') {
    return (
      <div className={classNames('relative min-h-[40px] flex-1 overflow-visible', className)}>
        <span
          className={classNames(
            'absolute left-0 right-0 whitespace-nowrap text-xs text-gray-400 text-right pr-1',
            isFirst ? 'top-0' : 'top-0 -translate-y-1/2',
          )}
        >
          {date.format(format)}
        </span>
      </div>
    )
  }

  return (
    <div className={classNames('relative min-w-[40px] flex-1 overflow-visible', className)}>
      <span
        className={classNames(
          'absolute top-0 whitespace-nowrap text-xs text-gray-400',
          isFirst ? 'left-0' : 'left-0 -translate-x-1/2',
        )}
      >
        {date.format(format)}
      </span>
    </div>
  )
}
