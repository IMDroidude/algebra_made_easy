import { fmt } from '../../lib/format'
import { snapTo } from '../../lib/snap'
import { approxEqual, isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'

/** The prediction: a point, and the same point with the sign of x flipped. */
export const PREDICT_FROM: Vec2 = [5, 3]
export const PREDICT_TO: Vec2 = [-5, 3]

/** The range of the sliders and of dragging in this lesson (Desmos uses the same ±10). */
export const LIMIT = 10

/** Whole numbers only, so a learner can land exactly on an axis or the origin. */
export const snapWhole = snapTo(1, LIMIT)

export type Region = 'origin' | 'x-axis' | 'y-axis' | 'I' | 'II' | 'III' | 'IV'

/** Which quadrant a point is in, or which axis it sits on. Quadrants are numbered counter-clockwise from the top right. */
export function regionOf([x, y]: Vec2): Region {
  const onX = isZero(y)
  const onY = isZero(x)
  if (onX && onY) return 'origin'
  if (onX) return 'x-axis'
  if (onY) return 'y-axis'
  if (x > 0) return y > 0 ? 'I' : 'IV'
  return y > 0 ? 'II' : 'III'
}

const SIGNS: Record<'I' | 'II' | 'III' | 'IV', string> = {
  I: 'x positive, y positive',
  II: 'x negative, y positive',
  III: 'x negative, y negative',
  IV: 'x positive, y negative',
}

/** Plain-English description of where a point is, for the live readout. */
export function describeRegion(p: Vec2): string {
  const r = regionOf(p)
  if (r === 'origin') return 'It is at the origin, where the axes cross.'
  if (r === 'x-axis') return 'It is on the x-axis (y is 0), so it is in no quadrant.'
  if (r === 'y-axis') return 'It is on the y-axis (x is 0), so it is in no quadrant.'
  return `It is in quadrant ${r}: ${SIGNS[r]}.`
}

/** The live label that rides on the point: its quadrant, or which axis it is on. */
export function pointTag(p: Vec2): string {
  const r = regionOf(p)
  if (r === 'origin') return 'origin'
  if (r === 'x-axis') return 'on the x-axis'
  if (r === 'y-axis') return 'on the y-axis'
  return `Quadrant ${r}`
}

/** One leg of the walk: "3 right (x)", or "0 left or right (x)" when there is nothing to walk. */
export function moveText(value: number, positive: string, negative: string, axis: string): string {
  if (isZero(value)) return `0 ${positive} or ${negative} (${axis})`
  return `${fmt(Math.abs(value))} ${value > 0 ? positive : negative} (${axis})`
}

/** How to reach the point from the origin: "Move 3 right (x), then 2 up (y)". */
export function walkSentence([x, y]: Vec2): string {
  return `Move ${moveText(x, 'right', 'left', 'x')}, then ${moveText(y, 'up', 'down', 'y')}`
}

/** "3 steps right", "2 steps down", "0 steps" — how to walk along one axis. */
export function walkText(value: number, positive: string, negative: string): string {
  if (isZero(value)) return `0 steps ${positive}`
  const n = Math.abs(value)
  return `${fmt(n)} step${approxEqual(n, 1) ? '' : 's'} ${value > 0 ? positive : negative}`
}

/** Removes −0, which dragging can produce and which would print as "-0." in NumPy. */
export const noNegZero = ([x, y]: Vec2): Vec2 => [x + 0, y + 0]

/**
 * How NumPy prints one element taken out of an array: integers as they are,
 * floats always with a decimal point (3.0, 2.5).
 */
export function numpyScalar(x: number, integerArray: boolean): string {
  if (integerArray) return fmt(x, 0)
  const text = fmt(x, 6)
  return text.includes('.') ? text : `${text}.0`
}
