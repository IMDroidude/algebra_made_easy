/** Fixed point and goals for the Practice step of lesson 2.4. None appears earlier in the lesson. */
import { approxEqual, isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { distance, square } from './powers'

export const PRACTICE_A: Vec2 = [-1, -1]
export const PRACTICE_B_START: Vec2 = [2, 1]

/** Each goal is checked against the live position of B. */
export const PRACTICE_CHECKS: Record<string, (b: Vec2) => boolean> = {
  area: (b) => approxEqual(square(b[0] - PRACTICE_A[0]), 6.25),
  negative: (b) => approxEqual(b[0] - PRACTICE_A[0], -2) && approxEqual(b[1] - PRACTICE_A[1], -2),
  five: (b) =>
    approxEqual(distance(PRACTICE_A, b), 5) &&
    !isZero(b[0] - PRACTICE_A[0]) &&
    !isZero(b[1] - PRACTICE_A[1]),
}
