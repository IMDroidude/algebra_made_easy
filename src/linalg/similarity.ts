/**
 * Similarity between every pair in a small set of vectors.
 *
 * `pairwiseDots` is what NumPy computes with `X @ X.T` when the vectors are
 * the rows of X; `pairwiseCosines` divides entry (i, j) by |row i| |row j|,
 * in that order, so it agrees with `dots / np.outer(lengths, lengths)`.
 */
import { cosineSimilarity } from './projection'
import type { Vec } from './types'
import { dot } from './vector'

/** The products of matching entries: the terms that a · b adds up. */
export function dotTerms(a: Vec, b: Vec): number[] {
  return a.map((x, k) => x * b[k])
}

/** Entry [i][j] is vectors[i] · vectors[j]. Symmetric; the diagonal holds squared lengths. */
export function pairwiseDots(vectors: Vec[]): number[][] {
  return vectors.map((a) => vectors.map((b) => dot(a, b)))
}

/**
 * Entry [i][j] is the cosine similarity of vectors[i] and vectors[j].
 * Null when any vector has zero length, since its row would be undefined.
 */
export function pairwiseCosines(vectors: Vec[]): number[][] | null {
  const rows: number[][] = []
  for (const a of vectors) {
    const row: number[] = []
    for (const b of vectors) {
      const c = cosineSimilarity(a, b)
      if (c === null) return null
      row.push(c)
    }
    rows.push(row)
  }
  return rows
}

export type Pair = [i: number, j: number]

/**
 * The most and least similar pairs of *different* vectors (i < j) in a
 * symmetric score matrix. Ties go to the pair that comes first.
 */
export function extremePairs(scores: number[][]): { closest: Pair; farthest: Pair } | null {
  let closest: Pair | null = null
  let farthest: Pair | null = null
  for (let i = 0; i < scores.length; i++) {
    for (let j = i + 1; j < scores.length; j++) {
      if (!closest || scores[i][j] > scores[closest[0]][closest[1]]) closest = [i, j]
      if (!farthest || scores[i][j] < scores[farthest[0]][farthest[1]]) farthest = [i, j]
    }
  }
  return closest && farthest ? { closest, farthest } : null
}
