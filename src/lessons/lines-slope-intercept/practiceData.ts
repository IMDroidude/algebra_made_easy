/** Data sets for the practice step of lesson 2.3. None of them appears earlier in the lesson. */
import { isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { GROUPS } from './boundaryData'
import { misclassified, sumSquaredError } from './lineMath'

export type DataSet = {
  id: string
  name: string
  points: Vec2[]
  /** Solved when the error is below this; 0 means the line must pass through every point. */
  target: number
}

export const DATA_SETS: DataSet[] = [
  {
    id: 'row',
    name: 'Three in a row',
    points: [
      [-3, -1],
      [1, 1],
      [3, 2],
    ],
    target: 0,
  },
  {
    id: 'down',
    name: 'Downhill',
    points: [
      [-4, 4],
      [-2, 3],
      [0, 1],
      [2, 0],
      [4, -2],
    ],
    target: 1,
  },
  {
    id: 'up',
    name: 'Noisy uphill',
    points: [
      [-4, -3],
      [-2, -2],
      [-1, 0],
      [1, 0],
      [3, 3],
      [4, 2],
    ],
    target: 4,
  },
]

/** Whether the line y = mx + b meets the data set's target. */
export function isSolved(set: DataSet, m: number, b: number): boolean {
  const error = sumSquaredError(m, b, set.points)
  return set.target === 0 ? isZero(error) : error < set.target
}

/** The fourth practice set: a boundary to place, not a line to fit. Its points are `GROUPS`. */
export const BOUNDARY_SET = { id: 'groups', name: 'Two groups' } as const

/** Whether the line y = mx + b puts every A above it and every B below it. */
export function isSplit(m: number, b: number): boolean {
  return misclassified(m, b, GROUPS).length === 0
}
