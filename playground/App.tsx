import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import { TimeLineRange } from '../src'
import type { TimeRange } from '../src'

type ViewMode = 'single' | 'multi'

type Resource = {
  id: string
  name: string
  color: {
    root: string
    selection: string
    handleLeft: string
    handleRight: string
    disabled: string
  }
  disabled?: boolean
}

const RESOURCES: Resource[] = [
  {
    id: 'room-a',
    name: 'Зал А',
    color: {
      root: 'bg-blue-50',
      selection: 'bg-blue-500',
      handleLeft: 'bg-blue-700',
      handleRight: 'bg-blue-700',
      disabled: 'bg-blue-200',
    },
  },
  {
    id: 'room-b',
    name: 'Зал Б',
    color: {
      root: 'bg-emerald-50',
      selection: 'bg-emerald-500',
      handleLeft: 'bg-emerald-700',
      handleRight: 'bg-emerald-700',
      disabled: 'bg-emerald-200',
    },
  },
  {
    id: 'room-c',
    name: 'Переговорная',
    color: {
      root: 'bg-violet-50',
      selection: 'bg-violet-500',
      handleLeft: 'bg-violet-700',
      handleRight: 'bg-violet-700',
      disabled: 'bg-violet-200',
    },
    disabled: true,
  },
  {
    id: 'room-d',
    name: 'Коворкинг',
    color: {
      root: 'bg-amber-50',
      selection: 'bg-amber-500',
      handleLeft: 'bg-amber-700',
      handleRight: 'bg-amber-700',
      disabled: 'bg-amber-200',
    },
  },
]

function makeDisabled(base: Dayjs): TimeRange[] {
  return [
    [base.hour(10).minute(0), base.hour(11).minute(30)],
    [base.hour(14).minute(0), base.hour(15).minute(0)],
    [base.hour(18).minute(0), base.hour(19).minute(0)],
  ]
}

function DateTimeControls({
  date,
  startHour,
  endHour,
  interval,
  disablePast,
  onChange,
}: {
  date: Dayjs
  startHour: number
  endHour: number
  interval: number
  disablePast: boolean
  onChange: (patch: {
    date?: Dayjs
    startHour?: number
    endHour?: number
    interval?: number
    disablePast?: boolean
  }) => void
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Дата
        <input
          type="date"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={date.format('YYYY-MM-DD')}
          onChange={(e) => onChange({ date: dayjs(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Начало
        <input
          type="number"
          min={0}
          max={endHour - 1}
          className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={startHour}
          onChange={(e) => onChange({ startHour: Number(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Конец
        <input
          type="number"
          min={startHour + 1}
          max={24}
          className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={endHour}
          onChange={(e) => onChange({ endHour: Number(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Шаг (мин)
        <select
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={interval}
          onChange={(e) => onChange({ interval: Number(e.target.value) })}
        >
          {[15, 30, 60].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600">
        <input
          type="checkbox"
          className="h-4 w-4 rounded"
          checked={disablePast}
          onChange={(e) => onChange({ disablePast: e.target.checked })}
        />
        Запретить прошлое
      </label>
    </div>
  )
}

function IntervalBadge({ interval }: { interval: TimeRange | null }) {
  if (!interval) return <span className="text-xs text-gray-400">не выбрано</span>
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      {interval[0].format('HH:mm')} – {interval[1].format('HH:mm')}
    </span>
  )
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('multi')
  const [selectedResource, setSelectedResource] = useState(RESOURCES[0].id)

  const [date, setDate] = useState(dayjs())
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(22)
  const [interval, setIntervalStep] = useState(30)
  const [disablePast, setDisablePast] = useState(false)

  const [selections, setSelections] = useState<Record<string, TimeRange | null>>({})

  const startDate = date.hour(startHour).minute(0).second(0)
  const endDate = date.hour(endHour).minute(0).second(0)

  const handleChange = (resourceId: string) => (range: TimeRange) => {
    setSelections((prev) => ({ ...prev, [resourceId]: range }))
  }

  const visibleResources =
    viewMode === 'single' ? RESOURCES.filter((r) => r.id === selectedResource) : RESOURCES

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">TimeLineRange — Playground</h1>

          {/* View toggle */}
          <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'single' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('single')}
            >
              Ресурс
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'multi' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('multi')}
            >
              Ресурсы
            </button>
          </div>
        </div>

        {/* Resource selector (single mode) */}
        {viewMode === 'single' && (
          <div className="mb-4 flex gap-2">
            {RESOURCES.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedResource(r.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedResource === r.id
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}

        <DateTimeControls
          date={date}
          startHour={startHour}
          endHour={endHour}
          interval={interval}
          disablePast={disablePast}
          onChange={(patch) => {
            if (patch.date !== undefined) setDate(patch.date)
            if (patch.startHour !== undefined) setStartHour(patch.startHour)
            if (patch.endHour !== undefined) setEndHour(patch.endHour)
            if (patch.interval !== undefined) setIntervalStep(patch.interval)
            if (patch.disablePast !== undefined) setDisablePast(patch.disablePast)
          }}
        />

        {/* Timelines */}
        <div className="flex flex-col gap-3">
          {visibleResources.map((resource) => {
            const disabledIntervals = makeDisabled(date)

            return (
              <div
                key={resource.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-gray-700">{resource.name}</span>
                  <div className="flex items-center gap-3">
                    {resource.disabled && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                        недоступен
                      </span>
                    )}
                    <IntervalBadge interval={selections[resource.id] ?? null} />
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <TimeLineRange
                    id={resource.id}
                    startDate={startDate}
                    endDate={endDate}
                    selectedInterval={selections[resource.id] ?? null}
                    disabledIntervals={disabledIntervals}
                    interval={interval}
                    minimumInterval={interval}
                    disabled={resource.disabled}
                    disablePast={disablePast}
                    onChange={handleChange(resource.id)}
                    classNames={{
                      root: resource.color.root,
                      selection: resource.color.selection,
                      resizeHandleLeft: resource.color.handleLeft,
                      resizeHandleRight: resource.color.handleRight,
                      disabledInterval: resource.color.disabled,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        {Object.entries(selections).some(([, v]) => v !== null) && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-gray-700">Выбранные интервалы</p>
            <div className="flex flex-col gap-1">
              {RESOURCES.map((r) => {
                const sel = selections[r.id]
                if (!sel) return null
                return (
                  <div key={r.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-28 text-gray-400">{r.name}</span>
                    <span>
                      {sel[0].format('HH:mm')} – {sel[1].format('HH:mm')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
