import { isInteger } from '../../lib/format'
import { fitLine, normalEquations, predict } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'
// Shared NumPy print replica (see the note in that file).
import { pyLiteral as lit } from '../../lib/numpy'
import { npArray, npFloat, npRound } from '../../lib/numpy'

/** Steps 1, 2 and 4: six points; symmetric x values keep the first numbers simple. */
export const DATA: Vec2[] = [
  [-4, -2.5],
  [-2, -0.5],
  [-1, -1],
  [1, 1],
  [2, 0.5],
  [4, 3],
]

/** Step 3: five points exactly on y = 0.5x; the last one is then dragged down. */
export const PREDICT_DATA: Vec2[] = [
  [-4, -2],
  [-2, -1],
  [0, 0],
  [2, 1],
  [4, 2],
]
export const PREDICT_FROM: Vec2 = [4, 2]
export const PREDICT_TO: Vec2 = [4, -3]

/** Step 4 projection picture: the x column and y column of a two-point dataset. */
export const PROJ_X: Vec2 = [2, 1]
export const PROJ_Y: Vec2 = [3, 4]

/** Step 5: training data for the model ŷ = w·x + b, and the input to predict for. */
export const TRAIN: Vec2[] = [
  [-4, -3],
  [-3, -1.5],
  [-1, -1],
  [0, 0.5],
  [2, 1],
  [3, 2.5],
]
export const X_NEW = 2.5

/** Step 6: a dataset not used anywhere else in the lesson. */
export const PRACTICE_DATA: Vec2[] = [
  [-3, 1],
  [-1, 2],
  [1, -1],
  [3, 0],
]

/** Snapping can produce -0; NumPy literals would show 0, so normalise first. */
export const tidy = (p: Vec2): Vec2 => [p[0] + 0, p[1] + 0]

function dataLines(points: Vec2[]): string[] {
  return [
    `x = np.array([${points.map((p) => lit(p[0])).join(', ')}])`,
    `y = np.array([${points.map((p) => lit(p[1])).join(', ')}])`,
    'X = np.column_stack([x, np.ones_like(x)])  # rows [x, 1]',
  ]
}

const tidyRound = (x: number) => npRound(x, 4) + 0

/** Step 4 NumPy: the normal equations built and solved, and lstsq agreeing. */
export function normalSnippet(points: Vec2[]): { code: string; output: string } {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const { XtX, Xty } = normalEquations(points)
  const fit = fitLine(points)
  const head = [
    'import numpy as np',
    '',
    ...dataLines(points),
    '',
    'XtX = X.T @ X',
    'Xty = X.T @ y',
    'print(XtX)',
    'print(Xty)',
  ]
  const shown = [npArray(XtX, isInteger(...xs)), npArray(Xty, isInteger(...xs, ...ys))]
  if (!fit) {
    return {
      code: [...head, '# every x is the same: XtX is singular,', '# so there is no single best line'].join('\n'),
      output: shown.join('\n'),
    }
  }
  const w = [tidyRound(fit.slope), tidyRound(fit.intercept)]
  return {
    code: [
      ...head,
      '',
      '# solve (XᵀX) w = Xᵀy; w = [slope, intercept]',
      'w = np.linalg.solve(XtX, Xty)',
      '# tidy float noise; + 0.0 turns -0. into 0.',
      'print(np.round(w, 4) + 0.0)',
      '',
      '# the library call that does all of this for you',
      'w2, *_ = np.linalg.lstsq(X, y)',
      'print(np.round(w2, 4) + 0.0)',
    ].join('\n'),
    output: [...shown, npArray(w), npArray(w)].join('\n'),
  }
}

/** Step 5 NumPy: train a linear regression with lstsq, then predict. */
export function regressionSnippet(points: Vec2[], xNew: number): { code: string; output: string } {
  const fit = fitLine(points)
  const head = ['import numpy as np', '', ...dataLines(points), '']
  if (!fit) {
    return {
      code: [...head, '# every x is the same: no single best line to train'].join('\n'),
      output: '',
    }
  }
  return {
    code: [
      ...head,
      '# train: find the weight w and bias b',
      '(w, b), *_ = np.linalg.lstsq(X, y)',
      '',
      '# predict for a new, unseen input',
      `x_new = ${lit(xNew)}`,
      'y_hat = w * x_new + b',
      'print(np.round(y_hat, 4) + 0.0)',
    ].join('\n'),
    output: npFloat(tidyRound(predict(fit, xNew))),
  }
}
