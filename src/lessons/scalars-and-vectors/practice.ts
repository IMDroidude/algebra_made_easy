import { add, approxEqualVec, scale, sub } from '../../linalg'
import { isZeroVec } from '../../linalg/span'
import type { Vec2 } from '../../linalg'
import type { Op } from './ops'

export type PracticeState = { op: Op; u: Vec2; v: Vec2; k: number }

/** Starting values: none of the targets is met yet. */
export const PRACTICE_START: PracticeState = { op: 'add', u: [1, -2], v: [-2, 1], k: 1 }

const CHECKS: Record<string, (s: PracticeState) => boolean> = {
  sum: (s) => s.op === 'add' && approxEqualVec(add(s.u, s.v), [-3, 2]),
  diff: (s) => s.op === 'subtract' && approxEqualVec(sub(s.u, s.v), [0, -3]),
  negative: (s) => s.op === 'scale' && s.k < 0 && approxEqualVec(scale(s.u, s.k), [-3, 1.5]),
  zero: (s) => s.op === 'scale' && !isZeroVec(s.u) && isZeroVec(scale(s.u, s.k)),
}

/** The ids of the challenges the current state satisfies. */
export function solvedChallenges(s: PracticeState): string[] {
  return Object.keys(CHECKS).filter((id) => CHECKS[id](s))
}
