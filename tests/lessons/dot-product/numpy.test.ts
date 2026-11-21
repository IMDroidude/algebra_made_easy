import { describe, expect, it } from 'vitest'
import type { Vec2 } from '../../../src/linalg'
import { rankBySimilarity } from '../../../src/linalg/projection'
import {
  DOCS,
  PRACTICE_CHECKS,
  QUERY,
  searchSnippet,
  understandSnippet,
} from '../../../src/lessons/dot-product/content'
import { pyFixed, pyFloat, pyScalar } from '../../../src/lessons/dot-product/pyFormat'
import fixtures from './numpy-fixtures.json'

describe('Python number printing', () => {
  // Expected strings are what Python 3 / NumPy 2 print.
  it('f"{x:.3f}" rounds exact ties to even, unlike toFixed', () => {
    expect(pyFixed(0.0625, 3)).toBe('0.062')
    expect(pyFixed(0.1875, 3)).toBe('0.188')
    expect(pyFixed(0.125, 2)).toBe('0.12')
    expect(pyFixed(2.5, 0)).toBe('2')
    expect(pyFixed(0.7071067811865476, 3)).toBe('0.707')
    expect(pyFixed(1.0000000000000002, 3)).toBe('1.000')
  })

  it('keeps the sign of negative zero, and prints nan', () => {
    expect(pyFixed(-0, 3)).toBe('-0.000')
    expect(pyFixed(-0.0001, 3)).toBe('-0.000')
    expect(pyFixed(0, 3)).toBe('0.000')
    expect(pyFixed(NaN, 3)).toBe('nan')
  })

  it('prints floats like print(np.float64(x)) and ints like print(np.int64(x))', () => {
    expect(pyFloat(5)).toBe('5.0')
    expect(pyFloat(2.5)).toBe('2.5')
    expect(pyFloat(-0)).toBe('-0.0')
    expect(pyScalar(11, true)).toBe('11')
    expect(pyScalar(-3, true)).toBe('-3')
    expect(pyScalar(5.5, false)).toBe('5.5')
  })
})

describe('step 4 snippet matches real NumPy', () => {
  it('default a = (4, 1), b = (2, 3)', () => {
    const s = understandSnippet([4, 1], [2, 3])
    expect(s.output).toBe('11\n4.12 3.61\n0.740')
    expect(s.code).toContain('a = np.array([4, 1])')
    expect(s.warns).toBe(false)
  })

  it('a zero vector prints nan and is flagged for the warning note', () => {
    const s = understandSnippet([0, 0], [1, 2])
    expect(s.output).toBe('0\n0.00 2.24\nnan')
    expect(s.warns).toBe(true)
  })

  it.each(fixtures.dot)('a = $a, b = $b', ({ a, b, numpy }) => {
    expect(understandSnippet(a as Vec2, b as Vec2).output).toBe(numpy)
  })
})

describe('step 5 search snippet matches real NumPy', () => {
  const run = (docs: Vec2[], q: Vec2, by: 'cosine' | 'dot') =>
    searchSnippet(docs, q, by, rankBySimilarity(q, docs, by)!).output

  it('defaults, by cosine and by dot product', () => {
    expect(run(DOCS, QUERY, 'cosine')).toBe(
      '1.000  Pet-friendly cafes\n0.923  What do cats eat?\n0.894  Puppy training tips',
    )
    expect(run(DOCS, QUERY, 'dot')).toBe(
      '13.000  Puppy training tips\n12.000  What do cats eat?\n9.500  Quick pasta recipes',
    )
  })

  it.each(fixtures.search)('docs = $docs, q = $q, by $by', ({ docs, q, by, numpy }) => {
    expect(run(docs as Vec2[], q as Vec2, by as 'cosine' | 'dot')).toBe(numpy)
  })

  it('treats a −0 coordinate (which dragging can produce) as the 0 the code shows', () => {
    // Python reads the literal "0" as +0, so (−1, 0) · (0, −1.5) is −0 in NumPy, printed "-0.000".
    const docs: Vec2[] = [[-1, -0], [0, -1], [1, 0], [0, 1], [-2, 0.5]]
    expect(run(docs, [-0, -1.5], 'cosine')).toBe(
      '1.000  What do cats eat?\n-0.000  Puppy training tips\n0.000  Quick pasta recipes',
    )
  })
})

describe('step 6 challenges (u = (2, −1))', () => {
  const solved = (w: Vec2) => Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](w))

  it('the starting position solves nothing', () => {
    expect(solved([3, 2])).toEqual([])
  })

  it('each challenge has a solution on the half-step grid', () => {
    expect(solved([1, 2])).toEqual(['perpendicular'])
    expect(solved([-4, 2])).toEqual(['opposite'])
    expect(solved([3, 1])).toEqual(['shadow'])
    expect(solved([1, 0])).toEqual(['unit'])
  })

  it('rejects the near misses', () => {
    expect(solved([0, 0])).toEqual([]) // zero vector: dot is 0 but there is no direction
    expect(solved([2, -1])).toEqual([]) // w on top of u is excluded from "same shadow"
    expect(solved([-1, 0])).toEqual([]) // unit, but leaning away from u
  })
})
