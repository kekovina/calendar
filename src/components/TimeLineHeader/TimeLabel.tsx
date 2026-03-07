import type { Dayjs } from 'dayjs'
import React from 'react'

type TimeLabelProps = {
  date: Dayjs
  isFirst: boolean
  format?: string
  className?: string
}

export const TimeLabel: React.FC<TimeLabelProps> = ({
  date,
  isFirst,
  format = 'HH:mm',
  className,
}) => (
  <div className={`relative min-w-[40px] flex-1 overflow-visible ${className ?? ''}`}>
    <span
      className={`absolute top-0 whitespace-nowrap text-xs text-gray-400 ${
        isFirst ? 'left-0' : 'left-0 -translate-x-1/2'
      }`}
    >
      {date.format(format)}
    </span>
  </div>
)
