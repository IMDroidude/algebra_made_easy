import { fmt } from '../../lib/format'
import { approxEqual, isZero } from '../../linalg'

export type Op = 'add' | 'subtract' | 'scale'

export const OPS: { id: Op; label: string }[] = [
  { id: 'add', label: 'Add: u + v' },
  { id: 'subtract', label: 'Subtract: u − v' },
  { id: 'scale', label: 'Scale: k · u' },
]

/** In words, what multiplying by k does to an arrow. */
export function scaleEffect(k: number): string {
  if (isZero(k)) return 'Multiplying by 0 shrinks any arrow to the zero vector: no length, no direction.'
  const size = approxEqual(Math.abs(k), 1)
    ? 'keeps its length'
    : Math.abs(k) > 1
      ? `gets ${fmt(Math.abs(k))} times longer`
      : `shrinks to ${fmt(Math.abs(k))} of its length`
  return k < 0
    ? `A negative scalar flips the arrow to point the opposite way, and it ${size}.`
    : `The direction stays the same; the arrow ${size}.`
}
