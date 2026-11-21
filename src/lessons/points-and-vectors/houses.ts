/**
 * Running example for 1.4: vectors between and added to houses.
 * A house's feature list [sqft, bedrooms, distance_km] is a point; the
 * difference of two houses, or a renovation, is a vector.
 */
import { HOUSES, featureVector } from '../../data/houses'
import { npArray } from '../../lib/numpy'
import { add, sub } from '../../linalg'
import { clean } from './model'

export const HOUSE_A = HOUSES[0]
export const HOUSE_B = HOUSES[1]

/** A renovation: +200 sqft, +1 bedroom, the house does not move. */
export const RENOVATION = [200, 1, 0]

/** B − A: how house B differs from house A, feature by feature. */
export const DIFF_AB = clean(sub(featureVector(HOUSE_B), featureVector(HOUSE_A)))

/** House A after the renovation: point + vector. */
export const RENOVATED_A = clean(add(featureVector(HOUSE_A), RENOVATION))

/** "+400", "−3", "0". */
export const signedPart = (x: number) => (x > 0 ? `+${x}` : x < 0 ? `−${-x}` : '0')

/** "(400, 1, −3)". */
export const tripleText = (v: readonly number[]) => `(${v.map((x) => String(x).replace('-', '−')).join(', ')})`

/** In words: what B − A says about the two houses. */
export function diffWords([s, b, d]: readonly number[]): string {
  const size = s >= 0 ? `${s} sqft bigger` : `${-s} sqft smaller`
  const beds = b === 0 ? 'the same number of bedrooms' : `${Math.abs(b)} ${b > 0 ? 'more' : 'fewer'} bedroom${Math.abs(b) === 1 ? '' : 's'}`
  const dist = d === 0 ? 'the same distance out' : `${Math.abs(d)} km ${d < 0 ? 'closer to' : 'further from'} the centre`
  return `${size}, ${beds}, ${dist}`
}

export const HOUSE_CODE = [
  'import numpy as np',
  '',
  `a = np.array([${featureVector(HOUSE_A).join(', ')}])   # house A: sqft, bedrooms, distance_km`,
  `b = np.array([${featureVector(HOUSE_B).join(', ')}])   # house B`,
  `renovation = np.array([${RENOVATION.join(', ')}])`,
  '',
  'print(b - a)            # how B differs from A: a vector',
  'print(a + renovation)   # house A after the work: a point',
].join('\n')

export const HOUSE_OUTPUT = `${npArray(DIFF_AB, true)}\n${npArray(RENOVATED_A, true)}`
