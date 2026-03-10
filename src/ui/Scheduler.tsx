import classNames from 'classnames'
import dayjs from 'dayjs'
import { useCallback, useId, useMemo, useState } from 'react'
import TimeLineHeader from '../components/TimeLineHeader/TimeLineHeader'
import type { SchedulerProps, SchedulerResource, TimeRange } from '../types'
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
}: SchedulerProps) {
  const rawId = useId()
  // useId may produce colons which are invalid in CSS id selectors — strip them
  const containerId = `sch-${rawId.replace(/:/g, '')}`
  const crossDragBounds = crossDrag ? `#${containerId}` : undefined

  const [crossDragPreview, setCrossDragPreview] = useState<{
    targetKey: string
    interval: TimeRange
    hasError: boolean
  } | null>(null)

  const validateAgainstRow = useCallback(
    (row: RowData, start: ReturnType<typeof dayjs>, end: ReturnType<typeof dayjs>): boolean => {
      const events = row.resource.events ?? []
      const s = start.startOf('minute')
      const e = end.startOf('minute')
      const hasOverlap = events.some(({ range: [es, ee] }) => {
        const evS = es.startOf('minute')
        const evE = ee.startOf('minute')
        return (s >= evS && s < evE) || (e > evS && e <= evE) || (s < evS && e > evE)
      })
      return hasOverlap || (disablePast && dayjs().isAfter(start))
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
    (row: RowData, range: TimeRange | null, hasError: boolean) => {
      if (singleSelection && range !== null) {
        rows.forEach((r) => {
          if (r.key !== row.key && selections[r.key]) {
            onChange?.(r.resource.id, r.date, null, false)
          }
        })
      }
      onChange?.(row.resource.id, row.date, range, hasError)
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
    (sourceKey: string, clientX: number, clientY: number, interval: TimeRange) => {
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
        const hasError = validateAgainstRow(targetRow, adjStart, adjEnd)
        setCrossDragPreview({ targetKey, interval, hasError })
        return
      }
      setCrossDragPreview(null)
    },
    [rows, isRowDisabled, validateAgainstRow],
  )

  const handleCrossDragDrop = useCallback(
    (sourceKey: string, clientX: number, clientY: number, range: TimeRange) => {
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
          const hasError = validateAgainstRow(targetRow, targetStart, targetEnd)

          onCrossDrag?.(
            { resourceId: sourceRow.resource.id, date: sourceRow.date },
            { resourceId: targetRow.resource.id, date: targetRow.date },
            adjustedRange,
            hasError,
          )
        }
        return
      }
    },
    [rows, isRowDisabled, validateAgainstRow, onCrossDrag],
  )

  // ─── Horizontal layout ────────────────────────────────────────────────────
  if (direction === 'horizontal') {
    return (
      <div id={containerId} className={classNames('overflow-x-auto', className)}>
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
                      crossDragPreview?.targetKey === row.key ? crossDragPreview.hasError : false
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
                    onChange={(range, hasError) => {
                      setCrossDragPreview(null)
                      handleRowChange(row, range, hasError)
                    }}
                    onCrossDragMove={(clientX, clientY, ivl) =>
                      handleCrossDragMove(row.key, clientX, clientY, ivl)
                    }
                    onCrossDragDrop={(clientX, clientY, range) =>
                      handleCrossDragDrop(row.key, clientX, clientY, range)
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Vertical layout ──────────────────────────────────────────────────────
  // Resources as columns, time axis on the left
  return (
    <div id={containerId} className={classNames('overflow-x-auto', className)}>
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
                  renderRowLabel({ resource: row.resource, date: row.date, direction: 'vertical' })
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
                  crossDragPreview?.targetKey === row.key ? crossDragPreview.hasError : false
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
                onChange={(range, hasError) => {
                  setCrossDragPreview(null)
                  handleRowChange(row, range, hasError)
                }}
                onCrossDragMove={(clientX, clientY, ivl) =>
                  handleCrossDragMove(row.key, clientX, clientY, ivl)
                }
                onCrossDragDrop={(clientX, clientY, range) =>
                  handleCrossDragDrop(row.key, clientX, clientY, range)
                }
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
