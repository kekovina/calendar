import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { forwardRef, useMemo, useRef, useState } from 'react'
import { DisabledInterval } from '../components/DisabledInterval'
import { SelectionRnd } from '../components/SelectionRnd'
import { TimeSlot } from '../components/TimeSlot'
import { useDisabledIntervals } from '../hooks/useDisabledIntervals'
import { useIntervalValidation } from '../hooks/useIntervalValidation'
import { useRndHandlers } from '../hooks/useRndHandlers'
import { useRndState } from '../hooks/useRndState'
import { useSlotClick } from '../hooks/useSlotClick'
import type { TimeLineRangeProps } from '../types'
import { generateDateArray, getSlotWidth } from '../utils'

const TimeLineRange = forwardRef<HTMLDivElement, TimeLineRangeProps>(
  (
    {
      id,
      disabled = false,
      disablePast = false,
      selectedInterval,
      disabledIntervals = [],
      onChange,
      minimumInterval = 30,
      startDate = dayjs().startOf('day'),
      endDate = dayjs().endOf('day'),
      boundsStart,
      boundsEnd,
      interval = 30,
      fixedDuration,
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

    const intervalArray = useMemo(
      () => generateDateArray(startDate, endDate, interval),
      [startDate, endDate, interval],
    )

    const { validateInterval } = useIntervalValidation(disabledIntervals, disablePast)

    const rndState = useRndState({
      selectedInterval: selectedInterval ?? null,
      startDate,
      interval,
      minimumInterval,
      timeLineRef: internalRef,
    })

    const { handleClick } = useSlotClick({
      disabled,
      disablePast,
      minimumInterval,
      startDate,
      endDate,
      interval,
      fixedDuration,
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
      validateInterval,
      onChange,
      onError: setIsError,
      updatePosition: rndState.updatePosition,
      updateWidth: rndState.updateWidth,
      updatePreview: rndState.updatePreview,
      clearPreview: rndState.clearPreview,
    })

    const disabledIntervalsData = useDisabledIntervals({
      disabledIntervals,
      timeLineRef: internalRef,
      interval,
      startDate,
    })

    const isSmallCarret = (carretRef.current?.clientWidth ?? 0) < 150
    const shouldShowSelection =
      selectedInterval && internalRef.current && selectedInterval[0].isSame(startDate, 'day')

    const displayInterval = rndState.selectedIntervalPreview || selectedInterval

    return (
      <div
        className={classNames('h-[65px] w-fit md:w-full', cls?.root ?? 'bg-gray-100', className)}
      >
        <div
          className={classNames('relative flex h-full items-center', cls?.track)}
          ref={timeLineRef}
        >
          {disabledIntervalsData.map((data) => (
            <DisabledInterval
              key={`${id}::${data.id}`}
              id={data.id}
              left={data.left}
              width={data.width}
              className={cls?.disabledInterval}
            />
          ))}

          {shouldShowSelection && internalRef.current && (
            <SelectionRnd
              width={rndState.width}
              height="90%"
              posX={rndState.posX}
              posY={(internalRef.current.getBoundingClientRect().height * 0.1) / 2}
              minWidth={(minimumInterval / interval) * getSlotWidth(internalRef.current)}
              isError={isError}
              interval={displayInterval!}
              isSmallCarret={isSmallCarret}
              gridSize={getSlotWidth(internalRef.current)}
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
