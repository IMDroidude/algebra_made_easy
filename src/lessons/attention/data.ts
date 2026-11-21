/**
 * The invented numbers for this lesson. The words are made up and so are the
 * vectors: in a real model both come out of training.
 */
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import type { Vec2 } from '../../linalg'

/** A three-word "sentence" of made-up words. */
export const TOKENS = ['blip', 'zorp', 'fen'] as const

/** One colour per token, used for its key and its value. The query and output have their own. */
export const TOKEN_COLOR = [COLOR.i, COLOR.j, COLOR.grid] as const
export const QUERY_COLOR = COLOR.v
export const OUTPUT_COLOR = COLOR.result

/** Vectors stay inside ±3 so scores stay readable; the plane shows a little more. */
export const LIMIT = 3
export const EXTENT = 3.5
export const SNAP = snapTo(0.5, LIMIT)

export const START_Q: Vec2[] = [
  [1, 1.5],
  [2, -0.5],
  [-1, 0.5],
]
export const START_K: Vec2[] = [
  [2, 0],
  [0, 2],
  [-1.5, -0.5],
]
export const START_V: Vec2[] = [
  [2, 1],
  [-1.5, 2],
  [0.5, -2],
]

/** Step 3: one query, three keys; k3 is turned to point the same way as the query. */
export const PREDICT_Q: Vec2 = [2, 1]
export const PREDICT_K: Vec2[] = [
  [1, 1.5],
  [-1, 0.5],
  [0.5, -1.5],
]
export const PREDICT_K3_AFTER: Vec2 = [2, 1]

/** Step 4: what the scores are divided by before softmax. √2 is √d_k for 2D vectors. */
export const TEMPERATURES = [0.25, 0.5, 1, Math.SQRT2, 2, 4] as const
export const SQRT_DK_INDEX = 3

/** Step 6: a new sentence with new numbers, not seen earlier in the lesson. */
export const PRACTICE_TOKENS = ['kib', 'lom', 'ruv'] as const
export const PRACTICE_Q: Vec2 = [1, 0.5]
export const PRACTICE_K: Vec2[] = [
  [1.5, 1],
  [-0.5, 1.5],
  [-1, -1],
]

/** Replace item i of a list without mutating it. */
export function setAt<T>(list: readonly T[], i: number, item: T): T[] {
  return list.map((x, k) => (k === i ? item : x))
}

/** "q1", "k2", … with a subscript-free label that reads well on the plane. */
export const name = (letter: string, i: number) => `${letter}${i + 1}`
