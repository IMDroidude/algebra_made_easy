import type { ReactNode } from 'react'
import { COLOR } from '../../lib/palette'
import { boxPieces, constantPieces, imbalance, sideText, tiltDeg } from './equation'
import type { Equation, Side } from './equation'

const W = 480
const H = 270
const PIVOT: [number, number] = [240, 62]
const ARM = 160
const HANG = 120
const PAN_W = 150
/** Same red as the app's error colour in light mode; readable on both themes. */
const BAD = '#d6336c'

type Piece = { w: number; h: number; draw: (x: number, y: number) => ReactNode }

const box = (label: string): Piece => {
  const w = Math.max(26, label.length * 9 + 10)
  return {
    w,
    h: 26,
    draw: (x, y) => (
      <g key={`${label}-${x}-${y}`}>
        <rect x={x} y={y} width={w} height={26} rx={4} fill={COLOR.v} />
        <text x={x + w / 2} y={y + 13} textAnchor="middle" dominantBaseline="central" fontSize={15} fontStyle="italic" fill="#fff">
          {label}
        </text>
      </g>
    ),
  }
}

const weight = (label: string, size: number): Piece => {
  const w = Math.max(size, label.length * 8 + 8)
  return {
    w,
    h: size,
    draw: (x, y) => (
      <g key={`${label}-${x}-${y}`}>
        <rect x={x} y={y} width={w} height={size} rx={3} fill={COLOR.ghost} />
        <text x={x + w / 2} y={y + size / 2} textAnchor="middle" dominantBaseline="central" fontSize={size > 20 ? 12 : 10} fill="#fff">
          {label}
        </text>
      </g>
    ),
  }
}

const balloon = (label: string): Piece => ({
  w: 24,
  h: 34,
  draw: (x, y) => (
    <g key={`b-${label}-${x}-${y}`}>
      <line x1={x + 12} y1={y + 22} x2={x + 12} y2={y + 34} stroke={COLOR.i} strokeWidth={1.5} />
      <ellipse cx={x + 12} cy={y + 11} rx={11} ry={11} fill="none" stroke={COLOR.i} strokeWidth={2} />
      <text x={x + 12} y={y + 11} textAnchor="middle" dominantBaseline="central" fontSize={label.length > 2 ? 9 : 11} fill={COLOR.i}>
        {label}
      </text>
    </g>
  ),
})

function piecesFor(s: Side, v: string): Piece[] {
  const out: Piece[] = []
  const boxes = boxPieces(s.x, v)
  if (boxes && 'count' in boxes) for (let i = 0; i < boxes.count; i++) out.push(box(v))
  else if (boxes) out.push(box(boxes.label))
  const c = constantPieces(s.k)
  if (c.kind === 'blocks') {
    for (let i = 0; i < c.tens; i++) out.push(weight('10', 26))
    for (let i = 0; i < c.ones; i++) out.push(weight('1', 16))
  } else if (c.kind === 'balloons') {
    for (let i = 0; i < c.count; i++) out.push(balloon('−1'))
  } else if (c.kind === 'label') {
    out.push(c.text.startsWith('−') ? balloon(c.text) : weight(c.text, 26))
  }
  return out
}

/** Stacks pieces in rows from the pan upwards, each row centred on the pan. */
function layout(pieces: Piece[], cx: number, floor: number): ReactNode[] {
  const gap = 2
  const rows: Piece[][] = [[]]
  let used = 0
  for (const p of pieces) {
    if (used + p.w > PAN_W - 2 && rows[rows.length - 1].length > 0) {
      rows.push([])
      used = 0
    }
    rows[rows.length - 1].push(p)
    used += p.w + gap
  }
  const nodes: ReactNode[] = []
  let base = floor
  for (const row of rows) {
    const width = row.reduce((s, p) => s + p.w, 0) + gap * (row.length - 1)
    const h = Math.max(0, ...row.map((p) => p.h))
    let x = cx - width / 2
    for (const p of row) {
      nodes.push(p.draw(x, base - p.h))
      x += p.w + gap
    }
    base -= h + gap
  }
  return nodes
}

const MOVE = 'motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out'

/** A pan drawn at its level position `at`, then slid by `shift` so the slide can animate. */
function Pan({ at, shift, side, v }: { at: [number, number]; shift: number; side: Side; v: string }) {
  const [cx, top] = at
  const panY = top + HANG
  return (
    <g className={MOVE} style={{ transform: `translateY(${shift}px)` }}>
      <line x1={cx} y1={top} x2={cx - PAN_W / 2 + 6} y2={panY} stroke="var(--muted)" strokeWidth={1.5} />
      <line x1={cx} y1={top} x2={cx + PAN_W / 2 - 6} y2={panY} stroke="var(--muted)" strokeWidth={1.5} />
      {layout(piecesFor(side, v), cx, panY - 1)}
      <path
        d={`M ${cx - PAN_W / 2} ${panY} L ${cx + PAN_W / 2} ${panY} L ${cx + PAN_W / 2 - 14} ${panY + 10} L ${cx - PAN_W / 2 + 14} ${panY + 10} Z`}
        fill="var(--ink)"
      />
      <text x={cx} y={panY + 30} textAnchor="middle" fontSize={18} fontStyle="italic" fill="var(--ink)">
        {sideText(side, v)}
      </text>
    </g>
  )
}

/**
 * A two-pan balance for an equation. Every box weighs the true value of x,
 * so the beam is level exactly when both sides weigh the same.
 */
export function BalanceScale({
  equation,
  xTrue,
  label,
  v = 'x',
  proportional = false,
}: {
  equation: Equation
  /** What one box really weighs. */
  xTrue: number
  label: string
  /** Name written on the boxes. */
  v?: string
  /** Tilt in proportion to the imbalance instead of always visibly. */
  proportional?: boolean
}) {
  const deg = tiltDeg(imbalance(equation, xTrue), proportional)
  const rad = (deg * Math.PI) / 180
  // The pans hang from the beam ends; for these small angles they only move up or down.
  const dy = ARM * Math.sin(rad)
  const level = deg === 0

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      data-tilt={deg}
      className="block h-auto w-full rounded-xl border border-line bg-surface"
    >
      {/* stand */}
      <path d={`M ${PIVOT[0]} ${PIVOT[1]} L ${PIVOT[0] - 22} ${H - 14} L ${PIVOT[0] + 22} ${H - 14} Z`} fill="var(--line)" />
      <rect x={PIVOT[0] - 60} y={H - 16} width={120} height={8} rx={3} fill="var(--muted)" />
      {/* beam, with a pointer that is upright only when the beam is level */}
      <g
        className={MOVE}
        style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${PIVOT[0]}px ${PIVOT[1]}px` }}
      >
        <line x1={PIVOT[0] - ARM} y1={PIVOT[1]} x2={PIVOT[0] + ARM} y2={PIVOT[1]} stroke="var(--ink)" strokeWidth={6} strokeLinecap="round" />
        <line x1={PIVOT[0]} y1={PIVOT[1]} x2={PIVOT[0]} y2={PIVOT[1] - 26} stroke={level ? COLOR.result : BAD} strokeWidth={3} strokeLinecap="round" />
      </g>
      <circle cx={PIVOT[0]} cy={PIVOT[1]} r={6} fill="var(--ink)" />
      <text x={PIVOT[0]} y={18} textAnchor="middle" fontSize={14} fontWeight={600} fill={level ? COLOR.result : Math.abs(deg) < 1 ? 'var(--muted)' : BAD}>
        {level ? 'level' : Math.abs(deg) < 1 ? 'almost level' : 'tipped!'}
      </text>
      <Pan at={[PIVOT[0] - ARM, PIVOT[1]]} shift={-dy} side={equation.left} v={v} />
      <Pan at={[PIVOT[0] + ARM, PIVOT[1]]} shift={dy} side={equation.right} v={v} />
    </svg>
  )
}
