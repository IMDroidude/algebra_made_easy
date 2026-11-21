import { Coordinates, Line, Mafs, MovablePoint, Point, Vector } from 'mafs'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { apply2 } from '../linalg'
import { keepInside, snapTo } from '../lib/snap'
import { BoundsContext, PADDING, usePlaneBounds, visibleBounds } from '../lib/planeBounds'
import { CoordHoverTarget, WithCoordTooltip } from './CoordTooltip'
import { PlaneLabel } from './PlaneLabel'
import type { Mat2, Vec2 } from '../linalg'

/** The 2D coordinate plane every visual is drawn on. y points up. */
export function Plane({
  children,
  extent = 5,
  x,
  y,
  stretch = false,
  height = 380,
  label,
}: {
  children?: ReactNode
  /** Shows -extent…extent on both axes. Overridden per axis by `x` / `y`. */
  extent?: number
  /** Visible x range, for planes not centred on the origin. */
  x?: [number, number]
  /** Visible y range. */
  y?: [number, number]
  /** Let x and y use different scales (for data whose axes have different units). */
  stretch?: boolean
  height?: number
  /** Short description for screen readers; the live values go in a text readout next to it. */
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
  const xRange = x ?? [-extent, extent]
  const yRange = y ?? [-extent, extent]
  const bounds = width > 0 ? visibleBounds(xRange, yRange, width, height, stretch) : null

  return (
    <div
      ref={box}
      role="group"
      aria-label={label}
      className="overflow-hidden rounded-xl border border-line"
    >
      <BoundsContext.Provider value={bounds}>
      <Mafs
        height={height}
        pan={false}
        zoom={false}
        viewBox={{ x: xRange, y: yRange, padding: PADDING }}
        preserveAspectRatio={stretch ? false : 'contain'}
      >
        <Coordinates.Cartesian subdivisions={false} />
        {children}
      </Mafs>
      </BoundsContext.Provider>
    </div>
  )
}

/** The grid lines of the plane after a matrix has been applied to them. */
export function TransformedGrid({
  matrix,
  extent = 10,
  color,
  opacity = 0.45,
}: {
  matrix: Mat2
  extent?: number
  color: string
  opacity?: number
}) {
  const lines: ReactNode[] = []
  for (let k = -extent; k <= extent; k++) {
    lines.push(
      <Line.Segment
        key={`v${k}`}
        point1={apply2(matrix, [k, -extent])}
        point2={apply2(matrix, [k, extent])}
        color={color}
        opacity={opacity}
        weight={1}
      />,
      <Line.Segment
        key={`h${k}`}
        point1={apply2(matrix, [-extent, k])}
        point2={apply2(matrix, [extent, k])}
        color={color}
        opacity={opacity}
        weight={1}
      />,
    )
  }
  return <>{lines}</>
}

/** An arrow with a text label at its tip. */
export function Arrow({
  tail = [0, 0],
  tip,
  color,
  label,
  labelAt = 'tip',
  labelDistance = 14,
  dashed = false,
  opacity = 1,
  weight = 3,
  showCoords = !dashed,
}: {
  tail?: Vec2
  tip: Vec2
  color: string
  label?: string
  /** Put the label at the tip (default) or beside the middle of the arrow. */
  labelAt?: 'tip' | 'middle'
  /** Gap in pixels between the anchor point and the label. */
  labelDistance?: number
  dashed?: boolean
  opacity?: number
  weight?: number
  /** Show the tip's coordinates on hover. On by default for solid arrows. */
  showCoords?: boolean
}) {
  const dx = tip[0] - tail[0]
  const dy = tip[1] - tail[1]
  const middle = labelAt === 'middle'
  const at: Vec2 = middle ? [tail[0] + dx / 2, tail[1] + dy / 2] : tip
  // Beside the middle: below a mostly horizontal arrow, to the right of a mostly vertical one.
  const attach = middle ? (Math.abs(dx) >= Math.abs(dy) ? 's' : 'e') : dx >= 0 ? 'e' : 'w'
  return (
    <>
      <Vector
        tail={tail}
        tip={tip}
        color={color}
        weight={weight}
        opacity={opacity}
        style={dashed ? 'dashed' : 'solid'}
      />
      {label && (
        <PlaneLabel
          x={at[0]}
          y={at[1]}
          attach={attach}
          distance={labelDistance}
          size={18}
          color={color}
        >
          {label}
        </PlaneLabel>
      )}
      {showCoords && <CoordHoverTarget point={tip} />}
    </>
  )
}

const defaultSnap = snapTo(0.5)

/** The snap function, plus: never let a point leave the visible plane. */
function useConstrain(snap: (p: Vec2) => Vec2) {
  const bounds = usePlaneBounds()
  return (p: Vec2) => (bounds ? keepInside(p, snap, bounds) : snap(p))
}

/** An arrow whose tip can be dragged, or moved with the arrow keys when focused. */
export function DraggableArrow({
  value,
  onChange,
  color,
  label,
  snap = defaultSnap,
}: {
  value: Vec2
  onChange: (next: Vec2) => void
  color: string
  label?: string
  snap?: (p: Vec2) => Vec2
}) {
  const constrain = useConstrain(snap)
  return (
    <>
      {/* Extra gap so the label clears the drag handle. */}
      <Arrow tip={value} color={color} label={label} labelDistance={24} showCoords={false} />
      <WithCoordTooltip point={value}>
        <MovablePoint point={value} onMove={onChange} constrain={constrain} color={color} />
      </WithCoordTooltip>
    </>
  )
}

/** A point that can be dragged (or moved with arrow keys); shows its coordinates on hover. */
export function DraggablePoint({
  value,
  onChange,
  color,
  snap = defaultSnap,
}: {
  value: Vec2
  onChange: (next: Vec2) => void
  color: string
  snap?: (p: Vec2) => Vec2
}) {
  const constrain = useConstrain(snap)
  return (
    <WithCoordTooltip point={value}>
      <MovablePoint point={value} onMove={onChange} constrain={constrain} color={color} />
    </WithCoordTooltip>
  )
}

/** A fixed point that shows its coordinates on hover. */
export function CoordPoint({ at, color, opacity }: { at: Vec2; color: string; opacity?: number }) {
  return (
    <>
      <Point x={at[0]} y={at[1]} color={color} opacity={opacity} />
      <CoordHoverTarget point={at} />
    </>
  )
}
