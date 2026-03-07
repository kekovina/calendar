import classNames from 'classnames'
import React from 'react'
import type { ReactNode } from 'react'

type ResizeHandleProps = {
  dir: 'left' | 'right'
  className?: string
  render?: (dir: 'left' | 'right') => ReactNode
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ dir, className, render }) => {
  if (render) return <>{render(dir)}</>

  return (
    <svg
      width={8}
      height={16}
      viewBox="0 0 8 16"
      fill="none"
      className={classNames('shrink-0', { 'rotate-180': dir === 'left' }, className)}
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
