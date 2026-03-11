import React from 'react'
import type { ReactNode } from 'react'
import type { SchedulerDirection } from '../types'

// Fixed fake rows for the visual background behind the blur
const FAKE_ROWS = [
  {
    bg: 'bg-blue-50',
    events: [
      { start: '8%', size: '13%', color: 'bg-blue-200' },
      { start: '38%', size: '18%', color: 'bg-blue-200' },
      { start: '72%', size: '10%', color: 'bg-blue-200' },
    ],
  },
  {
    bg: 'bg-emerald-50',
    events: [
      { start: '22%', size: '11%', color: 'bg-emerald-200' },
      { start: '55%', size: '14%', color: 'bg-emerald-200' },
    ],
  },
  {
    bg: 'bg-gray-100',
    events: [
      { start: '5%', size: '9%', color: 'bg-gray-300' },
      { start: '45%', size: '20%', color: 'bg-gray-300' },
      { start: '78%', size: '8%', color: 'bg-gray-300' },
    ],
  },
  {
    bg: 'bg-amber-50',
    events: [
      { start: '16%', size: '15%', color: 'bg-amber-200' },
      { start: '65%', size: '12%', color: 'bg-amber-200' },
    ],
  },
  {
    bg: 'bg-violet-50',
    events: [
      { start: '30%', size: '11%', color: 'bg-violet-200' },
      { start: '58%', size: '15%', color: 'bg-violet-200' },
      { start: '82%', size: '9%', color: 'bg-violet-200' },
    ],
  },
]

type OverlayProps = {
  isLoading?: boolean
  loadingText?: string
  renderOverlay?: () => ReactNode
  direction?: SchedulerDirection
}

export const Overlay: React.FC<OverlayProps> = ({
  isLoading = false,
  loadingText = 'Loading...',
  renderOverlay,
  direction = 'horizontal',
}) => {
  const isVertical = direction === 'vertical'

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      {/* Fake timeline rows — visible as background through the blur */}
      <div className={isVertical ? 'flex h-full gap-1 p-1' : 'flex flex-col gap-1 p-1 h-full'}>
        {FAKE_ROWS.map((row) => (
          <div key={row.bg} className={`relative rounded-lg ${row.bg} flex-1`}>
            {row.events.map((event) => (
              <div
                key={event.start}
                className={`absolute rounded-xl ${event.color}`}
                style={
                  isVertical
                    ? { top: event.start, height: event.size, left: '5%', right: '5%' }
                    : { left: event.start, width: event.size, top: '5%', bottom: '5%' }
                }
              />
            ))}
          </div>
        ))}
      </div>

      {/* Semi-transparent overlay with backdrop blur */}
      <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-white/60">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
            <span className="text-sm font-medium text-gray-500">{loadingText}</span>
          </div>
        ) : (
          renderOverlay?.()
        )}
      </div>
    </div>
  )
}
