import { HOUSES, featureVector } from '../../data/houses'
import { npArray } from '../../lib/numpy'
import { add, scale } from '../../linalg'
import type { Vec } from '../../linalg'

/** The three basis directions of house space: one per feature. */
export const E_SQFT: Vec = [1, 0, 0]
export const E_BED: Vec = [0, 1, 0]
export const E_DIST: Vec = [0, 0, 1]

/** The houses this example compares: B (built from the basis), A and H (look alike without distance). */
export const HOUSE_B = HOUSES[1]
export const LOOKALIKES = [HOUSES[0], HOUSES[7]] as const

/** A house rebuilt as sqft·e_sqft + bedrooms·e_bed (+ distance·e_dist when `withDistance`). */
export function mixOfBasis(v: readonly number[], withDistance: boolean): Vec {
  const two = add(scale(E_SQFT, v[0]), scale(E_BED, v[1]))
  return withDistance ? add(two, scale(E_DIST, v[2])) : two
}

/** House B with all three directions, and with only the first two. */
export const B_FULL = mixOfBasis(featureVector(HOUSE_B), true)
export const B_TWO = mixOfBasis(featureVector(HOUSE_B), false)

/** What the lesson's NumPy snippet prints. */
export const HOUSE_OUTPUT = [npArray(B_FULL, true), npArray(B_TWO, true)].join('\n')
