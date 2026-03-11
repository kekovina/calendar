# @kekovina/calendar

A flexible React time-slot scheduler with drag, resize, and multi-resource support. Supports horizontal and vertical layouts, cross-row drag-and-drop, event blocking, and full render customization.

## Installation

```bash
npm install @kekovina/calendar
```

```bash
yarn add @kekovina/calendar
```

**Peer dependencies** (must be installed separately):

```bash
npm install react react-dom
```

The package depends on `dayjs` and `classnames` — they are bundled as direct dependencies. Styles use Tailwind CSS utility classes; make sure your project has Tailwind configured, or override class names via the `classNames` prop.

---

## Quick Start

```tsx
import dayjs from 'dayjs'
import { Scheduler } from '@kekovina/calendar'
import type {
  SchedulerResource,
  SchedulerSelections,
  OnSchedulerChangeOptions,
} from '@kekovina/calendar'
import { useState } from 'react'

const resources: SchedulerResource[] = [
  { id: 'room-a', label: 'Room A' },
  { id: 'room-b', label: 'Room B' },
]

export default function App() {
  const [selections, setSelections] = useState<SchedulerSelections>({})

  const handleChange = ({ resourceId, date, range }: OnSchedulerChangeOptions) => {
    const key = `${resourceId}:${date.format('YYYY-MM-DD')}`
    setSelections((prev) => ({ ...prev, [key]: range }))
  }

  return (
    <Scheduler
      view="multi-resource"
      date={dayjs()}
      resources={resources}
      selections={selections}
      onChange={handleChange}
      startHour={8}
      endHour={20}
      interval={30}
    />
  )
}
```

---

## Components

### `Scheduler`

High-level component that renders a full scheduling grid with resource rows/columns, a time header, and built-in cross-row drag support.

```tsx
import { Scheduler } from '@kekovina/calendar'
```

#### Props

| Prop                    | Type                                                   | Default        | Description                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `view`                  | `'multi-resource' \| 'single-resource'`                | —              | **Required.** `multi-resource` renders all resources as rows (horizontal) or columns (vertical). `single-resource` renders a 7-day week view for `activeResourceId`.                              |
| `date`                  | `Dayjs`                                                | —              | **Required.** The reference date. In `multi-resource` view each resource shows this day. In `single-resource` view the week containing this date is shown.                                        |
| `resources`             | `SchedulerResource[]`                                  | —              | **Required.** List of resources to display.                                                                                                                                                       |
| `activeResourceId`      | `string`                                               | —              | ID of the resource to show in `single-resource` view. Falls back to the first resource if omitted.                                                                                                |
| `selections`            | `SchedulerSelections`                                  | `{}`           | Map of `"resourceId:YYYY-MM-DD"` → `TimeRange \| null`. Controls the selected interval for each row.                                                                                              |
| `onChange`              | `(options: OnSchedulerChangeOptions) => void`          | —              | Called when a selection is created, moved, resized, or cleared. Receives `{ resourceId, date, range, error }`. `range` is `null` when the selection is removed.                                   |
| `onCrossDrag`           | `(options: OnCrossDragOptions) => void`                | —              | Called when a selection is dropped onto a different resource row. Receives `{ from, to, range, error }`. You are responsible for updating `selections` — clear the source row and set the target. |
| `onEventClick`          | `(options: OnEventClickOptions) => void`               | —              | Called when a blocked event block is clicked. Receives `{ event, direction }`.                                                                                                                    |
| `startHour`             | `number`                                               | `0`            | First hour shown on the time axis (0–23).                                                                                                                                                         |
| `endHour`               | `number`                                               | `24`           | Last hour shown on the time axis (1–24).                                                                                                                                                          |
| `interval`              | `number`                                               | `30`           | Slot size in minutes. Determines the grid resolution for selection and snapping.                                                                                                                  |
| `minimumInterval`       | `number`                                               | `interval`     | Minimum allowed selection duration in minutes. Must be a positive multiple of `interval`.                                                                                                         |
| `fixedDuration`         | `number`                                               | —              | When set, selections are always exactly this many minutes long. Resize handles are hidden.                                                                                                        |
| `direction`             | `'horizontal' \| 'vertical'`                           | `'horizontal'` | Layout axis. `horizontal`: time flows left-to-right, resources are rows. `vertical`: time flows top-to-bottom, resources are columns.                                                             |
| `disabled`              | `boolean`                                              | `false`        | Disables all interaction on every row.                                                                                                                                                            |
| `disablePast`           | `boolean`                                              | `false`        | Prevents selections that start in the past. Selections overlapping the current time receive `error: 'past'`.                                                                                      |
| `crossDrag`             | `boolean`                                              | `false`        | Enables dragging a selection from one resource row to another. Requires `onCrossDrag` to update state.                                                                                            |
| `singleSelection`       | `boolean`                                              | `false`        | When `true`, creating or moving a selection in any row automatically clears all other rows.                                                                                                       |
| `isLoading`             | `boolean`                                              | `false`        | Shows a loading overlay over the entire scheduler grid.                                                                                                                                           |
| `loadingText`           | `string`                                               | —              | Text displayed inside the loading overlay.                                                                                                                                                        |
| `debug`                 | `boolean`                                              | `false`        | Renders slot date labels for development debugging.                                                                                                                                               |
| `className`             | `string`                                               | —              | Class applied to the outermost wrapper element.                                                                                                                                                   |
| `classNames`            | `SchedulerClassNames`                                  | —              | Fine-grained class overrides for internal elements (see [SchedulerClassNames](#schedulerclassnames)).                                                                                             |
| `renderResizeHandle`    | `(options: RenderResizeHandleOptions) => ReactNode`    | —              | Replace the default left/right resize handle UI. Receives `{ dir: 'left' \| 'right', direction }`.                                                                                                |
| `renderIntervalContent` | `(options: RenderIntervalContentOptions) => ReactNode` | —              | Replace the label shown inside the selected block. Receives `{ interval, isSmall, error, direction }`. `isSmall` is `true` when the block is too narrow to display full text.                     |
| `renderRowLabel`        | `(options: RenderRowLabelOptions) => ReactNode`        | —              | Replace the resource label rendered to the left of each row (horizontal) or above each column (vertical). Receives `{ resource, date, direction }`.                                               |
| `renderEvent`           | `(options: RenderEventOptions) => ReactNode`           | —              | Replace the blocked event block UI. Receives `{ event, direction }`.                                                                                                                              |
| `renderOverlay`         | `(options: RenderOverlayOptions) => ReactNode`         | —              | Replace the default loading overlay entirely. Receives `{ direction }`. Shown whenever `isLoading` is `true` or this prop is provided.                                                            |

#### Callback payloads

```ts
type OnSchedulerChangeOptions = {
  resourceId: string // which resource was changed
  date: Dayjs // which date row was changed
  range: TimeRange | null // new selection, or null if cleared
  error: SelectionError // 'overlap' | 'past' | null
}

type OnCrossDragOptions = {
  from: { resourceId: string; date: Dayjs }
  to: { resourceId: string; date: Dayjs }
  range: TimeRange // time-of-day preserved, date adjusted to target row
  error: SelectionError
}
```

---

### `TimeLineRange`

Low-level single-row timeline. Use this directly when you need a standalone picker without the full scheduler grid, or when building a custom layout.

```tsx
import { TimeLineRange } from '@kekovina/calendar'
```

Accepts a forwarded `ref` (`RefObject<HTMLDivElement>`) on the inner track element.

#### Props

| Prop                    | Type                                         | Default        | Description                                                                                                                                                          |
| ----------------------- | -------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                    | `string`                                     | —              | **Required.** Unique identifier used as a key prefix for event blocks.                                                                                               |
| `startDate`             | `Dayjs`                                      | start of today | Left/top boundary of the time axis.                                                                                                                                  |
| `endDate`               | `Dayjs`                                      | end of today   | Right/bottom boundary of the time axis.                                                                                                                              |
| `selectedInterval`      | `TimeRange \| null`                          | —              | Controlled selected time range.                                                                                                                                      |
| `previewInterval`       | `TimeRange \| null`                          | —              | Ghost preview block shown when an external drag hovers over this row (used internally by `Scheduler` for cross-drag).                                                |
| `previewError`          | `SelectionError`                             | `null`         | Validation state of the preview block — colors it red when non-null.                                                                                                 |
| `events`                | `SchedulerEvent[]`                           | `[]`           | Blocked time ranges rendered as non-interactive event blocks. Selections cannot overlap them.                                                                        |
| `onChange`              | `(options: OnChangeOptions) => void`         | —              | Called on selection create, move, or resize. Receives `{ range, error }`.                                                                                            |
| `onCrossDragDrop`       | `(options: OnCrossDragDropOptions) => void`  | —              | Called when the user releases a drag outside this timeline's bounds. Receives `{ clientX, clientY, range }`.                                                         |
| `onCrossDragMove`       | `(options: OnCrossDragMoveOptions) => void`  | —              | Called on every pointer move during a cross-timeline drag. Receives `{ clientX, clientY, interval }`. Use this to drive `previewInterval` on the hovered target row. |
| `onEventClick`          | `(options: OnEventClickOptions) => void`     | —              | Called when a blocked event block is clicked.                                                                                                                        |
| `interval`              | `number`                                     | `30`           | Slot size and snapping grid in minutes.                                                                                                                              |
| `minimumInterval`       | `number`                                     | `30`           | Minimum selection duration in minutes.                                                                                                                               |
| `fixedDuration`         | `number`                                     | —              | Fixed selection length in minutes. Resize handles are hidden.                                                                                                        |
| `boundsStart`           | `Dayjs`                                      | —              | Hard left/top drag boundary. The selection cannot be moved before this time.                                                                                         |
| `boundsEnd`             | `Dayjs`                                      | —              | Hard right/bottom drag boundary. The selection cannot extend past this time.                                                                                         |
| `direction`             | `'horizontal' \| 'vertical'`                 | `'horizontal'` | Layout axis.                                                                                                                                                         |
| `disabled`              | `boolean`                                    | `false`        | Disables all interaction.                                                                                                                                            |
| `disablePast`           | `boolean`                                    | `false`        | Prevents selections in the past.                                                                                                                                     |
| `crossDragEnabled`      | `boolean`                                    | `false`        | Enables firing `onCrossDragDrop` / `onCrossDragMove` when the pointer leaves the row bounds.                                                                         |
| `crossDragBounds`       | `string`                                     | —              | CSS selector for the element that constrains the drag area (e.g. `"#scheduler-container"`). Prevents the block from being dropped outside the scheduler bounds.      |
| `debug`                 | `boolean`                                    | `false`        | Renders slot date labels for debugging.                                                                                                                              |
| `className`             | `string`                                     | —              | Class applied to the outer wrapper.                                                                                                                                  |
| `classNames`            | `SchedulerClassNames`                        | —              | Fine-grained class overrides.                                                                                                                                        |
| `renderResizeHandle`    | `(options) => ReactNode`                     | —              | Custom resize handle.                                                                                                                                                |
| `renderIntervalContent` | `(options) => ReactNode`                     | —              | Custom selected block content.                                                                                                                                       |
| `renderLabel`           | `(options: RenderLabelOptions) => ReactNode` | —              | Renders a label prepended to the track (before the track in horizontal, above in vertical).                                                                          |
| `renderEvent`           | `(options) => ReactNode`                     | —              | Custom event block.                                                                                                                                                  |

#### Callback payloads

```ts
type OnChangeOptions = {
  range: TimeRange
  error: SelectionError // 'overlap' | 'past' | null
}

type OnCrossDragDropOptions = {
  clientX: number
  clientY: number
  range: TimeRange
}

type OnCrossDragMoveOptions = {
  clientX: number
  clientY: number
  interval: TimeRange
}
```

---

### `TimeLineHeader`

Standalone time axis header. Used internally by `Scheduler`, but exported for custom layouts.

```tsx
import { TimeLineHeader } from '@kekovina/calendar'
```

| Prop             | Type                         | Default         | Description                                                                  |
| ---------------- | ---------------------------- | --------------- | ---------------------------------------------------------------------------- |
| `startDate`      | `Dayjs`                      | —               | **Required.** Start of the time axis.                                        |
| `endDate`        | `Dayjs`                      | —               | **Required.** End of the time axis.                                          |
| `interval`       | `number`                     | —               | **Required.** Slot size in minutes. Must match the `TimeLineRange` interval. |
| `labelEvery`     | `number`                     | `60 / interval` | Show a time label every N slots. Default shows one label per hour.           |
| `timeFormat`     | `string`                     | `'HH:mm'`       | `dayjs` format string for time labels.                                       |
| `direction`      | `'horizontal' \| 'vertical'` | `'horizontal'`  | Layout axis.                                                                 |
| `className`      | `string`                     | —               | Class applied to the header container.                                       |
| `labelClassName` | `string`                     | —               | Class applied to each time label cell.                                       |

---

## Shared Types

```ts
import type {
  TimeRange,
  SchedulerDirection,
  SchedulerView,
  SelectionError,
  SchedulerEvent,
  SchedulerResource,
  SchedulerSelections,
  SchedulerClassNames,
} from '@kekovina/calendar'

// A [start, end] tuple of Dayjs values
type TimeRange = [Dayjs, Dayjs]

type SchedulerDirection = 'horizontal' | 'vertical'
type SchedulerView = 'multi-resource' | 'single-resource'
type SelectionError = 'overlap' | 'past' | null

type SchedulerEvent = {
  id?: string
  range: TimeRange
  label?: string
  className?: string
}

type SchedulerResource = {
  id: string
  label: string
  disabled?: boolean
  events?: SchedulerEvent[]
  classNames?: SchedulerClassNames // per-resource class overrides
}

// Key format: `"${resourceId}:YYYY-MM-DD"`
type SchedulerSelections = Record<string, TimeRange | null>
```

### `SchedulerClassNames`

Override any internal element's class. All keys are optional.

| Key                 | Element                                              |
| ------------------- | ---------------------------------------------------- |
| `root`              | Outer wrapper of each `TimeLineRange` row            |
| `track`             | Inner track containing slots and the selection block |
| `slot`              | Individual time slot cell                            |
| `slotPast`          | Time slot cell that is in the past                   |
| `selection`         | The draggable selected block                         |
| `selectionError`    | The selected block when `error` is non-null          |
| `resizeHandleLeft`  | Left / top resize handle                             |
| `resizeHandleRight` | Right / bottom resize handle                         |
| `eventBlock`        | Blocked event block                                  |

---

## Examples

### Vertical layout

```tsx
<Scheduler
  view="multi-resource"
  date={dayjs()}
  resources={resources}
  selections={selections}
  onChange={handleChange}
  direction="vertical"
  startHour={9}
  endHour={18}
  interval={15}
/>
```

### Week view for a single resource

```tsx
<Scheduler
  view="single-resource"
  date={dayjs()}
  resources={resources}
  activeResourceId="room-a"
  selections={selections}
  onChange={handleChange}
  startHour={8}
  endHour={20}
  interval={30}
/>
```

### Cross-row drag and drop

```tsx
<Scheduler
  view="multi-resource"
  date={dayjs()}
  resources={resources}
  selections={selections}
  crossDrag
  onChange={({ resourceId, date, range }) => {
    const key = `${resourceId}:${date.format('YYYY-MM-DD')}`
    setSelections((prev) => ({ ...prev, [key]: range }))
  }}
  onCrossDrag={({ from, to, range }) => {
    const fromKey = `${from.resourceId}:${from.date.format('YYYY-MM-DD')}`
    const toKey = `${to.resourceId}:${to.date.format('YYYY-MM-DD')}`
    setSelections((prev) => ({ ...prev, [fromKey]: null, [toKey]: range }))
  }}
/>
```

### Fixed-duration selection

```tsx
<Scheduler
  view="multi-resource"
  date={dayjs()}
  resources={resources}
  selections={selections}
  onChange={handleChange}
  interval={30}
  fixedDuration={60} // always exactly 1 hour; resize handles hidden
/>
```

### Per-resource styling

```tsx
const resources: SchedulerResource[] = [
  {
    id: 'room-a',
    label: 'Room A',
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
    label: 'Room B',
    classNames: {
      root: 'bg-emerald-50',
      selection: 'bg-emerald-500',
      resizeHandleLeft: 'bg-emerald-700',
      resizeHandleRight: 'bg-emerald-700',
    },
  },
]
```

### Custom selection content

```tsx
<Scheduler
  ...
  renderIntervalContent={({ interval, isSmall, error }) => (
    <span style={{ fontSize: isSmall ? 10 : 14 }}>
      {interval[0].format('HH:mm')} – {interval[1].format('HH:mm')}
      {error && ' ⚠️'}
    </span>
  )}
/>
```

### Blocked events

```tsx
const resources: SchedulerResource[] = [
  {
    id: 'room-a',
    label: 'Room A',
    events: [
      {
        id: 'meeting-1',
        range: [dayjs().hour(10).minute(0), dayjs().hour(11).minute(30)],
        label: 'Booked',
      },
    ],
  },
]
```

### Standalone `TimeLineRange`

```tsx
import { TimeLineRange } from '@kekovina/calendar'

const [interval, setInterval] = useState<TimeRange | null>(null)

<TimeLineRange
  id="my-timeline"
  startDate={dayjs().hour(8).minute(0)}
  endDate={dayjs().hour(20).minute(0)}
  interval={30}
  minimumInterval={30}
  selectedInterval={interval}
  onChange={({ range, error }) => {
    if (!error) setInterval(range)
  }}
  events={bookedSlots}
  disablePast
/>
```

---

## License

MIT
