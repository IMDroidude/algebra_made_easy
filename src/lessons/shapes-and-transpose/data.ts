/** Fixed examples used by the shapes-and-transpose lesson. */
import { fmt } from '../../lib/format'
import type { Matrix, Vec2 } from '../../linalg'

/** The example matrix of step 1: 2 rows, 3 columns. */
export const SEE_A: Matrix = [
  [3, 0, 1],
  [1, 2, -1],
]
export const SEE_V = [1, 1, 1]

/** The 1×2 matrix of the prediction, and the points it is applied to. */
export const PREDICT_M: Matrix = [[1, 1]]
export const PREDICT_POINTS: Vec2[] = [
  [2, 1],
  [-1, 2],
  [1, -2],
  [0, 3],
  [-2, -1],
]

/** Toy 2-number embeddings for the Apply step, one word per row. */
export const WORDS = ['cat', 'dog', 'car', 'bus']
export const X: Matrix = [
  [2, 1],
  [1.5, 2],
  [-1.5, 1],
  [-1.5, -2],
]

/** The NumPy literal for X, with a comment naming each row. */
export function xLiteral(): string {
  const head = 'X = np.array(['
  const pad = ' '.repeat(head.length)
  const rows = X.map((r) => `[${r.map((x) => fmt(x)).join(', ')}]`)
  const width = Math.max(...rows.map((r) => r.length)) + 2
  return rows
    .map((r, k) => {
      const tail = k === rows.length - 1 ? '])' : ','
      return `${k === 0 ? head : pad}${(r + tail).padEnd(width)} # ${WORDS[k]}`
    })
    .join('\n')
}
