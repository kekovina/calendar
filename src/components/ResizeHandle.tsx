import classNames from 'classnames'
import React from 'react'
import type { ReactNode } from 'react'
import type { SchedulerDirection } from '../types'

type ResizeHandleProps = {
  dir: 'left' | 'right'
  direction?: SchedulerDirection
  className?: string
  render?: (options: { dir: 'left' | 'right'; direction: SchedulerDirection }) => ReactNode
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  dir,
  direction = 'horizontal',
  className,
  render,
}) => {
  if (render) return <>{render({ dir, direction })}</>

  const rotationClass =
    direction === 'vertical'
      ? dir === 'left'
        ? '-rotate-90'
        : 'rotate-90'
      : dir === 'left'
        ? 'rotate-180'
        : ''

  return (
    <svg
      width={8}
      height={16}
      viewBox="0 0 8 16"
      fill="none"
      className={classNames('shrink-0 text-white', rotationClass, className)}
    >
      <path
        d="M2 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
