/**
 * Ways to measure how far apart, or how alike, two vectors are.
 *
 * Distances are 0 for identical vectors and grow as they differ. The
 * similarities here (Jaccard, Pearson) are largest for identical vectors.
 * Functions that would have to divide by zero return `null` instead of NaN,
 * so callers must say "undefined" rather than show a meaningless number.
 */
import { isZero } from './tolerance'
import type { Vec, Vec2 } from './types'
import { dot, norm, sub } from './vector'

/** Straight-line distance: √(Σ (aᵢ − bᵢ)²). Also called L2. */
export function euclidean(a: Vec, b: Vec): number {
  return norm(sub(a, b))
}

/** City-block distance: Σ |aᵢ − bᵢ|. Also called L1 or taxicab. */
export function manhattan(a: Vec, b: Vec): number {
  return a.reduce((sum, x, k) => sum + Math.abs(x - b[k]), 0)
}

/** The largest single difference: max |aᵢ − bᵢ|. Also called L∞. */
export function chebyshev(a: Vec, b: Vec): number {
  return a.reduce((max, x, k) => Math.max(max, Math.abs(x - b[k])), 0)
}

/**
 * The family the three above belong to: (Σ |aᵢ − bᵢ|^p)^(1/p), for p ≥ 1.
 * p = 1 is Manhattan, p = 2 is Euclidean, p = Infinity is Chebyshev.
 */
export function minkowski(a: Vec, b: Vec, p: number): number {
  if (p === Infinity) return chebyshev(a, b)
  if (p === 1) return manhattan(a, b)
  if (p === 2) return euclidean(a, b)
  return a.reduce((sum, x, k) => sum + Math.abs(x - b[k]) ** p, 0) ** (1 / p)
}

/**
 * Outline of every 2D point at Minkowski distance `radius` from `centre`:
 * a diamond for p = 1, a circle for p = 2, a square for p = Infinity. The
 * first point is repeated at the end so the outline closes.
 */
export function minkowskiBall(centre: Vec2, radius: number, p: number, steps = 96): Vec2[] {
  const points: Vec2[] = []
  for (let k = 0; k <= steps; k++) {
    const t = (2 * Math.PI * k) / steps
    const dir: Vec2 = [Math.cos(t), Math.sin(t)]
    // Stretch the direction until its p-length is exactly `radius`.
    const size = minkowski(dir, [0, 0], p)
    points.push([centre[0] + (radius * dir[0]) / size, centre[1] + (radius * dir[1]) / size])
  }
  return points
}

/** How many positions hold different values. Both vectors must have the same length. */
export function hamming(a: readonly unknown[], b: readonly unknown[]): number {
  return a.reduce<number>((count, x, k) => count + (x === b[k] ? 0 : 1), 0)
}

/**
 * Jaccard similarity of two 0/1 vectors: positions where both are 1, divided
 * by positions where at least one is 1. Positions where both are 0 are
 * ignored. Null when neither vector has a 1 (nothing to compare).
 */
export function jaccard(a: Vec, b: Vec): number | null {
  let both = 0
  let either = 0
  a.forEach((x, k) => {
    if (x !== 0 && b[k] !== 0) both++
    if (x !== 0 || b[k] !== 0) either++
  })
  return either === 0 ? null : both / either
}

/** The average of the entries. */
export function mean(v: Vec): number {
  return v.reduce((s, x) => s + x, 0) / v.length
}

/**
 * Pearson correlation: subtract each vector's own average, then take the
 * cosine. From −1 to 1. Null when either vector is constant (it has no "ups
 * and downs" to compare).
 */
export function pearson(a: Vec, b: Vec): number | null {
  const ma = mean(a)
  const mb = mean(b)
  const ca = a.map((x) => x - ma)
  const cb = b.map((x) => x - mb)
  const na = norm(ca)
  const nb = norm(cb)
  if (isZero(na) || isZero(nb)) return null
  return dot(ca, cb) / (na * nb)
}

/**
 * Min-max scaling of a table, column by column: (x − min) / (max − min), so
 * every column runs from 0 to 1. A column whose values are all equal becomes
 * all zeros.
 */
export function minMaxScale(rows: Vec[]): Vec[] {
  const columns = rows[0].map((_, c) => rows.map((r) => r[c]))
  const lo = columns.map((col) => Math.min(...col))
  const hi = columns.map((col) => Math.max(...col))
  return rows.map((r) => r.map((x, c) => (hi[c] === lo[c] ? 0 : (x - lo[c]) / (hi[c] - lo[c]))))
}
