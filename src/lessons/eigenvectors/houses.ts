import { HOUSES, featureMatrix, housesNumpy } from '../../data/houses'
import { npArray, npRound } from '../../lib/numpy'
import { eigen2 } from '../../linalg/eigen'
import type { Mat2, Vec2 } from '../../linalg'

/**
 * The running example for this lesson: PCA on two house features, size and
 * bedrooms. Both are standardised first (centre, divide by the standard
 * deviation), otherwise sqft, in the thousands, would swamp bedrooms.
 */

/** Centre every column and divide by its (population) standard deviation, like NumPy's X.std(). */
export function standardise(X: number[][]): number[][] {
  const n = X.length
  const cols = X[0].length
  const mean = Array.from({ length: cols }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n)
  const sd = mean.map((m, j) => Math.sqrt(X.reduce((s, r) => s + (r[j] - m) ** 2, 0) / n))
  return X.map((r) => r.map((x, j) => (x - mean[j]) / sd[j]))
}

/** Standardised (sqft, bedrooms) for each house. */
export const HOUSE_POINTS: Vec2[] = standardise(featureMatrix()).map((r) => [r[0], r[1]])

const n = HOUSE_POINTS.length
const sum = (f: (p: Vec2) => number) => HOUSE_POINTS.reduce((s, p) => s + f(p), 0)

/** Covariance SᵀS / n of the standardised points (their correlation matrix). */
export const HOUSE_COV: Mat2 = [
  [sum((p) => p[0] * p[0]) / n, sum((p) => p[0] * p[1]) / n],
  [sum((p) => p[0] * p[1]) / n, sum((p) => p[1] * p[1]) / n],
]

const e = eigen2(HOUSE_COV)
if (e.kind !== 'distinct') throw new Error('House covariance should have two distinct eigenvalues')

/** Principal directions, largest variance first, each a unit vector with x > 0. */
export const HOUSE_PCS = e.pairs

/** Share of the total spread along PC1. */
export const HOUSE_PC1_SHARE = HOUSE_PCS[0].value / (HOUSE_PCS[0].value + HOUSE_PCS[1].value)

export const HOUSE_IDS = HOUSES.map((h) => h.id)

export const HOUSE_CODE = [
  'import numpy as np',
  housesNumpy(),
  'Z = (X - X.mean(axis=0)) / X.std(axis=0)  # centre, then scale every column',
  'S = Z[:, :2]                 # keep sqft and bedrooms',
  'C = S.T @ S / len(S)         # 2×2 covariance matrix',
  'vals, vecs = np.linalg.eigh(C)  # eigh: for symmetric matrices, smallest first',
  'print(np.round(C, 3))',
  'print(np.round(vals, 3))',
  'print(np.round(vals / vals.sum(), 3))  # share of the spread',
].join('\n')

const ascending = [HOUSE_PCS[1].value, HOUSE_PCS[0].value]
const total = ascending[0] + ascending[1]

export const HOUSE_OUTPUT = [
  npArray(HOUSE_COV.map((r) => r.map((x) => npRound(x, 3)))),
  npArray(ascending.map((v) => npRound(v, 3))),
  npArray(ascending.map((v) => npRound(v / total, 3))),
].join('\n')
