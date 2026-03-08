import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { forwardRef, useMemo, useRef, useState } from 'react'
import { EventBlock } from '../components/EventBlock'
import { SelectionRnd } from '../components/SelectionRnd'
import { TimeSlot } from '../components/TimeSlot'
import { useDisabledIntervals } from '../hooks/useDisabledIntervals'
import { useIntervalValidation } from '../hooks/useIntervalValidation'
import { useRndHandlers } from '../hooks/useRndHandlers'
import { useRndState } from '../hooks/useRndState'
import { useSlotClick } from '../hooks/useSlotClick'
import type { TimeLineRangeProps } from '../types'
import { generateDateArray, getSlotSize } from '../utils'

const TimeLineRange = forwardRef<HTMLDivElement, TimeLineRangeProps>(
  (
    {
      id,
      disabled = false,
      disablePast = false,
      selectedInterval,
      events = [],
      onChange,
      onCrossDragDrop,
      minimumInterval = 30,
      startDate = dayjs().startOf('day'),
      endDate = dayjs().endOf('day'),
      boundsStart,
      boundsEnd,
      interval = 30,
      fixedDuration,
      direction = 'horizontal',
      crossDragEnabled = false,
      debug = false,
      className,
      classNames: cls,
      renderResizeHandle,
      renderIntervalContent,
    },
    timeLineRef,
  ) => {
    const [isError, setIsError] = useState(false)
    const carretRef = useRef<HTMLDivElement | null>(null)
    const localRef = useRef<HTMLDivElement>(null)

    const internalRef = (timeLineRef as React.RefObject<HTMLDivElement> | null) ?? localRef
    const isVertical = direction === 'vertical'

    const intervalArray = useMemo(
      () => generateDateArray(startDate, endDate, interval),
      [startDate, endDate, interval],
    )

    const { validateInterval } = useIntervalValidation(events, disablePast)

    const rndState = useRndState({
      selectedInterval: selectedInterval ?? null,
      startDate,
      interval,
      minimumInterval,
      timeLineRef: internalRef,
      direction,
    })

    const { handleClick } = useSlotClick({
      disabled,
      disablePast,
      minimumInterval,
      startDate,
      endDate,
      interval,
      fixedDuration,
      direction,
      timeLineRef: internalRef,
      validateInterval,
      onChange,
      onError: setIsError,
      updatePosition: rndState.updatePosition,
      updateWidth: rndState.updateWidth,
    })

    const rndHandlers = useRndHandlers({
      timeLineRef: internalRef,
      startDate,
      interval,
      selectedInterval: selectedInterval ?? null,
      boundsStart,
      boundsEnd,
      direction,
      crossDragEnabled,
      validateInterval,
      onChange,
      onCrossDragDrop,
      onError: setIsError,
      updatePosition: rndState.updatePosition,
      updateWidth: rndState.updateWidth,
      updatePreview: rndState.updatePreview,
      clearPreview: rndState.clearPreview,
    })

    const eventBlocks = useDisabledIntervals({
      events,
      timeLineRef: internalRef,
      interval,
      startDate,
      direction,
    })

    const slotSize = getSlotSize(internalRef.current, direction)
    const minSlotSize = (minimumInterval / interval) * slotSize

    const shouldShowSelection =
      selectedInterval && internalRef.current && selectedInterval[0].isSame(startDate, 'day')

    const displayInterval = rndState.selectedIntervalPreview || selectedInterval

    // In horizontal: isSmall based on width; in vertical: based on height
    const isSmallCarret = isVertical
      ? (carretRef.current?.clientHeight ?? 0) < 80
      : (carretRef.current?.clientWidth ?? 0) < 150

    // Compute SelectionRnd props depending on direction
    const containerRect = internalRef.current?.getBoundingClientRect()
    const selectionProps = isVertical
      ? {
          width: '90%' as const,
          height: rndState.width, // rndState.width holds the "size" (height in vertical)
          posX: containerRect ? containerRect.width * 0.05 : 0,
          posY: rndState.posX, // rndState.posX holds the "pos" (y in vertical)
          minWidth: 0,
          minHeight: minSlotSize,
        }
      : {
          width: rndState.width,
          height: '90%' as const,
          posX: rndState.posX,
          posY: containerRect ? (containerRect.height * 0.1) / 2 : 0,
          minWidth: minSlotSize,
          minHeight: 0,
        }

    return (
      <div
        className={classNames(
          isVertical ? 'w-full h-auto' : 'h-[65px] w-full',
          cls?.root ?? 'bg-gray-100',
          className,
        )}
      >
        <div
          className={classNames(
            'relative',
            isVertical ? 'flex flex-col w-full' : 'flex h-full items-center',
            cls?.track,
          )}
          ref={internalRef}
        >
          {eventBlocks.map((block) => (
            <EventBlock
              key={`${id}::${block.id}`}
              id={block.id}
              position={block.position}
              size={block.size}
              direction={direction}
              label={block.label}
              className={block.className ?? cls?.eventBlock}
            />
          ))}

          {shouldShowSelection && internalRef.current && (
            <SelectionRnd
              {...selectionProps}
              isError={isError}
              interval={displayInterval!}
              isSmallCarret={isSmallCarret}
              gridSize={slotSize}
              direction={direction}
              crossDragEnabled={crossDragEnabled}
              disableResize={!!fixedDuration}
              onDrag={rndHandlers.handleDrag}
              onDragStop={rndHandlers.handleDragStop}
              onResize={rndHandlers.handleResize}
              onResizeStop={rndHandlers.handleResizeStop}
              carretRef={carretRef}
              classNames={cls}
              renderResizeHandle={renderResizeHandle}
              renderIntervalContent={renderIntervalContent}
            />
          )}

          {intervalArray.slice(0, -1).map((date) => (
            <TimeSlot
              key={date.format('YYYY-MM-DD HH:mm')}
              date={date}
              disabled={disabled}
              disablePast={disablePast}
              direction={direction}
              debug={debug}
              onClick={handleClick}
              className={cls?.slot}
              pastClassName={cls?.slotPast}
            />
          ))}
        </div>
      </div>
    )
  },
)

TimeLineRange.displayName = 'TimeLineRange'

export default TimeLineRange
