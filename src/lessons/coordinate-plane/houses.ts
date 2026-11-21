import { HOUSES, housesNumpy } from '../../data/houses'
import type { House } from '../../data/houses'
import { npArray } from '../../lib/numpy'
import type { Vec2 } from '../../linalg'

/**
 * Running example for 1.2: each house drawn as the point (size, price).
 * The plane is not centred on the origin, and its two axes use very
 * different units, so it shows only the part of the plane where houses are.
 */

/** Visible size range (sqft) and price range ($k). */
export const SQFT_RANGE: [number, number] = [600, 2600]
export const PRICE_RANGE: [number, number] = [150, 600]
/** Grid spacing and numbered ticks on each axis. */
export const SQFT_GRID = 100
export const PRICE_GRID = 50
export const SQFT_TICKS = [1000, 1500, 2000]
export const PRICE_TICKS = [200, 300, 400, 500]

/** A house as a point on the plane: x = size, y = price. */
export const housePoint = (h: House): Vec2 => [h.sqft, h.priceK]

/** The house that is furthest right and highest at once (largest and dearest), if one is both. */
export function topRightHouse(houses: readonly House[] = HOUSES): House | undefined {
  const maxX = Math.max(...houses.map((h) => h.sqft))
  const maxY = Math.max(...houses.map((h) => h.priceK))
  return houses.find((h) => h.sqft === maxX && h.priceK === maxY)
}

/** "A (1100, 265)". */
export const housePointText = (h: House) => `${h.id} (${h.sqft}, ${h.priceK})`

/** NumPy: pair each house's size with its price, then pick one row. */
export function housePlaneCode(index: number): { code: string; output: string } {
  const h = HOUSES[index]
  const code = [
    'import numpy as np',
    '',
    housesNumpy(),
    '',
    '# column 0 of X (size) next to y (price): one (x, y) point per house',
    'points = np.column_stack([X[:, 0], y])',
    '',
    'print(points.shape)',
    `print(points[${index}])   # house ${h.id}`,
  ].join('\n')
  return { code, output: `(${HOUSES.length}, 2)\n${npArray(housePoint(h), true)}` }
}
