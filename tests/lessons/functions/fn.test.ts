import { describe, expect, it } from 'vitest'
import { isInteger, numpyPrint } from '../../../src/lib/format'
import {
  CHECKS,
  RULE_2X_PLUS_1,
  apply,
  errors,
  extentFor,
  feed,
  numpyArray,
  numpyExpr,
  points,
  range,
  ruleTex,
  ruleText,
  solvedChecks,
} from '../../../src/lessons/functions/fn'

describe('f(x) = 2x + 1', () => {
  it('gives the outputs shown in the lesson', () => {
    expect(apply(RULE_2X_PLUS_1, 3)).toBe(7)
    expect(apply(RULE_2X_PLUS_1, 0.5)).toBe(2)
    expect(points(RULE_2X_PLUS_1, range(-2, 2))).toEqual([
      [-2, -3],
      [-1, -1],
      [0, 1],
      [1, 3],
      [2, 5],
    ])
  })

  it('the prediction: 3x + 1 keeps (0, 1) and moves other points by x', () => {
    const before = points(RULE_2X_PLUS_1, range(-2, 2))
    const after = points({ m: 3, b: 1 }, range(-2, 2))
    expect(after).toEqual([
      [-2, -5],
      [-1, -2],
      [0, 1],
      [1, 4],
      [2, 7],
    ])
    expect(after.map((q, k) => q[1] - before[k][1])).toEqual([-2, -1, 0, 1, 2])
  })
})

describe('text', () => {
  it('writes rules the way a person would', () => {
    expect(ruleText(RULE_2X_PLUS_1)).toBe('2x + 1')
    expect(ruleText({ m: 3, b: 1 })).toBe('3x + 1')
    expect(ruleText({ m: 1, b: -3 })).toBe('x − 3')
    expect(ruleText({ m: -0.5, b: 0 })).toBe('−0.5x')
    expect(ruleText({ m: 0, b: 4 })).toBe('4')
    expect(ruleText({ m: -1, b: 2 })).toBe('−x + 2')
    expect(ruleTex({ m: 0.5, b: -0.5 })).toBe('0.5x - 0.5')
  })

  it('writes the NumPy expressions', () => {
    expect(numpyExpr(RULE_2X_PLUS_1)).toBe('2 * x + 1')
    expect(numpyExpr({ m: 0.5, b: -0.5 })).toBe('0.5 * x - 0.5')
    expect(numpyExpr({ m: 0, b: 4 })).toBe('0 * x + 4')
    expect(numpyExpr({ m: 2, b: 0 }, 'size')).toBe('2 * size')
    expect(numpyArray([1, 1.5, 2, 3])).toBe('np.array([1, 1.5, 2, 3])')
  })
})

describe('NumPy outputs (checked against real NumPy 2.4)', () => {
  const xs = range(-3, 3)
  const out = (m: number, b: number) =>
    numpyPrint(
      xs.map((x) => apply({ m, b }, x)),
      isInteger(m, b),
    )

  it('np.arange(-3, 4) and rules applied to it', () => {
    expect(numpyPrint(xs, true)).toBe('[-3 -2 -1  0  1  2  3]')
    expect(out(2, 1)).toBe('[-5 -3 -1  1  3  5  7]')
    expect(out(3, -2)).toBe('[-11  -8  -5  -2   1   4   7]')
    expect(out(0, 4)).toBe('[4 4 4 4 4 4 4]')
    expect(out(0.5, -0.5)).toBe('[-2.  -1.5 -1.  -0.5  0.   0.5  1. ]')
    expect(out(0.5, 0)).toBe('[-1.5 -1.  -0.5  0.   0.5  1.   1.5]')
  })

  it('the house-price model on np.array([1, 1.5, 2, 3])', () => {
    const sizes = [1, 1.5, 2, 3]
    const run = (m: number, b: number) =>
      numpyPrint(
        sizes.map((x) => apply({ m, b }, x)),
        false,
      )
    expect(run(2, 1)).toBe('[3. 4. 5. 7.]')
    expect(run(2.5, 0.5)).toBe('[3.   4.25 5.5  8.  ]')
    expect(run(2, 0)).toBe('[2. 3. 4. 6.]')
  })

  it('the house-price model errors', () => {
    expect(errors({ m: 2, b: 1 }, [1, 1.5, 2, 3], [3, 4, 5.5, 7])).toEqual([0, 0, -0.5, 0])
  })
})

describe('helpers', () => {
  it('feeds inputs without repeats, newest last', () => {
    expect(feed([1, 2], 3)).toEqual([1, 2, 3])
    expect(feed([1, 2, 3], 1)).toEqual([2, 3, 1])
  })

  it('sizes the plane to fit the points', () => {
    expect(extentFor([[1, 3]])).toBe(5)
    expect(extentFor([[3, 7]])).toBe(8)
    expect(extentFor([[3, 40]])).toBe(12)
  })
})

describe('practice challenges', () => {
  it('each has the intended answer', () => {
    expect(solvedChecks({ m: 2, b: 3 })).toEqual(['pair'])
    expect(solvedChecks({ m: 3, b: -2 })).toEqual(['start'])
    expect(solvedChecks({ m: 0, b: 4 })).toEqual(['flat'])
    expect(solvedChecks({ m: 0.5, b: -0.5 })).toEqual(['undo'])
    expect(solvedChecks({ m: 1, b: 0 })).toEqual([])
  })

  it('the undo machine really reverses 2x + 1', () => {
    for (const x of range(-3, 3)) expect(apply({ m: 0.5, b: -0.5 }, apply(RULE_2X_PLUS_1, x))).toBe(x)
    expect(CHECKS.undo({ m: 0.5, b: -0.5 })).toBe(true)
  })
})
