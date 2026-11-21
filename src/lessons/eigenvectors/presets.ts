import type { Mat2 } from '../../linalg'

/** Example matrices, one per case the lesson covers. */
export const PRESETS: { id: string; label: string; m: Mat2 }[] = [
  { id: 'stretch', label: 'Stretch', m: [[2, 1], [1, 2]] },
  { id: 'flip', label: 'Stretch and flip', m: [[1, 2], [2, 1]] },
  { id: 'lopsided', label: 'Lopsided', m: [[3, 1], [0, 2]] },
  { id: 'shear', label: 'Shear', m: [[1, 1], [0, 1]] },
  { id: 'scale', label: 'Scale', m: [[2, 0], [0, 2]] },
]

export const ROTATION_90: Mat2 = [
  [0, -1],
  [1, 0],
]
