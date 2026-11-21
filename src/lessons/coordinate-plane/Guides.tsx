import { Line, Polygon, useTransformContext, vec } from 'mafs'
import { Arrow } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { usePlaneBounds } from '../../lib/planeBounds'
import { isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { LIMIT, moveText, pointTag, regionOf } from './plane'

/** Pixels per maths unit in the enclosing plane (same on both axes: planes here keep units square). */
function usePxPerUnit(): number {
  const { viewTransform } = useTransformContext()
  return Math.abs(viewTransform[0]) || 40
}

/**
 * Dashed lines from the point straight across to each axis, so its two numbers
 * can be read off. They stop short of the axis numbers (which sit below the
 * x-axis and right of the y-axis) so the number they point at stays readable.
 */
export function Guides({ p }: { p: Vec2 }) {
  const [x, y] = p
  const unit = usePxPerUnit()
  // Gap in units: wide where the guide arrives on the side the numbers are drawn on.
  const gapX = (x > 0 ? 34 : 8) / unit
  const gapY = (y < 0 ? 24 : 8) / unit
  const endX = x > 0 ? Math.min(gapX, x) : Math.max(-gapX, x)
  const endY = y > 0 ? Math.min(gapY, y) : Math.max(-gapY, y)
  return (
    <>
      {!isZero(y) && Math.abs(y) > gapY && (
        <Line.Segment point1={[x, endY]} point2={p} color={COLOR.ghost} style="dashed" weight={1.5} />
      )}
      {!isZero(x) && Math.abs(x) > gapX && (
        <Line.Segment point1={[endX, y]} point2={p} color={COLOR.ghost} style="dashed" weight={1.5} />
      )}
    </>
  )
}

/** The names of the two axes at their positive ends, with the physical meaning of each. */
export function AxisNames({
  yAxis = true,
  xName = 'x (width) →',
  yName = '↑ y (height)',
}: {
  yAxis?: boolean
  xName?: string
  yName?: string
}) {
  const b = usePlaneBounds()
  const unit = usePxPerUnit()
  if (!b) return null
  const inset = 8 / unit
  // Inside the ±10 range on wide planes, so the name sits by the last number.
  const xEnd = Math.min(b.x[1] - inset, LIMIT + 0.4)
  // Left of the y-axis if it fits there, else to its right.
  const leftPx = -b.x[0] * unit
  // On narrow planes the long name would run into the "Quadrant II" label.
  const yText = leftPx < 300 && yName === '↑ y (height)' ? '↑ y' : yName
  const yLeft = leftPx > yText.length * 8.5 + 12
  return (
    <>
      <PlaneLabel x={xEnd} y={0} attach="nw" distance={6} size={16} color={COLOR.i}>
        {xName}
      </PlaneLabel>
      {yAxis && (
        <PlaneLabel x={0} y={b.y[1] - inset} attach={yLeft ? 'sw' : 'se'} distance={8} size={16} color={COLOR.j}>
          {yText}
        </PlaneLabel>
      )}
    </>
  )
}

const QUADS: { name: 'I' | 'II' | 'III' | 'IV'; sx: number; sy: number; signs: string; tint: string }[] = [
  { name: 'I', sx: 1, sy: 1, signs: '(+, +)', tint: COLOR.v },
  { name: 'II', sx: -1, sy: 1, signs: '(−, +)', tint: COLOR.i },
  { name: 'III', sx: -1, sy: -1, signs: '(−, −)', tint: COLOR.j },
  { name: 'IV', sx: 1, sy: -1, signs: '(+, −)', tint: COLOR.result },
]

/**
 * The four quadrants, always visible: a faint tint each (stronger for the one
 * holding `p`) and a "Quadrant I" … "Quadrant IV" label in the outer corner.
 * The labels carry the meaning; the tint only helps.
 */
export function Quadrants({ p, signs = false }: { p?: Vec2; signs?: boolean }) {
  const b = usePlaneBounds()
  const unit = usePxPerUnit()
  if (!b) return null
  const current = p ? regionOf(p) : null
  const e = 100
  // 12 px in from the corner, clear of the axis names and numbers.
  const ix = 12 / unit
  const iy = 10 / unit
  return (
    <>
      {QUADS.map((q) => (
        <Polygon
          key={q.name}
          points={[
            [0, 0],
            [q.sx * e, 0],
            [q.sx * e, q.sy * e],
            [0, q.sy * e],
          ]}
          color={q.tint}
          fillOpacity={current === q.name ? 0.1 : 0.04}
          strokeOpacity={0}
        />
      ))}
      {QUADS.map((q) => (
        <PlaneLabel
          key={`t${q.name}`}
          x={q.sx * Math.min(b.x[1] - ix, LIMIT + 0.4)}
          y={q.sy > 0 ? b.y[1] - iy : b.y[0] + iy}
          attach={`${q.sy > 0 ? 's' : 'n'}${q.sx > 0 ? 'w' : 'e'}` as 'sw'}
          distance={0}
          size={14}
          color="var(--muted)"
        >
          {`Quadrant ${q.name}${signs ? ` ${q.signs}` : ''}`}
        </PlaneLabel>
      ))}
    </>
  )
}

const TAG_H = 24
const CHAR = 7.6
/** The tag sits beyond the hover tooltip (which is 18–42 px above or below the point). */
const TAG_GAP = 48

/**
 * The live labels that ride on a point, Desmos style: a pill above it naming
 * its quadrant (or "on the x-axis" / "on the y-axis" / "origin"), and its
 * coordinates "(x, y)" beside it at all times. The pill flips below the point
 * near the top edge, and both stay inside the plane near the side edges.
 */
export function PointLabels({
  p,
  color = COLOR.v,
  coords = true,
  tag: showTag = true,
}: {
  p: Vec2
  color?: string
  coords?: boolean
  tag?: boolean
}) {
  const { viewTransform, userTransform } = useTransformContext()
  const b = usePlaneBounds()
  if (!b) return null
  const m = vec.matrixMult(viewTransform, userTransform)
  const [px, py] = vec.transform(p, m)
  const [left, top] = vec.transform([b.x[0], b.y[1]], m)
  const [right, bottom] = vec.transform([b.x[1], b.y[0]], m)

  const tag = pointTag(p)
  const w = tag.length * CHAR + 18
  const below = py - TAG_GAP - TAG_H < top + 4
  const tagY = below ? py + TAG_GAP : py - TAG_GAP - TAG_H
  const tagX = Math.max(left + 4, Math.min(right - 4 - w, px - w / 2))

  const coordText = fmtVec(p)
  const cw = coordText.length * 8.4
  // Away from the y-axis, so the dashed guide (which runs towards it) never crosses the text.
  // On the y-axis, go left: the axis numbers sit to its right.
  const onLeft = p[0] < 0 || isZero(p[0]) ? px - 16 - cw > left + 4 : px + 16 + cw > right - 4
  // Forced onto the guide's side (no room at the edge): drop below the horizontal guide.
  const towardAxis = p[0] < 0 ? !onLeft : onLeft
  const shift = towardAxis && !isZero(p[0]) ? (py + 30 > bottom ? -18 : 18) : 0
  const cy = Math.max(top + 12, Math.min(bottom - 12, py + shift))

  return (
    <g className="point-labels" pointerEvents="none">
      {showTag && (
      <g className="quadrant-tag">
        <rect x={tagX} y={tagY} width={w} height={TAG_H} rx={12} style={{ fill: 'var(--surface)', stroke: color, strokeWidth: 1.5 }} />
        <text
          x={tagX + w / 2}
          y={tagY + TAG_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fill: color, fontSize: 14, fontWeight: 600 }}
        >
          {tag}
        </text>
      </g>
      )}
      {coords && (
        <text
          className="coord-label"
          x={onLeft ? px - 16 : px + 16}
          y={cy}
          textAnchor={onLeft ? 'end' : 'start'}
          dominantBaseline="central"
          style={{ fill: color, fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 4 }}
        >
          {coordText}
        </text>
      )}
    </g>
  )
}

/**
 * The walk from the origin to p: first along x (width), then along y (height),
 * each arrow labelled with its leg ("3 right (x)", "2 up (y)"). Labels keep
 * clear of the axis numbers and of the point's own coordinate label.
 */
export function WalkArrows({ p }: { p: Vec2 }) {
  const [x, y] = p
  const unit = usePxPerUnit()
  const xText = moveText(x, 'right', 'left', 'x')
  const yText = moveText(y, 'up', 'down', 'y')
  // Below the numbers when the y arrow goes up, else above the axis.
  const xBelow = y > 0
  // Keep the x label clear of the y-axis numbers (drawn just right of the axis).
  const half = (xText.length * 7.6) / 2
  const minCentre = (half + 28) / unit
  const xc = Math.sign(x) * Math.max(Math.abs(x) / 2, x > 0 ? minCentre : half / unit + 0.2)
  const showY = Math.abs(y) * unit >= 50
  return (
    <>
      {!isZero(x) && <Arrow tip={[x, 0]} color={COLOR.i} showCoords={false} />}
      {!isZero(y) && <Arrow tail={[x, 0]} tip={p} color={COLOR.j} showCoords={false} />}
      {!isZero(x) && (
        <PlaneLabel x={xc} y={0} attach={xBelow ? 's' : 'n'} distance={xBelow ? 24 : 8} size={15} color={COLOR.i}>
          {xText}
        </PlaneLabel>
      )}
      {!isZero(y) && showY && (
        <PlaneLabel x={x} y={y / 2} attach={x <= 0 ? 'w' : 'e'} distance={10} size={15} color={COLOR.j}>
          {yText}
        </PlaneLabel>
      )}
    </>
  )
}
