/** Checks for the determinant Practice challenges, on the live matrix. */
import { approxEqual, approxEqualVec, det2, isZero } from '../../linalg'
import type { Mat2 } from '../../linalg'
import { collapseKind } from './determinant'

export const PRACTICE_CHECKS: Record<string, (m: Mat2) => boolean> = {
  double: (m) => approxEqualVec(m.flat(), [2, 2, -2, 2]),
  flip: (m) => approxEqual(det2(m), -3),
  line: (m) => collapseKind(m) === 'line' && m.flat().every((x) => !isZero(x)),
  point: (m) => collapseKind(m) === 'point',
}
