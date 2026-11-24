/**
 * The idea behind principal component analysis (PCA) in 2D: drop every point
 * onto a line through the origin and measure how spread out the shadows are.
 * PCA picks the line where that spread is largest.
 *
 * All functions expect points that are already centred (their mean is the origin).
 */
import type { Vec2 } from './types'
import { dot } from './vector'

/** The unit vector at the given angle, counter-clockwise from the x-axis. */
export function unitAt(degrees: number): Vec2 {
  const r = (degrees * Math.PI) / 180
  return [Math.cos(r), Math.sin(r)]
}

/** Where each point's shadow falls along the line at `degrees`: one number per point. */
export function coordsAlong(points: readonly Vec2[], degrees: number): number[] {
  const d = unitAt(degrees)
  return points.map((p) => dot(p, d))
}

/** Average squared distance from the mean (divides by n, like NumPy's `var`). */
export function variance(xs: readonly number[]): number {
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length
  return xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length
}

/** Spread of the points in every direction together: variance of x plus variance of y. */
export function totalVariance(points: readonly Vec2[]): number {
  return variance(points.map((p) => p[0])) + variance(points.map((p) => p[1]))
}

/**
 * The angle (0 ≤ angle < 180) of the line that keeps the most spread: the
 * first principal component of centred 2D points.
 */
export function principalAngleDeg(points: readonly Vec2[]): number {
  const n = points.length
  const sxx = points.reduce((s, p) => s + p[0] * p[0], 0) / n
  const syy = points.reduce((s, p) => s + p[1] * p[1], 0) / n
  const sxy = points.reduce((s, p) => s + p[0] * p[1], 0) / n
  const deg = (0.5 * Math.atan2(2 * sxy, sxx - syy) * 180) / Math.PI
  return deg < 0 ? deg + 180 : deg
}
