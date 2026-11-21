/** Step 4's matrix-to-point map: P = (x, y) is dragged, P′ = AP follows. */
import { apply2 } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'

/** P can be dragged within ±P_LIMIT on both axes. */
export const P_LIMIT = 3

const reachOf = (q: Vec2) => Math.max(Math.abs(q[0]), Math.abs(q[1]))

/**
 * Half-width of step 4's plane. It covers every P in the drag box (and the
 * current v, which step 1 may have put outside it), so dragging P never
 * rescales the plane under the pointer.
 */
export function understandExtentFor(m: Mat2, v: Vec2): number {
  const L = P_LIMIT
  const points: Vec2[] = [[L, L], [L, -L], [-L, L], [-L, -L], v]
  const reach = Math.max(
    4,
    ...points.map((q) => reachOf(apply2(m, q))),
    // the first leg of the walk, x copies of î
    ...[L, v[0]].map((x) => reachOf([m[0][0] * x, m[1][0] * x])),
  )
  return Math.min(14, Math.ceil(reach) + 1)
}
