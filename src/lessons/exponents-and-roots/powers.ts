/**
 * The maths behind lesson 2.4 (exponents and roots). Plain functions on
 * numbers; no React. Kept inside the lesson folder because nothing else needs
 * it yet.
 */
import { isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'

/** x² = x · x. Same operation as Python's `x ** 2`, which NumPy and Python compute as x * x. */
export function square(x: number): number {
  return x * x
}

/**
 * The square root, which is always the non-negative root: √9 = 3, not −3.
 * `null` for negative numbers, because no real number squares to a negative.
 */
export function sqrtNonNeg(x: number): number | null {
  if (x < 0 && !isZero(x)) return null
  return Math.sqrt(Math.max(0, x))
}

/** 2 to the power x. */
export function pow2(x: number): number {
  return 2 ** x
}

/** Corners of the square with one corner at the origin and the given side length. */
export function squareFromOrigin(side: number): Vec2[] {
  return [
    [0, 0],
    [side, 0],
    [side, side],
    [0, side],
  ]
}

/**
 * A square standing on a vertical gap at x, from height `from` to `to`, drawn
 * to the right of the gap. Its area is the gap squared.
 */
export function gapSquare(x: number, from: number, to: number): Vec2[] {
  const side = Math.abs(to - from)
  return [
    [x, from],
    [x, to],
    [x + side, to],
    [x + side, from],
  ]
}

/**
 * Straight-line distance between a and b: √(Δx² + Δy²). Computed in the
 * same order as NumPy's `np.sqrt(np.sum((a - b) ** 2))`.
 */
export function distance(a: Vec2, b: Vec2): number {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * The right triangle from A to B (across first, then up or down) and the
 * squares on its two legs, drawn on the outside of the triangle.
 */
export function legSquares(
  a: Vec2,
  b: Vec2,
): { corner: Vec2; dx: number; dy: number; across: Vec2[]; upDown: Vec2[] } {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const corner: Vec2 = [b[0], a[1]]
  const sx = Math.abs(dx)
  const sy = Math.abs(dy)
  // The across-square hangs on the far side of the horizontal leg from B.
  const away = dy >= 0 ? -1 : 1
  const across: Vec2[] = [a, corner, [corner[0], corner[1] + away * sx], [a[0], a[1] + away * sx]]
  // The up-down square sits on the far side of the vertical leg from A.
  const out = dx >= 0 ? 1 : -1
  const upDown: Vec2[] = [corner, b, [b[0] + out * sy, b[1]], [corner[0] + out * sy, corner[1]]]
  return { corner, dx, dy, across, upDown }
}

/** Mean of the squared errors (MSE). Sums left to right, like NumPy for short arrays. */
export function meanSquaredError(errors: readonly number[]): number {
  let total = 0
  for (const e of errors) total += e * e
  return total / errors.length
}

/** Mean of the absolute errors (MAE). */
export function meanAbsoluteError(errors: readonly number[]): number {
  let total = 0
  for (const e of errors) total += Math.abs(e)
  return total / errors.length
}

/** The share of the total that the largest entry contributes, from 0 to 1. */
export function largestShare(values: readonly number[]): number {
  const total = values.reduce((s, v) => s + v, 0)
  if (isZero(total)) return 0
  return Math.max(...values) / total
}

/** Rounds to the nearest multiple of `step`, and never returns −0. */
export function snapToStep(x: number, step: number): number {
  return Math.round(x / step) * step + 0
}

/** Linear interpolation from a to b as t runs from 0 to 1. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * How Python (and NumPy 2, via `print`) writes a float: the shortest text
 * that reads back as the same number, always with a decimal point. Valid for
 * the range these lessons use (1e-4 ≤ |x| < 1e16, or 0).
 */
export function pyFloat(x: number): string {
  if (Object.is(x, -0)) return '-0.0'
  return Number.isInteger(x) ? `${x}.0` : String(x)
}

/**
 * Constraint for a draggable square corner: keeps it on the diagonal y = x,
 * snapped to `step`, with a side from 0 to `max`.
 */
export function diagonalSnap(step: number, max: number) {
  return ([x, y]: Vec2): Vec2 => {
    const s = Math.min(max, Math.max(0, snapToStep((x + y) / 2, step)))
    return [s, s]
  }
}

/** The square of side `side` moved so its lower-left corner is at `at`. */
export function squareAt(at: Vec2, side: number): Vec2[] {
  return squareFromOrigin(side).map(([x, y]): Vec2 => [x + at[0], y + at[1]])
}
