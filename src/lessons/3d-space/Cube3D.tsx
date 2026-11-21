import { useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import {
  CORNER_VIEW,
  FRONT_VIEW,
  SIDE_VIEW,
  TOP_VIEW,
  depth,
  nearerThanPlane,
  project,
  rotateView,
  sameView,
  screenToFloor,
  shadow,
  slicePlane,
} from '../../linalg/project3d'
import type { Plane3, Vec3, View, Wall } from '../../linalg/project3d'
import { Button } from '../../components/ui'
import { AXIS_COLOR, SIZE, WALL_NAME, coord3Text } from './cube'
import { AXIS_INFO, walkLegs } from './walk'

/** Pixels per unit, and half the width of the drawing, in SVG units. */
const PX = 40
const HALF = 215
/** Degrees turned per pixel dragged, and per arrow-key press. */
const DRAG_DEG = 0.5
const KEY_DEG = 10

export type CubePoint = {
  at: Vec3
  label: string
  color: string
  /** Drawn larger and with its coordinates always shown. */
  highlight?: boolean
  /** What the hover box and the highlight label show instead of the drawn coordinates (for scaled data). */
  text?: string
}

type Axis = 'x' | 'y' | 'z'

/** A flat plane drawn through the room: solid inside the room, faint and dashed just outside it. */
export type CubePlane = {
  plane: Plane3
  color: string
  label: string
  /** Where to put the name; defaults to the middle of the part inside the room. */
  labelAt?: Vec3
}

/** How far beyond the room the faint part of a plane is drawn, hinting that it goes on forever. */
const PLANE_OVERHANG = 1

type Hover = { at: Vec3; text: string } | null

/** Cube corners and axis tips: what must fit in the picture. */
const EXTREMES: Vec3[] = [
  ...[0, SIZE].flatMap((x) => [0, SIZE].flatMap((y) => [0, SIZE].map((z): Vec3 => [x, y, z]))),
  [SIZE + 1.6, 0, 0],
  [0, SIZE + 1.6, 0],
  [0, 0, SIZE + 1.6],
]

/** The middle of the picture's bounding box, so the drawing stays centred as it turns. */
function pictureCentre(view: View): [number, number] {
  const pts = EXTREMES.map((p) => project(p, view))
  const xs = pts.map((q) => q[0])
  const ys = pts.map((q) => q[1])
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
}

const snapHalf = (x: number) => Math.max(0, Math.min(SIZE, Math.round(x * 2) / 2)) + 0

/**
 * A room corner drawn in SVG with our own projection: three walls (the planes
 * x = 0, y = 0 and z = 0), the outline of a cube, three axes, and optionally a
 * point with its shadows on the walls. Dragging the picture turns it; the
 * arrow keys do the same when it has focus. If `onPointChange` is given, the
 * point's floor shadow can be dragged to move the point along the floor.
 */
export function Cube3D({
  label,
  view,
  onViewChange,
  point,
  pointLabel = 'P',
  onPointChange,
  shadows = true,
  walk = false,
  points = [],
  planes = [],
  height = 620,
  axisNames,
  axisTicks,
}: {
  label: string
  view: View
  /** Leave out to make the picture fixed. */
  onViewChange?: (next: View) => void
  point?: Vec3
  pointLabel?: string
  onPointChange?: (next: Vec3) => void
  /** All three shadows, none, or just the one on the given wall. */
  shadows?: boolean | Wall
  /** Draw the walk from the corner: along x (width), then up y (height), then forward z (depth). */
  walk?: boolean
  points?: CubePoint[]
  /** Flat planes through the room. Points on the far side of the first one are drawn behind it. */
  planes?: CubePlane[]
  height?: number
  /** Replace the axis names (width, height, depth), e.g. for data axes. */
  axisNames?: Partial<Record<Axis, string>>
  /** Text for the tick at drawing unit k on an axis, for scaled data. Defaults to k. */
  axisTicks?: Partial<Record<Axis, (k: number) => string>>
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<
    | { mode: 'turn'; x: number; y: number; view: View }
    | { mode: 'move'; x: number; y: number; start: Vec3 }
    | null
  >(null)
  const [hover, setHover] = useState<Hover>(null)
  const [grabbing, setGrabbing] = useState(false)

  const [cx, cy] = pictureCentre(view)
  /** Where a world point is drawn, in SVG pixels (y down). */
  const at = (p: Vec3): [number, number] => {
    const [x, y] = project(p, view)
    return [(x - cx) * PX, -(y - cy) * PX]
  }
  const line = (a: Vec3, b: Vec3) => {
    const [x1, y1] = at(a)
    const [x2, y2] = at(b)
    return { x1, y1, x2, y2 }
  }
  const poly = (corners: Vec3[]) => corners.map((c) => at(c).join(',')).join(' ')

  /** SVG units per CSS pixel, so drags feel the same at every screen width. */
  const unitsPerPx = () => {
    const w = svgRef.current?.getBoundingClientRect().width
    return w ? (2 * HALF) / w : 1
  }

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    const target = e.target as Element
    if (onPointChange && point && target.closest('[data-handle="floor"]')) {
      drag.current = { mode: 'move', x: e.clientX, y: e.clientY, start: point }
    } else if (onViewChange) {
      drag.current = { mode: 'turn', x: e.clientX, y: e.clientY, view }
    } else return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setGrabbing(true)
  }

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (d.mode === 'turn') {
      onViewChange?.(rotateView(d.view, dx * DRAG_DEG, dy * DRAG_DEG))
    } else if (onPointChange) {
      const k = unitsPerPx() / PX
      const step = screenToFloor(view, [dx * k, -dy * k])
      if (step) onPointChange([snapHalf(d.start[0] + step[0]), d.start[1], snapHalf(d.start[2] + step[1])])
    }
  }

  const endDrag = () => {
    drag.current = null
    setGrabbing(false)
  }

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!onViewChange) return
    const turns: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_DEG, 0],
      ArrowRight: [KEY_DEG, 0],
      ArrowUp: [0, -KEY_DEG],
      ArrowDown: [0, KEY_DEG],
    }
    const t = turns[e.key]
    if (!t) return
    e.preventDefault()
    onViewChange(rotateView(view, t[0], t[1]))
  }

  // ---- walls, sorted so the farthest is drawn first ----
  const S = SIZE
  const walls: { wall: Wall; corners: Vec3[]; grid: [Vec3, Vec3][]; mid: Vec3; tag: Vec3 }[] = [
    {
      wall: 'xy',
      corners: [[0, 0, 0], [S, 0, 0], [S, S, 0], [0, S, 0]],
      grid: range(1, S - 1).flatMap((k): [Vec3, Vec3][] => [
        [[k, 0, 0], [k, S, 0]],
        [[0, k, 0], [S, k, 0]],
      ]),
      mid: [S / 2, S / 2, 0],
      tag: [S / 2, S - 0.35, 0],
    },
    {
      wall: 'yz',
      corners: [[0, 0, 0], [0, S, 0], [0, S, S], [0, 0, S]],
      grid: range(1, S - 1).flatMap((k): [Vec3, Vec3][] => [
        [[0, k, 0], [0, k, S]],
        [[0, 0, k], [0, S, k]],
      ]),
      mid: [0, S / 2, S / 2],
      tag: [0, S - 0.35, S / 2],
    },
    {
      wall: 'xz',
      corners: [[0, 0, 0], [S, 0, 0], [S, 0, S], [0, 0, S]],
      grid: range(1, S - 1).flatMap((k): [Vec3, Vec3][] => [
        [[k, 0, 0], [k, 0, S]],
        [[0, 0, k], [S, 0, k]],
      ]),
      mid: [S / 2, 0, S / 2],
      tag: [S / 2, 0, S - 0.4],
    },
  ]
  walls.sort((a, b) => depth(a.mid, view) - depth(b.mid, view))
  /** A wall seen nearly edge-on is a thin sliver; its name would sit on top of an axis. */
  const NORMAL: Record<Wall, Vec3> = { xy: [0, 0, 1], yz: [1, 0, 0], xz: [0, 1, 0] }
  const faceOn = (w: Wall) => Math.abs(depth(NORMAL[w], view)) > 0.3

  // The 12 edges of the cube, faint, so the box reads as a box.
  const corners: Vec3[] = [0, S].flatMap((x) => [0, S].flatMap((y) => [0, S].map((z): Vec3 => [x, y, z])))
  const edges: [Vec3, Vec3][] = []
  corners.forEach((a, i) =>
    corners.slice(i + 1).forEach((b) => {
      const differ = a.filter((v, k) => v !== b[k]).length
      if (differ === 1) edges.push([a, b])
    }),
  )

  const axisEnd = S + 1.1
  const axes: { name: Axis; dir: Vec3 }[] = [
    { name: 'x', dir: [1, 0, 0] },
    { name: 'y', dir: [0, 1, 0] },
    { name: 'z', dir: [0, 0, 1] },
  ]

  const shadowWalls: Wall[] = shadows === true ? ['xy', 'yz', 'xz'] : shadows ? [shadows] : []

  const sorted = [...points].sort((a, b) => depth(a.at, view) - depth(b.at, view))
  const first = planes[0]?.plane
  const inFront = (p: CubePoint) => !first || nearerThanPlane(p.at, first, view)

  const renderPoint = (p: CubePoint) => {
    const [px, py] = at(p.at)
    return (
      <g
        key={p.label}
        onPointerEnter={() => setHover({ at: p.at, text: `${p.label} ${p.text ?? coord3Text(p.at)}` })}
        onPointerLeave={() => setHover(null)}
      >
        <circle
          cx={px}
          cy={py}
          r={p.highlight ? 8 : 6}
          fill={p.color}
          stroke={p.highlight ? 'var(--ink)' : 'var(--surface)'}
          strokeWidth={p.highlight ? 2.5 : 1.5}
        />
        {!p.highlight && (
          <text x={px + 9} y={py - 9} fontSize={12} fontWeight={600} fill={p.color}>
            {p.label}
          </text>
        )}
        <circle cx={px} cy={py} r={14} fill="transparent" />
      </g>
    )
  }

  const interactive = Boolean(onViewChange)
  const viewName = [
    [CORNER_VIEW, 'corner view'],
    [FRONT_VIEW, 'front view'],
    [SIDE_VIEW, 'side view'],
    [TOP_VIEW, 'top view'],
  ].find(([v]) => sameView(v as View, view))?.[1] as string | undefined

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <svg
        ref={svgRef}
        role="group"
        aria-label={`${label}${interactive ? '. Drag, or focus and use the arrow keys, to turn the cube.' : ''}`}
        aria-roledescription="3D view"
        tabIndex={interactive ? 0 : undefined}
        viewBox={`${-HALF} ${-HALF} ${2 * HALF} ${2 * HALF}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        className={`block ${interactive ? (grabbing ? 'cursor-grabbing' : 'cursor-grab') : ''} focus-visible:outline-2 focus-visible:outline-accent`}
        style={{
          touchAction: interactive ? 'none' : undefined,
          background: 'var(--surface)',
          aspectRatio: '1 / 1',
          maxHeight: height,
        }}
        data-view={viewName ?? `yaw ${fmt(view.yaw, 0)}, pitch ${fmt(view.pitch, 0)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        {walls.map((w) => (
          <g key={w.wall}>
            <polygon
              points={poly(w.corners)}
              style={{ fill: 'var(--grid-faint)', stroke: 'var(--grid)', fillOpacity: 0.75 }}
              strokeWidth={1}
            />
            {w.grid.map(([a, b], k) => (
              <line key={k} {...line(a, b)} style={{ stroke: 'var(--grid)' }} strokeWidth={0.8} />
            ))}
            {faceOn(w.wall) && <WallLabel at={at(w.tag)}>{WALL_NAME[w.wall]}</WallLabel>}
          </g>
        ))}

        {edges.map(([a, b], k) => (
          <line
            key={k}
            {...line(a, b)}
            style={{ stroke: 'var(--muted)' }}
            strokeOpacity={0.35}
            strokeDasharray="3 4"
            strokeWidth={1}
          />
        ))}

        {axes.map(({ name, dir }) => {
          const end: Vec3 = [dir[0] * axisEnd, dir[1] * axisEnd, dir[2] * axisEnd]
          const [ex, ey] = at(end)
          const [ox, oy] = at([0, 0, 0])
          const len = Math.hypot(ex - ox, ey - oy)
          const lx = ex + (len > 1 ? ((ex - ox) / len) * 18 : 0)
          const ly = ey + (len > 1 ? ((ey - oy) / len) * 16 : 0)
          return (
            <g key={name}>
              <line {...line([0, 0, 0], end)} stroke={AXIS_COLOR[name]} strokeWidth={2.5} />
              {len > 6 && <ArrowHead from={[ox, oy]} to={[ex, ey]} color={AXIS_COLOR[name]} />}
              {range(1, S).map((k) => {
                const [tx, ty] = at([dir[0] * k, dir[1] * k, dir[2] * k])
                return len > 30 ? (
                  <g key={k}>
                    <circle cx={tx} cy={ty} r={2} fill={AXIS_COLOR[name]} />
                    <text
                      x={tx + (name === 'y' ? -10 : 0)}
                      y={ty + (name === 'y' ? 0 : 13)}
                      fontSize={10}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ fill: 'var(--muted)' }}
                    >
                      {axisTicks?.[name]?.(k) ?? k}
                    </text>
                  </g>
                ) : null
              })}
              {len > 12 && (
                <text
                  x={clampX(lx, 30)}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={AXIS_COLOR[name]}
                  data-axis-label={name}
                >
                  <tspan fontSize={17} fontWeight={700} fontStyle="italic">
                    {name}
                  </tspan>
                  <tspan fontSize={12} fontWeight={600} dx={4}>
                    {axisNames?.[name] ?? AXIS_INFO[name].name}
                  </tspan>
                </text>
              )}
            </g>
          )
        })}

        {point && walk && (
          <Walk
            point={point}
            at={at}
            avoid={[
              pointLabelRect(at(point), `${pointLabel} ${coord3Text(point)}`),
              ...shadowWalls.map((w): Rect => {
                const [sx, sy] = at(shadow(point, w))
                return { x: sx - 9, y: sy - 9, w: 18, h: 18 }
              }),
            ]}
          />
        )}

        {point && shadowWalls.length > 0 && (
          <>
            {shadowWalls.map((w) => (
              <line
                key={w}
                {...line(point, shadow(point, w))}
                style={{ stroke: 'var(--muted)' }}
                strokeDasharray="4 3"
                strokeWidth={1.3}
              />
            ))}
            {shadowWalls.map((w) => {
              const s = shadow(point, w)
              const [sx, sy] = at(s)
              const draggable = w === 'xz' && Boolean(onPointChange)
              return (
                <g
                  key={w}
                  data-handle={draggable ? 'floor' : undefined}
                  className={draggable ? 'cursor-move' : undefined}
                  onPointerEnter={() => setHover({ at: s, text: `shadow on ${WALL_NAME[w]}: ${coord3Text(s)}` })}
                  onPointerLeave={() => setHover(null)}
                >
                  {draggable && <circle cx={sx} cy={sy} r={14} fill={COLOR.v} fillOpacity={0.12} />}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={draggable ? 7 : 5}
                    style={{ fill: 'var(--surface)' }}
                    stroke={COLOR.v}
                    strokeWidth={2}
                  />
                  <circle cx={sx} cy={sy} r={16} fill="transparent" />
                </g>
              )
            })}
          </>
        )}

        {sorted.filter((p) => !inFront(p)).map(renderPoint)}

        {planes.map((pl) => (
          <PlaneSheet key={pl.label} plane={pl} poly={poly} at={at} />
        ))}

        {sorted.filter(inFront).map(renderPoint)}

        {sorted
          .filter((p) => p.highlight)
          .map((p) => (
            <PointLabel key={p.label} at={at(p.at)} text={`${p.label} ${p.text ?? coord3Text(p.at)}`} color={p.color} />
          ))}

        {point && (
          <g
            onPointerEnter={() => setHover({ at: point, text: `${pointLabel} = ${coord3Text(point)}` })}
            onPointerLeave={() => setHover(null)}
          >
            <circle cx={at(point)[0]} cy={at(point)[1]} r={8} fill={COLOR.v} stroke="var(--surface)" strokeWidth={2} />
            <PointLabel at={at(point)} text={`${pointLabel} ${coord3Text(point)}`} color={COLOR.v} />
          </g>
        )}

        {hover && <Tooltip at={at(hover.at)} text={hover.text} />}
      </svg>
    </div>
  )
}

/** One plane: the faint overhang outside the room, then the solid part inside, then its name. */
function PlaneSheet({
  plane,
  poly,
  at,
}: {
  plane: CubePlane
  poly: (corners: Vec3[]) => string
  at: (p: Vec3) => [number, number]
}) {
  const inner = slicePlane(plane.plane, 0, SIZE)
  const outer = slicePlane(plane.plane, -PLANE_OVERHANG, SIZE + PLANE_OVERHANG)
  if (inner.length === 0) return null
  // Name the plane at the middle of its part inside the room, on a plate so grid lines do not cross it.
  const pts = inner.map(at)
  const [mx, my] = plane.labelAt
    ? at(plane.labelAt)
    : [pts.reduce((a, q) => a + q[0], 0) / pts.length, pts.reduce((a, q) => a + q[1], 0) / pts.length]
  const w = plane.label.length * 7.4 + 14
  return (
    <g data-plane={plane.label} pointerEvents="none">
      {outer.length > 0 && (
        <polygon
          points={poly(outer)}
          fill={plane.color}
          fillOpacity={0.07}
          stroke={plane.color}
          strokeOpacity={0.6}
          strokeDasharray="6 5"
          strokeWidth={1.2}
        />
      )}
      <polygon points={poly(inner)} fill={plane.color} fillOpacity={0.26} stroke={plane.color} strokeWidth={2} />
      <rect
        x={clampX(mx, w / 2) - w / 2}
        y={my - 11}
        width={w}
        height={22}
        rx={5}
        style={{ fill: 'var(--surface)' }}
        opacity={0.9}
        stroke={plane.color}
      />
      <text
        x={clampX(mx, w / 2)}
        y={my}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={plane.color}
      >
        {plane.label}
      </text>
    </g>
  )
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, k) => from + k)
}

function ArrowHead({ from, to, color }: { from: [number, number]; to: [number, number]; color: string }) {
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI
  return (
    <polygon
      points="0,0 -10,-5 -10,5"
      fill={color}
      transform={`translate(${to[0]} ${to[1]}) rotate(${angle})`}
    />
  )
}

function WallLabel({ at, children }: { at: [number, number]; children: ReactNode }) {
  return (
    <text
      x={at[0]}
      y={at[1]}
      fontSize={11}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fill: 'var(--muted)' }}
      opacity={0.9}
      pointerEvents="none"
    >
      {children}
    </text>
  )
}

/** The point's name and coordinates on a small plate, so it stays legible over grid lines. */
type Rect = { x: number; y: number; w: number; h: number }

function pointLabelRect(at: [number, number], text: string): Rect {
  const w = text.length * 7.6 + 12
  const left = at[0] + 12 + w > HALF
  return { x: left ? at[0] - 12 - w : at[0] + 12, y: Math.max(-HALF + 4, at[1] - 30), w, h: 22 }
}

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

function PointLabel({ at, text, color }: { at: [number, number]; text: string; color: string }) {
  const { x, y, w } = pointLabelRect(at, text)
  return (
    <g pointerEvents="none">
      <rect x={x} y={y} width={w} height={22} rx={5} style={{ fill: 'var(--surface)' }} opacity={0.92} stroke={color} />
      <text
        x={x + w / 2}
        y={y + 11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={color}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {text}
      </text>
    </g>
  )
}

function Tooltip({ at, text }: { at: [number, number]; text: string }) {
  const w = text.length * 7.4 + 16
  const left = at[0] + 18 + w > HALF
  const x = Math.max(-HALF + 2, left ? at[0] - 18 - w : at[0] + 18)
  const y = Math.min(HALF - 26, at[1] + 10)
  return (
    <g className="coord-tooltip" pointerEvents="none" role="presentation">
      <rect x={x} y={y} width={w} height={24} rx={5} style={{ fill: 'var(--ink)', opacity: 0.92 }} />
      <text
        x={x + w / 2}
        y={y + 12}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: 'var(--surface)', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}
      >
        {text}
      </text>
    </g>
  )
}

/** Keep a label of the given half-width inside the drawing. */
function clampX(x: number, halfWidth: number): number {
  return Math.max(-HALF + halfWidth + 2, Math.min(HALF - halfWidth - 2, x))
}

/**
 * The walk from the corner to the point: along x (width), then up y (height),
 * then forward z (depth). Each leg is drawn in its axis colour and carries a
 * text label, so colour is not the only cue. Legs of length 0 are left out.
 */
function Walk({ point, at, avoid }: { point: Vec3; at: (p: Vec3) => [number, number]; avoid: Rect[] }) {
  const legs = walkLegs(point)
  const centre = at([SIZE / 2, SIZE / 2, SIZE / 2])
  const placed: Rect[] = [...avoid]
  return (
    <g data-walk="">
      {legs.map((l) => {
        const [x1, y1] = at(l.from)
        const [x2, y2] = at(l.to)
        const len = Math.hypot(x2 - x1, y2 - y1)
        if (len < 1) return null
        return (
          <line
            key={l.axis}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={AXIS_COLOR[l.axis]}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.9}
          />
        )
      })}
      {legs.map((l, k) => {
        const [x1, y1] = at(l.from)
        const [x2, y2] = at(l.to)
        const len = Math.hypot(x2 - x1, y2 - y1)
        if (len < 18) return null
        // Beside the leg, preferably on the side away from the room's centre; try a few spots
        // along the leg and on both sides, and take the first that hits nothing already drawn.
        let nx = -(y2 - y1) / len
        let ny = (x2 - x1) / len
        if (nx * ((x1 + x2) / 2 - centre[0]) + ny * ((y1 + y2) / 2 - centre[1]) < 0) {
          nx = -nx
          ny = -ny
        }
        const text = `${k + 1}. ${l.label}`
        const w = text.length * 7 + 12
        const h = 20
        const gap = Math.abs(nx) * (w / 2) + Math.abs(ny) * (h / 2) + 6
        const box = (t: number, side: number): Rect => {
          const cx = clampX(x1 + (x2 - x1) * t + side * nx * gap, w / 2)
          const cy = Math.max(-HALF + h / 2, Math.min(HALF - h / 2, y1 + (y2 - y1) * t + side * ny * gap))
          return { x: cx - w / 2, y: cy - h / 2, w, h }
        }
        const candidates = [0.5, 0.3, 0.7].flatMap((t) => [box(t, 1), box(t, -1)])
        const r = candidates.find((c) => !placed.some((o) => overlaps(c, o))) ?? candidates[0]
        placed.push(r)
        const cxLabel = r.x + w / 2
        const cyLabel = r.y + h / 2
        return (
          <g key={l.axis} pointerEvents="none" data-leg={l.axis}>
            <rect
              x={cxLabel - w / 2}
              y={cyLabel - 10}
              width={w}
              height={20}
              rx={4}
              style={{ fill: 'var(--surface)' }}
              opacity={0.92}
              stroke={AXIS_COLOR[l.axis]}
            />
            <text
              x={cxLabel}
              y={cyLabel}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={700}
              fill={AXIS_COLOR[l.axis]}
            >
              {text}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** Buttons that turn the cube, plus the four named views. */
export function ViewControls({ view, onChange }: { view: View; onChange: (next: View) => void }) {
  const presets: [string, View][] = [
    ['Corner', CORNER_VIEW],
    ['Front (xy)', FRONT_VIEW],
    ['Side (yz)', SIDE_VIEW],
    ['Top (xz)', TOP_VIEW],
  ]
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">Turn:</span>
      <Button variant="secondary" aria-label="Turn left" onClick={() => onChange(rotateView(view, -15, 0))}>
        ←
      </Button>
      <Button variant="secondary" aria-label="Turn right" onClick={() => onChange(rotateView(view, 15, 0))}>
        →
      </Button>
      <Button variant="secondary" aria-label="Tilt up" onClick={() => onChange(rotateView(view, 0, -15))}>
        ↑
      </Button>
      <Button variant="secondary" aria-label="Tilt down" onClick={() => onChange(rotateView(view, 0, 15))}>
        ↓
      </Button>
      <span className="ml-1 text-sm text-muted">View:</span>
      {presets.map(([name, v]) => (
        <Button
          key={name}
          variant={sameView(v, view) ? 'primary' : 'secondary'}
          aria-pressed={sameView(v, view)}
          onClick={() => onChange(v)}
        >
          {name}
        </Button>
      ))}
    </div>
  )
}

/** A labelled slider for one coordinate, with its physical name ("x — width", "left / right"). */
export function CoordSlider({
  axis,
  value,
  onChange,
}: {
  axis: 'x' | 'y' | 'z'
  value: number
  onChange: (next: number) => void
}) {
  const info = AXIS_INFO[axis]
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-28 shrink-0 leading-tight">
        <span className="block">
          <span className="font-display text-xl font-bold italic" style={{ color: AXIS_COLOR[axis] }}>
            {axis}
          </span>{' '}
          — {info.name}
        </span>
        <span className="block text-xs text-muted">{info.ends}</span>
      </span>
      <input
        type="range"
        min={0}
        max={SIZE}
        step={0.5}
        value={value}
        aria-label={`${axis} coordinate (${info.name}, ${info.ends})`}
        aria-valuetext={`${axis} = ${fmt(value)}`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full min-w-0"
        style={{ accentColor: AXIS_COLOR[axis] }}
      />
      <output className="w-8 shrink-0 text-right font-mono text-base" aria-hidden="true">
        {fmt(value)}
      </output>
    </label>
  )
}

/** Three sliders for a point's x, y and z. */
export function PointSliders({ value, onChange }: { value: Vec3; onChange: (next: Vec3) => void }) {
  const [x, y, z] = value
  return (
    <div className="mt-3 grid gap-3">
      <CoordSlider axis="x" value={x} onChange={(n) => onChange([n, y, z])} />
      <CoordSlider axis="y" value={y} onChange={(n) => onChange([x, n, z])} />
      <CoordSlider axis="z" value={z} onChange={(n) => onChange([x, y, n])} />
    </div>
  )
}
