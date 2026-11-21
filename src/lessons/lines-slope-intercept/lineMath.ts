/**
 * The maths behind lesson 2.3 (lines). Plain functions on numbers; no React.
 * Kept inside the lesson folder because nothing else needs it yet.
 */
import { isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'

/** The height of the line y = mx + b at x. Same operation order as NumPy's `m * x + b`. */
export function lineY(m: number, b: number, x: number): number {
  return m * x + b
}

/**
 * Slope of the line through p and q: rise over run. `null` when the run is
 * zero, because a vertical line has no slope and is not of the form y = mx + b.
 */
export function slopeThrough(p: Vec2, q: Vec2): number | null {
  const run = q[0] - p[0]
  if (isZero(run)) return null
  return (q[1] - p[1]) / run
}

/** The intercept b of the line with slope m through p: b = y₁ − m·x₁. */
export function interceptThrough(p: Vec2, m: number): number {
  return p[1] - m * p[0]
}

/** Vertical distances from each point to the line, measured as y − (mx + b). */
export function residuals(m: number, b: number, points: readonly Vec2[]): number[] {
  return points.map(([x, y]) => y - lineY(m, b, x))
}

/**
 * Sum of squared vertical distances. Adds left to right, as NumPy's `np.sum`
 * does for arrays shorter than eight entries, so the printed result matches.
 */
export function sumSquaredError(m: number, b: number, points: readonly Vec2[]): number {
  let total = 0
  for (const r of residuals(m, b, points)) total += r * r
  return total
}

/** The line with the smallest possible sum of squared vertical distances (least squares). */
export function leastSquaresLine(points: readonly Vec2[]): { m: number; b: number } {
  const n = points.length
  const meanX = points.reduce((s, p) => s + p[0], 0) / n
  const meanY = points.reduce((s, p) => s + p[1], 0) / n
  let sxy = 0
  let sxx = 0
  for (const [x, y] of points) {
    sxy += (x - meanX) * (y - meanY)
    sxx += (x - meanX) ** 2
  }
  const m = sxy / sxx
  return { m, b: meanY - m * meanX }
}

/** Rounds to the nearest multiple of `step`, and never returns −0. */
export function snapToStep(x: number, step: number): number {
  return Math.round(x / step) * step + 0
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
 * The corners of a rise-over-run triangle on the line y = mx + b, starting at
 * x = x0 and stepping `run` to the right: start → corner is the run,
 * corner → end is the rise.
 */
export function riseRunTriangle(
  m: number,
  b: number,
  x0: number,
  run = 1,
): { start: Vec2; corner: Vec2; end: Vec2; rise: number } {
  const start: Vec2 = [x0, lineY(m, b, x0)]
  const end: Vec2 = [x0 + run, lineY(m, b, x0 + run)]
  return { start, corner: [end[0], start[1]], end, rise: end[1] - start[1] }
}

/** Linear interpolation from a to b as t runs from 0 to 1. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * The equation of a line as text, e.g. "y = 0.5x + 1", "y = -x - 2", "y = 3".
 * Numbers are rounded to two decimals for display. `x` and `y` name the variables.
 */
export function lineEquation(m: number, b: number, x = 'x', y = 'y', digits = 2): string {
  const mr = Number(m.toFixed(digits))
  const br = Number(b.toFixed(digits))
  const mPart = isZero(mr) ? '' : mr === 1 ? x : mr === -1 ? `-${x}` : `${mr}${x}`
  if (mPart === '') return `${y} = ${isZero(br) ? 0 : br}`
  if (isZero(br)) return `${y} = ${mPart}`
  return `${y} = ${mPart} ${br < 0 ? '-' : '+'} ${Math.abs(br)}`
}

/** Largest |value| divided by smallest non-zero |value|; NumPy prints in e-notation above 1000. */
export function magnitudeRatio(values: readonly number[]): number {
  const abs = values.map(Math.abs).filter((v) => !isZero(v))
  if (abs.length === 0) return 1
  return Math.max(...abs) / Math.min(...abs)
}

/**
 * A square drawn on a residual: one side is the vertical gap between the
 * point (x, y) and the line, so its area is that gap squared.
 */
export function residualSquare(m: number, b: number, [x, y]: Vec2): Vec2[] {
  const pred = lineY(m, b, x)
  const side = Math.abs(y - pred)
  return [
    [x, pred],
    [x, y],
    [x + side, y],
    [x + side, pred],
  ]
}

/**
 * How far the point (x₁, x₂) sits above the line x₂ = m·x₁ + b: positive above,
 * negative below, 0 on the line. Same operation order as the NumPy snippet's
 * `X[:, 1] - (m * X[:, 0] + b)`, so the printed scores match exactly.
 */
export function boundaryScore(m: number, b: number, [x1, x2]: Vec2): number {
  return x2 - lineY(m, b, x1)
}

/** The classifier's rule: strictly above the line means class A. On the line counts as not above. */
export function isAbove(m: number, b: number, p: Vec2): boolean {
  return boundaryScore(m, b, p) > 0
}

/** A labelled data point for the boundary sections: `a` true means class A. */
export type Labelled = { name: string; at: Vec2; a: boolean }

/** The points the line y = mx + b puts on the wrong side (class A must be above, class B below). */
export function misclassified(m: number, b: number, points: readonly Labelled[]): Labelled[] {
  return points.filter((p) => isAbove(m, b, p.at) !== p.a)
}

/**
 * The same rule written as a neuron: w·x + bias > 0. Moving everything in
 * x₂ − (m·x₁ + b) > 0 to one side gives the weights (−m, 1) and the bias −b.
 * `+ 0` turns −0 into 0 for display.
 */
export function neuronForm(m: number, b: number): { w: Vec2; bias: number } {
  return { w: [-m + 0, 1], bias: -b + 0 }
}

/**
 * What NumPy prints for a 1-D boolean array: each True is padded to the width
 * of False, so `[ True False  True]`.
 */
export function npBoolArray(values: readonly boolean[]): string {
  return `[${values.map((v) => (v ? ' True' : 'False')).join(' ')}]`
}

/**
 * The part of the rectangle xRange × yRange on one side of the line y = mx + b
 * (`above` true: y ≥ mx + b), as a polygon for shading. Empty when the line
 * misses that side of the rectangle entirely.
 */
export function halfPlaneInBox(
  m: number,
  b: number,
  xRange: readonly [number, number],
  yRange: readonly [number, number],
  above: boolean,
): Vec2[] {
  const [x0, x1] = xRange
  const [y0, y1] = yRange
  const box: Vec2[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]
  const side = (p: Vec2) => (above ? 1 : -1) * boundaryScore(m, b, p)
  const out: Vec2[] = []
  box.forEach((p, k) => {
    const q = box[(k + 1) % box.length]
    const sp = side(p)
    const sq = side(q)
    if (sp >= 0) out.push(p)
    if ((sp > 0 && sq < 0) || (sp < 0 && sq > 0)) {
      const t = sp / (sp - sq)
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t])
    }
  })
  return out.length >= 3 ? out : []
}

/**
 * The sum NumPy computes for a float array of up to 128 entries: a plain loop
 * below 8 entries, otherwise eight running lanes added pairwise
 * ((r0 + r1) + (r2 + r3)) + ((r4 + r5) + (r6 + r7)), then any leftovers. The
 * order matters for the last digit NumPy prints.
 */
export function npSum(values: readonly number[]): number {
  const n = values.length
  if (n < 8) {
    let total = 0
    for (const v of values) total += v
    return total
  }
  if (n > 128) throw new Error('npSum: only arrays of up to 128 entries are supported')
  const r = values.slice(0, 8)
  let i = 8
  for (; i < n - (n % 8); i += 8) for (let j = 0; j < 8; j++) r[j] += values[i + j]
  let total = r[0] + r[1] + (r[2] + r[3]) + (r[4] + r[5] + (r[6] + r[7]))
  for (; i < n; i++) total += values[i]
  return total
}

/** Mean of the absolute vertical misses |y − (mx + b)|, in NumPy's summation order. */
export function meanAbsMiss(m: number, b: number, points: readonly Vec2[]): number {
  return npSum(residuals(m, b, points).map(Math.abs)) / points.length
}
