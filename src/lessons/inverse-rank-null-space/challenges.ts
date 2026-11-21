import { IDENTITY2, apply2, approxEqualVec, inverse2, isZero } from '../../linalg'
import { columnSpace2, rank2 } from '../../linalg/systems'
import type { Mat2 } from '../../linalg'

const matches = (m: Mat2, target: Mat2) => approxEqualVec(m.flat(), target.flat())

/** Practice task 4: the learner builds the matrix this one undoes, [[1, 2], [0, 1]]. */
export const UNDONE_BY: Mat2 = [
  [1, -2],
  [0, 1],
]

/** One check per practice challenge, run against the live matrix. */
export const CHECKS: Record<string, (m: Mat2) => boolean> = {
  /** Rank 1 with (1, 1) sent to the origin: the null space is y = x. */
  diagonal: (m) => rank2(m) === 1 && approxEqualVec(apply2(m, [1, 1]), [0, 0]),
  /** Invertible, its own inverse, and not the identity. */
  selfUndo: (m) => {
    const inv = inverse2(m)
    return inv !== null && matches(inv, m) && !matches(m, IDENTITY2)
  },
  /** Rank 1 with every output on the y-axis. */
  yAxis: (m) => {
    const cs = columnSpace2(m)
    return cs.dim === 1 && isZero(cs.direction[0])
  },
  /** Its inverse is UNDONE_BY. */
  undoneBy: (m) => {
    const inv = inverse2(m)
    return inv !== null && matches(inv, UNDONE_BY)
  },
}
