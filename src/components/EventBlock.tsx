import classNames from 'classnames'
import React, { memo } from 'react'

type EventBlockProps = {
  left: number
  width: number
  id: string
  label?: string
  className?: string
}

export const EventBlock: React.FC<EventBlockProps> = memo(
  ({ left, width, id, label, className }) => (
    <div
      key={id}
      className={classNames(
        'absolute h-[90%] rounded-2xl bg-gray-300',
        label && 'flex items-center overflow-hidden',
        className,
      )}
      style={{ left, width: width - 1 }}
    >
      {label && <span className="truncate px-2 text-xs font-medium text-gray-600">{label}</span>}
    </div>
  ),
)

EventBlock.displayName = 'EventBlock'
