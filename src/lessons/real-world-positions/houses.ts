/**
 * Running example for 1.5: choosing an origin and units for the houses.
 * Centring moves the origin to the average house; square metres change the
 * unit of the size column.
 */
import { HOUSES, featureMatrix, featureVector, housesNumpy } from '../../data/houses'
import type { House } from '../../data/houses'
import { npArray, npRound } from '../../lib/numpy'

/** Square feet in one square metre. */
export const SQFT_PER_M2 = 10.764

export type HouseOrigin = 'zero' | 'average'
export type SizeUnit = 'sqft' | 'm2'

/** The average house: the mean of each feature column. */
export const AVERAGE_HOUSE: number[] = featureMatrix()
  .reduce((s, row) => s.map((x, i) => x + row[i]), [0, 0, 0])
  .map((x) => x / HOUSES.length)

/**
 * A house's three numbers in the chosen frame: measured from zero or from the
 * average house, with size in sqft or in m² (rounded to 0.1 m²).
 */
export function houseInFrame(h: House, origin: HouseOrigin, unit: SizeUnit): number[] {
  const v = featureVector(h).map((x, i) => (origin === 'average' ? x - AVERAGE_HOUSE[i] : x) + 0)
  if (unit === 'm2') v[0] = npRound(v[0] / SQFT_PER_M2, 1) + 0
  return v
}

/** A number for the table, with a real minus sign; sizes in m² always show one decimal. */
export function cellText(x: number, i: number, unit: SizeUnit): string {
  const s = i === 0 && unit === 'm2' ? x.toFixed(1) : String(x)
  return s.replace('-', '−')
}

export const HOUSE_FRAME_CODE = [
  'import numpy as np',
  '',
  housesNumpy(),
  '',
  'average = X.mean(axis=0)   # the average house: the mean of each column',
  'centred = X - average      # every house, measured from the average house',
  `size_m2 = np.round(X[:, 0] / ${SQFT_PER_M2}, 1)   # size column in square metres`,
  '',
  'print(average)',
  'print(centred[0])   # house A',
  'print(size_m2)',
].join('\n')

export const HOUSE_FRAME_OUTPUT = [
  npArray(AVERAGE_HOUSE),
  npArray(houseInFrame(HOUSES[0], 'average', 'sqft')),
  npArray(HOUSES.map((h) => npRound(h.sqft / SQFT_PER_M2, 1))),
].join('\n')
