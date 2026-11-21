/**
 * The running example for this lesson: a redundant "area in m²" column does
 * not raise the rank of the house matrix, and three independent houses pin
 * down three weights exactly. Plain functions only, for the unit tests.
 */
import { HOUSES, featureMatrix, housesNumpy } from '../../data/houses'
import type { House } from '../../data/houses'
import { fmt } from '../../lib/format'
import { npArray } from '../../lib/numpy'
import { matVec } from '../../linalg'
import type { Matrix, Vec } from '../../linalg'

export const SQFT_TO_M2 = 0.0929

/** The hidden pricing rule the learner recovers: $k per sqft, per bedroom, per km. */
export const TRUE_WEIGHTS: Vec = [0.2, 15, -6]

/** The houses used to solve for the weights: A, B and C. */
export const SOLVE_HOUSES: House[] = HOUSES.slice(0, 3)

export const areaM2 = (h: House) => h.sqft * SQFT_TO_M2
export const areaText = (h: House) => fmt(areaM2(h), 2)

/** X with a fourth column, the area in m² (just sqft × 0.0929). */
export const withArea = (): Matrix => HOUSES.map((h) => [h.sqft, h.bedrooms, h.distanceKm, areaM2(h)])

/**
 * Rank by Gaussian elimination with partial pivoting. A pivot counts only if
 * it is large relative to the biggest entry, like NumPy's tolerance.
 */
export function rank(m: Matrix): number {
  const a = m.map((r) => [...r])
  const rows = a.length
  const cols = a[0].length
  const scale = Math.max(...a.flat().map(Math.abs))
  const tol = scale * Math.max(rows, cols) * 1e-12
  let r = 0
  for (let c = 0; c < cols && r < rows; c++) {
    let p = r
    for (let i = r + 1; i < rows; i++) if (Math.abs(a[i][c]) > Math.abs(a[p][c])) p = i
    if (Math.abs(a[p][c]) <= tol) continue
    ;[a[r], a[p]] = [a[p], a[r]]
    for (let i = r + 1; i < rows; i++) {
      const f = a[i][c] / a[r][c]
      for (let j = c; j < cols; j++) a[i][j] -= f * a[r][j]
    }
    r++
  }
  return r
}

/** Solve A x = b for a square, invertible A (Gaussian elimination, partial pivoting). */
export function solve(A: Matrix, b: Vec): Vec {
  const n = A.length
  const a = A.map((r, i) => [...r, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let i = c + 1; i < n; i++) if (Math.abs(a[i][c]) > Math.abs(a[p][c])) p = i
    ;[a[c], a[p]] = [a[p], a[c]]
    for (let i = c + 1; i < n; i++) {
      const f = a[i][c] / a[c][c]
      for (let j = c; j <= n; j++) a[i][j] -= f * a[c][j]
    }
  }
  const x = new Array<number>(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = a[i][n]
    for (let j = i + 1; j < n; j++) s -= a[i][j] * x[j]
    x[i] = s / a[i][i]
  }
  return x
}

/** The figures the pricing rule gives for houses A, B, C (price above a $60k base). */
export const ruleFigures = (): Vec => matVec(featureMatrix(SOLVE_HOUSES), TRUE_WEIGHTS)

export function houseSnippet(): { code: string; output: string } {
  const b = ruleFigures()
  const code = [
    'import numpy as np',
    '',
    housesNumpy()
      .split('\n')
      .filter((l) => !l.startsWith('y ='))
      .join('\n'),
    '',
    '# add a 4th column: area in m² (just sqft × 0.0929)',
    'X4 = np.column_stack([X, X[:, 0] * 0.0929])',
    'print(X4.shape)',
    'print(np.linalg.matrix_rank(X), np.linalg.matrix_rank(X4))',
    '',
    '# three houses (A, B, C), three unknown weights',
    'X3 = X[:3]',
    `b = np.array([${b.map((x) => fmt(x)).join(', ')}])`,
    'print(np.linalg.solve(X3, b))',
  ].join('\n')
  const output = [
    `(${HOUSES.length}, 4)`,
    `${rank(featureMatrix())} ${rank(withArea())}`,
    npArray(solve(featureMatrix(SOLVE_HOUSES), b)),
  ].join('\n')
  return { code, output }
}
