import type { ReactNode } from 'react'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { CORNER_VIEW, project } from '../../linalg/project3d'
import type { Vec3 } from '../../linalg/project3d'
import { AXIS_COLOR, SIZE } from './cube'

const W = 140
const H = 110

/**
 * Three small pictures in a row: one number on a line, two numbers on a flat
 * plane (lesson 1.2), three numbers in a room. Each adds one direction to the
 * last, and uses the matching first coordinates of the point.
 */
export function DimensionStrip({ point }: { point: Vec3 }) {
  const [x, y, z] = point
  return (
    <ol className="m-0 grid list-none grid-cols-3 gap-2 p-0" aria-label="From one number to three">
      <Panel
        title="1 number: a line"
        value={`x = ${fmt(x)}`}
        label={`A number line with a point at x = ${fmt(x)}`}
      >
        <LinePicture x={x} />
      </Panel>
      <Panel
        title="2 numbers: a plane"
        value={`(${fmt(x)}, ${fmt(y)})`}
        label={`A flat plane with a point at (${fmt(x)}, ${fmt(y)})`}
      >
        <PlanePicture x={x} y={y} />
      </Panel>
      <Panel
        title="3 numbers: a room"
        value={`(${fmt(x)}, ${fmt(y)}, ${fmt(z)})`}
        label={`A room corner with a point at (${fmt(x)}, ${fmt(y)}, ${fmt(z)})`}
      >
        <RoomPicture p={point} />
      </Panel>
    </ol>
  )
}

function Panel({ title, value, label, children }: { title: string; value: string; label: string; children: ReactNode }) {
  return (
    <li className="min-w-0 rounded-lg border border-line bg-surface p-1.5 text-center">
      <svg role="img" aria-label={label} viewBox={`0 0 ${W} ${H}`} width="100%" className="block">
        {children}
      </svg>
      <p className="m-0 text-xs leading-tight font-semibold">{title}</p>
      <p className="m-0 font-mono text-xs text-muted">{value}</p>
    </li>
  )
}

const U = 20 // pixels per unit in the line and plane pictures

function Dot({ at }: { at: [number, number] }) {
  return <circle cx={at[0]} cy={at[1]} r={5} fill={COLOR.v} stroke="var(--surface)" strokeWidth={1.5} />
}

function LinePicture({ x }: { x: number }) {
  const ox = 16
  const oy = H / 2
  return (
    <>
      <line x1={ox} y1={oy} x2={ox + SIZE * U + 10} y2={oy} stroke={AXIS_COLOR.x} strokeWidth={2.5} />
      {Array.from({ length: SIZE + 1 }, (_, k) => (
        <line key={k} x1={ox + k * U} y1={oy - 4} x2={ox + k * U} y2={oy + 4} stroke={AXIS_COLOR.x} />
      ))}
      <text x={ox} y={oy + 16} fontSize={10} textAnchor="middle" style={{ fill: 'var(--muted)' }}>
        0
      </text>
      <text x={ox + SIZE * U + 14} y={oy + 4} fontSize={13} fontStyle="italic" fontWeight={700} fill={AXIS_COLOR.x}>
        x
      </text>
      <Dot at={[ox + x * U, oy]} />
    </>
  )
}

function PlanePicture({ x, y }: { x: number; y: number }) {
  const ox = 16
  const oy = H - 5
  return (
    <>
      {Array.from({ length: SIZE }, (_, k) => k + 1).map((k) => (
        <g key={k} style={{ stroke: 'var(--grid)' }} strokeWidth={0.8}>
          <line x1={ox + k * U} y1={oy} x2={ox + k * U} y2={oy - SIZE * U} />
          <line x1={ox} y1={oy - k * U} x2={ox + SIZE * U} y2={oy - k * U} />
        </g>
      ))}
      <line x1={ox} y1={oy} x2={ox + SIZE * U + 10} y2={oy} stroke={AXIS_COLOR.x} strokeWidth={2.5} />
      <line x1={ox} y1={oy} x2={ox} y2={oy - SIZE * U} stroke={AXIS_COLOR.y} strokeWidth={2.5} />
      <text x={ox + SIZE * U + 14} y={oy + 4} fontSize={13} fontStyle="italic" fontWeight={700} fill={AXIS_COLOR.x}>
        x
      </text>
      <text x={ox - 12} y={oy - SIZE * U + 10} fontSize={13} fontStyle="italic" fontWeight={700} fill={AXIS_COLOR.y}>
        y
      </text>
      <Dot at={[ox + x * U, oy - y * U]} />
    </>
  )
}

function RoomPicture({ p }: { p: Vec3 }) {
  const k = 10
  const [cx, cy] = project([SIZE / 2, SIZE / 2, SIZE / 2], CORNER_VIEW)
  const at = (q: Vec3): [number, number] => {
    const [a, b] = project(q, CORNER_VIEW)
    return [W / 2 + (a - cx) * k, H / 2 + 4 - (b - cy) * k]
  }
  const S = SIZE
  const wall = (c: Vec3[]) => c.map((q) => at(q).join(',')).join(' ')
  const axis = (name: 'x' | 'y' | 'z', end: Vec3) => {
    const [x1, y1] = at([0, 0, 0])
    const [x2, y2] = at(end)
    const [tx, ty] = at(end.map((v) => v * 1.12) as Vec3)
    return (
      <g key={name}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={AXIS_COLOR[name]} strokeWidth={2.5} />
        <text x={tx} y={ty + 4} fontSize={13} fontStyle="italic" fontWeight={700} textAnchor="middle" fill={AXIS_COLOR[name]}>
          {name}
        </text>
      </g>
    )
  }
  return (
    <>
      <g style={{ fill: 'var(--grid-faint)', stroke: 'var(--grid)' }} strokeWidth={0.8}>
        <polygon points={wall([[0, 0, 0], [S, 0, 0], [S, S, 0], [0, S, 0]])} />
        <polygon points={wall([[0, 0, 0], [0, S, 0], [0, S, S], [0, 0, S]])} />
        <polygon points={wall([[0, 0, 0], [S, 0, 0], [S, 0, S], [0, 0, S]])} />
      </g>
      {axis('x', [S + 0.6, 0, 0])}
      {axis('y', [0, S + 0.6, 0])}
      {axis('z', [0, 0, S + 0.6])}
      <Dot at={at(p)} />
    </>
  )
}
