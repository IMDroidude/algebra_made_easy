import { describe, expect, it } from 'vitest'
import type { Vec2 } from '../../../src/linalg'
import {
  PRACTICE_CHECKS,
  PRACTICE_START,
  QUIZ,
  QUIZ_MEASURES,
  docScores,
  docSnippet,
  normSnippet,
} from '../../../src/lessons/distance-and-similarity/content'
import {
  HOUSE_OUTPUT,
  NEAREST_RAW,
  NEAREST_SCALED,
  RAW_DISTANCES,
  SCALED_DISTANCES,
} from '../../../src/lessons/distance-and-similarity/houseMath'
import fixtures from './numpy-fixtures.json'

describe('step 4 snippet matches real NumPy', () => {
  it('the step 1 points', () => {
    const s = normSnippet([2, 3], [5, 7])
    expect(s.code).toContain('a = np.array([2, 3])')
    expect(s.output).toBe('7.0\n5.0\n4.0')
  })

  it.each(fixtures.norms)('a = $a, b = $b', ({ a, b, numpy }) => {
    expect(normSnippet(a as Vec2, b as Vec2).output).toBe(numpy)
  })
})

describe('step 5 document snippet matches real NumPy', () => {
  it.each(fixtures.docs)('B is $k times as long', ({ k, numpy }) => {
    expect(docSnippet(k).output).toBe(numpy)
  })

  it('keeps the comments lined up', () => {
    expect(docSnippet(5).code).toContain('B = 5 * A                 # sports article, 5 times as long')
    expect(docSnippet(10).code).toContain('B = 10 * A                # sports article, 10 times as long')
    expect(docSnippet(1).code).toContain('# sports article, the same length')
  })

  it('distance overtakes the politics note from 3 times the length; cosine never moves', () => {
    expect(docScores(2).ab.distance).toBeLessThan(docScores(2).ac.distance)
    expect(docScores(3).ab.distance).toBeGreaterThan(docScores(3).ac.distance)
    for (const k of [1, 2, 3, 10]) expect(docScores(k).ab.cosine).toBeCloseTo(1, 12)
    expect(docScores(1).ac.cosine).toBeCloseTo(0.2, 12)
  })
})

describe('running example: nearest house, raw and scaled', () => {
  it('prints exactly what NumPy prints', () => {
    expect(HOUSE_OUTPUT).toBe(fixtures.houses)
  })

  it('raw distance follows square feet; scaling changes the nearest house', () => {
    expect(NEAREST_RAW.id).toBe('E')
    expect(NEAREST_SCALED.id).toBe('F')
    expect(RAW_DISTANCES[4]).toBeCloseTo(200.0125, 3)
    expect(SCALED_DISTANCES[5]).toBeCloseTo(0.367, 3)
    expect(SCALED_DISTANCES[4]).toBeCloseTo(0.391, 3)
  })
})

describe('practice', () => {
  it('nothing is solved at the start', () => {
    for (const check of Object.values(PRACTICE_CHECKS)) expect(check(PRACTICE_START)).toBe(false)
  })

  it('each goal has a solution, and wrong positions are rejected', () => {
    expect(PRACTICE_CHECKS.straight([6, 1])).toBe(true)
    expect(PRACTICE_CHECKS.straight([2, 5])).toBe(true)
    expect(PRACTICE_CHECKS.straight([2, 1])).toBe(false)
    expect(PRACTICE_CHECKS.diagonal([5, 4])).toBe(true)
    expect(PRACTICE_CHECKS.diagonal([0, 3])).toBe(true)
    expect(PRACTICE_CHECKS.diagonal([2, 1])).toBe(false)
    expect(PRACTICE_CHECKS.parallel([6, 3])).toBe(true)
    // Same direction but too close, and the origin, do not count.
    expect(PRACTICE_CHECKS.parallel([4, 2])).toBe(false)
    expect(PRACTICE_CHECKS.parallel([0, 0])).toBe(false)
  })

  it('the quiz uses every measure exactly once', () => {
    expect(QUIZ.map((q) => q.answer).sort()).toEqual([...QUIZ_MEASURES].sort())
  })
})
