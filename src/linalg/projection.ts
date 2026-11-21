/**
 * Lengths, directions, projections and similarity.
 *
 * Every function that has to divide by a length returns `null` when that
 * length is zero (within tolerance), instead of NaN: a zero vector has no
 * direction, so "the angle with it" or "the shadow on it" is undefined, and
 * callers must say so rather than show a meaningless number.
 */
import { isZero } from './tolerance'
import type { Vec } from './types'
import { dot, norm, scale } from './vector'

/** True when the vector has (approximately) zero length. */
export function isZeroVec(v: Vec): boolean {
  return isZero(norm(v))
}

/** The unit vector pointing the same way as v, or null for the zero vector. */
export function normalize<T extends Vec>(v: T): T | null {
  const n = norm(v)
  if (isZero(n)) return null
  return scale(v, 1 / n)
}

/**
 * Signed length of v's shadow on the line through `onto`: positive when the
 * shadow points the same way as `onto`, negative when it points backwards.
 * Equals v · onto / |onto|. Null when `onto` is the zero vector.
 */
export function scalarProjection(v: Vec, onto: Vec): number | null {
  const n = norm(onto)
  if (isZero(n)) return null
  return dot(v, onto) / n
}

/**
 * The shadow of v on the line through `onto`, as a vector:
 * (v · onto / onto · onto) onto. Null when `onto` is the zero vector.
 */
export function projectOnto<T extends Vec>(v: T, onto: T): T | null {
  const nn = dot(onto, onto)
  if (isZero(Math.sqrt(nn))) return null
  return scale(onto, dot(v, onto) / nn)
}

/**
 * Cosine similarity: a · b / (|a| |b|), a number from −1 to 1. Computed in
 * exactly that order, which is also how the lessons' NumPy code computes it,
 * so the two agree to the last bit. It is deliberately not clamped: rounding
 * can give 1.0000000000000002 for parallel vectors, as it does in NumPy, and
 * ranking must see the same values NumPy sees. Null when either vector has
 * zero length.
 */
export function cosineSimilarity(a: Vec, b: Vec): number | null {
  const na = norm(a)
  const nb = norm(b)
  if (isZero(na) || isZero(nb)) return null
  return dot(a, b) / (na * nb)
}

/** The angle between two vectors in degrees, from 0 to 180. Null if either is zero. */
export function angleBetweenDeg(a: Vec, b: Vec): number | null {
  const c = cosineSimilarity(a, b)
  if (c === null) return null
  if (isZero(dot(a, b))) return 90
  // Rounding can push the ratio a hair outside [−1, 1], where acos is NaN.
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI
}

export type DotSign = 'positive' | 'zero' | 'negative'

/** Whether a · b is positive, zero (perpendicular, within tolerance) or negative. */
export function dotSign(a: Vec, b: Vec): DotSign {
  const d = dot(a, b)
  if (isZero(d)) return 'zero'
  return d > 0 ? 'positive' : 'negative'
}

export type Ranked = { index: number; score: number }

/**
 * Scores each document against the query and sorts best first. Ties keep
 * their original order (like NumPy's `argsort(-scores, kind="stable")`).
 * `by: 'cosine'` divides by both lengths; `by: 'dot'` uses the raw dot product.
 * Returns null when cosine is asked for and the query or any document is zero.
 */
export function rankBySimilarity(
  query: Vec,
  docs: Vec[],
  by: 'cosine' | 'dot' = 'cosine',
): Ranked[] | null {
  const scores: number[] = []
  for (const d of docs) {
    const s = by === 'cosine' ? cosineSimilarity(d, query) : dot(d, query)
    if (s === null) return null
    scores.push(s)
  }
  return scores
    .map((score, index) => ({ index, score }))
    .sort((p, q) => q.score - p.score || p.index - q.index)
}

/** ReLU, applied to each entry: negative numbers become 0, the rest pass through. */
export function relu<T extends Vec>(v: T): T {
  return v.map((x) => Math.max(0, x)) as T
}
