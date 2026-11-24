import { describe, expect, it } from 'vitest'
import { approxEqual } from '../../src/linalg'
import { dotTerms, extremePairs, pairwiseCosines, pairwiseDots } from '../../src/linalg/similarity'

const CAT = [4, 1, 0]
const TIGER = [4, 4, 0]
const CAR = [0, 3, 4]

describe('dotTerms', () => {
  it('multiplies matching entries; the terms add up to the dot product', () => {
    expect(dotTerms(CAT, TIGER)).toEqual([16, 4, 0])
    expect(dotTerms(CAT, CAR)).toEqual([0, 3, 0])
    expect(dotTerms(TIGER, CAR)).toEqual([0, 12, 0])
  })
})

describe('pairwiseDots', () => {
  it('is X @ X.T: symmetric, with squared lengths on the diagonal', () => {
    expect(pairwiseDots([CAT, TIGER, CAR])).toEqual([
      [17, 20, 3],
      [20, 32, 12],
      [3, 12, 25],
    ])
  })
})

describe('pairwiseCosines', () => {
  it('gives 1 on the diagonal and the cosine of each pair elsewhere', () => {
    const c = pairwiseCosines([CAT, TIGER, CAR])!
    expect(approxEqual(c[0][0], 1)).toBe(true)
    expect(c[0][1]).toBeCloseTo(20 / Math.sqrt(17 * 32), 12)
    expect(c[0][2]).toBeCloseTo(3 / (Math.sqrt(17) * 5), 12)
    expect(c[1][2]).toBeCloseTo(12 / (Math.sqrt(32) * 5), 12)
    expect(c[1][0]).toBe(c[0][1])
  })

  it('two features only: tiger and car look more alike', () => {
    const c = pairwiseCosines([[4, 1], [4, 4], [0, 3]])!
    expect(c[1][2]).toBeCloseTo(Math.SQRT1_2, 12)
    expect(c[0][2]).toBeCloseTo(1 / Math.sqrt(17), 12)
  })

  it('is null when any vector is zero', () => {
    expect(pairwiseCosines([CAT, [0, 0, 0], CAR])).toBeNull()
  })
})

describe('extremePairs', () => {
  it('finds the most and least similar pairs of different vectors', () => {
    const c = pairwiseCosines([CAT, TIGER, CAR])!
    expect(extremePairs(c)).toEqual({ closest: [0, 1], farthest: [0, 2] })
  })

  it('ignores the diagonal and keeps the first pair on a tie', () => {
    expect(extremePairs([[9, 1, 1], [1, 9, 1], [1, 1, 9]])).toEqual({ closest: [0, 1], farthest: [0, 1] })
  })

  it('is null with fewer than two vectors', () => {
    expect(extremePairs([[1]])).toBeNull()
  })
})
