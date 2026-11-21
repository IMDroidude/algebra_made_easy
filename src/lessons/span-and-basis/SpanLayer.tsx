import { Line, Point, Polygon } from 'mafs'
import { COLOR } from '../../lib/palette'
import { latticePoints2, spanDirection2, spanKind2 } from '../../linalg/span'
import type { Vec2 } from '../../linalg'

/** Half-width and half-height of the area where sample points are drawn. */
const VIEW_X = 7.6
const VIEW_Y = 5.4

/**
 * Shows which points a·u + b·v can reach: a light wash over the whole plane,
 * a thick band along a line, or just the origin. Small dots mark the points
 * reached with whole-number a and b, so the "grid" made by u and v is visible.
 */
export function SpanLayer({
  u,
  v,
  opacity = 1,
}: {
  u: Vec2
  /** Leave out to show what u alone can reach. */
  v?: Vec2
  /** 0 to 1, used to fade the layer in during a reveal. */
  opacity?: number
}) {
  const vectors = v ? [u, v] : [u]
  const kind = spanKind2(vectors)
  const dir = spanDirection2(vectors)
  // Parallel vectors reach the same point many times; draw each point once.
  const seen = new Set<string>()
  const dots = latticePoints2(u, v ?? [0, 0], 12).filter(([x, y]) => {
    const key = `${x.toFixed(3)},${y.toFixed(3)}`
    if (seen.has(key) || Math.abs(x) > VIEW_X || Math.abs(y) > VIEW_Y) return false
    seen.add(key)
    return true
  })

  return (
    <>
      {kind === 'plane' && (
        <Polygon
          points={[
            [-20, -20],
            [20, -20],
            [20, 20],
            [-20, 20],
          ]}
          color={COLOR.result}
          fillOpacity={0.1 * opacity}
          strokeOpacity={0}
        />
      )}
      {kind === 'line' && dir && (
        <Line.ThroughPoints point1={[0, 0]} point2={dir} color={COLOR.result} weight={10} opacity={0.3 * opacity} />
      )}
      {dots.map(([x, y], i) => (
        <Point key={i} x={x} y={y} color={COLOR.result} opacity={0.65 * opacity} svgCircleProps={{ r: 2.5 }} />
      ))}
      {kind === 'point' && <Point x={0} y={0} color={COLOR.result} opacity={opacity} />}
    </>
  )
}
