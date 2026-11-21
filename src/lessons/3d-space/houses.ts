import { FEATURES, HOUSES, featureVector, housesNumpy } from '../../data/houses'
import type { House } from '../../data/houses'
import { npArray } from '../../lib/numpy'
import { FRONT_VIEW, SIDE_VIEW, TOP_VIEW } from '../../linalg/project3d'
import type { Vec3, View } from '../../linalg/project3d'

/**
 * Running example for 1.3: the houses as points in the room, with
 * x = size, y = bedrooms (up), z = distance. The room runs 0 to 5 on each
 * axis, so each feature is divided by its own scale to fit.
 */

/** One drawing unit on each axis, in that feature's units: 500 sqft, 1 bedroom, 3 km. */
export const ROOM_SCALE: Vec3 = [500, 1, 3]

/** Short axis names for the room picture. */
export const HOUSE_AXIS_NAMES = { x: 'size', y: 'bedrooms', z: 'distance' } as const

/** Tick labels in the features' own units. */
export const HOUSE_AXIS_TICKS = {
  x: (k: number) => String(k * ROOM_SCALE[0]),
  y: (k: number) => String(k * ROOM_SCALE[1]),
  z: (k: number) => String(k * ROOM_SCALE[2]),
}

export type Drop = 'none' | 0 | 1 | 2

/** The feature names used in the text. */
export const DROP_NAME = ['size', 'bedrooms', 'distance'] as const

/** Which wall each dropped feature flattens the houses onto, and the view that looks straight at it. */
export const DROP_WALL: Record<0 | 1 | 2, { wall: string; view: View; viewName: string }> = {
  0: { wall: 'the side wall', view: SIDE_VIEW, viewName: 'Side (yz)' },
  1: { wall: 'the floor', view: TOP_VIEW, viewName: 'Top (xz)' },
  2: { wall: 'the back wall', view: FRONT_VIEW, viewName: 'Front (xy)' },
}

/** Where a house is drawn in the room; a dropped feature becomes 0 (its shadow on a wall). */
export function roomPoint(h: House, drop: Drop): Vec3 {
  return featureVector(h).map((v, i) => (i === drop ? 0 : v / ROOM_SCALE[i]) + 0) as Vec3
}

/** The house's numbers that are kept: "(1100, 2, 8)", or "(1100, 2)" with distance dropped. */
export function keptText(h: House, drop: Drop): string {
  return `(${featureVector(h)
    .filter((_, i) => i !== drop)
    .join(', ')})`
}

/** NumPy for the chosen drop, with exactly what it prints. */
export function dropCode(drop: Drop): { code: string; output: string } {
  const a = featureVector(HOUSES[0])
  if (drop === 'none') {
    return {
      code: ['import numpy as np', '', housesNumpy(), '', 'print(X.shape)', 'print(X[0])   # house A'].join('\n'),
      output: `(${HOUSES.length}, ${FEATURES.length})\n${npArray(a, true)}`,
    }
  }
  const keep = [0, 1, 2].filter((i) => i !== drop)
  const names = keep.map((i) => DROP_NAME[i]).join(' and ')
  return {
    code: [
      'import numpy as np',
      '',
      housesNumpy(),
      '',
      `flat = X[:, [${keep.join(', ')}]]   # keep ${names}; drop ${DROP_NAME[drop]}`,
      '',
      'print(flat.shape)',
      'print(flat[0])   # house A',
    ].join('\n'),
    output: `(${HOUSES.length}, 2)\n${npArray(
      keep.map((i) => a[i]),
      true,
    )}`,
  }
}
