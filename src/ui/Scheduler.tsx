import classNames from 'classnames'
import type dayjs from 'dayjs'
import { useMemo } from 'react'
import TimeLineHeader from '../components/TimeLineHeader/TimeLineHeader'
import type { SchedulerProps, SchedulerResource } from '../types'
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
  startHour = 0,
  endHour = 24,
  interval = 30,
  minimumInterval,
  fixedDuration,
  disabled = false,
  disablePast = false,
  direction = 'horizontal',
  debug = false,
  className,
  classNames: cls,
  renderResizeHandle,
  renderIntervalContent,
  renderRowLabel,
}: SchedulerProps) {
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

  // ─── Horizontal layout ────────────────────────────────────────────────────
  if (direction === 'horizontal') {
    return (
      <div className={classNames('overflow-x-auto', className)}>
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
              <div key={row.key} className="flex items-center">
                <div
                  className={classNames(
                    LABEL_WIDTH,
                    'sticky left-0 z-10 bg-inherit pr-2 text-sm text-gray-600',
                    rowDisabled && 'opacity-40',
                  )}
                >
                  {renderRowLabel ? (
                    renderRowLabel({ resource: row.resource, date: row.date })
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
                    events={rowEvents}
                    interval={interval}
                    minimumInterval={minimumInterval ?? interval}
                    fixedDuration={fixedDuration}
                    disabled={rowDisabled}
                    disablePast={disablePast}
                    direction="horizontal"
                    debug={debug}
                    classNames={mergedClassNames}
                    renderResizeHandle={renderResizeHandle}
                    renderIntervalContent={renderIntervalContent}
                    onChange={(range, hasError) =>
                      onChange?.(row.resource.id, row.date, range, hasError)
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
    <div className={classNames('overflow-x-auto', className)}>
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
            <div key={row.key} className="flex flex-col flex-1 min-w-[80px]">
              {/* Column header (resource label) */}
              <div
                className={classNames(
                  LABEL_HEIGHT,
                  'flex items-center justify-center px-1 text-sm text-gray-600 border-b border-gray-200',
                  rowDisabled && 'opacity-40',
                )}
              >
                {renderRowLabel ? (
                  renderRowLabel({ resource: row.resource, date: row.date })
                ) : (
                  <span className="truncate">{row.label}</span>
                )}
              </div>

              <TimeLineRange
                id={row.key}
                startDate={rowStartDate}
                endDate={rowEndDate}
                selectedInterval={selectedInterval}
                events={rowEvents}
                interval={interval}
                minimumInterval={minimumInterval ?? interval}
                fixedDuration={fixedDuration}
                disabled={rowDisabled}
                disablePast={disablePast}
                direction="vertical"
                debug={debug}
                classNames={mergedClassNames}
                renderResizeHandle={renderResizeHandle}
                renderIntervalContent={renderIntervalContent}
                onChange={(range, hasError) =>
                  onChange?.(row.resource.id, row.date, range, hasError)
                }
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
