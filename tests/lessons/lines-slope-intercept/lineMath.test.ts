import { describe, expect, it } from 'vitest'
import { numpyPrint } from '../../../src/lib/format'
import {
  interceptThrough,
  leastSquaresLine,
  lerp,
  lineEquation,
  lineY,
  magnitudeRatio,
  pyFloat,
  residualSquare,
  residuals,
  riseRunTriangle,
  slopeThrough,
  snapToStep,
  sumSquaredError,
} from '../../../src/lessons/lines-slope-intercept/lineMath'
import { DATA_SETS, isSolved } from '../../../src/lessons/lines-slope-intercept/practiceData'
import type { Vec2 } from '../../../src/linalg'

/** All multiples of `step` from lo to hi: the values a slider can reach. */
const grid = (lo: number, hi: number, step: number) =>
  Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, k) => lo + k * step)

describe('lineY and the step 1 example', () => {
  it('y = 0.5x + 1 passes through the four points shown', () => {
    expect([-2, 0, 2, 4].map((x) => [x, lineY(0.5, 1, x)])).toEqual([
      [-2, 0],
      [0, 1],
      [2, 2],
      [4, 3],
    ])
  })
})

describe('lineEquation', () => {
  it('writes the usual forms', () => {
    expect(lineEquation(0.5, 1)).toBe('y = 0.5x + 1')
    expect(lineEquation(2, 1)).toBe('y = 2x + 1')
    expect(lineEquation(-2, 1)).toBe('y = -2x + 1')
    expect(lineEquation(0.5, -1.5)).toBe('y = 0.5x - 1.5')
    expect(lineEquation(1, 0)).toBe('y = x')
    expect(lineEquation(-1, -2)).toBe('y = -x - 2')
    expect(lineEquation(0, 3)).toBe('y = 3')
    expect(lineEquation(0, 0)).toBe('y = 0')
    expect(lineEquation(1.5, 0.5, 'x', 'y')).toBe('y = 1.5x + 0.5')
  })

  it('rounds for display and never shows -0', () => {
    expect(lineEquation(1 / 3, 2 / 3)).toBe('y = 0.33x + 0.67')
    expect(lineEquation(-0, -0)).toBe('y = 0')
    expect(lineEquation(0.001, 2)).toBe('y = 2')
  })
})

describe('rise over run (step 2)', () => {
  it('a run of 2 on y = 0.5x + 1 rises 1, so rise / run is the slope', () => {
    const t = riseRunTriangle(0.5, 1, 1, 2)
    expect(t.start).toEqual([1, 1.5])
    expect(t.corner).toEqual([3, 1.5])
    expect(t.end).toEqual([3, 2.5])
    expect(t.rise).toBe(1)
    expect(t.rise / 2).toBe(0.5)
  })

  it('the slope is the same wherever the triangle is measured', () => {
    for (const x0 of [-3, 0, 2.5]) expect(riseRunTriangle(-1.75, 2, x0, 2).rise / 2).toBeCloseTo(-1.75)
  })
})

describe('predict step: y = 2x + 1 to y = -2x + 1', () => {
  it('pivots about (0, 1), the intercept', () => {
    for (const t of [0, 0.3, 0.5, 1]) expect(lineY(lerp(2, -2, t), 1, 0)).toBe(1)
    expect(lerp(2, -2, 1)).toBe(-2)
  })
  it('is equally steep afterwards, going downhill', () => {
    expect(lineY(-2, 1, 1) - lineY(-2, 1, 0)).toBe(-2)
    expect(lineY(2, 1, 1) - lineY(2, 1, 0)).toBe(2)
  })
})

describe('line through two points (step 4)', () => {
  it('P = (-1, -2), Q = (3, 0) gives m = 0.5, b = -1.5', () => {
    const P: Vec2 = [-1, -2]
    const Q: Vec2 = [3, 0]
    const m = slopeThrough(P, Q)!
    expect(m).toBe(0.5)
    expect(interceptThrough(P, m)).toBe(-1.5)
    expect(lineEquation(m, interceptThrough(P, m))).toBe('y = 0.5x - 1.5')
  })

  it('a vertical pair has no slope', () => {
    expect(slopeThrough([2, -1], [2, 3])).toBeNull()
    expect(slopeThrough([2, 3], [2, 3])).toBeNull()
  })

  // Expected strings were printed by NumPy 2.4 for the same code.
  it('prints what NumPy prints for `print(m, b)`', () => {
    const out = (P: Vec2, Q: Vec2) => {
      const m = slopeThrough(P, Q)!
      return `${pyFloat(m)} ${pyFloat(interceptThrough(P, m))}`
    }
    expect(out([-1, -2], [3, 0])).toBe('0.5 -1.5')
    expect(out([1, 2], [3, 6])).toBe('2.0 0.0')
    expect(out([1, 0], [3, 0])).toBe('0.0 0.0')
    expect(out([3, 0], [1, 0])).toBe('-0.0 0.0')
    expect(out([-1.5, 2], [3, 0.5])).toBe('-0.3333333333333333 1.5')
  })
})

describe('pyFloat', () => {
  it('matches Python float printing', () => {
    expect(pyFloat(2)).toBe('2.0')
    expect(pyFloat(-0)).toBe('-0.0')
    expect(pyFloat(0)).toBe('0.0')
    expect(pyFloat(3.5)).toBe('3.5')
    expect(pyFloat(0.1 + 0.2)).toBe('0.30000000000000004')
    expect(pyFloat(91.9375)).toBe('91.9375')
  })
})

describe('snapToStep', () => {
  it('rounds to the step and never returns -0', () => {
    expect(snapToStep(0.3, 0.25)).toBe(0.25)
    expect(snapToStep(0.7, 0.25)).toBe(0.75)
    expect(Object.is(snapToStep(-0.1, 0.25), 0)).toBe(true)
    expect(snapToStep(-1.374, 0.25)).toBe(-1.25)
  })
})

describe('neuron (step 5)', () => {
  const batch = [-2, -1, 0, 1, 2]
  // Expected strings were printed by NumPy 2.4 for the same code.
  it('prints what NumPy prints', () => {
    expect(pyFloat(lineY(1.5, 0.5, 2))).toBe('3.5')
    expect(numpyPrint(batch.map((x) => lineY(1.5, 0.5, x)), false)).toBe('[-2.5 -1.   0.5  2.   3.5]')
    expect(pyFloat(lineY(-0.75, 2.25, 1.5))).toBe('1.125')
    expect(numpyPrint(batch.map((x) => lineY(-0.75, 2.25, x)), false)).toBe('[3.75 3.   2.25 1.5  0.75]')
    expect(numpyPrint(batch.map((x) => lineY(0, 0, x)), false)).toBe('[0. 0. 0. 0. 0.]')
    expect(numpyPrint(batch.map((x) => lineY(-3, 0.25, x)), false)).toBe(
      '[ 6.25  3.25  0.25 -2.75 -5.75]',
    )
  })

  it('no slider setting makes NumPy switch to e-notation', () => {
    for (const w of grid(-3, 3, 0.25))
      for (const b of grid(-3, 3, 0.25))
        expect(magnitudeRatio(batch.map((x) => lineY(w, b, x)))).toBeLessThan(1000)
  })
})

describe('error and least squares', () => {
  const pts: Vec2[] = [
    [-3, -1],
    [1, 1],
    [3, 2],
  ]

  it('residuals are y minus the line, squared and summed', () => {
    expect(residuals(1, 0, pts)).toEqual([2, 0, -1])
    expect(sumSquaredError(1, 0, pts)).toBe(5)
  })

  it('the residual square has area equal to the squared gap', () => {
    const sq = residualSquare(1, 0, [3, 2])
    expect(sq).toEqual([
      [3, 3],
      [3, 2],
      [4, 2],
      [4, 3],
    ])
  })

  it('least squares recovers an exact line', () => {
    const { m, b } = leastSquaresLine(pts)
    expect(m).toBeCloseTo(0.5)
    expect(b).toBeCloseTo(0.5)
  })

  // Expected strings were printed by NumPy 2.4 for the same code.
  it('prints what NumPy prints for the error', () => {
    const [, down, up] = DATA_SETS
    expect(pyFloat(sumSquaredError(1, 0, DATA_SETS[0].points))).toBe('5.0')
    expect(pyFloat(sumSquaredError(-0.75, 1.25, down.points))).toBe('0.3125')
    expect(pyFloat(sumSquaredError(0.75, -0.25, up.points))).toBe('2.9375')
    expect(pyFloat(sumSquaredError(1.25, -3.75, up.points))).toBe('91.9375')
  })
})

describe('practice data sets', () => {
  it('none is solved by the starting line y = x', () => {
    for (const set of DATA_SETS) expect(isSolved(set, 1, 0)).toBe(false)
  })

  it('each can be solved with the sliders (steps of 0.25)', () => {
    for (const set of DATA_SETS) {
      const reachable = grid(-4, 4, 0.25).some((m) => grid(-5, 5, 0.25).some((b) => isSolved(set, m, b)))
      expect(reachable, set.id).toBe(true)
    }
    expect(isSolved(DATA_SETS[0], 0.5, 0.5)).toBe(true)
  })

  it('best possible lines match what the insights say', () => {
    const down = leastSquaresLine(DATA_SETS[1].points)
    expect(lineEquation(down.m, down.b)).toBe('y = -0.75x + 1.2')
    expect(sumSquaredError(down.m, down.b, DATA_SETS[1].points)).toBeCloseTo(0.3)
    const up = leastSquaresLine(DATA_SETS[2].points)
    expect(lineEquation(up.m, up.b)).toBe('y = 0.7x - 0.12')
    expect(sumSquaredError(up.m, up.b, DATA_SETS[2].points)).toBeCloseTo(2.75, 2)
  })

  it('errors on the slider grid stay in the range pyFloat handles', () => {
    for (const set of DATA_SETS)
      for (const m of grid(-4, 4, 0.25))
        for (const b of grid(-5, 5, 0.25)) {
          const e = sumSquaredError(m, b, set.points)
          expect(e === 0 || (e >= 1e-4 && e < 1e16)).toBe(true)
        }
  })
})

describe('magnitudeRatio', () => {
  it('ignores zeros', () => {
    expect(magnitudeRatio([0, 2, -0.5])).toBe(4)
    expect(magnitudeRatio([0, 0])).toBe(1)
  })
})
