/**
 * Pure maths for the balance-scale lesson. No React here.
 *
 * An equation is two sides, each of the form `x·(coefficient) + constant`.
 * Every equation in this lesson has one true value of x (the weight of one
 * mystery box), which the scale "knows" even though the learner does not.
 */
import { approxEqual, isZero } from '../../linalg'
import { fmt } from '../../lib/format'

export type Side = { x: number; k: number }
export type Equation = { left: Side; right: Side }
export type Op = 'add' | 'sub' | 'mul' | 'div'
export type Target = 'both' | 'left' | 'right'

export const eq = (lx: number, lk: number, rx: number, rk: number): Equation => ({
  left: { x: lx, k: lk },
  right: { x: rx, k: rk },
})

/** What a side weighs when every box weighs `x`. */
export function evalSide(s: Side, x: number): number {
  return s.x * x + s.k
}

function applyToSide(s: Side, op: Op, n: number): Side {
  switch (op) {
    case 'add':
      return { x: s.x, k: s.k + n }
    case 'sub':
      return { x: s.x, k: s.k - n }
    case 'mul':
      return { x: s.x * n, k: s.k * n }
    case 'div':
      return { x: s.x / n, k: s.k / n }
  }
}

/** Multiplying or dividing by 0 is not a usable move (÷0 is undefined, ×0 erases the equation). */
export function isAllowed(op: Op, n: number): boolean {
  return !((op === 'mul' || op === 'div') && isZero(n))
}

/** Applies one move to one or both sides. */
export function applyOp(e: Equation, op: Op, n: number, target: Target): Equation {
  if (!isAllowed(op, n)) return e
  return {
    left: target === 'right' ? e.left : applyToSide(e.left, op, n),
    right: target === 'left' ? e.right : applyToSide(e.right, op, n),
  }
}

export type Move = { op: Op; n: number; target: Target }

/** The equation after a list of moves; also every equation along the way (first is `start`). */
export function replay(start: Equation, moves: readonly Move[]): Equation[] {
  const out = [start]
  for (const m of moves) out.push(applyOp(out[out.length - 1], m.op, m.n, m.target))
  return out
}

/** The one value of x that makes the two sides weigh the same, or null if there is none. */
export function solve(e: Equation): number | null {
  const a = e.left.x - e.right.x
  if (isZero(a)) return null
  return (e.right.k - e.left.k) / a
}

/** Left weight minus right weight, given the true box weight. Positive: left is heavier. */
export function imbalance(e: Equation, xTrue: number): number {
  return evalSide(e.left, xTrue) - evalSide(e.right, xTrue)
}

export function isBalanced(e: Equation, xTrue: number): boolean {
  return isZero(imbalance(e, xTrue))
}

/** x stands alone on one side and a plain number on the other. Returns that number, or null. */
export function isolatedValue(e: Equation): number | null {
  const alone = (s: Side) => approxEqual(s.x, 1) && isZero(s.k)
  const plain = (s: Side) => isZero(s.x)
  if (alone(e.left) && plain(e.right)) return e.right.k
  if (alone(e.right) && plain(e.left)) return e.left.k
  return null
}

/** Solved means: x is alone, the number on the other side is right, and the scale is level. */
export function isSolved(e: Equation, xTrue: number): boolean {
  const v = isolatedValue(e)
  return v !== null && approxEqual(v, xTrue) && isBalanced(e, xTrue)
}

/**
 * Beam angle in degrees, clockwise on screen (so positive tips the right pan down).
 * By default any imbalance tips it visibly (at least 5°); `proportional` makes the
 * angle grow from 0 with the imbalance, so nearly-balanced looks nearly level.
 */
export function tiltDeg(diff: number, proportional = false, max = 14): number {
  if (isZero(diff)) return 0
  const size = Math.min(max, proportional ? Math.abs(diff) * 2.5 : 5 + Math.abs(diff) * 0.6)
  return diff > 0 ? -size : size
}

/** "3x + 5", "x − 3", "12", "0.5x", "−x". Uses a real minus sign. `v` names the unknown. */
export function sideText(s: Side, v = 'x'): string {
  const coef = (c: number) =>
    approxEqual(c, 1) ? v : approxEqual(c, -1) ? `−${v}` : `${fmt(c).replace('-', '−')}${v}`
  const hasX = !isZero(s.x)
  const hasK = !isZero(s.k)
  if (!hasX) return fmt(s.k).replace('-', '−')
  if (!hasK) return coef(s.x)
  return `${coef(s.x)} ${s.k < 0 ? '−' : '+'} ${fmt(Math.abs(s.k))}`
}

export function equationText(e: Equation, v = 'x'): string {
  return `${sideText(e.left, v)} = ${sideText(e.right, v)}`
}

/** The same, for KaTeX. */
export function equationTex(e: Equation, v = 'x'): string {
  return equationText(e, v).replaceAll('−', '-')
}

const VERB: Record<Op, [string, string]> = {
  add: ['Add', 'to'],
  sub: ['Subtract', 'from'],
  mul: ['Multiply', 'by'],
  div: ['Divide', 'by'],
}

/** "Subtract 5 from both sides", "Divide the left side only by 3". */
export function opLabel(op: Op, n: number, target: Target): string {
  const [verb, prep] = VERB[op]
  const where =
    target === 'both' ? 'both sides' : target === 'left' ? 'the left side only' : 'the right side only'
  const num = fmt(n).replace('-', '−')
  return op === 'mul' || op === 'div' ? `${verb} ${where} by ${num}` : `${verb} ${num} ${prep} ${where}`
}

/**
 * How a quantity is drawn on a pan. Whole positive numbers become tens and
 * ones, whole negative numbers become balloons pulling up, and anything else
 * is a single labelled block.
 */
export type Pieces =
  | { kind: 'blocks'; tens: number; ones: number }
  | { kind: 'balloons'; count: number }
  | { kind: 'label'; text: string }
  | { kind: 'none' }

export function constantPieces(k: number): Pieces {
  if (isZero(k)) return { kind: 'none' }
  const whole = Math.round(k)
  if (!approxEqual(k, whole) || Math.abs(whole) > 99) return { kind: 'label', text: fmt(k).replace('-', '−') }
  if (whole < 0) return whole >= -8 ? { kind: 'balloons', count: -whole } : { kind: 'label', text: `−${-whole}` }
  return { kind: 'blocks', tens: Math.floor(whole / 10), ones: whole % 10 }
}

/** Boxes of x: one box each for whole counts 1–8, otherwise one labelled box ("2.5x"). */
export function boxPieces(c: number, v = 'x'): { count: number } | { label: string } | null {
  if (isZero(c)) return null
  const whole = Math.round(c)
  if (approxEqual(c, whole) && whole >= 1 && whole <= 8) return { count: whole }
  return { label: sideText({ x: c, k: 0 }, v) }
}

/**
 * Applying `op n` undoes the last thing done to x in `ax + b = c` (right side
 * plain). These are the two moves of the standard recipe: undo +b, then undo ×a.
 */
export function recipe(e: Equation): { op: Op; n: number }[] {
  const moves: { op: Op; n: number }[] = []
  if (!isZero(e.left.k)) moves.push(e.left.k > 0 ? { op: 'sub', n: e.left.k } : { op: 'add', n: -e.left.k })
  if (!approxEqual(e.left.x, 1)) moves.push({ op: 'div', n: e.left.x })
  return moves
}

/** One step of gradient descent on (w·x − y)² / 2 for a one-weight model y = w·x. */
export function trainStep(w: number, x: number, y: number, lr: number): number {
  return w - lr * (w * x - y) * x
}

/**
 * The single weight w that makes w·x closest to y over several examples, in the
 * least-squares sense: w = Σxy / Σx². With one example it is the exact answer y / x.
 */
export function bestWeight(xs: readonly number[], ys: readonly number[]): number {
  const sxy = xs.reduce((s, x, i) => s + x * ys[i], 0)
  const sxx = xs.reduce((s, x) => s + x * x, 0)
  return sxy / sxx
}

/** w after `steps` training steps from `w0`. */
export function trainFrom(w0: number, steps: number, x: number, y: number, lr: number): number {
  let w = w0
  for (let i = 0; i < steps; i++) w = trainStep(w, x, y, lr)
  return w
}

/** How Python's print() shows a float: shortest round-trip digits, always with a decimal point. */
export function pyFloat(v: number): string {
  if (Number.isInteger(v) && Math.abs(v) < 1e16) return `${v}.0`
  return String(v)
}
