import classNames from 'classnames'
import dayjs from 'dayjs'
import { useCallback, useId, useMemo, useState } from 'react'
import TimeLineHeader from '../components/TimeLineHeader/TimeLineHeader'
import { Overlay } from '../components/Overlay'
import type { SchedulerProps, SchedulerResource, SelectionError, TimeRange } from '../types'
import { hasOverlapWithEvents } from '../utils'
import TimeLineRange from './TimeLineRange'

const LABEL_WIDTH = 'w-28 shrink-0'
const LABEL_HEIGHT = 'h-8 shrink-0'

function selectionKey(resourceId: string, date: ReturnType<typeof dayjs>) {
  return `${resourceId}:${date.format('YYYY-MM-DD')}`
}

type RowData = {
  key: string
  resource: SchedulerResource
  date: ReturnType<typeof dayjs>
  label: string
}

export function Scheduler({
  view,
  date,
  resources,
  activeResourceId,
  selections = {},
  onChange,
  onCrossDrag,
  startHour = 0,
  endHour = 24,
  interval = 30,
  minimumInterval,
  fixedDuration,
  disabled = false,
  disablePast = false,
  direction = 'horizontal',
  crossDrag = false,
  singleSelection = false,
  debug = false,
  className,
  classNames: cls,
  renderResizeHandle,
  renderIntervalContent,
  renderRowLabel,
  renderEvent,
  onEventClick,
  isLoading = false,
  loadingText,
  renderOverlay,
}: SchedulerProps) {
  const rawId = useId()
  // useId may produce colons which are invalid in CSS id selectors — strip them
  const containerId = `sch-${rawId.replace(/:/g, '')}`
  const crossDragBounds = crossDrag ? `#${containerId}` : undefined

  const [crossDragPreview, setCrossDragPreview] = useState<{
    targetKey: string
    interval: TimeRange
    error: SelectionError
  } | null>(null)

  const validateAgainstRow = useCallback(
    (
      row: RowData,
      start: ReturnType<typeof dayjs>,
      end: ReturnType<typeof dayjs>,
    ): SelectionError => {
      if (hasOverlapWithEvents(start, end, row.resource.events ?? [])) return 'overlap'
      if (disablePast && dayjs().isAfter(start)) return 'past'
      return null
    },
    [disablePast],
  )

  const startDate = date.hour(startHour).minute(0).second(0).millisecond(0)
  const endDate = date.hour(endHour).minute(0).second(0).millisecond(0)

  const rows = useMemo<RowData[]>(() => {
    if (view === 'single-resource') {
      const resource = resources.find((r) => r.id === activeResourceId) ?? resources[0]
      if (!resource) return []

      const weekStart = date.startOf('week')
      return Array.from({ length: 7 }, (_, i) => {
        const day = weekStart.add(i, 'day')
        return {
          key: selectionKey(resource.id, day),
          resource,
          date: day,
          label: day.format('dd DD.MM'),
        }
      })
    }

    // multi-resource
    return resources.map((resource) => ({
      key: selectionKey(resource.id, date),
      resource,
      date,
      label: resource.label,
    }))
  }, [view, date, resources, activeResourceId])

  // ─── Single-selection enforcement ─────────────────────────────────────────
  const handleRowChange = useCallback(
    (row: RowData, range: TimeRange | null, error: SelectionError) => {
      if (singleSelection && range !== null) {
        rows.forEach((r) => {
          if (r.key !== row.key && selections[r.key]) {
            onChange?.({ resourceId: r.resource.id, date: r.date, range: null, error: null })
          }
        })
      }
      onChange?.({ resourceId: row.resource.id, date: row.date, range, error })
    },
    [rows, selections, singleSelection, onChange],
  )

  // ─── Cross-timeline drag handlers ─────────────────────────────────────────
  const isRowDisabled = useCallback(
    (key: string) => {
      const row = rows.find((r) => r.key === key)
      return !row || disabled || (row.resource.disabled ?? false)
    },
    [rows, disabled],
  )

  const handleCrossDragMove = useCallback(
    (
      sourceKey: string,
      { clientX, clientY, interval }: { clientX: number; clientY: number; interval: TimeRange },
    ) => {
      const elements = document.elementsFromPoint(clientX, clientY)
      for (const el of elements) {
        const rowEl = el.closest('[data-scheduler-key]')
        if (!rowEl) continue
        const targetKey = rowEl.getAttribute('data-scheduler-key')
        if (!targetKey || targetKey === sourceKey || isRowDisabled(targetKey)) {
          setCrossDragPreview(null)
          return
        }
        const targetRow = rows.find((r) => r.key === targetKey)
        if (!targetRow) {
          setCrossDragPreview(null)
          return
        }
        const duration = interval[1].diff(interval[0], 'minute')
        const adjStart = targetRow.date
          .hour(interval[0].hour())
          .minute(interval[0].minute())
          .second(0)
          .millisecond(0)
        const adjEnd = adjStart.add(duration, 'minute')
        const error = validateAgainstRow(targetRow, adjStart, adjEnd)
        setCrossDragPreview({ targetKey, interval, error })
        return
      }
      setCrossDragPreview(null)
    },
    [rows, isRowDisabled, validateAgainstRow],
  )

  const handleCrossDragDrop = useCallback(
    (
      sourceKey: string,
      { clientX, clientY, range }: { clientX: number; clientY: number; range: TimeRange },
    ) => {
      setCrossDragPreview(null)
      const elements = document.elementsFromPoint(clientX, clientY)
      for (const el of elements) {
        const rowEl = el.closest('[data-scheduler-key]')
        if (!rowEl) continue
        const targetKey = rowEl.getAttribute('data-scheduler-key')
        if (!targetKey || targetKey === sourceKey || isRowDisabled(targetKey)) continue
        const sourceRow = rows.find((r) => r.key === sourceKey)
        const targetRow = rows.find((r) => r.key === targetKey)
        if (sourceRow && targetRow) {
          // Adjust interval to target row's date (preserving time-of-day)
          const duration = range[1].diff(range[0], 'minute')
          const targetStart = targetRow.date
            .hour(range[0].hour())
            .minute(range[0].minute())
            .second(0)
            .millisecond(0)
          const targetEnd = targetStart.add(duration, 'minute')
          const adjustedRange: TimeRange = [targetStart, targetEnd]

          // Validate against target row's events
          const error = validateAgainstRow(targetRow, targetStart, targetEnd)

          onCrossDrag?.({
            from: { resourceId: sourceRow.resource.id, date: sourceRow.date },
            to: { resourceId: targetRow.resource.id, date: targetRow.date },
            range: adjustedRange,
            error,
          })
        }
        return
      }
    },
    [rows, isRowDisabled, validateAgainstRow, onCrossDrag],
  )

  const showOverlay = isLoading || !!renderOverlay

  // ─── Horizontal layout ────────────────────────────────────────────────────
  if (direction === 'horizontal') {
    return (
      <div className={classNames('relative', className)}>
        <div id={containerId} className="overflow-x-auto">
          <div className="flex min-w-fit flex-col gap-1">
            {/* Header row */}
            <div className="flex">
              <div className={classNames(LABEL_WIDTH, 'sticky left-0 bg-inherit')} />
              <div className="flex-1">
                <TimeLineHeader startDate={startDate} endDate={endDate} interval={interval} />
              </div>
            </div>

            {/* Timeline rows */}
            {rows.map((row) => {
              if (showOverlay) {
                return <div key={row.key} className="h-[65px]" />
              }

              const rowStartDate = row.date.hour(startHour).minute(0).second(0).millisecond(0)
              const rowEndDate = row.date.hour(endHour).minute(0).second(0).millisecond(0)
              const rowDisabled = disabled || (row.resource.disabled ?? false)
              const mergedClassNames = { ...cls, ...row.resource.classNames }
              const selectedInterval = selections[row.key] ?? null
              const rowEvents = row.resource.events ?? []

              return (
                <div key={row.key} className="flex items-center" data-scheduler-key={row.key}>
                  <div
                    className={classNames(
                      LABEL_WIDTH,
                      'sticky left-0 z-10 bg-inherit pr-2 text-sm text-gray-600',
                      rowDisabled && 'opacity-40',
                    )}
                  >
                    {renderRowLabel ? (
                      renderRowLabel({
                        resource: row.resource,
                        date: row.date,
                        direction: 'horizontal',
                      })
                    ) : (
                      <span className="truncate">{row.label}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <TimeLineRange
                      id={row.key}
                      startDate={rowStartDate}
                      endDate={rowEndDate}
                      selectedInterval={selectedInterval}
                      previewInterval={
                        crossDragPreview?.targetKey === row.key ? crossDragPreview.interval : null
                      }
                      previewError={
                        crossDragPreview?.targetKey === row.key ? crossDragPreview.error : null
                      }
                      events={rowEvents}
                      interval={interval}
                      minimumInterval={minimumInterval ?? interval}
                      fixedDuration={fixedDuration}
                      disabled={rowDisabled}
                      disablePast={disablePast}
                      direction="horizontal"
                      crossDragEnabled={crossDrag && !rowDisabled}
                      crossDragBounds={crossDragBounds}
                      debug={debug}
                      classNames={mergedClassNames}
                      renderResizeHandle={renderResizeHandle}
                      renderIntervalContent={renderIntervalContent}
                      renderEvent={renderEvent}
                      onEventClick={onEventClick}
                      onChange={({ range, error }) => {
                        setCrossDragPreview(null)
                        handleRowChange(row, range, error)
                      }}
                      onCrossDragMove={(opts) => handleCrossDragMove(row.key, opts)}
                      onCrossDragDrop={(opts) => handleCrossDragDrop(row.key, opts)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {showOverlay && (
          <Overlay
            isLoading={isLoading}
            loadingText={loadingText}
            renderOverlay={renderOverlay ? () => renderOverlay({ direction }) : undefined}
            direction={direction}
          />
        )}
      </div>
    )
  }

  // ─── Vertical layout ──────────────────────────────────────────────────────
  // Resources as columns, time axis on the left
  return (
    <div className={classNames('relative', className)}>
      <div id={containerId} className="overflow-x-auto">
        <div className="flex min-w-fit">
          {/* Time axis column */}
          <div className="flex flex-col shrink-0">
            {/* Top-left spacer for resource label row */}
            <div className={LABEL_HEIGHT} />
            <TimeLineHeader
              startDate={startDate}
              endDate={endDate}
              interval={interval}
              direction="vertical"
            />
          </div>

          {/* Resource columns */}
          {rows.map((row) => {
            if (showOverlay) {
              return <div key={row.key} className="flex-1 min-w-[80px]" />
            }

            const rowStartDate = row.date.hour(startHour).minute(0).second(0).millisecond(0)
            const rowEndDate = row.date.hour(endHour).minute(0).second(0).millisecond(0)
            const rowDisabled = disabled || (row.resource.disabled ?? false)
            const mergedClassNames = { ...cls, ...row.resource.classNames }
            const selectedInterval = selections[row.key] ?? null
            const rowEvents = row.resource.events ?? []

            return (
              <div
                key={row.key}
                className="flex flex-col flex-1 min-w-[80px]"
                data-scheduler-key={row.key}
              >
                {/* Column header (resource label) */}
                <div
                  className={classNames(
                    LABEL_HEIGHT,
                    'flex items-center justify-center px-1 text-sm text-gray-600 border-b border-gray-200',
                    rowDisabled && 'opacity-40',
                  )}
                >
                  {renderRowLabel ? (
                    renderRowLabel({
                      resource: row.resource,
                      date: row.date,
                      direction: 'vertical',
                    })
                  ) : (
                    <span className="truncate">{row.label}</span>
                  )}
                </div>

                <TimeLineRange
                  id={row.key}
                  startDate={rowStartDate}
                  endDate={rowEndDate}
                  selectedInterval={selectedInterval}
                  previewInterval={
                    crossDragPreview?.targetKey === row.key ? crossDragPreview.interval : null
                  }
                  previewError={
                    crossDragPreview?.targetKey === row.key ? crossDragPreview.error : null
                  }
                  events={rowEvents}
                  interval={interval}
                  minimumInterval={minimumInterval ?? interval}
                  fixedDuration={fixedDuration}
                  disabled={rowDisabled}
                  disablePast={disablePast}
                  direction="vertical"
                  crossDragEnabled={crossDrag && !rowDisabled}
                  debug={debug}
                  classNames={mergedClassNames}
                  renderResizeHandle={renderResizeHandle}
                  renderIntervalContent={renderIntervalContent}
                  renderEvent={renderEvent}
                  onChange={({ range, error }) => {
                    setCrossDragPreview(null)
                    handleRowChange(row, range, error)
                  }}
                  onCrossDragMove={(opts) => handleCrossDragMove(row.key, opts)}
                  onCrossDragDrop={(opts) => handleCrossDragDrop(row.key, opts)}
                />
              </div>
            )
          })}
        </div>
      </div>
      {showOverlay && (
        <Overlay
          isLoading={isLoading}
          loadingText={loadingText}
          renderOverlay={renderOverlay ? () => renderOverlay({ direction }) : undefined}
          direction={direction}
        />
      )}
    </div>
  )
}
