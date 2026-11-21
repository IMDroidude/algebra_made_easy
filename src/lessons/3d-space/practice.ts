import { approxEqualVec, isZero } from '../../linalg'
import type { Vec3 } from '../../linalg/project3d'

export const PRACTICE_START: Vec3 = [2.5, 1.5, 2.5]

/** Each practice challenge, checked against the live point. */
export const PRACTICE_CHECKS: Record<string, (p: Vec3) => boolean> = {
  goto: (p) => approxEqualVec(p, [1, 4, 2]),
  detective: (p) => approxEqualVec(p, [4, 2.5, 1]),
  edge: ([x, y, z]) => isZero(y) && isZero(z) && x >= 2,
}
