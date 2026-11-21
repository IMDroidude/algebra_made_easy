/**
 * Inverse, rank, null space, linear systems and least squares, for 2×2
 * matrices and 2D data. Built on the shared tolerance: nothing here compares
 * floats with === 0.
 */
import { IDENTITY2, apply2, columns2, det2, inverse2, lerp2, mul2 } from './matrix'
import { approxEqualVec, isZero } from './tolerance'
import { dot, norm, scale, sub } from './vector'
import type { Mat2, Vec2 } from './types'

// ─── Rank and null space ────────────────────────────────────────────────────

const isZeroVec = (v: Vec2) => isZero(v[0]) && isZero(v[1])
const longer = (a: Vec2, b: Vec2) => (norm(b) > norm(a) ? b : a)

/**
 * The dimension of the output: 2 when the plane stays a plane, 1 when it is
 * squashed onto a line, 0 when everything lands on the origin.
 */
export function rank2(m: Mat2): 0 | 1 | 2 {
  if (m.flat().every(isZero)) return 0
  return isZero(det2(m)) ? 1 : 2
}

/** A subspace of the plane: just the origin, a line through the origin, or everything. */
export type Subspace2 = { dim: 0 } | { dim: 1; direction: Vec2 } | { dim: 2 }

/**
 * The inputs that land on the origin. For a rank-1 matrix this is a line; its
 * direction is perpendicular to the (longer) row, so that row · x = 0.
 */
export function nullSpace2(m: Mat2): Subspace2 {
  const r = rank2(m)
  if (r === 2) return { dim: 0 }
  if (r === 0) return { dim: 2 }
  const [a, b] = longer(m[0], m[1])
  return { dim: 1, direction: [-b, a] }
}

/** Every possible output: the plane, a line along the (longer) column, or the origin alone. */
export function columnSpace2(m: Mat2): Subspace2 {
  const r = rank2(m)
  if (r === 2) return { dim: 2 }
  if (r === 0) return { dim: 0 }
  const [c1, c2] = columns2(m)
  return { dim: 1, direction: longer(c1, c2) }
}

/**
 * NumPy's `np.linalg.matrix_rank` for a 2×2 matrix: count the singular values
 * above max(σ) · 2 · machine epsilon. Far stricter than this app's tolerance,
 * so a matrix the app treats as singular can still be rank 2 for NumPy.
 */
export function numpyMatrixRank2(m: Mat2): 0 | 1 | 2 {
  const [[a, b], [c, d]] = m
  const sumSq = a * a + b * b + c * c + d * d
  const det = Math.abs(det2(m))
  // σ₁² + σ₂² = sum of squares and σ₁σ₂ = |det|
  const sMax = Math.sqrt((sumSq + Math.sqrt(Math.max(0, sumSq * sumSq - 4 * det * det))) / 2)
  if (sMax === 0) return 0
  const sMin = det / sMax
  const tol = sMax * 2 * Number.EPSILON
  return sMin > tol ? 2 : 1
}

// ─── Undo animation ─────────────────────────────────────────────────────────

/**
 * The matrix shown at `phase` of "apply A, then undo it": from the identity to
 * A while phase goes 0 → 1, then A⁻¹ is applied on top while phase goes 1 → 2,
 * arriving back at the identity. Returns null past phase 1 if A has no inverse.
 */
export function thereAndBack2(m: Mat2, phase: number): Mat2 | null {
  if (phase <= 1) return lerp2(IDENTITY2, m, Math.max(0, phase))
  const inv = inverse2(m)
  if (!inv) return null
  return mul2(lerp2(IDENTITY2, inv, Math.min(1, phase - 1)), m)
}

// ─── Linear systems Ax = b ──────────────────────────────────────────────────

/** A line in the plane: all points `point + t · direction`. */
export type Line2 = { point: Vec2; direction: Vec2 }

/**
 * The points satisfying one equation a·x + b·y = c, the "row picture".
 * When a = b = 0 the equation is 0 = c: true everywhere if c is 0, nowhere otherwise.
 */
export function rowLine(row: Vec2, rhs: number): Line2 | 'everywhere' | 'nowhere' {
  if (isZeroVec(row)) return isZero(rhs) ? 'everywhere' : 'nowhere'
  return { point: scale(row, rhs / dot(row, row)), direction: [-row[1], row[0]] }
}

export type Solution2 =
  | { kind: 'unique'; x: Vec2 }
  | { kind: 'none' }
  /** Every point of the line solves it: one solution plus any null-space vector. */
  | { kind: 'line'; line: Line2 }
  /** A and b are both zero: every x works. */
  | { kind: 'all' }

/** Solves Ax = b: one solution, none, a whole line of them, or the whole plane. */
export function solve2(m: Mat2, b: Vec2): Solution2 {
  const inv = inverse2(m)
  if (inv) return { kind: 'unique', x: apply2(inv, b) }
  const r = rank2(m)
  if (r === 0) return isZeroVec(b) ? { kind: 'all' } : { kind: 'none' }
  // Rank 1: solve the longer row, then check that the other row agrees.
  const k = norm(m[1]) > norm(m[0]) ? 1 : 0
  const line = rowLine(m[k], b[k]) as Line2
  return approxEqualVec(apply2(m, line.point), b) ? { kind: 'line', line } : { kind: 'none' }
}

// ─── Projection ─────────────────────────────────────────────────────────────

/** The multiple of `onto` closest to `v`: the shadow of v on the line through `onto`. */
export function project2(v: Vec2, onto: Vec2): Vec2 {
  const len2 = dot(onto, onto)
  if (isZero(len2)) return [0, 0]
  return scale(onto, dot(v, onto) / len2)
}

/** The point of a line closest to `p`. */
export function closestOnLine(line: Line2, p: Vec2): Vec2 {
  const offset = project2(sub(p, line.point), line.direction)
  return [line.point[0] + offset[0], line.point[1] + offset[1]]
}

// ─── Least squares: the best-fit line y = slope · x + intercept ────────────

export type FitLine = { slope: number; intercept: number }

/** Design matrix X: one row [x, 1] per data point, so X w = slope · x + intercept. */
export function designMatrix(points: Vec2[]): [number, number][] {
  return points.map(([x]) => [x, 1])
}

/** The two sides of the normal equations (XᵀX) w = Xᵀy. */
export function normalEquations(points: Vec2[]): { XtX: Mat2; Xty: Vec2 } {
  let sx = 0
  let sxx = 0
  let sy = 0
  let sxy = 0
  for (const [x, y] of points) {
    sx += x
    sxx += x * x
    sy += y
    sxy += x * y
  }
  return {
    XtX: [
      [sxx, sx],
      [sx, points.length],
    ],
    Xty: [sxy, sy],
  }
}

/**
 * The least-squares line: the slope and intercept that minimise the sum of
 * squared vertical residuals. Null when no single line is best, which happens
 * when every point has the same x (XᵀX is then singular).
 */
export function fitLine(points: Vec2[]): FitLine | null {
  const { XtX, Xty } = normalEquations(points)
  const inv = inverse2(XtX)
  if (!inv) return null
  const [slope, intercept] = apply2(inv, Xty)
  return { slope, intercept }
}

export function predict(line: FitLine, x: number): number {
  return line.slope * x + line.intercept
}

/** The line through two points with different x. */
export function lineThrough(p: Vec2, q: Vec2): FitLine | null {
  const run = q[0] - p[0]
  if (isZero(run)) return null
  const slope = (q[1] - p[1]) / run
  return { slope, intercept: p[1] - slope * p[0] }
}

/** Vertical gaps: actual y minus the line's prediction, one per point. */
export function residuals(points: Vec2[], line: FitLine): number[] {
  return points.map(([x, y]) => y - predict(line, x))
}

/** Sum of squared residuals: the error least squares minimises. */
export function sumSquaredResiduals(points: Vec2[], line: FitLine): number {
  return residuals(points, line).reduce((s, r) => s + r * r, 0)
}

// ─── Low rank ───────────────────────────────────────────────────────────────

/** u vᵀ: a column times a row. Every such 2×2 matrix has rank 1 (or 0). */
export function outer2(u: Vec2, v: Vec2): Mat2 {
  return [
    [u[0] * v[0], u[0] * v[1]],
    [u[1] * v[0], u[1] * v[1]],
  ]
}

/** How many numbers a d×d matrix takes, written in full or as B (d×r) times A (r×d). */
export function lowRankParams(d: number, r: number): { full: number; factored: number } {
  return { full: d * d, factored: 2 * d * r }
}

/**
 * Xᵀr for the residuals r of a line: [Σ x·r, Σ r]. Both are zero exactly when
 * the line is the least-squares line (the normal equations).
 */
export function xtResiduals(points: Vec2[], line: FitLine): Vec2 {
  const r = residuals(points, line)
  return [r.reduce((s, ri, k) => s + ri * points[k][0], 0), r.reduce((s, ri) => s + ri, 0)]
}
