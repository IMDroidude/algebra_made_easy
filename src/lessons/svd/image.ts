/**
 * A 32×32 greyscale picture (a house under the sun), drawn with simple
 * shapes so the same few lines of NumPy can rebuild it exactly. Values run
 * from 0 (black) to 1 (white); row 0 is the top of the picture.
 */
import type { Matrix } from '../../linalg'

export const SIZE = 32

/** The NumPy lines that build the same picture, entry for entry. */
export const IMAGE_CODE = [
  'y, x = np.mgrid[0:32, 0:32]        # row, column of each pixel',
  'img = 0.6 + 0.01 * y               # sky, lighter lower down',
  'img[(x - 24)**2 + (y - 7)**2 <= 16] = 1.0                        # sun',
  'img[y >= 27] = 0.2                                                # ground',
  'img[(y >= 17) & (y < 27) & (x >= 5) & (x < 18)] = 0.95           # wall',
  'img[(y >= 9) & (y < 17) & (np.abs(2 * x - 22) <= 2 * (y - 8))] = 0.3  # roof',
  'img[(y >= 21) & (y < 27) & (x >= 7) & (x < 10)] = 0.1            # door',
  'img[(y >= 19) & (y < 23) & (x >= 12) & (x < 16)] = 0.45          # window',
].join('\n')

export function houseImage(): Matrix {
  return Array.from({ length: SIZE }, (_, y) =>
    Array.from({ length: SIZE }, (_, x) => {
      let v = 0.6 + 0.01 * y
      if ((x - 24) ** 2 + (y - 7) ** 2 <= 16) v = 1.0
      if (y >= 27) v = 0.2
      if (y >= 17 && y < 27 && x >= 5 && x < 18) v = 0.95
      if (y >= 9 && y < 17 && Math.abs(2 * x - 22) <= 2 * (y - 8)) v = 0.3
      if (y >= 21 && y < 27 && x >= 7 && x < 10) v = 0.1
      if (y >= 19 && y < 23 && x >= 12 && x < 16) v = 0.45
      return v
    }),
  )
}
