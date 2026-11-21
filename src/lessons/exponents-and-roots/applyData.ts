/** Example data for the Apply step of lesson 2.4. */
import type { Vec2 } from '../../linalg'

/** The model's predictions lie on this line: y = 0.5x + 0.5. */
export const ERROR_LINE = { m: 0.5, b: 0.5 }

/** Inputs of the four examples. The last one's true value can be dragged. */
export const ERROR_XS = [-3, -1, 1, 3]

/** True values of the first three examples. */
export const ERROR_TARGETS = [-0.5, 0.5, 0.5]

export function predictionAt(x: number): number {
  return ERROR_LINE.m * x + ERROR_LINE.b
}

/** Error of each example: true value minus prediction. */
export function errorsFor(targets: readonly number[]): number[] {
  return targets.map((t, k) => t - predictionAt(ERROR_XS[k]))
}

/** Two toy 2D "embeddings". */
export const EMBED_A: Vec2 = [2, 1.5]
export const EMBED_B: Vec2 = [-1, -0.5]
