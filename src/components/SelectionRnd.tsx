import classNames from 'classnames'
import React from 'react'
import type { ReactNode, RefObject } from 'react'
import { Rnd } from 'react-rnd'
import type { RndResizeCallback, RndDragCallback } from 'react-rnd'
import type { TimeRange, SchedulerClassNames, SchedulerDirection } from '../types'
import { DisplayInterval } from './DisplayInterval'
import { ResizeHandle } from './ResizeHandle'

type SelectionRndProps = {
  width: number | string
  height: string | number
  posX: number
  posY: number
  minWidth: number
  minHeight: number
  isError: boolean
  interval: TimeRange
  isSmallCarret: boolean
  gridSize: number
  direction?: SchedulerDirection
  isCrossDragging?: boolean
  onDrag: RndDragCallback
  onDragStop: RndDragCallback
  onResize: RndResizeCallback
  onResizeStop: RndResizeCallback
  carretRef: RefObject<HTMLDivElement | null>
  disableResize?: boolean
  classNames?: SchedulerClassNames
  renderResizeHandle?: (options: {
    dir: 'left' | 'right'
    direction: SchedulerDirection
  }) => ReactNode
  renderIntervalContent?: (options: {
    interval: TimeRange
    isSmall: boolean
    isError: boolean
    direction: SchedulerDirection
  }) => ReactNode
}

export const SelectionRnd: React.FC<SelectionRndProps> = ({
  width,
  height,
  posX,
  posY,
  minWidth,
  minHeight,
  isError,
  interval,
  isSmallCarret,
  gridSize,
  direction = 'horizontal',
  isCrossDragging = false,
  onDrag,
  onDragStop,
  onResize,
  onResizeStop,
  carretRef,
  disableResize = false,
  classNames: cls,
  renderResizeHandle,
  renderIntervalContent,
}) => {
  const isVertical = direction === 'vertical'
  const handleCls = isError ? 'bg-red-600' : undefined

  return (
    <Rnd
      size={{ width, height }}
      position={{ x: posX, y: posY }}
      bounds="parent"
      enableResizing={
        isVertical
          ? { top: !disableResize, bottom: !disableResize, left: false, right: false }
          : { left: !disableResize, right: !disableResize, top: false, bottom: false }
      }
      minWidth={minWidth}
      minHeight={minHeight}
      dragAxis={isVertical ? 'y' : 'x'}
      dragGrid={isVertical ? [1, gridSize] : [gridSize, 1]}
      resizeGrid={isVertical ? [1, gridSize] : [gridSize, 1]}
      onDrag={onDrag}
      onDragStop={onDragStop}
      onResize={onResize}
      onResizeStop={onResizeStop}
      resizeHandleComponent={
        isVertical
          ? {
              top: <ResizeHandle dir="left" direction="vertical" render={renderResizeHandle} />,
              bottom: <ResizeHandle dir="right" direction="vertical" render={renderResizeHandle} />,
            }
          : {
              right: (
                <ResizeHandle dir="right" direction="horizontal" render={renderResizeHandle} />
              ),
              left: <ResizeHandle dir="left" direction="horizontal" render={renderResizeHandle} />,
            }
      }
      resizeHandleClasses={
        isVertical
          ? {
              top: classNames(
                'w-full cursor-row-resize rounded-t-2xl flex justify-center',
                handleCls ?? cls?.resizeHandleLeft ?? 'bg-blue-700',
              ),
              bottom: classNames(
                'w-full cursor-row-resize rounded-b-2xl flex justify-center',
                handleCls ?? cls?.resizeHandleRight ?? 'bg-blue-700',
              ),
            }
          : {
              right: classNames(
                'h-full cursor-col-resize rounded-r-2xl flex items-center flex justify-center',
                handleCls ?? cls?.resizeHandleRight ?? 'bg-blue-700',
              ),
              left: classNames(
                'h-full cursor-col-resize rounded-l-2xl flex items-center flex justify-center',
                handleCls ?? cls?.resizeHandleLeft ?? 'bg-blue-700',
              ),
            }
      }
      resizeHandleStyles={
        isVertical
          ? { top: { top: 0, height: 16 }, bottom: { bottom: 0, height: 16 } }
          : { right: { right: 0, width: 16 }, left: { left: 0, width: 16 } }
      }
      className={classNames(
        'rounded-2xl',
        isCrossDragging && 'invisible',
        isError
          ? classNames('opacity-35', cls?.selectionError ?? 'bg-red-500')
          : (cls?.selection ?? 'bg-blue-500'),
      )}
    >
      <div className="flex h-full items-center justify-center" ref={carretRef}>
        <div
          className={classNames('w-full text-center text-white', {
            'text-wrap text-sm leading-none': isSmallCarret,
          })}
        >
          {renderIntervalContent ? (
            renderIntervalContent({ interval, isSmall: isSmallCarret, isError, direction })
          ) : (
            <DisplayInterval interval={interval} isSmall={isSmallCarret} />
          )}
        </div>
      </div>
    </Rnd>
  )
}
