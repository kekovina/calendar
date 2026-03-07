import dayjs, { type Dayjs } from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import { useState } from 'react'
import { Scheduler } from '../src'
import type { SchedulerResource, SchedulerSelections, SchedulerView } from '../src'

dayjs.extend(weekday)
dayjs.extend(localeData)

const RESOURCES: SchedulerResource[] = [
  {
    id: 'room-a',
    label: 'Зал А',
    disabledIntervals: [],
    classNames: {
      root: 'bg-blue-50',
      selection: 'bg-blue-500',
      resizeHandleLeft: 'bg-blue-700',
      resizeHandleRight: 'bg-blue-700',
      disabledInterval: 'bg-blue-200',
    },
  },
  {
    id: 'room-b',
    label: 'Зал Б',
    disabledIntervals: [],
    classNames: {
      root: 'bg-emerald-50',
      selection: 'bg-emerald-500',
      resizeHandleLeft: 'bg-emerald-700',
      resizeHandleRight: 'bg-emerald-700',
      disabledInterval: 'bg-emerald-200',
    },
  },
  {
    id: 'room-c',
    label: 'Переговорная',
    disabled: true,
    classNames: {
      root: 'bg-gray-50',
    },
  },
  {
    id: 'room-d',
    label: 'Коворкинг',
    disabledIntervals: [],
    classNames: {
      root: 'bg-amber-50',
      selection: 'bg-amber-500',
      resizeHandleLeft: 'bg-amber-700',
      resizeHandleRight: 'bg-amber-700',
      disabledInterval: 'bg-amber-200',
    },
  },
]

function makeDisabled(base: Dayjs) {
  return [
    [base.hour(10).minute(0), base.hour(11).minute(30)],
    [base.hour(14).minute(0), base.hour(15).minute(0)],
  ] as [Dayjs, Dayjs][]
}

function Controls({
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
  onChange: (
    p: Partial<{
      date: Dayjs
      startHour: number
      endHour: number
      interval: number
      disablePast: boolean
    }>,
  ) => void
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Дата
        <input
          type="date"
          value={date.format('YYYY-MM-DD')}
          onChange={(e) => onChange({ date: dayjs(e.target.value) })}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Начало (ч)
        <input
          type="number"
          min={0}
          max={endHour - 1}
          value={startHour}
          onChange={(e) => onChange({ startHour: Number(e.target.value) })}
          className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Конец (ч)
        <input
          type="number"
          min={startHour + 1}
          max={24}
          value={endHour}
          onChange={(e) => onChange({ endHour: Number(e.target.value) })}
          className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Шаг (мин)
        <select
          value={interval}
          onChange={(e) => onChange({ interval: Number(e.target.value) })}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          checked={disablePast}
          onChange={(e) => onChange({ disablePast: e.target.checked })}
          className="h-4 w-4 rounded"
        />
        Запретить прошлое
      </label>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<SchedulerView>('multi-resource')
  const [activeResourceId, setActiveResourceId] = useState(RESOURCES[0].id)

  const [date, setDate] = useState(dayjs())
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(20)
  const [interval, setInterval] = useState(30)
  const [disablePast, setDisablePast] = useState(false)

  const [selections, setSelections] = useState<SchedulerSelections>({})

  // Inject disabledIntervals per resource per date (could come from API)
  const resources: SchedulerResource[] = RESOURCES.map((r) => ({
    ...r,
    disabledIntervals: r.disabled ? undefined : makeDisabled(date),
  }))

  const handleChange = (
    resourceId: string,
    rowDate: Dayjs,
    range: [Dayjs, Dayjs],
    hasError: boolean,
  ) => {
    const key = `${resourceId}:${rowDate.format('YYYY-MM-DD')}`
    setSelections((prev) => ({ ...prev, [key]: range }))
    if (hasError) console.warn('interval error', resourceId, range)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        {/* Toolbar */}
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Scheduler — Playground</h1>

          <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
            {(['multi-resource', 'single-resource'] as SchedulerView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  view === v ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {v === 'multi-resource' ? 'Ресурсы' : 'Ресурс / неделя'}
              </button>
            ))}
          </div>
        </div>

        {/* Resource selector for single-resource view */}
        {view === 'single-resource' && (
          <div className="mb-4 flex flex-wrap gap-2">
            {RESOURCES.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveResourceId(r.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeResourceId === r.id
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <Controls
          date={date}
          startHour={startHour}
          endHour={endHour}
          interval={interval}
          disablePast={disablePast}
          onChange={(p) => {
            if (p.date !== undefined) setDate(p.date)
            if (p.startHour !== undefined) setStartHour(p.startHour)
            if (p.endHour !== undefined) setEndHour(p.endHour)
            if (p.interval !== undefined) setInterval(p.interval)
            if (p.disablePast !== undefined) setDisablePast(p.disablePast)
          }}
        />

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <Scheduler
            view={view}
            date={date}
            resources={resources}
            activeResourceId={activeResourceId}
            selections={selections}
            onChange={handleChange}
            startHour={startHour}
            endHour={endHour}
            interval={interval}
            disablePast={disablePast}
          />
        </div>

        {/* Summary */}
        {Object.values(selections).some(Boolean) && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-gray-700">Выбранные интервалы</p>
            <div className="flex flex-col gap-1">
              {Object.entries(selections).map(([key, sel]) => {
                if (!sel) return null
                const [resId, dateStr] = key.split(':')
                const res = RESOURCES.find((r) => r.id === resId)
                return (
                  <div key={key} className="flex gap-3 text-sm text-gray-600">
                    <span className="w-32 truncate text-gray-400">{res?.label ?? resId}</span>
                    <span className="w-24 text-gray-400">{dateStr}</span>
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
