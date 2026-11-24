import { Line, Polyline } from 'mafs'
import { PlaneLabel } from '../../components/PlaneLabel'
import { fmt } from '../../lib/format'
import { isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { euclidean, minkowskiBall } from '../../linalg/distance'
import { MEASURE_COLOR } from './content'

/**
 * The gap between two points, drawn three ways: the straight segment
 * (Euclidean), the two legs of the grid route (Manhattan, dashed), and a
 * thick band on the longer leg (Chebyshev).
 */
export function GapLines({ a, b }: { a: Vec2; b: Vec2 }) {
  const corner: Vec2 = [b[0], a[1]]
  const dx = Math.abs(b[0] - a[0])
  const dy = Math.abs(b[1] - a[1])
  const mid: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  // The longer leg is the Chebyshev distance; on a tie, the horizontal one is marked.
  const longLeg: [Vec2, Vec2] = dx >= dy ? [a, corner] : [corner, b]
  // The grid route sits below-right or above-left of the straight line; label the line on the other side.
  const side = (b[0] - a[0]) * (b[1] - a[1]) >= 0 ? 'nw' : 'ne'
  return (
    <>
      {!isZero(Math.max(dx, dy)) && (
        <Line.Segment
          point1={longLeg[0]}
          point2={longLeg[1]}
          color={MEASURE_COLOR.chebyshev}
          weight={11}
          opacity={0.4}
        />
      )}
      {!isZero(dx) && (
        <>
          <Line.Segment point1={a} point2={corner} color={MEASURE_COLOR.manhattan} style="dashed" weight={3} />
          <PlaneLabel x={(a[0] + corner[0]) / 2} y={a[1]} attach="s" distance={10} color={MEASURE_COLOR.manhattan}>
            {fmt(dx)}
          </PlaneLabel>
        </>
      )}
      {!isZero(dy) && (
        <>
          <Line.Segment point1={corner} point2={b} color={MEASURE_COLOR.manhattan} style="dashed" weight={3} />
          <PlaneLabel
            x={corner[0]}
            y={(corner[1] + b[1]) / 2}
            attach={b[0] >= a[0] ? 'e' : 'w'}
            distance={10}
            color={MEASURE_COLOR.manhattan}
          >
            {fmt(dy)}
          </PlaneLabel>
        </>
      )}
      {!isZero(dx) && !isZero(dy) && (
        <>
          <Line.Segment point1={a} point2={b} color={MEASURE_COLOR.euclidean} weight={3} />
          <PlaneLabel x={mid[0]} y={mid[1]} attach={side} distance={10} color={MEASURE_COLOR.euclidean}>
            {fmt(euclidean(a, b))}
          </PlaneLabel>
        </>
      )}
    </>
  )
}

/** Every point at the same Minkowski distance from `centre`: diamond, circle or square. */
export function Ball({
  centre,
  radius,
  p,
  color,
  weight = 2,
  opacity = 1,
}: {
  centre: Vec2
  radius: number
  p: number
  color: string
  weight?: number
  opacity?: number
}) {
  if (isZero(radius)) return null
  return (
    <Polyline
      points={minkowskiBall(centre, radius, p)}
      color={color}
      weight={weight}
      strokeOpacity={opacity}
      fillOpacity={0}
    />
  )
}
