import { Circle, Line, Polygon } from 'mafs'
import type { CardinalDirection } from 'mafs'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CoordPoint, Plane } from '../../components/Plane'
import { PADDING, usePlaneBounds } from '../../lib/planeBounds'
import { PlaneLabel } from '../../components/PlaneLabel'
import { COLOR } from '../../lib/palette'
import type { Vec2 } from '../../linalg'
import { centres, halfPlaneInBox, linePoints } from './classifier'
import type { Example } from './classifier'
import { EMAIL_COLOR } from './data'

/** The colour of the learned boundary line, in every step. */
export const LINE_COLOR = COLOR.result
/** The difference vector d and the direction w. */
export const ARROW_COLOR = COLOR.v
/** A new email the learner places. */
export const NEW_COLOR = COLOR.i

/**
 * A Plane for count data: the left and bottom edges stay just below 0, and
 * any extra width the screen offers is added on the right, where the data is,
 * instead of half of it being wasted on negative counts.
 */
export function EmailPlane({
  x,
  y,
  height,
  label,
  children,
  maxSpan = 10,
}: {
  x: [number, number]
  y: [number, number]
  height: number
  label: string
  children: ReactNode
  /** The widest x range worth showing; on wider screens the plane stops growing. */
  maxSpan?: number
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
  let xr = x
  if (width > 0) {
    const wanted = (y[1] - y[0] + 2 * PADDING) * (width / height) - 2 * PADDING
    if (wanted > x[1] - x[0]) xr = [x[0], x[0] + wanted]
  }
  const ySpan = y[1] - y[0] + 2 * PADDING
  const maxWidth = Math.round((height * (maxSpan + 2 * PADDING)) / ySpan)
  return (
    <div ref={box} className="mx-auto" style={{ maxWidth }}>
      <Plane x={xr} y={y} height={height} label={label}>
        {children}
      </Plane>
    </div>
  )
}

/** Axis names in the top-left and bottom-right corners of the visible box. */
export function AxisNames({ x: xIn, y: yIn }: { x: [number, number]; y: [number, number] }) {
  const vb = usePlaneBounds()
  const x = vb ? vb.x : xIn
  const y = vb ? vb.y : yIn
  return (
    <>
      <PlaneLabel x={x[1]} y={0} attach="nw" distance={6} size={13} color="var(--muted)">
        links →
      </PlaneLabel>
      <PlaneLabel x={0} y={y[1]} attach="se" distance={6} size={13} color="var(--muted)">
        ↑ “!” marks
      </PlaneLabel>
    </>
  )
}

/**
 * Where to put an email's name: pointing away from its group's centre, so
 * names do not sit on neighbours, but never onto the axis numbers.
 */
function labelSide(e: Example, centre: Vec2): CardinalDirection {
  const dx = e.at[0] - centre[0]
  const dy = e.at[1] - centre[1]
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return 'ne'
  let side: CardinalDirection = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'e' : 'w') : dy > 0 ? 'n' : 's'
  if (side === 's' && e.at[1] < 0.75) side = 'ne'
  if (side === 'w' && e.at[0] < 0.75) side = 'ne'
  return side
}

/**
 * The emails as dots, each with its name. Spam dots also get a small square,
 * so the two groups differ in shape as well as colour.
 */
export function EmailDots({
  data,
  opacity = 1,
  wrong = [],
}: {
  data: readonly Example[]
  opacity?: number
  /** Names of emails to circle as misclassified. */
  wrong?: readonly string[]
}) {
  const r = 0.17
  const c = centres(data)
  return (
    <>
      {data.map((e) => {
        const [x, y] = e.at
        const color = EMAIL_COLOR[e.kind]
        return (
          <g key={e.name} data-email={e.name} data-wrong={wrong.includes(e.name) ? '' : undefined}>
            {wrong.includes(e.name) && (
              <Circle center={e.at} radius={0.36} color="var(--ink)" fillOpacity={0} weight={2} strokeStyle="dashed" />
            )}
            {e.kind === 'spam' && (
              <Polygon
                points={[
                  [x - r, y - r],
                  [x + r, y - r],
                  [x + r, y + r],
                  [x - r, y + r],
                ]}
                color={color}
                fillOpacity={0}
                weight={2}
                strokeOpacity={opacity}
              />
            )}
            <CoordPoint at={e.at} color={color} opacity={opacity} />
            <PlaneLabel x={x} y={y} attach={labelSide(e, c[e.kind])} distance={14} size={12} color={color}>
              {e.name}
            </PlaneLabel>
          </g>
        )
      })}
    </>
  )
}

/** A group centre: a ring with a cross, and its name. */
export function CentreMark({ at, kind, attach }: { at: Vec2; kind: Example['kind']; attach: CardinalDirection }) {
  const color = EMAIL_COLOR[kind]
  const s = 0.16
  return (
    <g data-centre={kind}>
      <Circle center={at} radius={0.26} color={color} fillOpacity={0.15} weight={2.5} />
      <Line.Segment point1={[at[0] - s, at[1]]} point2={[at[0] + s, at[1]]} color={color} weight={2} />
      <Line.Segment point1={[at[0], at[1] - s]} point2={[at[0], at[1] + s]} color={color} weight={2} />
      <PlaneLabel x={at[0]} y={at[1]} attach={attach} distance={18} size={14} color={color}>
        {kind === 'normal' ? 'μ normal' : 'μ spam'}
      </PlaneLabel>
    </g>
  )
}

/** The line w · x = b, with the two sides lightly shaded and named. */
export function Boundary({
  w,
  b,
  x,
  y,
  shade = true,
  names = true,
  color = LINE_COLOR,
  dashed = false,
  normalAt = [0.3, 3.2],
  spamAt = [5.2, 6],
}: {
  w: Vec2
  b: number
  x: [number, number]
  y: [number, number]
  shade?: boolean
  names?: boolean
  color?: string
  dashed?: boolean
  /** Where the side names start (text runs to the right). */
  normalAt?: Vec2
  spamAt?: Vec2
}) {
  const vb = usePlaneBounds()
  const bx = vb ? vb.x : x
  const by = vb ? vb.y : y
  const [p, q] = linePoints(w, b)
  const spamSide = halfPlaneInBox(w, b, bx, by, 'spam')
  const normalSide = halfPlaneInBox(w, b, bx, by, 'normal')
  return (
    <>
      {shade && spamSide.length > 2 && <Polygon points={spamSide} color={EMAIL_COLOR.spam} fillOpacity={0.07} weight={0} />}
      {shade && normalSide.length > 2 && (
        <Polygon points={normalSide} color={EMAIL_COLOR.normal} fillOpacity={0.07} weight={0} />
      )}
      <Line.ThroughPoints point1={p} point2={q} color={color} weight={3} style={dashed ? 'dashed' : 'solid'} />
      {names && (
        <>
          <PlaneLabel x={spamAt[0]} y={spamAt[1]} attach="e" distance={0} size={11} color={EMAIL_COLOR.spam}>
            spam side
          </PlaneLabel>
          <PlaneLabel x={normalAt[0]} y={normalAt[1]} attach="e" distance={0} size={11} color={EMAIL_COLOR.normal}>
            normal side
          </PlaneLabel>
        </>
      )}
    </>
  )
}
