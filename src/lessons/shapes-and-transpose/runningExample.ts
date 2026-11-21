/**
 * The running example for this lesson: the house matrix X (8 × 3) times a
 * weight vector, times a layer W.T, and the error you get with W instead.
 * Plain functions only, so the unit tests can check every number shown.
 */
import { HOUSES, featureMatrix, featureVector, housesNumpy } from '../../data/houses'
import type { House } from '../../data/houses'
import { fmt } from '../../lib/format'
import { npArray } from '../../lib/numpy'
import { matMul, matVec, transpose } from '../../linalg'
import type { Matrix, Vec } from '../../linalg'
import { checkMatmul } from './shapes'
import type { MatmulCheck, Shape } from './shapes'

/** One weight per feature: $k per sqft, per bedroom, per km. */
export const WEIGHTS: Vec = [0.2, 15, -6]
/** The base price added to every house, in $k. */
export const BASE = 60
/** A layer with 2 outputs: a price score, and the area in m². Stored as (outputs, inputs). */
export const LAYER: Matrix = [
  [0.2, 15, -6],
  [0.0929, 0, 0],
]

export const X_SHAPE: Shape = [HOUSES.length, 3]

/** Predicted price of one house: w · x + 60. */
export const predicted = (h: House) => matVec([WEIGHTS], featureVector(h))[0] + BASE

export type Choice = 'w' | 'WT' | 'W'

export const CHOICES: { id: Choice; label: string; expr: string; shape: string }[] = [
  { id: 'w', label: 'X @ w', expr: 'X @ w', shape: '(3,)' },
  { id: 'WT', label: 'X @ W.T', expr: 'X @ W.T', shape: '(3, 2)' },
  { id: 'W', label: 'X @ W', expr: 'X @ W', shape: '(2, 3)' },
]

/** What the shape checker says for each choice, in words. */
export function shapeCheck(choice: Choice): { check: MatmulCheck | null; text: string } {
  if (choice === 'w') {
    return {
      check: null,
      text: '(8, 3) @ (3,): the 3s match, so the result has shape (8,): one number per house.',
    }
  }
  const right: Shape = choice === 'WT' ? [3, 2] : [2, 3]
  const check = checkMatmul(X_SHAPE, right)
  return {
    check,
    text: check.ok
      ? '(8, 3) @ (3, 2): the 3s match, so the result has shape (8, 2): two numbers per house.'
      : '(8, 3) @ (2, 3): 3 columns meet 2 rows. The inner sizes differ, so NumPy refuses.',
  }
}

export const xLiteral = () =>
  housesNumpy()
    .split('\n')
    .filter((l) => !l.startsWith('y ='))
    .join('\n')

export function houseSnippet(choice: Choice): { code: string; output: string } {
  const X = featureMatrix()
  const head = ['import numpy as np', '', xLiteral(), '']
  if (choice === 'w') {
    const out = matVec(X, WEIGHTS).map((p) => p + BASE)
    return {
      code: [
        ...head,
        '# $k per sqft, per bedroom, per km',
        'w = np.array([0.2, 15, -6])',
        'print(X.shape, w.shape)',
        'print((X @ w).shape)',
        'print(X @ w + 60)   # price in $k, one per house',
      ].join('\n'),
      output: ['(8, 3) (3,)', '(8,)', npArray(out)].join('\n'),
    }
  }
  const layer = [
    'W = np.array([[0.2, 15, -6],     # output 1: price score',
    '              [0.0929, 0, 0]])   # output 2: area in m²',
    'print(W.shape)',
  ]
  if (choice === 'WT') {
    return {
      code: [...head, ...layer, 'print((X @ W.T).shape)', 'print(X @ W.T)'].join('\n'),
      output: ['(2, 3)', '(8, 2)', npArray(matMul(X, transpose(LAYER)))].join('\n'),
    }
  }
  const check = checkMatmul(X_SHAPE, [2, 3])
  return {
    code: [...head, ...layer, 'print(X @ W)'].join('\n'),
    output: ['(2, 3)', `ValueError: ${check.ok ? '' : check.error}`].join('\n'),
  }
}

export const priceText = (h: House) => fmt(predicted(h), 2)
