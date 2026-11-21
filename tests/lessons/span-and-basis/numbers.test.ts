import { describe, expect, it } from 'vitest'
import { isInteger } from '../../../src/lib/format'
import { approxEqualVec } from '../../../src/linalg'
import type { Vec2 } from '../../../src/linalg'
import { canReach2, combine2, rank2, spanKind2 } from '../../../src/linalg/span'
import { numpyPrint1d } from '../../../src/lessons/scalars-and-vectors/numpyOut'
import {
  F1,
  F2_GOOD,
  F2_REDUNDANT,
  MOVIE_START,
  decompose,
  featureSnippet,
} from '../../../src/lessons/span-and-basis/features'
import { PRACTICE_START, TARGET, solvedChallenges } from '../../../src/lessons/span-and-basis/practice'
import { numpyCombine } from '../../../src/lessons/span-and-basis/numpyMath'
import { rankMeaning, spanSentence } from '../../../src/lessons/span-and-basis/spanText'
import fixtures from './numpy-fixtures.json'

describe('NumPy outputs match real NumPy', () => {
  it('step 4: a * u + b * v and matrix_rank for 404 sampled inputs', () => {
    for (const c of fixtures.combination) {
      const u = c.u as Vec2
      const v = c.v as Vec2
      const w = numpyCombine(c.a, u, c.b, v)
      expect(approxEqualVec(w, combine2(c.a, u, c.b, v))).toBe(true) // same value the lesson shows
      expect(numpyPrint1d(w, isInteger(...u, ...v, c.a, c.b)), JSON.stringify(c)).toBe(c.w)
      expect(rank2([u, v]), JSON.stringify(c)).toBe(c.rank)
    }
  })

  it('step 5: np.linalg.solve and the rebuilt movie for every position on the plane', () => {
    expect(fixtures.solve).toHaveLength(441)
    for (const c of fixtures.solve) {
      const d = decompose(c.x as Vec2, F1, F2_GOOD)
      if (!d.ok) throw new Error('expected a solution')
      expect(numpyPrint1d(d.c, false), JSON.stringify(c)).toBe(c.c)
      expect(numpyPrint1d(d.rebuilt, false), JSON.stringify(c)).toBe(c.rebuilt)
    }
  })

  it('step 5: the redundant feature gives the error NumPy raises', () => {
    expect(featureSnippet(MOVIE_START, F2_REDUNDANT).output.split('\n').at(-1)).toBe(fixtures.singular)
  })

  it('step 5 defaults print [2. 1.] and [3. 1.]', () => {
    expect(featureSnippet(MOVIE_START, F2_GOOD).output).toBe('[2. 1.]\n[3. 1.]')
  })
})

describe('numbers shown in the lesson', () => {
  it('step 1: u + 2v = (0, 3)', () => {
    expect(combine2(1, [2, 1], 2, [-1, 1])).toEqual([0, 3])
  })

  it('step 2 hints: (4, 2) and (−2, −1) lie on the line of u = (2, 1)', () => {
    expect(spanKind2([[2, 1], [4, 2]])).toBe('line')
    expect(spanKind2([[2, 1], [-2, -1]])).toBe('line')
  })

  it('step 3: u = (1, 2), v = (−1.5, −3) span the line y = 2x, not (1, 0)', () => {
    const u: Vec2 = [1, 2]
    const v: Vec2 = [-1.5, -3]
    expect(spanKind2([u, v])).toBe('line')
    expect(canReach2(u, v, [2, 4])).toBe(true)
    expect(canReach2(u, v, [1, 0])).toBe(false)
    expect(combine2(1.5, u, 1, v)).toEqual([0, 0])
    expect(combine2(1, u, 0, v)).toEqual(u)
  })

  it('step 5: the movie (3, 1) is 2·f1 + 1·f2, and the redundant feature is −1 × f1', () => {
    const d = decompose(MOVIE_START, F1, F2_GOOD)
    expect(d.ok && d.c).toEqual([2, 1])
    expect(F2_REDUNDANT).toEqual([-F1[0], -F1[1]])
    expect(decompose(MOVIE_START, F1, F2_REDUNDANT).ok).toBe(false)
  })

  it('describes each kind of span', () => {
    expect(spanSentence('plane', 2)).toMatch(/whole plane/)
    expect(spanSentence('line', 2)).toMatch(/only a line/)
    expect(spanSentence('point', 2)).toMatch(/single point/)
    expect(spanSentence('line', 1)).toMatch(/line through the origin/)
    expect(spanSentence('point', 1)).toMatch(/single point/)
    expect(rankMeaning(2)).toBe('the whole plane')
    expect(rankMeaning(1)).toBe('a line through the origin')
    expect(rankMeaning(0)).toBe('only the origin')
  })
})

describe('practice checks', () => {
  const none = new Set<string>()

  it('none is solved at the start', () => {
    expect(solvedChallenges(PRACTICE_START, none)).toEqual([])
  })

  it('collapse, then restore', () => {
    const collapsed = { ...PRACTICE_START, v: [-4, 2] as Vec2 }
    expect(solvedChallenges(collapsed, none)).toEqual(['collapse'])
    // restoring only counts after a collapse
    expect(solvedChallenges(PRACTICE_START, none)).not.toContain('restore')
    expect(solvedChallenges(PRACTICE_START, new Set(['collapse']))).toContain('restore')
  })

  it('a zero vector does not count as collapsing', () => {
    expect(solvedChallenges({ ...PRACTICE_START, v: [0, 0] }, none)).toEqual([])
  })

  it('the star is reached with a = −1.75, b = −0.5 at the starting u and v', () => {
    expect(solvedChallenges({ ...PRACTICE_START, a: -1.75, b: -0.5 }, none)).toEqual(['reach'])
    expect(combine2(-1.75, PRACTICE_START.u, -0.5, PRACTICE_START.v)).toEqual(TARGET)
  })

  it('a collapsed pair reaches the star only along its line', () => {
    expect(solvedChallenges({ u: [-2, 0.5], v: [4, -1], a: 2, b: 0 }, none)).toEqual([
      'collapse',
      'reach-line',
    ])
    expect(solvedChallenges({ u: [2, 1], v: [4, 2], a: 1, b: 1 }, none)).toEqual(['collapse'])
  })
})
