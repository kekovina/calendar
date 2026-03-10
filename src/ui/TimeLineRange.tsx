import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { EventBlock } from '../components/EventBlock'
import { SelectionRnd } from '../components/SelectionRnd'
import { TimeSlot } from '../components/TimeSlot'
import { useDisabledIntervals } from '../hooks/useDisabledIntervals'
import { useIntervalValidation } from '../hooks/useIntervalValidation'
import { useRndHandlers } from '../hooks/useRndHandlers'
import { useRndState } from '../hooks/useRndState'
import { useSlotClick } from '../hooks/useSlotClick'
import type { SelectionError, TimeLineRangeProps } from '../types'
import { generateDateArray, getSlotPosition, getSlotSize } from '../utils'

const TimeLineRange = forwardRef<HTMLDivElement, TimeLineRangeProps>(
  (
    {
      id,
      disabled = false,
      disablePast = false,
      selectedInterval,
      previewInterval,
      previewError = null,
      events = [],
      onChange,
      onCrossDragDrop,
      onCrossDragMove,
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
      renderLabel,
      renderEvent,
      onEventClick,
    },
    timeLineRef,
  ) => {
    const [selectionError, setSelectionError] = useState<SelectionError>(null)
    const carretRef = useRef<HTMLDivElement | null>(null)
    const localRef = useRef<HTMLDivElement>(null)

    const internalRef = (timeLineRef as React.RefObject<HTMLDivElement> | null) ?? localRef
    const isVertical = direction === 'vertical'

    const intervalArray = useMemo(
      () => generateDateArray(startDate, endDate, interval),
      [startDate, endDate, interval],
    )

    const { validateInterval } = useIntervalValidation(events, disablePast)

    useEffect(() => {
      if (!selectedInterval) {
        setSelectionError(null)
        return
      }
      setSelectionError(validateInterval(selectedInterval[0], selectedInterval[1]))
    }, [selectedInterval, validateInterval])

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
      onError: setSelectionError,
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
      onCrossDragMove,
      onError: setSelectionError,
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

    // Compute cross-drag preview element position/size
    const previewStyle = useMemo(() => {
      if (!previewInterval || !internalRef.current) return null
      const rowDay = startDate.startOf('day')
      // Adjust interval to this row's day (preserve time-of-day)
      const adjStart = rowDay
        .hour(previewInterval[0].hour())
        .minute(previewInterval[0].minute())
        .second(0)
      const adjEnd = rowDay
        .hour(previewInterval[1].hour())
        .minute(previewInterval[1].minute())
        .second(0)
      const sz = getSlotSize(internalRef.current, direction)
      const pos = getSlotPosition(internalRef.current, adjStart, startDate, interval, direction)
      const duration = adjEnd.diff(adjStart, 'minute')
      const size = (duration / interval) * sz
      const rect = internalRef.current.getBoundingClientRect()
      if (isVertical) {
        return {
          position: 'absolute' as const,
          top: pos,
          height: size,
          left: rect.width * 0.05,
          width: '90%',
        }
      }
      return {
        position: 'absolute' as const,
        left: pos,
        width: size,
        top: (rect.height * 0.1) / 2,
        height: '90%',
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewInterval, startDate, interval, direction, isVertical, internalRef.current])

    return (
      <div
        className={classNames(
          isVertical ? 'w-full h-auto' : 'h-[65px] w-full',
          renderLabel && (isVertical ? 'flex flex-col' : 'flex flex-row'),
          cls?.root ?? 'bg-gray-100',
          className,
        )}
      >
        {renderLabel && renderLabel({ direction })}
        <div
          className={classNames(
            'relative',
            renderLabel && 'flex-1',
            isVertical ? 'flex flex-col w-full' : 'flex h-full items-center',
            cls?.track,
          )}
          ref={internalRef}
        >
          {eventBlocks.map((block) => (
            <EventBlock
              key={`${id}::${block.id}`}
              id={block.id}
              event={block.event}
              position={block.position}
              size={block.size}
              direction={direction}
              label={block.label}
              className={block.className ?? cls?.eventBlock}
              renderEvent={renderEvent}
              onEventClick={onEventClick}
            />
          ))}

          {shouldShowSelection && internalRef.current && (
            <>
              {rndHandlers.isCrossDragging && (
                <div
                  style={{
                    position: 'absolute',
                    left: selectionProps.posX,
                    top: selectionProps.posY,
                    width: selectionProps.width,
                    height: selectionProps.height,
                  }}
                  className={classNames(
                    'rounded-2xl pointer-events-none',
                    selectionError !== null
                      ? classNames('opacity-35', cls?.selectionError ?? 'bg-red-500')
                      : (cls?.selection ?? 'bg-blue-500'),
                  )}
                />
              )}
              <SelectionRnd
                {...selectionProps}
                error={selectionError}
                interval={displayInterval!}
                isSmallCarret={isSmallCarret}
                gridSize={slotSize}
                direction={direction}
                isCrossDragging={rndHandlers.isCrossDragging}
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
            </>
          )}

          {previewStyle && (
            <div
              style={previewStyle}
              className={classNames(
                'rounded-2xl pointer-events-none opacity-50',
                previewError !== null
                  ? (cls?.selectionError ?? 'bg-red-500')
                  : (cls?.selection ?? 'bg-blue-500'),
              )}
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
