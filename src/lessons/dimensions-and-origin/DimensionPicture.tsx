import type { ReactNode } from 'react'
import { COLOR } from '../../lib/palette'
import { oblique } from './model'
import type { Dims } from './model'

const W = 340
const H = 230
const AXIS_COLORS = [COLOR.i, COLOR.j, COLOR.grid] as const

/**
 * A small schematic picture with one, two or three directions to move in, and
 * one point. `values` are in drawing units (0 to about 4). Pure SVG: no
 * dragging here, it is a picture to look at.
 */
export function DimensionPicture({
  dims,
  values,
  axes,
  pointLabel,
  label,
}: {
  dims: Dims
  values: readonly number[]
  axes: readonly string[]
  pointLabel: string
  label: string
}) {
  return (
    <svg viewBox={`0 ${dims === 1 ? 50 : 0} ${W} ${dims === 1 ? 130 : H}`} role="img" aria-label={label} className="block h-auto w-full max-w-[460px]">
      {dims === 1 && <OneD x={values[0]} axis={axes[0]} pointLabel={pointLabel} />}
      {dims === 2 && <TwoD x={values[0]} y={values[1]} axes={axes} pointLabel={pointLabel} />}
      {dims === 3 && <ThreeD p={[values[0], values[1], values[2]]} axes={axes} pointLabel={pointLabel} />}
    </svg>
  )
}

function Dot({ at, children }: { at: [number, number]; children: ReactNode }) {
  return (
    <>
      <circle cx={at[0]} cy={at[1]} r={7} fill={COLOR.v} />
      <text x={at[0] + 10} y={at[1] - 12} fill={COLOR.v} fontSize={15} fontWeight={600}>
        {children}
      </text>
    </>
  )
}

function OriginDot({ at, dx = -8, dy = 20, anchor = 'end' }: { at: [number, number]; dx?: number; dy?: number; anchor?: 'end' | 'start' | 'middle' }) {
  return (
    <>
      <circle cx={at[0]} cy={at[1]} r={5} fill={COLOR.result} />
      <text x={at[0] + dx} y={at[1] + dy} fill={COLOR.result} fontSize={13} fontWeight={600} textAnchor={anchor}>
        origin
      </text>
    </>
  )
}

function AxisArrow({ from, to, color, name, nameAt }: { from: [number, number]; to: [number, number]; color: string; name: string; nameAt: [number, number] }) {
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]]
  const len = Math.hypot(dx, dy)
  const [ux, uy] = [dx / len, dy / len]
  const head = `${to[0]},${to[1]} ${to[0] - 10 * ux + 5 * uy},${to[1] - 10 * uy - 5 * ux} ${to[0] - 10 * ux - 5 * uy},${to[1] - 10 * uy + 5 * ux}`
  return (
    <>
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={color} strokeWidth={2.5} />
      <polygon points={head} fill={color} />
      <text x={nameAt[0]} y={nameAt[1]} fill={color} fontSize={13} fontWeight={600}>
        {name}
      </text>
    </>
  )
}

function OneD({ x, axis, pointLabel }: { x: number; axis: string; pointLabel: string }) {
  const o: [number, number] = [60, 120]
  const u = 50
  return (
    <>
      <line x1={20} y1={o[1]} x2={320} y2={o[1]} stroke="var(--grid)" strokeWidth={3} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <line key={k} x1={o[0] + k * u} y1={o[1] - 6} x2={o[0] + k * u} y2={o[1] + 6} stroke="var(--muted)" strokeWidth={1.5} />
      ))}
      <AxisArrow from={o} to={[o[0] + 5.2 * u, o[1]]} color={AXIS_COLORS[0]} name={axis} nameAt={[o[0] + 2.4 * u, o[1] + 34]} />
      <OriginDot at={o} dx={0} dy={34} anchor="middle" />
      <Dot at={[o[0] + x * u, o[1]]}>{pointLabel}</Dot>
    </>
  )
}

function TwoD({ x, y, axes, pointLabel }: { x: number; y: number; axes: readonly string[]; pointLabel: string }) {
  const o: [number, number] = [60, 190]
  const u = 42
  const grid: ReactNode[] = []
  for (let k = 0; k <= 6; k++) grid.push(<line key={`v${k}`} x1={o[0] + k * u} y1={o[1]} x2={o[0] + k * u} y2={o[1] - 4 * u} stroke="var(--grid-faint)" />)
  for (let k = 0; k <= 4; k++) grid.push(<line key={`h${k}`} x1={o[0]} y1={o[1] - k * u} x2={o[0] + 6 * u} y2={o[1] - k * u} stroke="var(--grid-faint)" />)
  const p: [number, number] = [o[0] + x * u, o[1] - y * u]
  return (
    <>
      {grid}
      <line x1={o[0]} y1={p[1]} x2={p[0]} y2={p[1]} stroke={AXIS_COLORS[0]} strokeDasharray="4 4" />
      <line x1={p[0]} y1={o[1]} x2={p[0]} y2={p[1]} stroke={AXIS_COLORS[1]} strokeDasharray="4 4" />
      <AxisArrow from={o} to={[o[0] + 6.3 * u, o[1]]} color={AXIS_COLORS[0]} name={axes[0]} nameAt={[o[0] + 5 * u, o[1] + 22]} />
      <AxisArrow from={o} to={[o[0], o[1] - 4.3 * u]} color={AXIS_COLORS[1]} name={axes[1]} nameAt={[o[0] + 8, 14]} />
      <OriginDot at={o} dx={-8} dy={18} />
      <Dot at={p}>{pointLabel}</Dot>
    </>
  )
}

function ThreeD({ p, axes, pointLabel }: { p: [number, number, number]; axes: readonly string[]; pointLabel: string }) {
  const o: [number, number] = [110, 150]
  const u = 38
  const at = (q: [number, number, number]) => oblique(q, u, o)
  const [X, Y, Z] = [5, 3.2, 3]
  const edge = (a: [number, number, number], b: [number, number, number], k: string) => {
    const [p1, p2] = [at(a), at(b)]
    return <line key={k} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="var(--grid)" strokeWidth={1} />
  }
  const room = [
    edge([X, 0, 0], [X, Y, 0], 'a'),
    edge([0, Y, 0], [X, Y, 0], 'b'),
    edge([X, 0, 0], [X, 0, Z], 'c'),
    edge([0, 0, Z], [X, 0, Z], 'd'),
    edge([0, Y, 0], [0, Y, Z], 'e'),
    edge([0, 0, Z], [0, Y, Z], 'f'),
  ]
  const [x, , z] = p
  const floor = at([x, 0, z])
  const top = at(p)
  const corner = at([x, 0, 0])
  return (
    <>
      {room}
      <line x1={corner[0]} y1={corner[1]} x2={floor[0]} y2={floor[1]} stroke={AXIS_COLORS[2]} strokeDasharray="4 4" />
      <line x1={floor[0]} y1={floor[1]} x2={top[0]} y2={top[1]} stroke={AXIS_COLORS[1]} strokeDasharray="4 4" />
      <AxisArrow from={o} to={at([X + 0.6, 0, 0])} color={AXIS_COLORS[0]} name={axes[0]} nameAt={[at([X - 0.6, 0, 0])[0], o[1] - 8]} />
      <AxisArrow from={o} to={at([0, Y + 0.5, 0])} color={AXIS_COLORS[1]} name={axes[1]} nameAt={[o[0] + 8, at([0, Y + 0.3, 0])[1]]} />
      <AxisArrow from={o} to={at([0, 0, Z + 0.6])} color={AXIS_COLORS[2]} name={axes[2]} nameAt={[at([0, 0, Z + 0.6])[0] + 10, at([0, 0, Z + 0.6])[1] + 4]} />
      <OriginDot at={o} dx={-8} dy={-6} />
      <circle cx={floor[0]} cy={floor[1]} r={3} fill="var(--muted)" />
      <Dot at={top}>{pointLabel}</Dot>
    </>
  )
}
