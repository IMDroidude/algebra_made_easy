import { approxEqualVec } from '../../linalg'
import { combine2, isZeroVec, spanKind2 } from '../../linalg/span'
import type { Vec2 } from '../../linalg'

export type PracticeState = { u: Vec2; v: Vec2; a: number; b: number }

/** Starting values for the practice plane. None of the challenges is met. */
export const PRACTICE_START: PracticeState = { u: [2, -1], v: [1, 1.5], a: 1, b: 1 }

/** The point the learner has to reach. */
export const TARGET: Vec2 = [-4, 1]

const atStart = (s: PracticeState) =>
  approxEqualVec(s.u, PRACTICE_START.u) && approxEqualVec(s.v, PRACTICE_START.v)

const isLine = (s: PracticeState) =>
  spanKind2([s.u, s.v]) === 'line' && !isZeroVec(s.u) && !isZeroVec(s.v)

/**
 * The ids of the challenges the current state satisfies. `alreadyDone` lets
 * "restore" require that the span was collapsed first.
 */
export function solvedChallenges(s: PracticeState, alreadyDone: ReadonlySet<string>): string[] {
  const w = combine2(s.a, s.u, s.b, s.v)
  const out: string[] = []
  if (isLine(s)) out.push('collapse')
  if (alreadyDone.has('collapse') && spanKind2([s.u, s.v]) === 'plane') out.push('restore')
  if (atStart(s) && approxEqualVec(w, TARGET)) out.push('reach')
  if (isLine(s) && approxEqualVec(w, TARGET)) out.push('reach-line')
  return out
}
