import { Matrix } from 'ml-matrix'
import { describe, expect, it } from 'vitest'
import { approxEqual, approxEqualVec, dot, norm } from '../../src/linalg'
import type { Vec2 } from '../../src/linalg'
import {
  angleBetweenDeg,
  cosineSimilarity,
  dotSign,
  isZeroVec,
  normalize,
  projectOnto,
  rankBySimilarity,
  relu,
  scalarProjection,
} from '../../src/linalg/projection'

describe('normalize', () => {
  it('gives a unit vector in the same direction', () => {
    expect(approxEqualVec(normalize([3, 4])!, [0.6, 0.8])).toBe(true)
    const u = normalize([4, 1])!
    expect(approxEqual(norm(u), 1)).toBe(true)
    expect(approxEqual(u[0] / u[1], 4)).toBe(true)
  })

  it('returns null for the zero vector instead of NaN', () => {
    expect(normalize([0, 0])).toBeNull()
    expect(normalize([1e-9, 0])).toBeNull()
    expect(isZeroVec([0, 0])).toBe(true)
    expect(isZeroVec([0.5, 0])).toBe(false)
  })
})

describe('projection (the "shadow")', () => {
  it('step 1: the shadow of (2, 3) on (4, 0) is (2, 0), length 2, and 4 × 2 = a · b = 8', () => {
    expect(projectOnto<Vec2>([2, 3], [4, 0])).toEqual([2, 0])
    expect(scalarProjection([2, 3], [4, 0])).toBe(2)
    expect(dot([4, 0], [2, 3])).toBe(8)
    expect(norm([4, 0]) * scalarProjection([2, 3], [4, 0])!).toBe(8)
  })

  it('step 2 defaults: a = (4, 1), b = (2, 3)', () => {
    const a: Vec2 = [4, 1]
    const b: Vec2 = [2, 3]
    expect(dot(a, b)).toBe(11)
    expect(norm(a).toFixed(2)).toBe('4.12')
    expect(norm(b).toFixed(2)).toBe('3.61')
    expect(scalarProjection(b, a)!.toFixed(2)).toBe('2.67')
    expect(projectOnto(b, a)!.map((x) => x.toFixed(2))).toEqual(['2.59', '0.65'])
    expect(angleBetweenDeg(a, b)!.toFixed(1)).toBe('42.3')
  })

  it('is negative when the shadow points backwards', () => {
    expect(scalarProjection([-2, 1], [1, 0])).toBe(-2)
    expect(approxEqualVec(projectOnto<Vec2>([-2, 1], [1, 0])!, [-2, 0])).toBe(true)
  })

  it('is the zero vector for perpendicular arrows', () => {
    expect(approxEqualVec(projectOnto<Vec2>([-1, 3], [3, 1])!, [0, 0])).toBe(true)
  })

  it('the leftover part is perpendicular to the line', () => {
    const v: Vec2 = [2.5, -1]
    const onto: Vec2 = [1, 2]
    const proj = projectOnto(v, onto)!
    expect(approxEqual(dot([v[0] - proj[0], v[1] - proj[1]], onto), 0)).toBe(true)
  })

  it('is undefined (null) onto the zero vector', () => {
    expect(projectOnto<Vec2>([1, 2], [0, 0])).toBeNull()
    expect(scalarProjection([1, 2], [0, 0])).toBeNull()
  })

  it('agrees with ml-matrix: (v·u / u·u) u', () => {
    const v = Matrix.columnVector([3, -1.5])
    const u = Matrix.columnVector([2, 0.5])
    const k = v.transpose().mmul(u).get(0, 0) / u.transpose().mmul(u).get(0, 0)
    expect(approxEqualVec(projectOnto([3, -1.5], [2, 0.5])!, u.mul(k).to1DArray())).toBe(true)
  })
})

describe('cosine similarity and angle', () => {
  it('step 2 defaults give 0.740 (as NumPy prints it)', () => {
    expect(cosineSimilarity([4, 1], [2, 3])!.toFixed(3)).toBe('0.740')
  })

  it('is 1, 0 and −1 for same, perpendicular and opposite directions', () => {
    expect(cosineSimilarity([1, 2], [2, 4])).toBeCloseTo(1, 12)
    expect(cosineSimilarity([3, 1], [-1, 3])).toBe(0)
    expect(cosineSimilarity([2, -1], [-4, 2])).toBeCloseTo(-1, 12)
  })

  it('ignores length', () => {
    expect(cosineSimilarity([3, 2], [1, 1])).toBe(cosineSimilarity([3, 2], [2, 2]))
  })

  it('is the dot product of the two unit vectors', () => {
    const a: Vec2 = [4, 1]
    const b: Vec2 = [2, 3]
    expect(approxEqual(cosineSimilarity(a, b)!, dot(normalize(a)!, normalize(b)!))).toBe(true)
  })

  it('a · b = |a| |b| cos θ', () => {
    const a: Vec2 = [-1.5, 2]
    const b: Vec2 = [3, 0.5]
    const theta = (angleBetweenDeg(a, b)! * Math.PI) / 180
    expect(approxEqual(dot(a, b), norm(a) * norm(b) * Math.cos(theta))).toBe(true)
  })

  it('is undefined (null) when either vector is zero', () => {
    expect(cosineSimilarity([0, 0], [1, 2])).toBeNull()
    expect(cosineSimilarity([1, 2], [0, 0])).toBeNull()
    expect(angleBetweenDeg([0, 0], [1, 2])).toBeNull()
  })

  it('angle is exactly 90 for perpendicular arrows and never NaN at the extremes', () => {
    expect(angleBetweenDeg([3, 1], [-1, 3])).toBe(90)
    expect(angleBetweenDeg([1.5, 1], [3, 2])).toBeCloseTo(0, 5)
    expect(angleBetweenDeg([1.5, 1], [-3, -2])).toBeCloseTo(180, 5)
  })
})

describe('dot product sign', () => {
  it('step 3: (3, 1) · (−1, 3) = 0 although |a| |b| = 10', () => {
    expect(dot([3, 1], [-1, 3])).toBe(0)
    expect(approxEqual(norm([3, 1]) * norm([-1, 3]), 10)).toBe(true)
    expect(norm([3, 1]).toFixed(2)).toBe('3.16')
    expect(dotSign([3, 1], [-1, 3])).toBe('zero')
  })

  it('is positive under 90° and negative over 90°', () => {
    expect(dotSign([4, 1], [2, 3])).toBe('positive')
    expect(dotSign([4, 1], [-2, 3])).toBe('negative')
    expect(dotSign([0, 0], [2, 3])).toBe('zero')
  })
})

describe('rankBySimilarity', () => {
  const docs: Vec2[] = [
    [4, 0.5],
    [2, 3],
    [0.5, 4],
    [1.5, 1],
    [-2, -2.5],
  ]

  it('step 5: by cosine, the short on-topic document D4 ranks first', () => {
    const r = rankBySimilarity([3, 2], docs)!
    expect(r.map((x) => x.index)).toEqual([3, 1, 0, 2, 4])
    expect(r.slice(0, 3).map((x) => x.score.toFixed(3))).toEqual(['1.000', '0.923', '0.894'])
  })

  it('step 5: by raw dot product, D4 drops out of the top three', () => {
    const r = rankBySimilarity([3, 2], docs, 'dot')!
    expect(r.map((x) => x.score)).toEqual([13, 12, 9.5, 6.5, -11])
    expect(r.slice(0, 3).map((x) => x.index)).not.toContain(3)
  })

  it('keeps ties in their original order', () => {
    const r = rankBySimilarity([1, 0], [[0, 1], [1, 0], [2, 0], [0, -1]])!
    expect(r.map((x) => x.index)).toEqual([1, 2, 0, 3])
  })

  it('returns null when a cosine is undefined', () => {
    expect(rankBySimilarity([0, 0], docs)).toBeNull()
    expect(rankBySimilarity([1, 1], [[0, 0]])).toBeNull()
    expect(rankBySimilarity([0, 0], docs, 'dot')).not.toBeNull()
  })
})

describe('relu', () => {
  it('zeroes negative entries only', () => {
    expect(relu([3, -1])).toEqual([3, 0])
    expect(relu([-3, 1])).toEqual([0, 1])
    expect(relu([0.5, 2])).toEqual([0.5, 2])
  })
})
