import type { ReactNode } from 'react'

export interface SchedulerProps {
  children?: ReactNode
}

export function Scheduler({ children }: SchedulerProps) {
  return <div className="scheduler">{children}</div>
}
