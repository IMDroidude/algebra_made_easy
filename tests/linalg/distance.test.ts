import { describe, expect, it } from 'vitest'
import { approxEqual } from '../../src/linalg'
import {
  chebyshev,
  euclidean,
  hamming,
  jaccard,
  manhattan,
  mean,
  minMaxScale,
  minkowski,
  minkowskiBall,
  pearson,
} from '../../src/linalg/distance'

const A = [2, 3]
const B = [5, 7]

describe('Euclidean, Manhattan, Chebyshev', () => {
  it('measure the same gap three ways', () => {
    expect(euclidean(A, B)).toBe(5)
    expect(manhattan(A, B)).toBe(7)
    expect(chebyshev(A, B)).toBe(4)
  })

  it('are 0 for identical vectors and symmetric', () => {
    for (const d of [euclidean, manhattan, chebyshev]) {
      expect(d(A, A)).toBe(0)
      expect(d(A, B)).toBe(d(B, A))
    }
  })

  it('always order as Chebyshev ≤ Euclidean ≤ Manhattan', () => {
    const pairs = [[[1, 1], [4, 3]], [[0, 0], [-2, 5]], [[1, 1, 1, 1], [2, 2, 2, 2]], [[3, -1], [3, 6]]]
    for (const [a, b] of pairs) {
      expect(chebyshev(a, b)).toBeLessThanOrEqual(euclidean(a, b))
      expect(euclidean(a, b)).toBeLessThanOrEqual(manhattan(a, b))
    }
  })

  it('disagree about which of Q and R is closer to P', () => {
    const P = [1, 1, 1, 1]
    const Q = [2, 2, 2, 2]
    const R = [1, 1, 1, 4]
    expect([euclidean(P, Q), euclidean(P, R)]).toEqual([2, 3])
    expect([manhattan(P, Q), manhattan(P, R)]).toEqual([4, 3])
    expect([chebyshev(P, Q), chebyshev(P, R)]).toEqual([1, 3])
  })
})

describe('minkowski', () => {
  it('is Manhattan at p = 1, Euclidean at p = 2, Chebyshev at p = ∞', () => {
    expect(minkowski(A, B, 1)).toBe(7)
    expect(minkowski(A, B, 2)).toBe(5)
    expect(minkowski(A, B, Infinity)).toBe(4)
  })

  it('falls from Manhattan towards Chebyshev as p grows', () => {
    expect(minkowski(A, B, 3)).toBeCloseTo(4.4979, 4)
    expect(minkowski(A, B, 10)).toBeCloseTo(4.022, 3)
    expect(minkowski(A, B, 1.5)).toBeLessThan(7)
    expect(minkowski(A, B, 1.5)).toBeGreaterThan(5)
  })
})

describe('minkowskiBall', () => {
  it.each([1, 1.5, 2, 4, Infinity])('every outline point is at the radius for p = %s', (p) => {
    const centre: [number, number] = [2, 1]
    const outline = minkowskiBall(centre, 3, p)
    for (const point of outline) expect(approxEqual(minkowski(point, centre, p), 3)).toBe(true)
    expect(outline.at(-1)![0]).toBeCloseTo(outline[0][0], 9)
  })

  it('is a diamond for p = 1 and a square for p = ∞', () => {
    const diamond = minkowskiBall([0, 0], 1, 1, 8)
    expect(diamond[1][0]).toBeCloseTo(0.5, 9)
    expect(diamond[1][1]).toBeCloseTo(0.5, 9)
    const square = minkowskiBall([0, 0], 1, Infinity, 8)
    expect(square[1][0]).toBeCloseTo(1, 9)
    expect(square[1][1]).toBeCloseTo(1, 9)
  })
})

describe('hamming', () => {
  it('counts positions that differ', () => {
    expect(hamming([1, 0, 1, 1, 0, 1], [1, 1, 1, 0, 0, 1])).toBe(2)
    expect(hamming([...'GATTACA'], [...'GACTATA'])).toBe(2)
    expect(hamming([1, 1, 1, 1, 0, 0], [1, 1, 0, 0, 1, 0])).toBe(3)
  })
})

describe('jaccard', () => {
  it('is shared items over all items, ignoring shared absences', () => {
    // {milk, bread, eggs, butter} and {milk, bread, jam}
    expect(jaccard([1, 1, 1, 1, 0, 0], [1, 1, 0, 0, 1, 0])).toBe(0.4)
    // The same baskets in a bigger shop: nothing changes.
    expect(jaccard([1, 1, 1, 1, 0, 0, 0, 0, 0], [1, 1, 0, 0, 1, 0, 0, 0, 0])).toBe(0.4)
    expect(jaccard([1, 0], [1, 0])).toBe(1)
    expect(jaccard([1, 0], [0, 1])).toBe(0)
  })

  it('is null for two empty sets', () => {
    expect(jaccard([0, 0, 0], [0, 0, 0])).toBeNull()
  })
})

describe('pearson', () => {
  const ali = [5, 5, 3, 2]
  const sara = [4, 4, 2, 1]
  const omar = [2, 3, 5, 5]

  it('ignores a constant offset between raters', () => {
    expect(pearson(ali, sara)).toBeCloseTo(1, 12)
  })

  it('is negative for opposite tastes', () => {
    expect(pearson(ali, omar)).toBeCloseTo(-25 / 27, 12)
    expect(mean(ali)).toBe(3.75)
  })

  it('is null when one vector never changes', () => {
    expect(pearson([3, 3, 3], [1, 2, 3])).toBeNull()
  })
})

describe('minMaxScale', () => {
  it('maps every column onto 0…1', () => {
    expect(minMaxScale([[900, 1], [1500, 3], [2400, 4]])).toEqual([
      [0, 0],
      [0.4, 2 / 3],
      [1, 1],
    ])
  })

  it('turns a constant column into zeros', () => {
    expect(minMaxScale([[5, 1], [5, 3]])).toEqual([[0, 0], [0, 1]])
  })
})
