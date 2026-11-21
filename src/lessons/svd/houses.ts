import { HOUSES, featureMatrix, housesNumpy } from '../../data/houses'
import { npArray, npRound } from '../../lib/numpy'
import { lowRankStorage, svd } from '../../linalg/svd'
import { standardise } from '../eigenvectors/houses'

/**
 * The running example for this lesson: the SVD of the standardised 8 × 3
 * house feature matrix. Standardising first (centre, divide by the standard
 * deviation) stops sqft, in the thousands, from swamping the other columns.
 */

export const HOUSE_Z = standardise(featureMatrix())
export const HOUSE_ROWS = HOUSES.length
export const HOUSE_COLS = HOUSE_Z[0].length

const decomposition = svd(HOUSE_Z)

/** Singular values, largest first. */
export const HOUSE_S: number[] = decomposition.s

/** Total spread: the sum of every squared entry, which equals Σσ². */
export const HOUSE_TOTAL = HOUSE_S.reduce((t, s) => t + s * s, 0)

/** Share of the spread kept by the rank-k approximation, for k = 1, 2, 3. */
export const HOUSE_KEPT: number[] = HOUSE_S.map((_, k) =>
  HOUSE_S.slice(0, k + 1).reduce((t, s) => t + s * s, 0) / HOUSE_TOTAL,
)

/** |first two right singular vectors|: how much of each feature each direction mixes in. */
export const HOUSE_DIRECTIONS: number[][] = [0, 1].map((t) => decomposition.V.map((row) => Math.abs(row[t])))

export const HOUSE_STORAGE = HOUSE_S.map((_, k) => lowRankStorage(HOUSE_ROWS, HOUSE_COLS, k + 1))

/** Numbers stored for a big table: 10,000 houses, rank 2, versus the full table. */
export const BIG_ROWS = 10000
export const BIG_RANK2 = lowRankStorage(BIG_ROWS, HOUSE_COLS, 2)
export const BIG_FULL = BIG_ROWS * HOUSE_COLS

export const HOUSE_CODE = [
  'import numpy as np',
  housesNumpy(),
  'Z = (X - X.mean(axis=0)) / X.std(axis=0)  # centre, then scale every column',
  'U, s, Vt = np.linalg.svd(Z, full_matrices=False)',
  'print(np.round(s, 2))',
  'print(np.round(np.cumsum(s**2) / np.sum(s**2), 3))  # spread kept by rank 1, 2, 3',
  'print(np.round(np.abs(Vt[:2]), 2))  # what the top two directions mix (signs can flip)',
].join('\n')

export const HOUSE_OUTPUT = [
  npArray(HOUSE_S.map((s) => npRound(s, 2))),
  npArray(HOUSE_KEPT.map((k) => npRound(k, 3))),
  npArray(HOUSE_DIRECTIONS.map((r) => r.map((x) => npRound(x, 2)))),
].join('\n')
