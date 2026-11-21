/**
 * The running example for lesson 2.3, built on the shared houses: price
 * against size as points for a line, and a fixed boundary line in the
 * (sqft, distance) plane. Pure data and maths; no React.
 */
import { HOUSES } from '../../data/houses'
import type { Vec2 } from '../../linalg'
import { leastSquaresLine, meanAbsMiss, pyFloat } from './lineMath'

/** Each house as the point (sqft, price in $k). */
export const PRICE_POINTS: Vec2[] = HOUSES.map((h) => [h.sqft, h.priceK])

/** The least-squares line through those points (≈ 0.217·sqft + 29.8). */
export const BEST = leastSquaresLine(PRICE_POINTS)

/** Where the learner's line starts: clearly too flat. */
export const HOUSE_START = { m: 0.1, b: 150 }

/** The price that splits the houses into two groups for the boundary example. */
export const PRICE_SPLIT = 350

/**
 * The boundary line sqft − 40 · distance = 1250. Houses on the "more" side
 * (sqft − 40·distance > 1250) all sold for more than $350k.
 */
export const BOUNDARY = { perKm: 40, cut: 1250 }

export function boundaryScoreHouse(sqft: number, distanceKm: number): number {
  return sqft - BOUNDARY.perKm * distanceKm - BOUNDARY.cut
}

/** The boundary as distance = (sqft − 1250) / 40, for drawing in the (sqft, distance) plane. */
export function boundaryDistance(sqft: number): number {
  return (sqft - BOUNDARY.cut) / BOUNDARY.perKm
}

/** NumPy code for the average miss of the line price = m·sqft + b. */
export function houseLineCode(m: number, b: number): string {
  return [
    'import numpy as np',
    '',
    `sqft = np.array([${HOUSES.map((h) => h.sqft).join(', ')}])`,
    `price = np.array([${HOUSES.map((h) => h.priceK).join(', ')}])   # $k`,
    '',
    `m, b = ${m + 0}, ${b + 0}   # your line`,
    'miss = price - (m * sqft + b)',
    'print(np.mean(np.abs(miss)))   # average miss in $k',
  ].join('\n')
}

export function houseLineOutput(m: number, b: number): string {
  return pyFloat(meanAbsMiss(m, b, PRICE_POINTS))
}
