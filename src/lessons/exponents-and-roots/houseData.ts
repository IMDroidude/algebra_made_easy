/**
 * The running example for lesson 2.4, on the shared houses: the squared
 * errors of the price model price = 0.22 × sqft + 30, and the distance
 * between two houses as feature vectors. Pure maths; no React.
 */
import { HOUSES, featureVector } from '../../data/houses'
import type { House } from '../../data/houses'
import { npArray, npFloat } from '../../lib/numpy'

/** The rounded best-fit line from lessons 2.2 and 2.3. */
export const PRICE_MODEL = { m: 0.22, b: 30 }

export function predictPrice(h: House): number {
  return PRICE_MODEL.m * h.sqft + PRICE_MODEL.b
}

/** True price minus prediction, as in this lesson's Apply step. */
export function priceError(h: House): number {
  return h.priceK - predictPrice(h)
}

/**
 * The sum NumPy computes for a float array of up to 128 entries: a plain loop
 * below 8 entries, otherwise eight running lanes added pairwise
 * ((r0 + r1) + (r2 + r3)) + ((r4 + r5) + (r6 + r7)), then any leftovers.
 */
export function npSum(values: readonly number[]): number {
  const n = values.length
  if (n < 8) {
    let total = 0
    for (const v of values) total += v
    return total
  }
  if (n > 128) throw new Error('npSum: only arrays of up to 128 entries are supported')
  const r = values.slice(0, 8)
  let i = 8
  for (; i < n - (n % 8); i += 8) for (let j = 0; j < 8; j++) r[j] += values[i + j]
  let total = r[0] + r[1] + (r[2] + r[3]) + (r[4] + r[5] + (r[6] + r[7]))
  for (; i < n; i++) total += values[i]
  return total
}

export const HOUSE_ERRORS = HOUSES.map(priceError)
export const HOUSE_SQUARES = HOUSE_ERRORS.map((e) => e * e)
export const HOUSE_MSE = npSum(HOUSE_SQUARES) / HOUSES.length

export const errorCode = [
  'import numpy as np',
  '',
  `sqft = np.array([${HOUSES.map((h) => h.sqft).join(', ')}])`,
  `y = np.array([${HOUSES.map((h) => h.priceK).join(', ')}])   # actual prices, $k`,
  '',
  `errors = y - (${PRICE_MODEL.m} * sqft + ${PRICE_MODEL.b})`,
  'print(errors)',
  'print(errors ** 2)',
  'print(np.mean(errors ** 2))   # mean squared error',
].join('\n')

export const errorOutput = [npArray(HOUSE_ERRORS), npArray(HOUSE_SQUARES), npFloat(HOUSE_MSE)].join('\n')

/** A house's features, with size optionally in thousands of sqft. */
export function features(h: House, thousands: boolean): number[] {
  const [sqft, bed, km] = featureVector(h)
  return [thousands ? sqft / 1000 : sqft, bed, km]
}

/** Straight-line distance between two feature lists: √(sum of squared differences). */
export function featureDistance(a: readonly number[], b: readonly number[]): number {
  return Math.sqrt(npSum(a.map((x, k) => (b[k] - x) * (b[k] - x))))
}

export function distanceCode(a: House, b: House, thousands: boolean): string {
  const lit = (h: House) => `np.array([${features(h, thousands).join(', ')}])`
  const [p, q] = [a.id.toLowerCase(), b.id.toLowerCase()]
  return [
    'import numpy as np',
    '',
    `# ${thousands ? 'thousands of sqft' : 'sqft'}, bedrooms, km`,
    `${p} = ${lit(a)}   # house ${a.id}`,
    `${q} = ${lit(b)}   # house ${b.id}`,
    '',
    `print(${q} - ${p})`,
    `print(np.sqrt(np.sum((${q} - ${p}) ** 2)))`,
  ].join('\n')
}

export function distanceOutput(a: House, b: House, thousands: boolean): string {
  const fa = features(a, thousands)
  const fb = features(b, thousands)
  const diff = fb.map((x, k) => x - fa[k])
  return `${npArray(diff, !thousands)}\n${npFloat(featureDistance(fa, fb))}`
}
