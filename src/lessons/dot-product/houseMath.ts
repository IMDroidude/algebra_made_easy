import { HOUSES, featureVector } from '../../data/houses'
import type { House } from '../../data/houses'
import { npArray } from '../../lib/numpy'
import { dot } from '../../linalg'
import type { Vec } from '../../linalg'

/** A simple price model: $k per sqft, per bedroom, per km from the centre. */
export const WEIGHTS: Vec = [0.2, 15, -6]
/** The base price in $k, added to every house. */
export const BIAS = 60

/** Predicted price in $k: weights · features + bias. */
export function predict(h: House): number {
  return dot(WEIGHTS, featureVector(h)) + BIAS
}

/** Real price minus predicted price, in $k. */
export function residual(h: House): number {
  return h.priceK - predict(h)
}

export const PREDICTIONS = HOUSES.map(predict)
export const RESIDUALS = HOUSES.map(residual)

/** What the lesson's NumPy snippet prints: the predictions, then the errors. */
export const HOUSE_OUTPUT = [npArray(PREDICTIONS, false), npArray(RESIDUALS, false)].join('\n')
