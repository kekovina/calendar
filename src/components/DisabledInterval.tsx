import classNames from 'classnames'
import React, { memo } from 'react'

type DisabledIntervalProps = {
  left: number
  width: number
  id: string
  className?: string
}

export const DisabledInterval: React.FC<DisabledIntervalProps> = memo(
  ({ left, width, id, className }) => (
    <div
      key={id}
      className={classNames('absolute h-[90%] rounded-2xl bg-gray-300', className)}
      style={{ left, width: width - 1 }}
    />
  ),
)

DisabledInterval.displayName = 'DisabledInterval'
