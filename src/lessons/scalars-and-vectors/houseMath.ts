import { HOUSES, featureMatrix, featureVector } from '../../data/houses'
import { npArray } from '../../lib/numpy'
import { add, scale, sub } from '../../linalg'
import type { Vec } from '../../linalg'

/** House A (Garden flat) and house B (Corner house) as feature vectors. */
export const HOUSE_A = featureVector(HOUSES[0])
export const HOUSE_B = featureVector(HOUSES[1])

/** b − a: how the Corner house differs from the Garden flat, feature by feature. */
export const B_MINUS_A = sub(HOUSE_B, HOUSE_A)

/** 2 × a: every feature doubled, distance included. */
export const TWO_A = scale(HOUSE_A, 2)

/** Sum of all eight feature vectors, then divided by 8: the average house. */
export const HOUSE_SUM = featureMatrix().reduce<Vec>((s, v) => add(s, v), [0, 0, 0])
export const AVERAGE_HOUSE = scale(HOUSE_SUM, 1 / HOUSES.length)

/** What the lesson's NumPy snippet prints, line by line. */
export const HOUSE_OUTPUT = [
  npArray(B_MINUS_A, true),
  npArray(TWO_A, true),
  // X.sum(axis=0) / 8 is true division, so NumPy returns floats.
  npArray(AVERAGE_HOUSE, false),
].join('\n')
