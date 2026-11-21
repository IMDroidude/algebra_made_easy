import { isInteger } from '../../lib/format'
import { add, scale } from '../../linalg'
import { cleanZero2 } from '../../linalg/span'
import type { Vec2 } from '../../linalg'

/**
 * a * u + b * v exactly as NumPy computes it. The one difference from plain
 * floating point: when a scalar and an array are both integers, NumPy
 * multiplies integers, and an integer cannot be "-0". So 0 * (-2) is 0, not
 * -0, which changes what NumPy prints for a sum such as -0.25 * 0 + 0 * (-2).
 */
export function numpyCombine(a: number, u: Vec2, b: number, v: Vec2): Vec2 {
  const term = (k: number, w: Vec2) => (isInteger(k, ...w) ? cleanZero2(scale(w, k)) : scale(w, k))
  return add(term(a, u), term(b, v))
}
