/** Goals for step 6, checked against the live weights of query 1. */
import type { Vec } from '../../linalg'

export const CHECKS: Record<string, (w: Vec) => boolean> = {
  /** Query 1 gives at least 90% of its attention to token 3. */
  focus: (w) => w[2] >= 0.9,
  /** Every weight within 0.02 of one third. */
  uniform: (w) => w.every((x) => Math.abs(x - 1 / 3) < 0.02),
  /** Tokens 1 and 2 get nearly equal shares, token 3 almost none. */
  split: (w) => Math.abs(w[0] - w[1]) < 0.05 && w[2] < 0.05,
}

export function solvedBy(w: Vec): string[] {
  return Object.keys(CHECKS).filter((id) => CHECKS[id](w))
}
