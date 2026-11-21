import { describe, expect, it } from 'vitest'
import { isInteger } from '../../../src/lib/format'
import { add, angleDeg, norm, scale, sub } from '../../../src/linalg'
import type { Vec2 } from '../../../src/linalg'
import { WORDS, analogy, nearestWord } from '../../../src/lessons/scalars-and-vectors/embeddings'
import { hasNegativeZero, numpyPrint1d } from '../../../src/lessons/scalars-and-vectors/numpyOut'
import { scaleEffect } from '../../../src/lessons/scalars-and-vectors/ops'
import { PRACTICE_START, solvedChallenges } from '../../../src/lessons/scalars-and-vectors/practice'
import fixtures from './numpy-fixtures.json'

describe('numpyPrint1d matches real NumPy', () => {
  it('prints the cases checked by hand against NumPy 2.4', () => {
    expect(numpyPrint1d([1, 3], true)).toBe('[1 3]')
    expect(numpyPrint1d([3, -1], true)).toBe('[ 3 -1]')
    expect(numpyPrint1d([-1, -0], false)).toBe('[-1. -0.]')
    expect(numpyPrint1d([2, -0], false)).toBe('[ 2. -0.]')
    expect(numpyPrint1d(scale([0, 2] as Vec2, -0.5), false)).toBe('[-0. -1.]')
    expect(numpyPrint1d([0.375, 1.5], false)).toBe('[0.375 1.5  ]')
    expect(numpyPrint1d([-0.25, 10], false)).toBe('[-0.25 10.  ]')
  })

  it('agrees with NumPy on u + v, u − v and k * u for 405 sampled inputs', () => {
    for (const c of fixtures.ops) {
      const u = c.u as Vec2
      const v = c.v as Vec2
      const intSum = isInteger(...u, ...v)
      const intScale = isInteger(c.k, ...u)
      expect(numpyPrint1d(add(u, v), intSum), JSON.stringify(c)).toBe(c.sum)
      expect(numpyPrint1d(sub(u, v), intSum), JSON.stringify(c)).toBe(c.diff)
      expect(numpyPrint1d(scale(u, c.k), intScale), JSON.stringify(c)).toBe(c.scaled)
    }
  })

  it('agrees with NumPy on king − man + woman for 151 sampled inputs', () => {
    for (const c of fixtures.analogy) {
      const input = { king: c.king as Vec2, man: c.man as Vec2, woman: c.woman as Vec2 }
      const integer = isInteger(...input.king, ...input.man, ...input.woman)
      expect(numpyPrint1d(analogy(input), integer), JSON.stringify(c)).toBe(c.out)
    }
  })

  it('detects a negative zero so the lesson can explain it', () => {
    expect(hasNegativeZero(scale([0, 2] as Vec2, -0.5))).toBe(true)
    expect(hasNegativeZero([0, 1])).toBe(false)
  })
})

describe('numbers shown in the lesson', () => {
  it('step 1: w = (3, 2) has length 3.61 and points 34° from the x-axis', () => {
    expect(norm([3, 2])).toBeCloseTo(3.6056, 4)
    expect(Math.round(angleDeg([3, 2]))).toBe(34)
  })

  it('step 2 / 4 defaults: u = (2, 1), v = (−1, 2), k = 2', () => {
    const u: Vec2 = [2, 1]
    const v: Vec2 = [-1, 2]
    expect(add(u, v)).toEqual([1, 3])
    expect(sub(u, v)).toEqual([3, -1])
    expect(scale(u, 2)).toEqual([4, 2])
  })

  it('step 3: u − v for u = (3, 1), v = (1, 3), and the two wrong answers', () => {
    const u: Vec2 = [3, 1]
    const v: Vec2 = [1, 3]
    expect(sub(u, v)).toEqual([2, -2])
    expect(add(v, sub(u, v))).toEqual(u) // starting at v's tip and adding u − v reaches u
    expect(sub(v, u)).toEqual([-2, 2])
    expect(add(u, v)).toEqual([4, 4])
  })

  it('scaleEffect describes k in words', () => {
    expect(scaleEffect(0)).toMatch(/zero vector/)
    expect(scaleEffect(-1)).toMatch(/opposite way, and it keeps its length/)
    expect(scaleEffect(2)).toMatch(/direction stays the same; the arrow gets 2 times longer/)
    expect(scaleEffect(0.5)).toMatch(/shrinks to 0.5 of its length/)
  })
})

describe('embeddings (step 5)', () => {
  it('king − man + woman lands at (4.5, 3.5), 0.5 from queen', () => {
    const result = analogy({ king: WORDS.king, man: WORDS.man, woman: WORDS.woman })
    expect(result).toEqual([4.5, 3.5])
    expect(sub(WORDS.woman, WORDS.man)).toEqual([0.5, 2])
    const best = nearestWord(WORDS, result, ['king', 'man', 'woman'])
    expect(best.word).toBe('queen')
    expect(best.distance).toBeCloseTo(0.5)
  })

  it('dragging woman far away changes the nearest word', () => {
    const result = analogy({ king: WORDS.king, man: WORDS.man, woman: [-4, -3] })
    expect(nearestWord(WORDS, result, ['king', 'man', 'woman']).word).not.toBe('queen')
  })
})

describe('practice checks', () => {
  it('none is solved at the start', () => {
    expect(solvedChallenges(PRACTICE_START)).toEqual([])
    expect(solvedChallenges({ ...PRACTICE_START, op: 'subtract' })).toEqual([])
    expect(solvedChallenges({ ...PRACTICE_START, op: 'scale' })).toEqual([])
  })

  it('the example answers in the insights tick their challenge', () => {
    expect(solvedChallenges({ op: 'add', u: [-1, 0], v: [-2, 2], k: 1 })).toEqual(['sum'])
    expect(solvedChallenges({ op: 'add', u: [-4, 4], v: [1, -2], k: 1 })).toEqual(['sum'])
    expect(solvedChallenges({ op: 'subtract', u: [1, -1], v: [1, 2], k: 1 })).toEqual(['diff'])
    expect(solvedChallenges({ op: 'scale', u: [2, -1], v: [0, 0], k: -1.5 })).toEqual(['negative'])
    expect(solvedChallenges({ op: 'scale', u: [3, -1.5], v: [0, 0], k: -1 })).toEqual(['negative'])
    expect(solvedChallenges({ op: 'scale', u: [1, 1], v: [0, 0], k: 0 })).toEqual(['zero'])
  })

  it('a positive k does not count as the negative-scalar answer', () => {
    expect(solvedChallenges({ op: 'scale', u: [-3, 1.5], v: [0, 0], k: 1 })).toEqual([])
  })

  it('k = 0 with u = 0 does not count as making a vector vanish', () => {
    expect(solvedChallenges({ op: 'scale', u: [0, 0], v: [0, 0], k: 0 })).toEqual([])
  })
})
