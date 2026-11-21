import { isZero } from './tolerance'
import type { Mat2, Matrix, Vec, Vec2 } from './types'

export const IDENTITY2: Mat2 = [
  [1, 0],
  [0, 1],
]

export function shape(m: Matrix): [rows: number, cols: number] {
  return [m.length, m.length === 0 ? 0 : m[0].length]
}

/** y = A x */
export function matVec(m: Matrix, v: Vec): Vec {
  const [, cols] = shape(m)
  if (cols !== v.length) {
    throw new Error(`Shape mismatch: matrix has ${cols} columns, vector has ${v.length} entries`)
  }
  return m.map((row) => row.reduce((sum, a, j) => sum + a * v[j], 0))
}

/** A B: apply B first, then A. */
export function matMul(a: Matrix, b: Matrix): Matrix {
  const [aRows, aCols] = shape(a)
  const [bRows, bCols] = shape(b)
  if (aCols !== bRows) {
    throw new Error(`Shape mismatch: (${aRows}×${aCols}) @ (${bRows}×${bCols})`)
  }
  return a.map((row) =>
    Array.from({ length: bCols }, (_, j) => row.reduce((sum, x, k) => sum + x * b[k][j], 0)),
  )
}

export function transpose(m: Matrix): Matrix {
  const [rows, cols] = shape(m)
  return Array.from({ length: cols }, (_, j) => Array.from({ length: rows }, (_, i) => m[i][j]))
}

export function apply2(m: Mat2, v: Vec2): Vec2 {
  // Sums start from +0, like matVec and like NumPy's matmul, so (-1)·0 + (-1)·0
  // gives 0 rather than -0. NumPy prints the two differently.
  return [0 + m[0][0] * v[0] + m[0][1] * v[1], 0 + m[1][0] * v[0] + m[1][1] * v[1]]
}

export function mul2(a: Mat2, b: Mat2): Mat2 {
  return matMul(a, b) as Mat2
}

/** The two columns: where î = (1, 0) and ĵ = (0, 1) land. */
export function columns2(m: Mat2): [Vec2, Vec2] {
  return [
    [m[0][0], m[1][0]],
    [m[0][1], m[1][1]],
  ]
}

export function fromColumns2(c1: Vec2, c2: Vec2): Mat2 {
  return [
    [c1[0], c2[0]],
    [c1[1], c2[1]],
  ]
}

export function det2(m: Mat2): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0]
}

export function isSingular2(m: Mat2): boolean {
  return isZero(det2(m))
}

/** Returns null when the matrix is singular (within tolerance). */
export function inverse2(m: Mat2): Mat2 | null {
  const d = det2(m)
  if (isZero(d)) return null
  return [
    [m[1][1] / d, -m[0][1] / d],
    [-m[1][0] / d, m[0][0] / d],
  ]
}

/** Entry-wise blend from a (t = 0) to b (t = 1), used to animate a transformation. */
export function lerp2(a: Mat2, b: Mat2, t: number): Mat2 {
  const mix = (x: number, y: number) => x + (y - x) * t
  return [
    [mix(a[0][0], b[0][0]), mix(a[0][1], b[0][1])],
    [mix(a[1][0], b[1][0]), mix(a[1][1], b[1][1])],
  ]
}

/** Counter-clockwise rotation by the given angle in degrees. */
export function rotation2(degrees: number): Mat2 {
  const r = (degrees * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  return [
    [c, -s],
    [s, c],
  ]
}
