import { det2, fromColumns2 } from './matrix'
import { isZero } from './tolerance'
import { add, norm, scale } from './vector'
import type { Vec2 } from './types'

/**
 * Linear combinations and span in 2D: what a·u + b·v can reach, and how to
 * find the a and b that reach a given point.
 */

/** a·u + b·v */
export function combine2(a: number, u: Vec2, b: number, v: Vec2): Vec2 {
  return add(scale(u, a), scale(v, b))
}

/** True when the vector is the zero vector (within tolerance). */
export function isZeroVec(v: readonly number[]): boolean {
  return v.every(isZero)
}

/**
 * True when u and v point along different lines, so that together they reach
 * every point of the plane. Same test as "the matrix [u v] is not singular".
 */
export function isIndependent2(u: Vec2, v: Vec2): boolean {
  return !isZero(det2(fromColumns2(u, v)))
}

export type SpanKind = 'point' | 'line' | 'plane'

/**
 * What every combination of the given vectors can reach: only the origin, a
 * line through the origin, or the whole plane. This is the rank (0, 1, 2) in words.
 */
export function spanKind2(vectors: readonly Vec2[]): SpanKind {
  const nonZero = vectors.filter((w) => !isZeroVec(w))
  if (nonZero.length === 0) return 'point'
  for (let i = 0; i < nonZero.length; i++) {
    for (let j = i + 1; j < nonZero.length; j++) {
      if (isIndependent2(nonZero[i], nonZero[j])) return 'plane'
    }
  }
  return 'line'
}

/** The rank of the vectors as a set: 0, 1 or 2. */
export function rank2(vectors: readonly Vec2[]): 0 | 1 | 2 {
  const kind = spanKind2(vectors)
  return kind === 'point' ? 0 : kind === 'line' ? 1 : 2
}

/** The first non-zero vector in the list, or null: the direction of a span that is a line. */
export function spanDirection2(vectors: readonly Vec2[]): Vec2 | null {
  return vectors.find((w) => !isZeroVec(w)) ?? null
}

/** True when point p lies on the line through the origin along the non-zero direction d. */
export function isOnLine2(d: Vec2, p: Vec2): boolean {
  // Cross product of d and p, divided by |d| so the test does not depend on how long d is.
  return isZero(det2(fromColumns2(d, p)) / norm(d))
}

/** True when some a·u + b·v equals the target. */
export function canReach2(u: Vec2, v: Vec2, target: Vec2): boolean {
  const kind = spanKind2([u, v])
  if (kind === 'plane') return true
  if (kind === 'point') return isZeroVec(target)
  return isOnLine2(spanDirection2([u, v])!, target)
}

/**
 * The unique a and b with a·u + b·v = target, by Cramer's rule. Returns null
 * when u and v are dependent (then there is either no answer or infinitely many).
 */
export function solveCombination2(u: Vec2, v: Vec2, target: Vec2): Vec2 | null {
  const d = det2(fromColumns2(u, v))
  if (isZero(d)) return null
  const a = det2(fromColumns2(target, v)) / d
  const b = det2(fromColumns2(u, target)) / d
  return [a, b]
}

/**
 * Solves M c = x the way NumPy's np.linalg.solve does for a 2×2 matrix (LAPACK
 * dgesv: LU with partial pivoting, then forward and back substitution). The
 * order of operations is copied so that results, including the sign of a
 * zero, match what NumPy prints. M is given by its two columns.
 * Returns null when NumPy would raise LinAlgError("Singular matrix"), which
 * happens only when a pivot is exactly zero.
 */
export function numpySolve2(c1: Vec2, c2: Vec2, x: Vec2): Vec2 | null {
  // Rows of M.
  let r0: [number, number, number] = [c1[0], c2[0], x[0]]
  let r1: [number, number, number] = [c1[1], c2[1], x[1]]
  // Partial pivoting: the row with the larger |entry| in column 1 goes first (ties keep the order).
  if (Math.abs(r1[0]) > Math.abs(r0[0])) [r0, r1] = [r1, r0]
  if (r0[0] === 0) return null
  const l = r1[0] * (1 / r0[0])
  const u11 = r1[1] - l * r0[1]
  if (u11 === 0) return null
  const y1 = r1[2] - l * r0[2]
  // OpenBLAS (which NumPy ships with) multiplies by the reciprocal of each pivot.
  const b = y1 * (1 / u11)
  const a = (r0[2] - b * r0[1]) * (1 / r0[0])
  return [a, b]
}

/**
 * Sample points a·u + b·v for a and b on a grid from -range to range, used to
 * show which points a pair of vectors can reach.
 */
export function latticePoints2(u: Vec2, v: Vec2, range: number, step = 1): Vec2[] {
  const out: Vec2[] = []
  const n = Math.round(range / step)
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) out.push(combine2(i * step, u, j * step, v))
  }
  return out
}

/** Turns -0 into 0, so a value shown as "0" in code really is the 0 that code would use. */
export function cleanZero2(p: Vec2): Vec2 {
  return [p[0] + 0, p[1] + 0]
}
