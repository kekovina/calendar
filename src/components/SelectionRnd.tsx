import classNames from 'classnames'
import React from 'react'
import type { ReactNode, RefObject } from 'react'
import { Rnd } from 'react-rnd'
import type { RndResizeCallback, RndDragCallback } from 'react-rnd'
import type { TimeRange, SchedulerClassNames } from '../types'
import { DisplayInterval } from './DisplayInterval'
import { ResizeHandle } from './ResizeHandle'

type SelectionRndProps = {
  width: number
  height: string
  posX: number
  posY: number
  minWidth: number
  isError: boolean
  interval: TimeRange
  isSmallCarret: boolean
  gridSize: number
  onDrag: RndDragCallback
  onDragStop: RndDragCallback
  onResize: RndResizeCallback
  onResizeStop: RndResizeCallback
  carretRef: RefObject<HTMLDivElement | null>
  disableResize?: boolean
  classNames?: SchedulerClassNames
  renderResizeHandle?: (dir: 'left' | 'right') => ReactNode
  renderIntervalContent?: (interval: TimeRange, isSmall: boolean) => ReactNode
}

export const SelectionRnd: React.FC<SelectionRndProps> = ({
  width,
  height,
  posX,
  posY,
  minWidth,
  isError,
  interval,
  isSmallCarret,
  gridSize,
  onDrag,
  onDragStop,
  onResize,
  onResizeStop,
  carretRef,
  disableResize = false,
  classNames: cls,
  renderResizeHandle,
  renderIntervalContent,
}) => (
  <Rnd
    size={{ width, height }}
    position={{ x: posX, y: posY }}
    bounds="parent"
    enableResizing={{ left: !disableResize, right: !disableResize, top: false, bottom: false }}
    minWidth={minWidth}
    dragAxis="x"
    dragGrid={[gridSize, 1]}
    resizeGrid={[gridSize, 1]}
    onDrag={onDrag}
    onDragStop={onDragStop}
    onResize={onResize}
    onResizeStop={onResizeStop}
    resizeHandleComponent={{
      right: <ResizeHandle dir="right" render={renderResizeHandle} />,
      left: <ResizeHandle dir="left" render={renderResizeHandle} />,
    }}
    resizeHandleClasses={{
      right: classNames(
        'h-full cursor-col-resize rounded-r-2xl flex items-center',
        isError ? 'bg-red-600' : (cls?.resizeHandleRight ?? 'bg-blue-700'),
      ),
      left: classNames(
        'h-full cursor-col-resize rounded-l-2xl flex items-center',
        isError ? 'bg-red-600' : (cls?.resizeHandleLeft ?? 'bg-blue-700'),
      ),
    }}
    resizeHandleStyles={{
      right: { right: 0, width: 16 },
      left: { left: 0, width: 16 },
    }}
    className={classNames(
      'rounded-2xl',
      isError
        ? classNames('opacity-35', cls?.selectionError ?? 'bg-red-500')
        : (cls?.selection ?? 'bg-blue-500'),
    )}
  >
    <div className="flex h-full items-center" ref={carretRef}>
      <div
        className={classNames('w-full text-center text-white', {
          'text-wrap text-sm leading-none': isSmallCarret,
        })}
      >
        {renderIntervalContent ? (
          renderIntervalContent(interval, isSmallCarret)
        ) : (
          <DisplayInterval interval={interval} isSmall={isSmallCarret} />
        )}
      </div>
    </div>
  </Rnd>
)
