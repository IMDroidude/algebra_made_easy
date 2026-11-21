/** Fixed examples used by the determinant lesson. */
import type { Mat2, Vec2 } from '../../linalg'

export const UNIT_SQUARE: Vec2[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
]

/**
 * An "F" drawn inside the unit square. It has no mirror symmetry, so a flip
 * shows as a backwards F, not just as a change of colour.
 */
export const F_SHAPE: Vec2[] = [
  [0.2, 0.1],
  [0.2, 0.9],
  [0.8, 0.9],
  [0.8, 0.72],
  [0.4, 0.72],
  [0.4, 0.58],
  [0.65, 0.58],
  [0.65, 0.4],
  [0.4, 0.4],
  [0.4, 0.1],
]

/** Step 1: a fixed matrix whose unit square becomes a parallelogram of area 3. */
export const SEE_M: Mat2 = [
  [2, 1],
  [0, 1.5],
]

/** Step 3: B, and B with its two columns swapped. */
export const PREDICT_B: Mat2 = [
  [2, 1],
  [0, 1],
]
export const PREDICT_SWAPPED: Mat2 = [
  [1, 2],
  [1, 0],
]

/** Step 4 starts the box picture here: det = 3·2 − 1·1 = 5. */
export const UNDERSTAND_START: Mat2 = [
  [3, 1],
  [1, 2],
]

/** Step 5: a singular layer and the first input. */
export const APPLY_W: Mat2 = [
  [1, 2],
  [0.5, 1],
]
export const APPLY_X: Vec2 = [1, 1]

/** Step 6 starts here (det 2). */
export const PRACTICE_START: Mat2 = [
  [1, 1],
  [-1, 1],
]

/** What real NumPy 2 prints for np.linalg.det of [[2, 1], [1, 3]], whose exact determinant is 5. */
export const NUMPY_DET_EXAMPLE = {
  matrix: [
    [2, 1],
    [1, 3],
  ] as Mat2,
  printed: '5.000000000000001',
}
