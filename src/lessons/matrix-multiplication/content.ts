/**
 * The fixed examples of this lesson and the NumPy code it shows, kept out of
 * the components so the unit tests can check every number against real NumPy.
 */
import { fmt, isInteger, numpyMat2, numpyPrint } from '../../lib/format'
import {
  IDENTITY2,
  apply2,
  approxEqual,
  approxEqualVec,
  isZero,
  lerp2,
  mul2,
} from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'
import { relu } from '../../linalg/projection'

/** An "F" shape: asymmetric, so flips and turns are easy to see. */
export const SHAPE: Vec2[] = [
  [0, 0],
  [0, 2],
  [1.5, 2],
  [1.5, 1.5],
  [0.5, 1.5],
  [0.5, 1.25],
  [1, 1.25],
  [1, 0.75],
  [0.5, 0.75],
  [0.5, 0],
]

export const QUARTER_TURN: Mat2 = [
  [0, -1],
  [1, 0],
]

/** Step 1: stretch sideways (B), then turn a quarter (A). */
export const SEE_B: Mat2 = [
  [2, 0],
  [0, 1],
]
export const SEE_A: Mat2 = QUARTER_TURN

/** Step 2 starts from a quarter turn A and a shear B. */
export const START_A: Mat2 = QUARTER_TURN
export const START_B: Mat2 = [
  [1, 1],
  [0, 1],
]

/** Step 3: a quarter turn and a top-to-bottom mirror; AB and BA are different mirrors. */
export const PREDICT_A: Mat2 = QUARTER_TURN
export const PREDICT_B: Mat2 = [
  [1, 0],
  [0, -1],
]

/**
 * The matrix that has been applied after a fraction t of "first, then second":
 * the first half of t blends in `first`, the second half blends in `second`
 * on top of it. At t = 1 this is second · first.
 */
export function staged(first: Mat2, second: Mat2, t: number): Mat2 {
  const s1 = Math.min(1, 2 * t)
  const s2 = Math.max(0, 2 * t - 1)
  return mul2(lerp2(IDENTITY2, second, s2), lerp2(IDENTITY2, first, s1))
}

/** Wraps negative numbers in brackets so products read correctly: 2 · (−1). */
export const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

/** A 2×2 matrix in LaTeX; `style(r, c, text)` can decorate single entries. */
export function texMat(m: Mat2, style: (r: number, c: number, s: string) => string = (_r, _c, s) => s) {
  const cell = (r: number, c: number) => style(r, c, fmt(m[r][c]))
  return String.raw`\begin{bmatrix} ${cell(0, 0)} & ${cell(0, 1)} \\ ${cell(1, 0)} & ${cell(1, 1)} \end{bmatrix}`
}

/** Step 4's NumPy code for the learner's own A and B, and what it prints. */
export function productSnippet(A: Mat2, B: Mat2) {
  const integer = isInteger(...A.flat(), ...B.flat())
  const code = [
    'import numpy as np',
    '',
    numpyMat2('A', A),
    numpyMat2('B', B),
    '',
    'print(A @ B)   # B first, then A',
    'print(B @ A)   # A first, then B',
  ].join('\n')
  const output = [numpyPrint(mul2(A, B), integer), numpyPrint(mul2(B, A), integer)].join('\n')
  return { code, output }
}

/* ---------- Step 5: two layers ---------- */

/** Four data points, one per row, as they would sit in a dataset. */
export const LAYER_X: Vec2[] = [
  [2, 1],
  [-1, 2],
  [-2, -1],
  [1, -2],
]

export const START_W1: Mat2 = [
  [1, 1],
  [-1, 1],
]
export const START_W2: Mat2 = [
  [1, -0.5],
  [0.5, 1],
]

/** Runs the two-layer network on one point, with or without a ReLU in between. */
export function network(W1: Mat2, W2: Mat2, x: Vec2, withRelu: boolean) {
  const pre = apply2(W1, x)
  const h = withRelu ? relu(pre) : pre
  return { h, y: apply2(W2, h) }
}

/**
 * The plane's grid lines after passing through the network, as polylines. Without
 * the ReLU each line stays straight; with it, lines bend where a hidden value
 * crosses 0. Those bend points are included exactly, so the corners are sharp.
 */
export function networkGrid(W1: Mat2, W2: Mat2, withRelu: boolean, extent = 6, step = 1): Vec2[][] {
  const lines: Vec2[][] = []
  const samples = (p0: Vec2, dir: Vec2) => {
    const ts = new Set<number>([-extent, extent])
    if (withRelu) {
      const a = apply2(W1, p0)
      const b = apply2(W1, dir)
      for (const i of [0, 1]) {
        if (isZero(b[i])) continue
        const t = -a[i] / b[i]
        if (t > -extent && t < extent) ts.add(t)
      }
    }
    return [...ts]
      .sort((m, n) => m - n)
      .map((t) => network(W1, W2, [p0[0] + t * dir[0], p0[1] + t * dir[1]], withRelu).y)
  }
  for (let k = -extent; k <= extent; k += step) {
    lines.push(samples([k, 0], [0, 1]), samples([0, k], [1, 0]))
  }
  return lines
}

/** Step 5's NumPy code and exactly what it prints. */
export function layerSnippet(W1: Mat2, W2: Mat2, withRelu: boolean) {
  const integer = isInteger(...W1.flat(), ...W2.flat(), ...LAYER_X.flat())
  const Y = LAYER_X.map((x) => network(W1, W2, x, withRelu).y)
  const W = mul2(W2, W1)
  const collapsed = LAYER_X.map((x) => apply2(W, x))
  const same = approxEqualVec(Y.flat(), collapsed.flat())
  const rows = LAYER_X.map((q) => `[${fmt(q[0])}, ${fmt(q[1])}]`).join(',\n              ')
  const code = [
    'import numpy as np',
    '',
    numpyMat2('W1', W1),
    numpyMat2('W2', W2),
    '# one data point per row',
    `X = np.array([${rows}])`,
    '',
    withRelu ? 'H = np.maximum(0, X @ W1.T)   # layer 1, then ReLU' : 'H = X @ W1.T                  # layer 1',
    'Y = H @ W2.T                  # layer 2',
    'W = W2 @ W1                   # both layers as one matrix',
    '',
    'print(Y)',
    'print(np.allclose(Y, X @ W.T))',
  ].join('\n')
  const output = `${numpyPrint(Y, integer)}\n${same ? 'True' : 'False'}`
  return { code, output, Y, W, collapsed, same }
}

/* ---------- Step 6: practice ---------- */

/** A fixed matrix not used elsewhere: twice as wide, half as tall. */
export const PRACTICE_A: Mat2 = [
  [2, 0],
  [0, 0.5],
]

const matches = (m: Mat2, target: Mat2) => approxEqualVec(m.flat(), target.flat())

export const PRACTICE_CHECKS: Record<string, (B: Mat2) => boolean> = {
  undo: (B) => matches(mul2(PRACTICE_A, B), IDENTITY2),
  turn: (B) => matches(mul2(PRACTICE_A, B), QUARTER_TURN),
  commute: (B) => {
    const scalarMultipleOfI = isZero(B[0][1]) && isZero(B[1][0]) && approxEqual(B[0][0], B[1][1])
    return !scalarMultipleOfI && matches(mul2(PRACTICE_A, B), mul2(B, PRACTICE_A))
  },
}
