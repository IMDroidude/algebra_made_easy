import { approxEqual, approxEqualVec, isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { regionOf } from './plane'

export const PRACTICE_START: Vec2 = [1, 1]

/** Each practice challenge, checked against the live point. */
export const PRACTICE_CHECKS: Record<string, (p: Vec2) => boolean> = {
  target: (p) => approxEqualVec(p, [-3, 2]),
  yaxis: ([x, y]) => isZero(x) && y < 0 && !isZero(y),
  four: ([x, y]) => x > 0 && !isZero(x) && approxEqual(y, -4),
  swap: (p) => regionOf(p) === 'III' && approxEqual(p[0], p[1]),
}
