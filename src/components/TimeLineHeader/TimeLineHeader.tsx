import classNames from 'classnames'
import type { Dayjs } from 'dayjs'
import React from 'react'
import { useTimeIntervals } from '../../hooks/useTimeIntervals'
import { TimeLabel } from './TimeLabel'

export type TimeLineHeaderProps = {
  startDate: Dayjs
  endDate: Dayjs
  interval: number
  /** Show a label every N slots. Defaults to every full hour (60 / interval). */
  labelEvery?: number
  timeFormat?: string
  className?: string
  labelClassName?: string
}

const TimeLineHeader: React.FC<TimeLineHeaderProps> = ({
  startDate,
  endDate,
  interval,
  labelEvery,
  timeFormat,
  className,
  labelClassName,
}) => {
  const intervalArray = useTimeIntervals(startDate, endDate, interval)
  const every = labelEvery ?? Math.max(1, Math.round(60 / interval))

  const lastDate = intervalArray[intervalArray.length - 1]

  return (
    <div className={classNames('relative flex h-5 overflow-visible', className)}>
      {intervalArray.slice(0, -1).map((date, index) => (
        <TimeLabel
          key={date.valueOf()}
          date={date}
          isFirst={index === 0}
          format={timeFormat}
          className={classNames(index % every !== 0 && 'invisible', labelClassName)}
        />
      ))}

      {/* End label: zero-width anchor at the right edge, text shifted -100% */}
      {lastDate && (
        <div className="relative w-0 shrink-0 overflow-visible">
          <span
            className={classNames(
              'absolute left-0 -translate-x-full whitespace-nowrap text-xs text-gray-400',
              labelClassName,
            )}
          >
            {lastDate.format(timeFormat ?? 'HH:mm')}
          </span>
        </div>
      )}
    </div>
  )
}

export default TimeLineHeader
