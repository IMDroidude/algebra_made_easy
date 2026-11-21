import { HOUSES } from '../../data/houses'
import { npArray } from '../../lib/numpy'
import { IDENTITY2, apply2, lerp2 } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'

/** Square feet per square metre is 10.764, so 1 sqft = 0.0929 m² (rounded). */
export const SQFT_TO_M2 = 0.0929

/** Converts (sqft, bedrooms) into (m², bedrooms): stretch x by 0.0929, leave y alone. */
export const TO_M2: Mat2 = [
  [SQFT_TO_M2, 0],
  [0, 1],
]

/** Each house as a 2D vector (sqft, bedrooms). */
export const SIZE_BEDS: Vec2[] = HOUSES.map((h) => [h.sqft, h.bedrooms])

/** Each house after the matrix: (m², bedrooms). */
export const IN_M2: Vec2[] = SIZE_BEDS.map((p) => apply2(TO_M2, p))

/** NumPy literal for the matrix (written by hand: it needs 4 decimals, not the usual 3). */
export const MATRIX_LITERAL = `A = np.array([[${SQFT_TO_M2}, 0],\n              [0,      1]])`

/** What `print(S @ A.T)` shows: one row per house. */
export const HOUSE_OUTPUT = npArray(IN_M2, false)

/** The houses part-way through: the matrix slides from the identity (t = 0) to A (t = 1). */
export function housesAt(t: number): Vec2[] {
  if (t >= 1) return IN_M2
  const m = lerp2(IDENTITY2, TO_M2, t)
  return SIZE_BEDS.map((p) => apply2(m, p))
}
