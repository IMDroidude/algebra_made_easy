import { describe, expect, it } from 'vitest'
import { fmt } from '../../../src/lib/format'
import { dot, sub } from '../../../src/linalg'
import type { Vec2 } from '../../../src/linalg'
import { fitLine, lineThrough, predict, project2, residuals, sumSquaredResiduals } from '../../../src/linalg/systems'
import { CHECKS } from '../../../src/lessons/projection-least-squares/challenges'
import {
  DATA,
  PRACTICE_DATA,
  PREDICT_DATA,
  PREDICT_TO,
  PROJ_X,
  PROJ_Y,
  TRAIN,
  X_NEW,
} from '../../../src/lessons/projection-least-squares/data'
import { lineText } from '../../../src/lessons/projection-least-squares/text'

describe('steps 1 and 2', () => {
  it('best line y = 0.62x + 0.08 with error 1.61', () => {
    const fit = fitLine(DATA)!
    expect(lineText(fit)).toBe('y = 0.62x + 0.08')
    expect(fmt(sumSquaredResiduals(DATA, fit))).toBe('1.61')
    expect(residuals(DATA, fit).map((r) => fmt(r))).toEqual(['-0.11', '0.65', '-0.46', '0.3', '-0.82', '0.44'])
  })
  it('the starting hand-drawn line y = 0 has error 17.75, 11 times the best', () => {
    const mine = lineThrough([-4, 0], [4, 0])!
    expect(sumSquaredResiduals(DATA, mine)).toBe(17.75)
    expect(fmt(17.75 / sumSquaredResiduals(DATA, fitLine(DATA)!), 1)).toBe('11')
  })
})

describe('step 3: the outlier', () => {
  it('before: y = 0.5x with zero error', () => {
    const fit = fitLine(PREDICT_DATA)!
    expect(lineText(fit)).toBe('y = 0.5x')
    expect(sumSquaredResiduals(PREDICT_DATA, fit)).toBeCloseTo(0, 12)
  })
  it('after: slope 0, y = −1, error 10; the old line would leave a residual of −5', () => {
    const moved: Vec2[] = [...PREDICT_DATA.slice(0, -1), PREDICT_TO]
    const fit = fitLine(moved)!
    expect(fit.slope).toBeCloseTo(0, 12)
    expect(fit.intercept).toBeCloseTo(-1, 12)
    expect(lineText(fit)).toBe('y = −1')
    expect(sumSquaredResiduals(moved, fit)).toBeCloseTo(10, 12)
    expect(residuals([PREDICT_TO], { slope: 0.5, intercept: 0 })).toEqual([-5])
  })
})

describe('step 4: projection picture', () => {
  it('y = (3, 4) projects onto x = (2, 1) at (4, 2), w = 2, residual (−1, 2) ⟂ x', () => {
    const p = project2(PROJ_Y, PROJ_X)
    expect(p).toEqual([4, 2])
    expect(dot(PROJ_Y, PROJ_X) / dot(PROJ_X, PROJ_X)).toBe(2)
    expect(sub(PROJ_Y, p)).toEqual([-1, 2])
    expect(dot(sub(PROJ_Y, p), PROJ_X)).toBe(0)
  })
})

describe('step 5: regression', () => {
  it('trains w = 0.7, b = 0.1 and predicts 1.85 at x = 2.5', () => {
    const fit = fitLine(TRAIN)!
    expect(fmt(fit.slope)).toBe('0.7')
    expect(fmt(fit.intercept)).toBe('0.1')
    expect(fmt(predict(fit, X_NEW))).toBe('1.85')
  })
})

describe('step 6: challenge checks', () => {
  const solvedBy = (p: Vec2[]) => Object.keys(CHECKS).filter((id) => CHECKS[id](p))
  it('the starting data solves nothing (best line y = −0.3x + 0.5)', () => {
    expect(lineText(fitLine(PRACTICE_DATA)!)).toBe('y = −0.3x + 0.5')
    expect(solvedBy(PRACTICE_DATA)).toEqual([])
  })
  it('each has a solution', () => {
    expect(solvedBy([[-3, 1], [-1, 2], [1, 2], [3, 1]])).toEqual(['flat'])
    expect(solvedBy([[-3, -1], [-1, 0], [1, 1], [3, 2]])).toEqual(['perfect'])
    expect(solvedBy([[-3, -2], [-1, -2], [1, 2], [3, 2]])).toEqual([])
    expect(solvedBy([[-3, -3.5], [-1, 0.5], [1, -0.5], [3, 3.5]])).toEqual(['diagonal'])
    expect(solvedBy([[1, 1], [1, 2], [1, -1], [1, 0]])).toEqual(['vertical'])
  })
})

describe('lineText', () => {
  it('formats lines with real minus signs', () => {
    expect(lineText({ slope: 1, intercept: -0.5 })).toBe('y = x − 0.5')
    expect(lineText({ slope: -1, intercept: 2 })).toBe('y = −x + 2')
    expect(lineText({ slope: 0, intercept: 0 })).toBe('y = 0')
  })
})
