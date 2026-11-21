/** The single place where "close enough to zero" is defined. */
export const EPSILON = 1e-6

export function isZero(x: number): boolean {
  return Math.abs(x) < EPSILON
}

export function approxEqual(a: number, b: number): boolean {
  return isZero(a - b)
}

export function approxEqualVec(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((x, i) => approxEqual(x, b[i]))
}
