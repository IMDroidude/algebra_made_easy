import { approxEqual, det2 } from '../../linalg'
import { eigen2, lineTest } from '../../linalg/eigen'
import type { Mat2 } from '../../linalg'

/** Practice goals, each checked against the learner's live matrix. */
export const CHECKS: Record<string, (m: Mat2) => boolean> = {
  // eigenvalues exactly 2 and −1
  twoAndMinusOne: (m) => {
    const e = eigen2(m)
    return e.kind === 'distinct' && approxEqual(e.pairs[0].value, 2) && approxEqual(e.pairs[1].value, -1)
  },
  // every direction flipped and halved
  everyFlipped: (m) => {
    const e = eigen2(m)
    return e.kind === 'scalar' && approxEqual(e.value, -0.5)
  },
  // no real eigenvectors, and not a pure rotation (it changes areas)
  turnAndScale: (m) => eigen2(m).kind === 'complex' && !approxEqual(Math.abs(det2(m)), 1),
  // (1, 2) is an eigenvector with eigenvalue 2, but not every direction is
  oneTwo: (m) => {
    const t = lineTest(m, [1, 2])
    return t.kept && t.factor !== null && approxEqual(t.factor, 2) && eigen2(m).kind !== 'scalar'
  },
}
