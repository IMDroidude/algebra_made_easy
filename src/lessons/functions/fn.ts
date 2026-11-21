/**
 * Pure maths for the functions lesson: a rule f(x) = m·x + b, its outputs,
 * and the text that describes it. No React here.
 */
import { approxEqual, isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { fmt } from '../../lib/format'

export type Rule = { m: number; b: number }

export const RULE_2X_PLUS_1: Rule = { m: 2, b: 1 }

/** f(x) = m·x + b */
export function apply(r: Rule, x: number): number {
  return r.m * x + r.b
}

/** Every input with its output, as points (x, f(x)). */
export function points(r: Rule, xs: readonly number[]): Vec2[] {
  return xs.map((x) => [x, apply(r, x)])
}

/** Whole numbers from `from` up to and including `to`. */
export function range(from: number, to: number): number[] {
  const out: number[] = []
  for (let x = from; x <= to; x++) out.push(x)
  return out
}

const minus = (s: string) => s.replace('-', '−')

/** "2x + 1", "x − 3", "−0.5x", "4", "3x". Real minus signs, for prose. */
export function ruleText(r: Rule, v = 'x'): string {
  const term = approxEqual(r.m, 1) ? v : approxEqual(r.m, -1) ? `−${v}` : `${minus(fmt(r.m))}${v}`
  if (isZero(r.m)) return minus(fmt(r.b))
  if (isZero(r.b)) return term
  return `${term} ${r.b < 0 ? '−' : '+'} ${fmt(Math.abs(r.b))}`
}

/** The same, for KaTeX. */
export function ruleTex(r: Rule, v = 'x'): string {
  return ruleText(r, v).replaceAll('−', '-')
}

/** The rule as a NumPy expression on an array `v`: "2 * x + 1", "0.5 * x - 0.5", "0 * x + 4". */
export function numpyExpr(r: Rule, v = 'x'): string {
  const head = `${fmt(r.m)} * ${v}`
  if (isZero(r.b)) return head
  return `${head} ${r.b < 0 ? '-' : '+'} ${fmt(Math.abs(r.b))}`
}

/** A NumPy literal for a list of inputs: "np.array([1, 1.5, 2, 3])". */
export function numpyArray(xs: readonly number[]): string {
  return `np.array([${xs.map((x) => fmt(x)).join(', ')}])`
}

/**
 * Half-width of a square plane that shows every point, with a margin: at least
 * 5, at most `max`.
 */
export function extentFor(pts: readonly Vec2[], max = 12): number {
  const reach = Math.max(0, ...pts.flat().map(Math.abs))
  return Math.min(max, Math.max(5, Math.ceil(reach) + 1))
}

/** Keeps a list of fed-in inputs free of repeats; the newest goes last. */
export function feed(xs: readonly number[], x: number): number[] {
  return [...xs.filter((q) => !approxEqual(q, x)), x]
}

/** Error of each prediction: prediction minus the true value. */
export function errors(r: Rule, xs: readonly number[], ys: readonly number[]): number[] {
  return xs.map((x, i) => apply(r, x) - ys[i])
}

/** Practice checks, each from the live rule. */
export const CHECKS: Record<string, (r: Rule) => boolean> = {
  pair: (r) => approxEqual(apply(r, 2), 7) && approxEqual(apply(r, 4), 11),
  start: (r) => approxEqual(apply(r, 0), -2) && approxEqual(apply(r, 1), 1),
  flat: (r) => isZero(r.m) && approxEqual(r.b, 4),
  undo: (r) => approxEqual(apply(r, 7), 3) && approxEqual(apply(r, 1), 0),
}

export function solvedChecks(r: Rule): string[] {
  return Object.keys(CHECKS).filter((id) => CHECKS[id](r))
}
