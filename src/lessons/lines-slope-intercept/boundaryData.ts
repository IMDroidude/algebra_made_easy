/**
 * Labelled data for the "line that splits the plane" parts of lesson 2.3, and
 * the NumPy code that classifies it. Outputs are computed here so the picture,
 * the readout and the printed output always agree.
 */
import { npArray } from '../../lib/numpy'
import { fmt } from '../../lib/format'
import { boundaryScore, isAbove, misclassified, npBoolArray, pyFloat } from './lineMath'
import type { Labelled } from './lineMath'

/** Class A (above the line) and class B. Each also has its own marker and letter, so colour is not the only cue. */
export const CLASS_COLOR = { a: '#d6336c', b: '#a67c00' } as const

/**
 * Ten made-up fruits measured two ways, both scored 0 to 8: size (x) and
 * sweetness (y). Apples are class A (above the line), lemons class B. No flat
 * line separates them: a big lemon can be as sweet as a small apple.
 */
export const FRUIT: Labelled[] = [
  { name: 'A1', at: [1, 4], a: true },
  { name: 'A2', at: [2, 6], a: true },
  { name: 'A3', at: [4, 5], a: true },
  { name: 'A4', at: [5, 7], a: true },
  { name: 'A5', at: [6, 7], a: true },
  { name: 'L1', at: [2, 1], a: false },
  { name: 'L2', at: [3, 3], a: false },
  { name: 'L3', at: [4, 2], a: false },
  { name: 'L4', at: [6, 4], a: false },
  { name: 'L5', at: [7, 5], a: false },
]

/** The fruit plane shows 0…8 on both axes. */
export const FRUIT_RANGE: [number, number] = [0, 8]

/** The fruit line starts flat at y = 4.5: two fruits are on the wrong side. */
export const FRUIT_START = { m: 0, b: 4.5 }

/**
 * The practice step's "Two groups" set, in −5…5. A is above, B below. Not
 * separable by a flat line; the slope has to be negative.
 */
export const GROUPS: Labelled[] = [
  { name: 'A1', at: [-4, 3], a: true },
  { name: 'A2', at: [-2, 2], a: true },
  { name: 'A3', at: [0, 2], a: true },
  { name: 'A4', at: [2, 1], a: true },
  { name: 'A5', at: [4, 0], a: true },
  { name: 'B1', at: [-4, 1], a: false },
  { name: 'B2', at: [-2, -1], a: false },
  { name: 'B3', at: [0, -2], a: false },
  { name: 'B4', at: [2, -2], a: false },
  { name: 'B5', at: [3, -3], a: false },
]

/** Turns a slider value into a Python float literal: 4.5 → "4.5", 0 → "0.0". */
const lit = (x: number) => pyFloat(Number(fmt(x)))

/** `X = np.array([[1, 4], [2, 6], …])`, wrapped five rows to a line. */
function matrixLiteral(points: readonly Labelled[], comment: string): string[] {
  const head = 'X = np.array(['
  const pad = ' '.repeat(head.length)
  const rows = points.map((p) => `[${p.at.join(', ')}]`)
  const lines: string[] = []
  for (let k = 0; k < rows.length; k += 5) lines.push(rows.slice(k, k + 5).join(', '))
  return [`# ${comment}`, `${head}${lines.join(`,\n${pad}`)}])`]
}

const labels = (points: readonly Labelled[]) => `np.array([${points.map((p) => (p.a ? 1 : 0)).join(', ')}])`

/** The Apply-section snippet: scores, predictions and the number of mistakes. */
export function fruitCode(m: number, b: number): string {
  return [
    'import numpy as np',
    '',
    ...matrixLiteral(FRUIT, 'one fruit per row: size, sweetness'),
    `is_apple = ${labels(FRUIT)}`,
    '',
    `m, b = ${lit(m)}, ${lit(b)}`,
    'score = X[:, 1] - (m * X[:, 0] + b)   # height above the line',
    'pred = score > 0                      # True means "apple"',
    'print(score)',
    'print(pred)',
    'print(np.sum(pred != is_apple), "on the wrong side")',
  ].join('\n')
}

export function fruitOutput(m: number, b: number): string {
  const scores = FRUIT.map((p) => boundaryScore(m, b, p.at))
  const pred = FRUIT.map((p) => isAbove(m, b, p.at))
  return [npArray(scores), npBoolArray(pred), `${misclassified(m, b, FRUIT).length} on the wrong side`].join('\n')
}

/** The practice snippet for the "Two groups" set: just the number of mistakes. */
export function groupsCode(m: number, b: number): string {
  return [
    'import numpy as np',
    '',
    ...matrixLiteral(GROUPS, 'one point per row: two features'),
    `is_a = ${labels(GROUPS)}`,
    `m, b = ${lit(m)}, ${lit(b)}`,
    '',
    'score = X[:, 1] - (m * X[:, 0] + b)',
    'print(np.sum((score > 0) != is_a))   # mistakes',
  ].join('\n')
}

export function groupsOutput(m: number, b: number): string {
  return String(misclassified(m, b, GROUPS).length)
}
