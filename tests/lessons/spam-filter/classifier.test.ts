import { describe, expect, it } from 'vitest'
import { EMAILS } from '../../../src/data/emails'
import {
  centres,
  columnSums,
  fisherDirection,
  halfPlaneInBox,
  learn,
  lineText,
  mistakes,
  moveEmail,
  pointsOf,
  projectOntoDirection,
  sameLine,
  score,
  snapCount,
  tidy,
  verdict,
  withinScatter,
} from '../../../src/lessons/spam-filter/classifier'
import { MODEL, STRETCHED, STRETCHED_FISHER, STRETCHED_FISHER_RAW, STRETCHED_PLAIN } from '../../../src/lessons/spam-filter/data'
import { PRACTICE_START, solved } from '../../../src/lessons/spam-filter/practice'
import { matVec } from '../../../src/linalg'

describe('the spam filter learned from the shared emails', () => {
  it('centres are (1, 1) and (4, 4); 1ᵀX gives (4, 4) and (16, 16)', () => {
    expect(centres(EMAILS)).toEqual({ normal: [1, 1], spam: [4, 4] })
    expect(columnSums(pointsOf(EMAILS, 'normal'))).toEqual([4, 4])
    expect(columnSums(pointsOf(EMAILS, 'spam'))).toEqual([16, 16])
  })

  it('d = (3, 3), w = (1, 1), midpoint (2.5, 2.5), b = 5, line x + y = 5', () => {
    expect(MODEL.difference).toEqual([3, 3])
    expect(MODEL.w).toEqual([1, 1])
    expect(MODEL.midpoint).toEqual([2.5, 2.5])
    expect(MODEL.b).toBe(5)
    expect(lineText(MODEL.w, MODEL.b)).toBe('x + y = 5')
  })

  it('S_w = 4I and S_w⁻¹ d = (0.75, 0.75), which tidies to (1, 1)', () => {
    expect(withinScatter(EMAILS)).toEqual([
      [4, 0],
      [0, 4],
    ])
    expect(fisherDirection(EMAILS)).toEqual([0.75, 0.75])
    expect(tidy([0.75, 0.75])).toEqual([1, 1])
    expect(learn(EMAILS, 'fisher')!.w).toEqual([1, 1])
  })

  it('X @ w = [1 1 3 3 7 7 9 9] and all 8 are right', () => {
    expect(matVec(EMAILS.map((e) => e.at), MODEL.w)).toEqual([1, 1, 3, 3, 7, 7, 9, 9])
    expect(mistakes(MODEL, EMAILS)).toEqual([])
  })

  it('N3 scores 3, S1 scores 7; (3, 1) scores 4 and is normal; S1 projects to (3.5, 3.5)', () => {
    expect(score(MODEL.w, [1, 2])).toBe(3)
    expect(score(MODEL.w, [4, 3])).toBe(7)
    expect(verdict(MODEL.w, MODEL.b, [3, 1])).toBe('normal')
    expect(verdict(MODEL.w, MODEL.b, [2, 3])).toBe('on the line')
    expect(verdict(MODEL.w, MODEL.b, [1, 5])).toBe('spam')
    expect(projectOntoDirection([4, 3], MODEL.w)).toEqual([3.5, 3.5])
    expect(projectOntoDirection([1, 3], MODEL.w)).toEqual([2, 2])
  })

  it('doubling w doubles b and keeps the line', () => {
    expect(sameLine(MODEL, { w: [2, 2], b: 10 })).toBe(true)
    expect(sameLine(MODEL, { w: [2, 2], b: 5 })).toBe(false)
    expect(sameLine(MODEL, { w: [1, 0.5], b: 5 })).toBe(false)
  })
})

describe('the stretched inbox', () => {
  it('plain recipe x + y = 6 gets N2 and S1 wrong', () => {
    expect(STRETCHED_PLAIN.difference).toEqual([2, 2])
    expect(STRETCHED_PLAIN.midpoint).toEqual([4, 2])
    expect(lineText(STRETCHED_PLAIN.w, STRETCHED_PLAIN.b)).toBe('x + y = 6')
    expect(mistakes(STRETCHED_PLAIN, STRETCHED).map((e) => e.name)).toEqual(['N2', 'S1'])
  })

  it('S_w = [[36, 0], [0, 4]], S_w⁻¹ d = (1/18, 1/2), line x + 9y = 22 gets all right', () => {
    expect(withinScatter(STRETCHED)).toEqual([
      [36, 0],
      [0, 4],
    ])
    expect(STRETCHED_FISHER_RAW[0]).toBeCloseTo(1 / 18, 12)
    expect(STRETCHED_FISHER_RAW[1]).toBeCloseTo(0.5, 12)
    expect(STRETCHED_FISHER.w[1]).toBeCloseTo(9, 9)
    expect(STRETCHED_FISHER.b).toBeCloseTo(22, 9)
    expect(lineText(STRETCHED_FISHER.w, STRETCHED_FISHER.b)).toBe('x + 9y = 22')
    expect(mistakes(STRETCHED_FISHER, STRETCHED)).toEqual([])
  })
})

describe('helpers', () => {
  it('snaps counts to whole, non-negative numbers', () => {
    expect(snapCount([2.4, -1.2])).toEqual([2, 0])
  })
  it('clips a half-plane to a box', () => {
    expect(halfPlaneInBox([1, 1], 5, [0, 6], [0, 6], 'normal')).toEqual([
      [0, 0],
      [5, 0],
      [0, 5],
    ])
  })
  it('no direction when the centres coincide', () => {
    const one = [
      { name: 'a', kind: 'normal' as const, at: [1, 1] as [number, number] },
      { name: 'b', kind: 'spam' as const, at: [1, 1] as [number, number] },
    ]
    expect(learn(one)).toBeNull()
  })
  it('writes lines with negative and fractional coefficients', () => {
    expect(lineText([1, -0.5], 2)).toBe('x − 0.5y = 2')
    expect(lineText([0, 1], -3)).toBe('y = −3')
  })
})

describe('practice challenges tick from live state', () => {
  it('none at the start', () => {
    expect(solved(EMAILS, MODEL, PRACTICE_START).size).toBe(0)
  })
  it('on the line, and spam with one link', () => {
    expect(solved(EMAILS, MODEL, [0, 5]).has('on-line')).toBe(true)
    expect(solved(EMAILS, MODEL, [1, 5]).has('one-link')).toBe(true)
    expect(solved(EMAILS, MODEL, [1, 4]).has('one-link')).toBe(false)
  })
  it('moving S3 out changes the line; moving S1 to (1, 1) makes a training mistake', () => {
    const out = moveEmail(EMAILS, 6, [7, 6])
    const m = learn(out)!
    expect(m.centres.spam).toEqual([4.5, 4.5])
    expect(solved(out, m, PRACTICE_START).has('move')).toBe(true)
    const fooled = moveEmail(EMAILS, 4, [1, 1])
    const f = learn(fooled)!
    expect(mistakes(f, fooled).map((e) => e.name)).toEqual(['S1'])
    expect(solved(fooled, f, PRACTICE_START).has('fool')).toBe(true)
  })
})
