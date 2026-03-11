import React from 'react'
import type { TimeRange } from '../types'

type DisplayIntervalProps = {
  interval: TimeRange
  isSmall: boolean
  format?: string
}

export const DisplayInterval: React.FC<DisplayIntervalProps> = ({
  interval,
  isSmall,
  format = 'HH:mm',
}) => (
  <>
    {interval[0].format(format)} {isSmall && <br />} - {isSmall && <br />}
    {interval[1].format(format)}
  </>
)
