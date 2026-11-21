import { npArray } from '../../lib/numpy'

/** How NumPy prints a 1-D array (see lib/numpy). */
export function numpyPrint1d(values: readonly number[], integer: boolean): string {
  return npArray([...values], integer)
}

/** True when any entry is a negative zero, so the lesson can explain the "-0." NumPy prints. */
export function hasNegativeZero(values: readonly number[]): boolean {
  return values.some((x) => Object.is(x, -0))
}
