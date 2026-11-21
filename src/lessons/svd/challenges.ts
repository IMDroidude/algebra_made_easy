import { approxEqual, approxEqualVec, det2 } from '../../linalg'
import { svd2 } from '../../linalg/svd'
import type { Mat2 } from '../../linalg'

const sigmas = (m: Mat2, a: number, b: number) => {
  const { sigma } = svd2(m)
  return approxEqual(sigma[0], a) && approxEqual(sigma[1], b)
}

/** Practice goals, each checked against the learner's live matrix. */
export const CHECKS: Record<string, (m: Mat2) => boolean> = {
  // a circle of radius 2 that is not simply 2I
  bigCircle: (m) => sigmas(m, 2, 2) && !approxEqualVec(m.flat(), [2, 0, 0, 2]),
  // semi-axes 3 and 1, long axis along y = x
  diagonal: (m) => {
    if (!sigmas(m, 3, 1)) return false
    const { U } = svd2(m)
    return approxEqual(Math.abs(U[0][0] + U[1][0]) / Math.SQRT2, 1)
  },
  // flattened to a segment of length 4
  segment: (m) => sigmas(m, 2, 0),
  // stretches 2 and 1, but mirrored
  mirrored: (m) => sigmas(m, 2, 1) && det2(m) < 0,
}
