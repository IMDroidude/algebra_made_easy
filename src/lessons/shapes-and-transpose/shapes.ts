/**
 * Shape arithmetic and NumPy text for the shapes-and-transpose lesson.
 * Plain functions only: no React, no drawing.
 */
import { fmt } from '../../lib/format'
import { approxEqual, isZero, matMul, shape } from '../../linalg'
import type { Matrix, Vec2 } from '../../linalg'

export type Shape = [rows: number, cols: number]

export type MatmulCheck = { ok: true; result: Shape } | { ok: false; error: string }

/** NumPy's spelling of a shape: (2, 3). */
export function pyShape([rows, cols]: Shape): string {
  return `(${rows}, ${cols})`
}

/** The shape of A.T for an A of the given shape. */
export function transposeShape([rows, cols]: Shape): Shape {
  return [cols, rows]
}

/** Exactly the message NumPy 2 raises for `A @ B` when the inner sizes differ (both 2-D). */
export function numpyMatmulError(a: Shape, b: Shape): string {
  return (
    'matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature ' +
    `(n?,k),(k,m?)->(n?,m?) (size ${b[0]} is different from ${a[1]})`
  )
}

/** Whether A @ B is allowed, and the shape of the result. Matches what `matMul` accepts. */
export function checkMatmul(a: Shape, b: Shape): MatmulCheck {
  return a[1] === b[0]
    ? { ok: true, result: [a[0], b[1]] }
    : { ok: false, error: numpyMatmulError(a, b) }
}

/** Number of entries in a matrix of this shape. */
export function size([rows, cols]: Shape): number {
  return rows * cols
}

/** A matrix of the given shape filled with one value, like np.ones / np.zeros. */
export function filled([rows, cols]: Shape, value: number): Matrix {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => value))
}

/** The n×n identity, like np.eye(n). */
export function eye(n: number): Matrix {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
}

/** Shape of an actual matrix, typed as a Shape. */
export function shapeOf(m: Matrix): Shape {
  return shape(m)
}

/** A @ B, as `linalg.matMul` computes it (throws on a shape mismatch). */
export function product(a: Matrix, b: Matrix): Matrix {
  return matMul(a, b)
}

/**
 * NumPy literal for any matrix, continuation rows aligned under the first:
 * W = np.array([[1, 0.5]])  or  N = np.array([[1],\n              [1]]).
 */
export function numpyMat(name: string, m: Matrix): string {
  const head = `${name} = np.array([`
  const pad = ' '.repeat(head.length)
  const rows = m.map((row) => `[${row.map((x) => fmt(x)).join(', ')}]`)
  return `${head}${rows.join(`,\n${pad}`)}])`
}

/** Round every entry the way it is displayed, so pictures, maths and code use the same numbers. */
export function asShown(m: Matrix): Matrix {
  return m.map((row) => row.map((x) => Number(fmt(x))))
}

/** 1×2 matrix [a b] applied to a point of the plane: one number, a·x + b·y. */
export function squash(m: Matrix, v: Vec2): number {
  return m[0][0] * v[0] + m[0][1] * v[1]
}

/** 2×1 matrix [p; q] applied to a number t: the point (p·t, q·t). */
export function lift(m: Matrix, t: number): Vec2 {
  return [m[0][0] * t, m[1][0] * t]
}

/**
 * Direction along which a 1×2 matrix [a b] gives the same output: (−b, a).
 * Null when the matrix is all zeros (then every point gives 0).
 */
export function sameOutputDirection(m: Matrix): Vec2 | null {
  const [a, b] = m[0]
  if (isZero(a) && isZero(b)) return null
  return [-b, a]
}

/** Groups indices whose values are equal (within tolerance); used to spot collisions. */
export function collisions(values: number[]): number[][] {
  const groups: number[][] = []
  values.forEach((x, k) => {
    const g = groups.find((grp) => approxEqual(values[grp[0]], x))
    if (g) g.push(k)
    else groups.push([k])
  })
  return groups.filter((g) => g.length > 1)
}

/** State of the shape checker: shapes of A and B, and whether B is used transposed. */
export type PickerState = { a: Shape; b: Shape; transposeB: boolean }

/** The shape B actually has in the product: B, or B.T when the toggle is on. */
export function effectiveB(s: PickerState): Shape {
  return s.transposeB ? transposeShape(s.b) : s.b
}
