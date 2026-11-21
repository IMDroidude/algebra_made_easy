import { add, norm, sub } from '../../linalg'
import type { Vec2 } from '../../linalg'

/**
 * A made-up 2D "embedding" for a handful of words. Real embeddings are learned
 * from text and have hundreds of dimensions; these numbers are invented so the
 * famous analogy can be drawn on a plane.
 */
export const WORDS: Record<string, Vec2> = {
  man: [1, 1],
  woman: [1.5, 3],
  king: [4, 1.5],
  queen: [4.5, 4],
  apple: [-3.5, -2],
  banana: [-2, -3.5],
  car: [-3.5, 2.5],
}

export type Word = keyof typeof WORDS

/** The three words the learner can drag. */
export type AnalogyInput = { king: Vec2; man: Vec2; woman: Vec2 }

/** king − man + woman */
export function analogy({ king, man, woman }: AnalogyInput): Vec2 {
  return add(sub(king, man), woman)
}

/**
 * The word whose point is closest to `target`, leaving out the words given in
 * `exclude` (the usual rule: the input words themselves do not count as answers).
 */
export function nearestWord(
  points: Record<string, Vec2>,
  target: Vec2,
  exclude: readonly string[] = [],
): { word: string; distance: number } {
  let best = { word: '', distance: Infinity }
  for (const [word, p] of Object.entries(points)) {
    if (exclude.includes(word)) continue
    const distance = norm(sub(p, target))
    if (distance < best.distance) best = { word, distance }
  }
  return best
}
