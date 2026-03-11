import classNames from 'classnames'
import React, { memo } from 'react'
import type { ReactNode } from 'react'
import type { SchedulerDirection, SchedulerEvent } from '../types'

type EventBlockProps = {
  position: number
  size: number
  id: string
  event: SchedulerEvent
  direction?: SchedulerDirection
  label?: string
  className?: string
  renderEvent?: (options: { event: SchedulerEvent; direction: SchedulerDirection }) => ReactNode
  onEventClick?: (options: { event: SchedulerEvent; direction: SchedulerDirection }) => void
}

export const EventBlock: React.FC<EventBlockProps> = memo(
  ({
    position,
    size,
    id,
    event,
    direction = 'horizontal',
    label,
    className,
    renderEvent,
    onEventClick,
  }) => {
    const isVertical = direction === 'vertical'
    const style = isVertical
      ? { top: position, height: size - 1, left: '5%', right: '5%', width: 'auto' }
      : { left: position, width: size - 1 }

    const handleClick = onEventClick ? () => onEventClick({ event, direction }) : undefined

    if (renderEvent) {
      return (
        <div key={id} className="absolute" style={style} onClick={handleClick}>
          {renderEvent({ event, direction })}
        </div>
      )
    }

    return (
      <div
        key={id}
        className={classNames(
          'absolute rounded-2xl bg-gray-300',
          isVertical ? 'w-[90%]' : 'h-[90%]',
          label && 'flex items-center overflow-hidden',
          onEventClick && 'cursor-pointer',
          className,
        )}
        style={style}
        onClick={handleClick}
      >
        {label && <span className="truncate px-2 text-xs font-medium text-gray-600">{label}</span>}
      </div>
    )
  },
)

EventBlock.displayName = 'EventBlock'
