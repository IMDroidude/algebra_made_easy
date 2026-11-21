import { isZero } from '../linalg'
import { npArray } from './numpy'
import type { Mat2, Vec } from '../linalg'

/** Rounds for display, drops trailing zeros, and never prints "-0". */
export function fmt(x: number, digits = 2): string {
  const rounded = Number(x.toFixed(digits))
  return Object.is(rounded, -0) ? '0' : String(rounded)
}

export function fmtVec(v: Vec, digits = 2): string {
  return `(${v.map((x) => fmt(x, digits)).join(', ')})`
}

/**
 * A determinant that is tiny but not exactly zero is shown as "≈ 0", so the
 * learner can see why the app treats the matrix as singular.
 */
export function fmtDet(det: number): string {
  if (det === 0) return '0'
  if (isZero(det)) return '≈ 0'
  // Small but not treated as singular: show significant digits, never a bare "0".
  if (Math.abs(det) < 0.005) return String(Number(det.toPrecision(2)))
  return fmt(det)
}

/** Number boxes show 3 decimals, so code literals use the same precision. */
const LITERAL_DIGITS = 3

/** The value NumPy actually receives from a literal written with `numpyMat2` / `numpyVec`. */
export function asTyped(x: number): number {
  return Number(fmt(x, LITERAL_DIGITS))
}

export function asTyped2(m: Mat2): Mat2 {
  return [
    [asTyped(m[0][0]), asTyped(m[0][1])],
    [asTyped(m[1][0]), asTyped(m[1][1])],
  ]
}

/** NumPy literal for a 2×2 matrix, with continuation lines aligned under the first row. */
export function numpyMat2(name: string, m: Mat2): string {
  const head = `${name} = np.array([`
  const pad = ' '.repeat(head.length)
  const f = (x: number) => fmt(x, LITERAL_DIGITS)
  return `${head}[${f(m[0][0])}, ${f(m[0][1])}],\n${pad}[${f(m[1][0])}, ${f(m[1][1])}]])`
}

/**
 * What NumPy prints for a 1D or 2D array. `integer` says whether the array
 * NumPy would compute has an integer dtype. Thin wrapper over lib/numpy.
 */
export function numpyPrint(values: number[] | number[][], integer: boolean): string {
  return npArray(values, integer)
}

export function isInteger(...values: number[]): boolean {
  return values.every((x) => Number.isInteger(x))
}

export function numpyVec(name: string, v: Vec): string {
  return `${name} = np.array([${v.map((x) => fmt(x, LITERAL_DIGITS)).join(', ')}])`
}

/** Coordinates as shown in hover tooltips: "x = 3, y = 4". */
export function coordText([x, y]: Vec): string {
  return `x = ${fmt(x)}, y = ${fmt(y)}`
}
