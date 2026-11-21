import { Matrix as MlMatrix } from 'ml-matrix'
import { describe, expect, it } from 'vitest'
import {
  attention,
  attentionScores,
  closestByAngle,
  scaledScores,
  softmax,
  softmaxRows,
  softmaxSteps,
  weightedSum,
} from '../../src/linalg/attention'

const close = (a: number[], b: number[], digits = 10) =>
  a.forEach((x, i) => expect(x).toBeCloseTo(b[i], digits))

describe('softmax', () => {
  it('gives positive weights that sum to 1', () => {
    const w = softmax([2, -1, 0.5])
    expect(w.every((x) => x > 0)).toBe(true)
    expect(w.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12)
  })

  it('matches exp(x) / sum(exp(x))', () => {
    const xs = [1, 2, 3]
    const e = xs.map(Math.exp)
    const total = e[0] + e[1] + e[2]
    close(softmax(xs), e.map((x) => x / total))
  })

  it('turns equal scores into equal weights, whatever their size', () => {
    close(softmax([0, 0, 0]), [1 / 3, 1 / 3, 1 / 3])
    close(softmax([7, 7, 7]), [1 / 3, 1 / 3, 1 / 3])
  })

  it('does not change when the same number is added to every score', () => {
    close(softmax([1, 2, 3]), softmax([101, 102, 103]))
  })

  it('survives scores that would overflow exp (max-subtraction trick)', () => {
    expect(Math.exp(1000)).toBe(Infinity)
    const w = softmax([1000, 999, 0])
    expect(w.every(Number.isFinite)).toBe(true)
    close(w, softmax([1, 0, -999]))
  })

  it('never reaches exactly 0 or 1 for moderate scores', () => {
    const w = softmax([10, 0, 0])
    expect(w[0]).toBeLessThan(1)
    expect(w[1]).toBeGreaterThan(0)
  })

  it('temperature: small sharpens, large flattens', () => {
    const s = [2, 1, 0]
    const sharp = softmax(s, 0.25)
    const plain = softmax(s)
    const flat = softmax(s, 4)
    expect(sharp[0]).toBeGreaterThan(plain[0])
    expect(flat[0]).toBeLessThan(plain[0])
    close(softmax(s, 2), softmax([1, 0.5, 0]))
    expect(() => softmax(s, 0)).toThrow()
  })

  it('applies row by row', () => {
    const m = softmaxRows([
      [0, 0],
      [Math.log(3), 0],
    ])
    close(m[0], [0.5, 0.5])
    close(m[1], [0.75, 0.25])
  })
})

describe('scores', () => {
  const Q = [
    [1, 1.5],
    [2, -0.5],
    [-1, 0.5],
  ]
  const K = [
    [2, 0],
    [0.5, 1.5],
    [-1.5, -0.5],
  ]

  it('Q Kᵀ holds every query·key dot product', () => {
    expect(attentionScores(Q, K)).toEqual([
      [2, 2.75, -2.25],
      [4, 0.25, -2.75],
      [-2, 0.25, 1.25],
    ])
  })

  it('agrees with ml-matrix', () => {
    const ml = new MlMatrix(Q).mmul(new MlMatrix(K).transpose()).to2DArray()
    expect(attentionScores(Q, K)).toEqual(ml)
  })

  it('scales by √d_k', () => {
    const s = scaledScores(Q, K)
    close(s[0], [2 / Math.SQRT2, 2.75 / Math.SQRT2, -2.25 / Math.SQRT2])
  })

  it('rejects queries and keys of different lengths', () => {
    expect(() => attentionScores([[1, 2]], [[1, 2, 3]])).toThrow()
  })
})

describe('weightedSum', () => {
  it('equal weights give the plain average', () => {
    close(
      weightedSum([1 / 3, 1 / 3, 1 / 3], [
        [3, 0],
        [0, 3],
        [0, 0],
      ]),
      [1, 1],
    )
  })

  it('a weight of 1 picks one vector', () => {
    expect(weightedSum([0, 1], [[1, 2], [3, 4]])).toEqual([3, 4])
  })

  it('needs one weight per vector', () => {
    expect(() => weightedSum([1], [[1, 2], [3, 4]])).toThrow()
  })
})

describe('attention', () => {
  const Q = [
    [1, 1.5],
    [2, -0.5],
    [-1, 0.5],
  ]
  const K = [
    [2, 0],
    [0.5, 1.5],
    [-1.5, -0.5],
  ]
  const V = [
    [2, 1],
    [-1, 2],
    [0.5, -2],
  ]

  it('every row of weights sums to 1, and output row i is the weighted sum of values', () => {
    const r = attention(Q, K, V)
    for (let i = 0; i < 3; i++) {
      expect(r.weights[i].reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12)
      close(r.output[i], weightedSum(r.weights[i], V))
    }
  })

  it('matches the formula softmax(Q Kᵀ / √d_k) V computed independently', () => {
    const scores = new MlMatrix(Q).mmul(new MlMatrix(K).transpose()).div(Math.sqrt(2))
    const e = scores.to2DArray().map((row) => row.map(Math.exp))
    const w = e.map((row) => row.map((x) => x / (row[0] + row[1] + row[2])))
    const out = new MlMatrix(w).mmul(new MlMatrix(V)).to2DArray()
    const r = attention(Q, K, V)
    r.output.forEach((row, i) => close(row, out[i]))
  })

  it('a zero query attends to every token equally and outputs the average value', () => {
    const r = attention([[0, 0]], K, V)
    close(r.weights[0], [1 / 3, 1 / 3, 1 / 3])
    close(r.output[0], [0.5, 1 / 3])
  })

  it('needs one value per key', () => {
    expect(() => attention(Q, K, V.slice(0, 2))).toThrow()
  })
})

describe('closestByAngle', () => {
  it('picks the key with the smallest angle, not the longest', () => {
    expect(closestByAngle([1, 1.5], [[2, 0], [0.5, 1.5], [-1.5, -0.5]])).toBe(1)
    expect(closestByAngle([1, 0], [[5, 5], [0.5, 0]])).toBe(1)
  })
  it('returns -1 for a zero query and skips zero keys', () => {
    expect(closestByAngle([0, 0], [[1, 0]])).toBe(-1)
    expect(closestByAngle([1, 0], [[0, 0], [-1, 0]])).toBe(1)
  })
})

describe('softmaxSteps', () => {
  it('exposes scaled scores, exponentials and their total, and weights = exps / total', () => {
    const st = softmaxSteps([2, 3, -2.25], Math.SQRT2)
    close(st.scaled, [2 / Math.SQRT2, 3 / Math.SQRT2, -2.25 / Math.SQRT2])
    close(st.exps, st.scaled.map(Math.exp))
    expect(st.total).toBeCloseTo(st.exps[0] + st.exps[1] + st.exps[2], 12)
    close(st.weights, st.exps.map((e) => e / st.total))
    // The lesson's step 4 example, query 1 at T = √2 (checked with NumPy)
    expect(st.scaled.map((x) => Number(x.toFixed(2)))).toEqual([1.41, 2.12, -1.59])
    expect(st.exps.map((x) => Number(x.toFixed(2)))).toEqual([4.11, 8.34, 0.2])
    expect(st.total.toFixed(2)).toBe("12.66")
    expect(st.weights.map((x) => Number(x.toFixed(2)))).toEqual([0.32, 0.66, 0.02])
  })
})
