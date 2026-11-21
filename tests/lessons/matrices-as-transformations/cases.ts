import { numpyMat2, numpyVec } from '../../../src/lib/format'
import {
  MIRRORS,
  SCALE_RANGE,
  SHEAR_RANGE,
  THETA_RANGE,
  rotationMatrix,
  scalingMatrix,
  shearMatrix,
} from '../../../src/lessons/matrices-as-transformations/galleryMath'
import type { Mat2, Vec2 } from '../../../src/linalg'

const range = ({ min, max, step }: { min: number; max: number; step: number }) =>
  Array.from({ length: Math.round((max - min) / step) + 1 }, (_, k) => min + k * step)

/** Every matrix a gallery card can produce. */
export const GALLERY_MATRICES: Mat2[] = [
  ...range(THETA_RANGE).map(rotationMatrix),
  ...range(SCALE_RANGE).flatMap((sx) => range(SCALE_RANGE).map((sy) => scalingMatrix(sx, sy))),
  ...MIRRORS.map((m) => m.matrix),
  ...range(SHEAR_RANGE).map(shearMatrix),
]

/** Step 4 after "Try it" loads a gallery matrix, with a few points P. */
export const POINTS: Vec2[] = [
  [2, 1],
  [-3, 2.5],
  [0.5, -1.5],
]

export const step4Code = (m: Mat2, v: Vec2) =>
  `import numpy as np\n\n${numpyMat2('A', m)}\n${numpyVec('v', v)}\n\nprint(A @ v)`
