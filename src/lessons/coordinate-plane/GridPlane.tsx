import { Coordinates, Mafs, Polygon } from 'mafs'
import { useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { BoundsContext, PADDING, visibleBounds } from '../../lib/planeBounds'
import type { Bounds } from '../../lib/snap'
import { labelEvery } from './layout'

/**
 * Local variant of the shared `Plane` for this lesson. Same behaviour (fixed
 * view, no pan or zoom, origin centred, bounds context for draggables), plus:
 * - axis numbers thin out to every 2nd unit when one unit is under ~26 px,
 *   while the grid keeps a line for every unit so counting still works;
 * - `numberLine` hides the y-axis and the horizontal grid lines, leaving a
 *   plain number line (step 1 starts in one dimension).
 * The shared Plane has no option for either, so this lives here.
 */
export function GridPlane({
  children,
  x = [-10.5, 10.5],
  y = [-10.5, 10.5],
  height,
  numberLine = false,
  limit = 10,
  onPick,
  label,
}: {
  children?: ReactNode
  x?: [number, number]
  y?: [number, number]
  height: number
  numberLine?: boolean
  /** How far the numbers go (and how far points can be moved). */
  limit?: number
  /** Called with the nearest whole-number point when the plane is clicked (click to plot). */
  onPick?: (p: [number, number]) => void
  label: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    setWidth(el.clientWidth)
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const bounds = width > 0 ? visibleBounds(x, y, width, height, false) : null
  const pxPerUnit = bounds && width > 0 ? width / (bounds.x[1] - bounds.x[0]) : 40
  const every = labelEvery(pxPerUnit)
  // Numbers stop at ±limit (the reach of the point and sliders); beyond it the plane is dimmed.
  // Only inside the requested range: extra room a wide or tall screen adds stays unnumbered.
  const labelsIn = (r: [number, number]) => (n: number) =>
    n !== 0 && Math.abs(n) <= limit && n >= Math.ceil(r[0]) && n <= Math.floor(r[1]) && n % every === 0
      ? String(n).replace('-', '−')
      : ''

  const pick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onPick || !bounds || !box.current) return
    const r = box.current.getBoundingClientRect()
    const fx = (e.clientX - r.left) / r.width
    const fy = (e.clientY - r.top) / r.height
    const px = bounds.x[0] + fx * (bounds.x[1] - bounds.x[0])
    const py = bounds.y[1] - fy * (bounds.y[1] - bounds.y[0])
    const clamp = (v: number) => Math.max(-limit, Math.min(limit, Math.round(v))) + 0
    onPick([clamp(px), clamp(py)])
  }

  return (
    <div ref={box} role="group" aria-label={label} onClick={onPick ? pick : undefined} className="overflow-hidden rounded-xl border border-line [&_.mafs-axis_text]:text-[13px]">
      <BoundsContext.Provider value={bounds}>
        <Mafs height={height} pan={false} zoom={false} viewBox={{ x, y, padding: PADDING }} preserveAspectRatio="contain">
          <Coordinates.Cartesian
            subdivisions={false}
            xAxis={{ lines: 1, labels: labelsIn(x) }}
            yAxis={numberLine ? false : { lines: 1, labels: labelsIn(y) }}
          />
          {bounds && <OutOfRange bounds={bounds} limit={limit} />}
          {children}
        </Mafs>
      </BoundsContext.Provider>
    </div>
  )
}

/** Greys out the strips past x = ±limit that wide planes show but the point cannot reach. */
function OutOfRange({ bounds, limit }: { bounds: Bounds; limit: number }) {
  const [y0, y1] = bounds.y
  const strips: [number, number][] = []
  if (bounds.x[1] > limit + 1.2) strips.push([limit + 0.5, bounds.x[1] + 1])
  if (bounds.x[0] < -limit - 1.2) strips.push([bounds.x[0] - 1, -limit - 0.5])
  return (
    <>
      {strips.map(([a, b]) => (
        <Polygon
          key={a}
          points={[
            [a, y0 - 1],
            [b, y0 - 1],
            [b, y1 + 1],
            [a, y1 + 1],
          ]}
          color="var(--muted)"
          fillOpacity={0.08}
          strokeOpacity={0}
        />
      ))}
    </>
  )
}
