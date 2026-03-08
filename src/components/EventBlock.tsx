import classNames from 'classnames'
import React, { memo } from 'react'
import type { SchedulerDirection } from '../types'

type EventBlockProps = {
  position: number
  size: number
  id: string
  direction?: SchedulerDirection
  label?: string
  className?: string
}

export const EventBlock: React.FC<EventBlockProps> = memo(
  ({ position, size, id, direction = 'horizontal', label, className }) => {
    const isVertical = direction === 'vertical'
    const style = isVertical
      ? { top: position, height: size - 1, left: '5%', right: '5%', width: 'auto' }
      : { left: position, width: size - 1 }

    return (
      <div
        key={id}
        className={classNames(
          'absolute rounded-2xl bg-gray-300',
          isVertical ? 'w-[90%]' : 'h-[90%]',
          label && 'flex items-center overflow-hidden',
          className,
        )}
        style={style}
      >
        {label && <span className="truncate px-2 text-xs font-medium text-gray-600">{label}</span>}
      </div>
    )
  },
)

EventBlock.displayName = 'EventBlock'
