/** Checks for the Practice challenges, on the shapes the learner has picked. */
import { checkMatmul, effectiveB, size } from './shapes'
import type { PickerState } from './shapes'

const isSquare = ([r, c]: [number, number]) => r === c

export const PRACTICE_CHECKS: Record<string, (s: PickerState) => boolean> = {
  number: (s) => {
    const b = effectiveB(s)
    const ab = checkMatmul(s.a, b)
    return ab.ok && ab.result[0] === 1 && ab.result[1] === 1 && s.a[1] >= 3
  },
  oneway: (s) => {
    const b = effectiveB(s)
    return checkMatmul(s.a, b).ok && !checkMatmul(b, s.a).ok
  },
  both: (s) => {
    const b = effectiveB(s)
    const ab = checkMatmul(s.a, b)
    const ba = checkMatmul(b, s.a)
    return (
      !isSquare(s.a) &&
      !isSquare(b) &&
      ab.ok &&
      ba.ok &&
      (ab.result[0] !== ba.result[0] || ab.result[1] !== ba.result[1])
    )
  },
  outer: (s) => {
    const b = effectiveB(s)
    const ab = checkMatmul(s.a, b)
    return ab.ok && size(ab.result) > size(s.a) + size(b)
  },
}
