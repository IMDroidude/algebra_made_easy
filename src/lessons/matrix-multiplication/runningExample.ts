/**
 * The running example for this lesson: two steps applied to the shared houses
 * (convert units, then mix the features), and the single matrix that does both.
 * Plain functions only, so the unit tests can check every number shown.
 */
import { HOUSES, featureVector, housesNumpy } from '../../data/houses'
import type { House } from '../../data/houses'
import { fmt } from '../../lib/format'
import { npArray } from '../../lib/numpy'
import { matMul, matVec } from '../../linalg'
import type { Matrix, Vec } from '../../linalg'

export const SQFT_TO_M2 = 0.0929
export const KM_TO_MILES = 0.6214

/** Step 1, U: square feet to square metres, kilometres to miles; bedrooms stay. */
export const UNITS: Matrix = [
  [SQFT_TO_M2, 0, 0],
  [0, 1, 0],
  [0, 0, KM_TO_MILES],
]

/** Step 2, M: space score = area + 10 per bedroom; bedrooms; closeness = −distance. */
export const MIX: Matrix = [
  [1, 10, 0],
  [0, 1, 0],
  [0, 0, -1],
]

/** The house the NumPy snippet follows. */
export const HOUSE_B: House = HOUSES[1]

/** M(Ux): the two steps one after the other. */
export const twoSteps = (h: House): Vec => matVec(MIX, matVec(UNITS, featureVector(h)))
/** (MU)x: the single product matrix. */
export const oneMatrix = (h: House): Vec => matVec(matMul(MIX, UNITS), featureVector(h))
/** (UM)x: the same two matrices in the swapped order (mix first, then convert). */
export const swapped = (h: House): Vec => matVec(matMul(UNITS, MIX), featureVector(h))

/** The space score as shown in the table, two decimals. */
export const scoreText = (x: number) => fmt(x, 2)

/** X as a NumPy literal, without the price line this example does not use. */
export const xLiteral = () =>
  housesNumpy()
    .split('\n')
    .filter((l) => !l.startsWith('y ='))
    .join('\n')

export function houseSnippet(): { code: string; output: string } {
  const code = [
    'import numpy as np',
    '',
    xLiteral(),
    '',
    '# step 1: sqft -> m², km -> miles',
    'U = np.diag([0.0929, 1, 0.6214])',
    '# step 2: space score (m² + 10 per bedroom), bedrooms, closeness',
    'M = np.array([[1, 10, 0],',
    '              [0, 1, 0],',
    '              [0, 0, -1]])',
    'x = X[1]   # house B',
    '',
    'print(M @ (U @ x))   # two steps',
    'print((M @ U) @ x)   # one matrix: the same',
    'print((U @ M) @ x)   # swapped order: different',
  ].join('\n')
  const output = [twoSteps(HOUSE_B), oneMatrix(HOUSE_B), swapped(HOUSE_B)]
    .map((v) => npArray(v))
    .join('\n')
  return { code, output }
}
