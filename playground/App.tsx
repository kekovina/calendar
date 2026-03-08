import dayjs, { type Dayjs } from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import { useEffect, useId, useRef, useState } from 'react'
import { Scheduler } from '../src'
import type {
  SchedulerEvent,
  SchedulerResource,
  SchedulerSelections,
  SchedulerView,
  TimeRange,
} from '../src'

dayjs.extend(weekday)
dayjs.extend(localeData)

// ─── Types ────────────────────────────────────────────────────────────────────

type AppEvent = {
  id: string
  title: string
  resourceId: string
  date: string // YYYY-MM-DD
  range: TimeRange
}

type FormState = {
  title: string
  resourceId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
}

// ─── Static data ──────────────────────────────────────────────────────────────

const RESOURCES: SchedulerResource[] = [
  {
    id: 'room-a',
    label: 'Hall A',
    classNames: {
      root: 'bg-blue-50',
      selection: 'bg-blue-500',
      resizeHandleLeft: 'bg-blue-700',
      resizeHandleRight: 'bg-blue-700',
      eventBlock: 'bg-blue-200',
    },
  },
  {
    id: 'room-b',
    label: 'Hall B',
    classNames: {
      root: 'bg-emerald-50',
      selection: 'bg-emerald-500',
      resizeHandleLeft: 'bg-emerald-700',
      resizeHandleRight: 'bg-emerald-700',
      eventBlock: 'bg-emerald-200',
    },
  },
  {
    id: 'room-c',
    label: 'Meeting Room',
    disabled: true,
    classNames: { root: 'bg-gray-50' },
  },
  {
    id: 'room-d',
    label: 'Coworking',
    classNames: {
      root: 'bg-amber-50',
      selection: 'bg-amber-500',
      resizeHandleLeft: 'bg-amber-700',
      resizeHandleRight: 'bg-amber-700',
      eventBlock: 'bg-amber-200',
    },
  },
]

const RESOURCE_COLORS: Record<string, string> = {
  'room-a': 'bg-blue-100 text-blue-700',
  'room-b': 'bg-emerald-100 text-emerald-700',
  'room-c': 'bg-gray-100 text-gray-500',
  'room-d': 'bg-amber-100 text-amber-700',
}

function makeBlockedEvents(base: Dayjs): SchedulerEvent[] {
  return [
    {
      id: 'blocked-1',
      range: [base.hour(10).minute(0), base.hour(11).minute(30)],
      label: 'Booked',
    },
    { id: 'blocked-2', range: [base.hour(14).minute(0), base.hour(15).minute(0)], label: 'Booked' },
  ]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function selectionKey(resourceId: string, date: Dayjs) {
  return `${resourceId}:${date.format('YYYY-MM-DD')}`
}

function rangeToTimes(range: TimeRange): { startTime: string; endTime: string } {
  return {
    startTime: range[0].format('HH:mm'),
    endTime: range[1].format('HH:mm'),
  }
}

function formToDraft(form: FormState): TimeRange | null {
  if (!form.date || !form.startTime || !form.endTime) return null
  const base = dayjs(form.date)
  const [sh, sm] = form.startTime.split(':').map(Number)
  const [eh, em] = form.endTime.split(':').map(Number)
  const start = base.hour(sh).minute(sm).second(0)
  const end = base.hour(eh).minute(em).second(0)
  if (!start.isValid() || !end.isValid() || !end.isAfter(start)) return null
  return [start, end]
}

// ─── EventForm ────────────────────────────────────────────────────────────────

function EventForm({
  form,
  onFormChange,
  onSave,
  onCancel,
}: {
  form: FormState
  onFormChange: (patch: Partial<FormState>) => void
  onSave: () => void
  onCancel: () => void
}) {
  const titleId = useId()
  const backdropRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const inputCls =
    'rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full'

  const isValid = form.title.trim() !== '' && formToDraft(form) !== null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={(e) => e.target === backdropRef.current && onCancel()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">New event</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Title */}
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
            <span>
              Title <span className="text-red-400">*</span>
            </span>
            <input
              id={titleId}
              ref={titleRef}
              type="text"
              placeholder="Enter event title"
              value={form.title}
              onChange={(e) => onFormChange({ title: e.target.value })}
              className={inputCls}
            />
          </label>

          {/* Resource */}
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
            Resource
            <select
              value={form.resourceId}
              onChange={(e) => onFormChange({ resourceId: e.target.value })}
              className={inputCls}
            >
              {RESOURCES.filter((r) => !r.disabled).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          {/* Date */}
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => onFormChange({ date: e.target.value })}
              className={inputCls}
            />
          </label>

          {/* Time range */}
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-gray-600">
              Start
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => onFormChange({ startTime: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-gray-600">
              End
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => onFormChange({ endTime: e.target.value })}
                className={inputCls}
              />
            </label>
          </div>

          {/* Validation hint */}
          {form.startTime && form.endTime && !formToDraft(form) && (
            <p className="text-xs text-red-500">End time must be after start time</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!isValid}
            className="rounded-lg bg-blue-500 px-4 py-1.5 text-sm text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── EventsList ───────────────────────────────────────────────────────────────

function EventsList({
  events,
  onEdit,
  onDelete,
}: {
  events: AppEvent[]
  onEdit: (event: AppEvent) => void
  onDelete: (id: string) => void
}) {
  if (events.length === 0) return null

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-medium text-gray-700">
          Events{' '}
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {events.length}
          </span>
        </p>
      </div>
      <div className="divide-y divide-gray-50">
        {events.map((ev) => {
          const res = RESOURCES.find((r) => r.id === ev.resourceId)
          const colorCls = RESOURCE_COLORS[ev.resourceId] ?? 'bg-gray-100 text-gray-600'
          return (
            <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorCls}`}>
                {res?.label ?? ev.resourceId}
              </span>
              <span className="flex-1 text-sm text-gray-800">{ev.title}</span>
              <span className="text-xs text-gray-400">{ev.date}</span>
              <span className="text-xs text-gray-500">
                {ev.range[0].format('HH:mm')} – {ev.range[1].format('HH:mm')}
              </span>
              <button
                onClick={() => onEdit(ev)}
                className="text-xs text-blue-400 hover:text-blue-600"
              >
                ✎
              </button>
              <button
                onClick={() => onDelete(ev.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Controls ─────────────────────────────────────────────────────────────────

function Controls({
  date,
  startHour,
  endHour,
  interval,
  minimumInterval,
  disablePast,
  onChange,
}: {
  date: Dayjs
  startHour: number
  endHour: number
  interval: number
  minimumInterval: number
  disablePast: boolean
  onChange: (
    p: Partial<{
      date: Dayjs
      startHour: number
      endHour: number
      interval: number
      minimumInterval: number
      disablePast: boolean
    }>,
  ) => void
}) {
  const inputCls =
    'rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <div className="mb-5 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Date
        <input
          type="date"
          value={date.format('YYYY-MM-DD')}
          onChange={(e) => onChange({ date: dayjs(e.target.value) })}
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Start (h)
        <input
          type="number"
          min={0}
          max={endHour - 1}
          value={startHour}
          onChange={(e) => onChange({ startHour: Number(e.target.value) })}
          className={`${inputCls} w-20`}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        End (h)
        <input
          type="number"
          min={startHour + 1}
          max={24}
          value={endHour}
          onChange={(e) => onChange({ endHour: Number(e.target.value) })}
          className={`${inputCls} w-20`}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Step (min)
        <select
          value={interval}
          onChange={(e) => onChange({ interval: Number(e.target.value) })}
          className={inputCls}
        >
          {[15, 30, 60].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        Min duration (min)
        <select
          value={minimumInterval}
          onChange={(e) => onChange({ minimumInterval: Number(e.target.value) })}
          className={`${inputCls} w-24`}
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
        Disable past
      </label>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const defaultForm = (): FormState => ({
  title: '',
  resourceId: RESOURCES[0].id,
  date: dayjs().format('YYYY-MM-DD'),
  startTime: '09:00',
  endTime: '10:00',
})

export default function App() {
  const [view, setView] = useState<SchedulerView>('multi-resource')
  const [activeResourceId, setActiveResourceId] = useState(RESOURCES[0].id)

  const [date, setDate] = useState(dayjs())
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(20)
  const [interval, setIntervalStep] = useState(30)
  const [minimumInterval, setMinimumInterval] = useState(30)
  const [disablePast, setDisablePast] = useState(false)

  const [selections, setSelections] = useState<SchedulerSelections>({})
  const [events, setEvents] = useState<AppEvent[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)
  // Track which selection key the current form draft belongs to
  const draftKeyRef = useRef<string | null>(null)

  // Sync form changes → draft on timeline
  useEffect(() => {
    if (!formOpen) return
    const draft = formToDraft(form)
    const key = `${form.resourceId}:${form.date}`
    // Clear previous draft key if resource/date changed
    if (draftKeyRef.current && draftKeyRef.current !== key) {
      setSelections((prev) => ({ ...prev, [draftKeyRef.current!]: null }))
    }
    draftKeyRef.current = key
    setSelections((prev) => ({ ...prev, [key]: draft }))
  }, [form, formOpen])

  const openForm = (initial: Partial<FormState> = {}) => {
    setForm({ ...defaultForm(), ...initial })
    setFormOpen(true)
  }

  const closeForm = () => {
    // Clear draft
    if (draftKeyRef.current) {
      setSelections((prev) => ({ ...prev, [draftKeyRef.current!]: null }))
      draftKeyRef.current = null
    }
    setFormOpen(false)
  }

  const saveEvent = () => {
    const range = formToDraft(form)
    if (!range || !form.title.trim()) return

    setEvents((prev) => {
      const exists = prev.find((e) => e.id === editingIdRef.current)
      if (exists) {
        return prev.map((e) =>
          e.id === editingIdRef.current
            ? { ...e, title: form.title, resourceId: form.resourceId, date: form.date, range }
            : e,
        )
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          title: form.title,
          resourceId: form.resourceId,
          date: form.date,
          range,
        },
      ]
    })

    // Clear draft from timeline after save
    if (draftKeyRef.current) {
      setSelections((prev) => ({ ...prev, [draftKeyRef.current!]: null }))
      draftKeyRef.current = null
    }
    editingIdRef.current = null
    setFormOpen(false)
  }

  const editingIdRef = useRef<string | null>(null)

  const handleEdit = (event: AppEvent) => {
    editingIdRef.current = event.id
    openForm({
      title: event.title,
      resourceId: event.resourceId,
      date: event.date,
      startTime: event.range[0].format('HH:mm'),
      endTime: event.range[1].format('HH:mm'),
    })
  }

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  // Slot click: update selection on timeline without opening the form
  const handleSchedulerChange = (
    resourceId: string,
    rowDate: Dayjs,
    range: TimeRange,
    _hasError: boolean,
  ) => {
    const key = selectionKey(resourceId, rowDate)
    setSelections((prev) => ({ ...prev, [key]: range }))
  }

  // Saved events mapped to SchedulerEvent per resource
  const eventsByResource = events.reduce<Record<string, SchedulerEvent[]>>((acc, ev) => {
    const schedEvent: SchedulerEvent = { id: ev.id, range: ev.range, label: ev.title }
    acc[ev.resourceId] = [...(acc[ev.resourceId] ?? []), schedEvent]
    return acc
  }, {})

  const resources: SchedulerResource[] = RESOURCES.map((r) => ({
    ...r,
    events: r.disabled
      ? undefined
      : [...makeBlockedEvents(date), ...(eventsByResource[r.id] ?? [])],
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        {/* Toolbar */}
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Scheduler — Playground</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                editingIdRef.current = null
                openForm()
              }}
              className="rounded-lg bg-blue-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
            >
              + Event
            </button>
            <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
              {(['multi-resource', 'single-resource'] as SchedulerView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    view === v ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {v === 'multi-resource' ? 'Resources' : 'Week'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resource tabs (single-resource mode) */}
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
          minimumInterval={minimumInterval}
          disablePast={disablePast}
          onChange={(p) => {
            if (p.date !== undefined) setDate(p.date)
            if (p.startHour !== undefined) setStartHour(p.startHour)
            if (p.endHour !== undefined) setEndHour(p.endHour)
            if (p.interval !== undefined) {
              setIntervalStep(p.interval)
              setMinimumInterval((prev) =>
                Math.max(p.interval!, Math.round(prev / p.interval!) * p.interval!),
              )
            }
            if (p.minimumInterval !== undefined) {
              // Snap to the nearest multiple of current interval
              const step = interval
              setMinimumInterval(Math.max(step, Math.round(p.minimumInterval / step) * step))
            }
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
            onChange={handleSchedulerChange}
            startHour={startHour}
            endHour={endHour}
            interval={interval}
            minimumInterval={minimumInterval}
            disablePast={disablePast}
          />
        </div>

        <EventsList events={events} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      {formOpen && (
        <EventForm
          form={form}
          onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSave={saveEvent}
          onCancel={closeForm}
        />
      )}
    </div>
  )
}
