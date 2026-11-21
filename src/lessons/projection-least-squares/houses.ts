import { Matrix, solve } from 'ml-matrix'
import { HOUSES, featureMatrix, housesNumpy, prices } from '../../data/houses'
import { npArray, npFloat, npRound } from '../../lib/numpy'
import { fitLine, sumSquaredResiduals } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'

/**
 * The running example for this lesson: multiple linear regression on the
 * shared houses. Price from all three features plus a bias, by least squares.
 */

/** X with a column of 1s appended, so the last weight is the bias. */
export const HOUSE_A: number[][] = featureMatrix().map((row) => [...row, 1])
const y = prices()

/** Least-squares weights [sqft, bedrooms, distance, bias] (QR solve, like lstsq). */
export const HOUSE_WEIGHTS: number[] = solve(new Matrix(HOUSE_A), Matrix.columnVector(y)).to1DArray()

/** Predicted price for each house. */
export const HOUSE_PRED: number[] = HOUSE_A.map((row) => row.reduce((s, x, j) => s + x * HOUSE_WEIGHTS[j], 0))

/** Actual minus predicted, per house. */
export const HOUSE_RESID: number[] = y.map((p, i) => p - HOUSE_PRED[i])

export const HOUSE_SSE = HOUSE_RESID.reduce((s, r) => s + r * r, 0)

/** The largest gap between a prediction and the real price, in $k. */
export const HOUSE_MAX_GAP = Math.max(...HOUSE_RESID.map(Math.abs))

/** For comparison: the best line using size alone. */
const sizePoints: Vec2[] = HOUSES.map((h) => [h.sqft, h.priceK])
export const SIZE_FIT = fitLine(sizePoints)!
export const SIZE_SSE = sumSquaredResiduals(sizePoints, SIZE_FIT)

export const HOUSE_CODE = [
  'import numpy as np',
  housesNumpy(),
  'A = np.column_stack([X, np.ones(len(X))])  # add a column of 1s for the bias',
  'w, *_ = np.linalg.lstsq(A, y)',
  'print(np.round(w, 3))        # sqft, bedrooms, distance, bias',
  'print(np.round(A @ w, 1))    # predicted prices',
  'print(np.round(np.sum((y - A @ w)**2), 1))  # sum of squared residuals',
].join('\n')

export const HOUSE_OUTPUT = [
  npArray(HOUSE_WEIGHTS.map((w) => npRound(w, 3))),
  npArray(HOUSE_PRED.map((p) => npRound(p, 1))),
  npFloat(npRound(HOUSE_SSE, 1)),
].join('\n')
