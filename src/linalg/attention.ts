/**
 * Scaled dot-product attention, the core operation of a transformer:
 *
 *   Attention(Q, K, V) = softmax(Q Kᵀ / √d_k) V
 *
 * Q, K and V hold one vector per row (one row per token), as they do in NumPy
 * and in every ML library. Built only on the general matrix helpers.
 */
import { matMul, shape, transpose } from './matrix'
import { isZero } from './tolerance'
import { add, dot, norm, scale } from './vector'
import type { Matrix, Vec } from './types'

/**
 * Turns any list of scores into positive weights that sum to 1.
 * `temperature` divides the scores first: small values sharpen the result,
 * large values flatten it. The largest score is subtracted before `exp`
 * (it cancels out in the division) so big scores cannot overflow to Infinity.
 */
export function softmax(scores: Vec, temperature = 1): Vec {
  if (scores.length === 0) return []
  if (!(temperature > 0)) throw new Error('Temperature must be positive')
  const scaled = scores.map((s) => s / temperature)
  const max = Math.max(...scaled)
  const e = scaled.map((s) => Math.exp(s - max))
  const total = e.reduce((sum, x) => sum + x, 0)
  return e.map((x) => x / total)
}

export type SoftmaxSteps = {
  /** scores / temperature */
  scaled: Vec
  /** e to the power of each scaled score (not shifted, for showing; may be huge) */
  exps: Vec
  /** sum of `exps` */
  total: number
  /** the weights, computed the numerically safe way */
  weights: Vec
}

/** softmax with every intermediate exposed, for explaining it one step at a time. */
export function softmaxSteps(scores: Vec, temperature = 1): SoftmaxSteps {
  const scaled = scores.map((s) => s / temperature)
  const exps = scaled.map(Math.exp)
  const total = exps.reduce((sum, x) => sum + x, 0)
  return { scaled, exps, total, weights: softmax(scores, temperature) }
}

/** softmax applied to each row on its own: every row of the result sums to 1. */
export function softmaxRows(m: Matrix, temperature = 1): Matrix {
  return m.map((row) => softmax(row, temperature))
}

/** Q Kᵀ: entry (i, j) is the dot product of query i with key j. */
export function attentionScores(Q: Matrix, K: Matrix): Matrix {
  const [, dq] = shape(Q)
  const [, dk] = shape(K)
  if (dq !== dk) throw new Error(`Queries have ${dq} entries but keys have ${dk}`)
  return matMul(Q, transpose(K))
}

/** Q Kᵀ / √d_k, where d_k is the number of entries in each key. */
export function scaledScores(Q: Matrix, K: Matrix): Matrix {
  const dk = shape(K)[1]
  const root = Math.sqrt(dk)
  return attentionScores(Q, K).map((row) => row.map((s) => s / root))
}

/** Σ wⱼ vⱼ: the weighted sum of a list of vectors. */
export function weightedSum(weights: Vec, vectors: Vec[]): Vec {
  if (weights.length !== vectors.length || vectors.length === 0) {
    throw new Error(`Need one weight per vector: ${weights.length} weights, ${vectors.length} vectors`)
  }
  return vectors.reduce((sum, v, j) => add(sum, scale(v, weights[j])), scale(vectors[0], 0))
}

export type AttentionResult = {
  /** Q Kᵀ */
  scores: Matrix
  /** Q Kᵀ / √d_k */
  scaled: Matrix
  /** softmax of each row of `scaled` */
  weights: Matrix
  /** weights V: row i is the output for query i */
  output: Matrix
}

/** Every intermediate of scaled dot-product attention, for showing step by step. */
export function attention(Q: Matrix, K: Matrix, V: Matrix): AttentionResult {
  if (shape(K)[0] !== shape(V)[0]) {
    throw new Error(`Need one value per key: ${shape(K)[0]} keys, ${shape(V)[0]} values`)
  }
  const scores = attentionScores(Q, K)
  const scaled = scaledScores(Q, K)
  const weights = softmaxRows(scaled)
  const output = matMul(weights, V)
  return { scores, scaled, weights, output }
}

/**
 * Index of the key that points most nearly the same way as the query (largest
 * cosine of the angle between them), or -1 if the query or every key is zero.
 */
export function closestByAngle(query: Vec, keys: Vec[]): number {
  if (isZero(norm(query))) return -1
  let best = -1
  let bestCos = -Infinity
  keys.forEach((k, j) => {
    if (isZero(norm(k))) return
    const c = dot(query, k) / (norm(query) * norm(k))
    if (c > bestCos) {
      bestCos = c
      best = j
    }
  })
  return best
}
