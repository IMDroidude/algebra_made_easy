import { describe, expect, it } from 'vitest'
import { HOUSES, prices } from '../../../src/data/houses'
import { fmt, isInteger, numpyPrint } from '../../../src/lib/format'
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
  roundTo,
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

  it('the house-price model on the shared houses (checked against NumPy 2)', () => {
    const sqft = HOUSES.map((h) => h.sqft)
    const run = (m: number, b: number) =>
      numpyPrint(
        sqft.map((x) => apply({ m, b }, x)),
        isInteger(m, b),
      )
    expect(run(0.22, 30)).toBe('[272. 360. 228. 470. 316. 426. 558. 250.]')
    expect(run(0.25, 0)).toBe('[275. 375. 225. 500. 325. 450. 600. 250.]')
    expect(run(0.2, 50)).toBe('[270. 350. 230. 450. 310. 410. 530. 250.]')
    expect(run(1, 0)).toBe('[1100 1500  900 2000 1300 1800 2400 1000]')
    expect(numpyExpr({ m: 0.22, b: 30 }, 'sqft')).toBe('0.22 * sqft + 30')
  })

  it('the house-price model errors (prediction minus actual)', () => {
    const err = (m: number, b: number) =>
      numpyPrint(
        errors({ m, b }, HOUSES.map((h) => h.sqft), prices()),
        isInteger(m, b),
      )
    expect(err(0.22, 30)).toBe('[  7. -10. -20.  30. -19.   8.  -2.  45.]')
    expect(err(0.25, 0)).toBe('[ 10.   5. -23.  60. -10.  32.  40.  45.]')
    expect(err(1, 0)).toBe('[ 835 1130  652 1560  965 1382 1840  795]')
    expect(fmt(Math.max(...errors({ m: 0.22, b: 30 }, HOUSES.map((h) => h.sqft), prices()).map(Math.abs)))).toBe('45')
  })

  it('rounds typed weights to two decimals', () => {
    expect(roundTo(0.2173)).toBe(0.22)
    expect(roundTo(-0.004)).toBe(0)
    expect(Object.is(roundTo(-0.004), -0)).toBe(false)
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
