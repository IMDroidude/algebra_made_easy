import { dot, inverse2, isZero, matVec, scale, sub, add, approxEqual } from '../../linalg'
import { fmt } from '../../lib/format'
import { mean2 } from '../../linalg/eigen'
import { outer2 } from '../../linalg/systems'
import type { Mat2, Vec2 } from '../../linalg'

/**
 * The maths of the lesson: a two-class linear classifier learned from the
 * centres of the two groups. Plain functions on numbers; the components only
 * draw what these return.
 */

/** One labelled training example. Same shape as the shared emails. */
export type Example = { name: string; kind: 'normal' | 'spam'; at: Vec2 }

export const pointsOf = (data: readonly Example[], kind: Example['kind']): Vec2[] =>
  data.filter((e) => e.kind === kind).map((e) => e.at)

/** The centre (mean vector) of each group: the average, coordinate by coordinate. */
export function centres(data: readonly Example[]): { normal: Vec2; spam: Vec2 } {
  return { normal: mean2(pointsOf(data, 'normal')), spam: mean2(pointsOf(data, 'spam')) }
}

/** Column sums of a group, i.e. 1ᵀ X_group: what the matrix form of the mean adds up before dividing. */
export function columnSums(points: readonly Vec2[]): Vec2 {
  return points.reduce<Vec2>((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0])
}

/**
 * Within-class scatter: the sum, over every example, of the outer product of
 * its deviation from its own group's centre with itself.
 */
export function withinScatter(data: readonly Example[]): Mat2 {
  const c = centres(data)
  let s: Mat2 = [
    [0, 0],
    [0, 0],
  ]
  for (const e of data) {
    const dev = sub(e.at, c[e.kind])
    const o = outer2(dev, dev)
    s = [
      [s[0][0] + o[0][0], s[0][1] + o[0][1]],
      [s[1][0] + o[1][0], s[1][1] + o[1][1]],
    ]
  }
  return s
}

/** Fisher's direction S_w⁻¹ (μ_spam − μ_normal). Null when S_w cannot be inverted. */
export function fisherDirection(data: readonly Example[]): Vec2 | null {
  const inv = inverse2(withinScatter(data))
  if (!inv) return null
  const c = centres(data)
  return matVec(inv, sub(c.spam, c.normal)) as Vec2
}

/**
 * Scales a direction so its largest entry (by size) is 1. Scaling never
 * changes where an arrow points, so (3, 3) and (0.75, 0.75) both become (1, 1).
 */
export function tidy(v: Vec2): Vec2 {
  const m = Math.max(Math.abs(v[0]), Math.abs(v[1]))
  return isZero(m) ? v : scale(v, 1 / m)
}

/** A linear classifier: spam when w · x > b. */
export type Model = {
  centres: { normal: Vec2; spam: Vec2 }
  /** μ_spam − μ_normal */
  difference: Vec2
  /** the direction used for scoring */
  w: Vec2
  /** halfway between the centres */
  midpoint: Vec2
  /** the threshold, w · midpoint */
  b: number
}

/**
 * The lesson's recipe: centres, their difference (tidied so the largest entry
 * is 1), the midpoint, and the threshold b = w · midpoint. Null when the two
 * centres coincide, because then there is no direction to learn.
 */
export function learn(data: readonly Example[], direction: 'difference' | 'fisher' = 'difference'): Model | null {
  const c = centres(data)
  const difference = sub(c.spam, c.normal)
  if (isZero(Math.hypot(difference[0], difference[1]))) return null
  const raw = direction === 'fisher' ? fisherDirection(data) : difference
  if (!raw) return null
  const w = tidy(raw)
  const midpoint = scale(add(c.normal, c.spam), 0.5)
  return { centres: c, difference, w, midpoint, b: dot(w, midpoint) }
}

export const score = (w: Vec2, x: Vec2): number => dot(w, x)

/** Which side of the line w · x = b a point is on. Exactly on the line counts as normal (not above the threshold). */
export function verdict(w: Vec2, b: number, x: Vec2): 'normal' | 'spam' | 'on the line' {
  const s = score(w, x)
  if (approxEqual(s, b)) return 'on the line'
  return s > b ? 'spam' : 'normal'
}

/** The predicted group: anything not above the threshold is normal. */
export const predictKind = (w: Vec2, b: number, x: Vec2): Example['kind'] =>
  verdict(w, b, x) === 'spam' ? 'spam' : 'normal'

/** Training examples the model gets wrong. */
export function mistakes(model: Pick<Model, 'w' | 'b'>, data: readonly Example[]): Example[] {
  return data.filter((e) => predictKind(model.w, model.b, e.at) !== e.kind)
}

/** Two points on the line w · x = b, far enough apart to draw it across any plane. */
export function linePoints(w: Vec2, b: number): [Vec2, Vec2] {
  const nn = dot(w, w)
  const foot = scale(w, b / nn)
  const along: Vec2 = [-w[1], w[0]]
  return [foot, add(foot, along)]
}

/** The part of a box where w · x > b (`side` = 'spam') or w · x ≤ b, as a polygon. */
export function halfPlaneInBox(w: Vec2, b: number, x: [number, number], y: [number, number], side: 'spam' | 'normal'): Vec2[] {
  const box: Vec2[] = [
    [x[0], y[0]],
    [x[1], y[0]],
    [x[1], y[1]],
    [x[0], y[1]],
  ]
  const sign = side === 'spam' ? 1 : -1
  const f = (p: Vec2) => sign * (dot(w, p) - b)
  const out: Vec2[] = []
  for (let i = 0; i < box.length; i++) {
    const p = box[i]
    const q = box[(i + 1) % box.length]
    const fp = f(p)
    const fq = f(q)
    if (fp >= 0) out.push(p)
    if ((fp >= 0) !== (fq >= 0)) {
      const t = fp / (fp - fq)
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])])
    }
  }
  return out
}

/** The foot of the perpendicular from x onto the line through the origin along w. */
export function projectOntoDirection(x: Vec2, w: Vec2): Vec2 {
  return scale(w, dot(x, w) / dot(w, w))
}

/** Same line? w · x = b and w′ · x = b′ describe one line when one pair is a multiple of the other. */
export function sameLine(a: Pick<Model, 'w' | 'b'>, b: Pick<Model, 'w' | 'b'>): boolean {
  const cross = a.w[0] * b.w[1] - a.w[1] * b.w[0]
  if (!isZero(cross)) return false
  const k = Math.abs(a.w[0]) > Math.abs(a.w[1]) ? b.w[0] / a.w[0] : b.w[1] / a.w[1]
  return approxEqual(a.b * k, b.b)
}

/** Whether two data sets hold the same points in the same order. */
export function sameData(a: readonly Example[], b: readonly Example[]): boolean {
  return a.length === b.length && a.every((e, i) => approxEqual(e.at[0], b[i].at[0]) && approxEqual(e.at[1], b[i].at[1]))
}

/** The line w · x = b written for people: "x + y = 5", "x + 9y = 22", "0.92x + y = 4.6". */
export function lineText(w: Vec2, b: number): string {
  const term = (c: number, v: string) => (approxEqual(c, 1) ? v : approxEqual(c, -1) ? `−${v}` : `${fmt(c)}${v}`)
  const parts: string[] = []
  if (!isZero(w[0])) parts.push(term(w[0], 'x'))
  if (!isZero(w[1])) {
    const t = term(Math.abs(w[1]), 'y')
    parts.push(parts.length === 0 ? term(w[1], 'y') : `${w[1] < 0 ? '−' : '+'} ${t}`)
  }
  return `${parts.join(' ')} = ${fmt(b)}`.replace(/-/g, '−')
}

/** Counts are whole numbers and never negative. */
export const snapCount = ([x, y]: Vec2): Vec2 => [Math.max(0, Math.round(x)), Math.max(0, Math.round(y))]

/** Moves one example to a new place, keeping the others. */
export const moveEmail = (data: readonly Example[], i: number, at: Vec2): Example[] =>
  data.map((e, j) => (j === i ? { ...e, at } : e))
