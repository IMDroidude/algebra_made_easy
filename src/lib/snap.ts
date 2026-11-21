import type { Vec2 } from '../linalg'

export type Bounds = { x: [number, number]; y: [number, number] }

/**
 * Rounds a dragged position to a grid step. With `limit`, also keeps it within
 * ±limit on both axes (for lessons that want a deliberately small playing
 * field). Without it, the plane itself keeps points on screen; see keepInside.
 */
export function snapTo(step: number, limit?: number) {
  const clamp = (x: number) => (limit === undefined ? x : Math.max(-limit, Math.min(limit, x)))
  return ([x, y]: Vec2): Vec2 => [
    clamp(Math.round(x / step) * step),
    clamp(Math.round(y / step) * step),
  ]
}

/**
 * Applies `snap`, then makes sure the result is inside the visible plane.
 * Snapping can round a point just past the edge, so when that happens the
 * input is nudged inwards until the snapped result fits.
 */
export function keepInside(p: Vec2, snap: (p: Vec2) => Vec2, bounds: Bounds, margin = 0.15): Vec2 {
  const lo = (r: [number, number]) => r[0] + margin
  const hi = (r: [number, number]) => r[1] - margin
  const fit = (v: number, r: [number, number]) => Math.max(lo(r), Math.min(hi(r), v))
  let c: Vec2 = [fit(p[0], bounds.x), fit(p[1], bounds.y)]
  let q = snap(c)
  for (let i = 0; i < 40; i++) {
    const outX = q[0] > bounds.x[1] ? -1 : q[0] < bounds.x[0] ? 1 : 0
    const outY = q[1] > bounds.y[1] ? -1 : q[1] < bounds.y[0] ? 1 : 0
    if (outX === 0 && outY === 0) return q
    c = [c[0] + outX * 0.05, c[1] + outY * 0.05]
    q = snap(c)
  }
  return q
}
