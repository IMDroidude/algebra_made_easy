import { describe, expect, it } from 'vitest'
import { numpyPrint } from '../../../src/lib/format'
import {
  ERROR_TARGETS,
  ERROR_XS,
  EMBED_A,
  EMBED_B,
  errorsFor,
  predictionAt,
} from '../../../src/lessons/exponents-and-roots/applyData'
import {
  PRACTICE_A,
  PRACTICE_B_START,
  PRACTICE_CHECKS,
} from '../../../src/lessons/exponents-and-roots/practiceData'
import {
  diagonalSnap,
  distance,
  gapSquare,
  largestShare,
  legSquares,
  lerp,
  meanAbsoluteError,
  meanSquaredError,
  pow2,
  pyFloat,
  snapToStep,
  sqrtNonNeg,
  square,
  squareAt,
  squareFromOrigin,
} from '../../../src/lessons/exponents-and-roots/powers'
import type { Vec2 } from '../../../src/linalg'

/** Shoelace area of a polygon. */
const area = (pts: Vec2[]) =>
  Math.abs(pts.reduce((s, [x, y], k) => {
    const [x2, y2] = pts[(k + 1) % pts.length]
    return s + x * y2 - x2 * y
  }, 0)) / 2

const half = (lo: number, hi: number) =>
  Array.from({ length: Math.round((hi - lo) * 2) + 1 }, (_, k) => lo + k / 2)

describe('squares and roots (steps 1 and 2)', () => {
  it('3² = 9, 2³ = 8, and a side-3 square has area 9', () => {
    expect(square(3)).toBe(9)
    expect(2 ** 3).toBe(8)
    expect(area(squareFromOrigin(3))).toBe(9)
  })

  it('side 2.5 gives area 6.25; area 7 gives side 2.646', () => {
    expect(square(2.5)).toBe(6.25)
    expect(String(sqrtNonNeg(7))).toMatch(/^2\.6457/)
    expect(sqrtNonNeg(7)!.toFixed(3)).toBe('2.646')
    expect(sqrtNonNeg(16)).toBe(4)
    expect(sqrtNonNeg(2)).toBeCloseTo(1.414, 3)
  })

  it('a side below 1 has a smaller area than side', () => {
    expect(square(0.5)).toBeLessThan(0.5)
  })

  it('the corner stays on the diagonal, snapped, between 0 and 5', () => {
    const snap = diagonalSnap(0.5, 5)
    expect(snap([3, 2])).toEqual([2.5, 2.5])
    expect(snap([9, 9])).toEqual([5, 5])
    expect(snap([-2, -1])).toEqual([0, 0])
  })
})

describe('square roots', () => {
  it('always gives the non-negative root', () => {
    expect(sqrtNonNeg(9)).toBe(3)
    expect(square(-3)).toBe(9)
    expect(sqrtNonNeg(square(-3))).toBe(3)
  })
  it('has no real answer for negatives', () => {
    expect(sqrtNonNeg(-4)).toBeNull()
    expect(sqrtNonNeg(-1e-12)).toBe(0)
  })
})

describe('doubling the side (step 3)', () => {
  it('area goes from 4 to 16, four copies of the original', () => {
    expect(square(lerp(2, 4, 0))).toBe(4)
    expect(square(lerp(2, 4, 1))).toBe(16)
    const copies = [
      [0, 0],
      [2, 0],
      [0, 2],
      [2, 2],
    ].map(([a, b]) => area(squareAt([a, b], 2)))
    expect(copies.reduce((s, x) => s + x, 0)).toBe(16)
  })
  it('the wrong answers are wrong: not 8, 6 or 32', () => {
    expect([8, 6, 32]).not.toContain(square(4))
  })
})

describe('growth (step 4)', () => {
  it('x² runs 1, 4, 9, 16 with gaps 3, 5, 7', () => {
    const sq = [1, 2, 3, 4].map(square)
    expect(sq).toEqual([1, 4, 9, 16])
    expect(sq.slice(1).map((s, k) => s - sq[k])).toEqual([3, 5, 7])
  })
  it('2ˣ and x² cross at 2 and 4; 2ˣ wins after that', () => {
    expect(pow2(2)).toBe(square(2))
    expect(pow2(4)).toBe(square(4))
    expect(pow2(3)).toBeLessThan(square(3))
    expect(pow2(10)).toBe(1024)
    expect(square(10)).toBe(100)
    for (let x = 4.5; x <= 20; x += 0.5) expect(pow2(x)).toBeGreaterThan(square(x))
  })

  // Expected strings were printed by NumPy 2.4 for the same code.
  it('prints what NumPy prints', () => {
    const out = (x: number) => [pyFloat(square(x)), pyFloat(sqrtNonNeg(square(x))!)]
    expect(out(-3)).toEqual(['9.0', '3.0'])
    expect(out(-2.5)).toEqual(['6.25', '2.5'])
    expect(out(0)).toEqual(['0.0', '0.0'])
    expect(out(4)).toEqual(['16.0', '4.0'])
    expect(out(0.5)).toEqual(['0.25', '0.5'])
    expect(numpyPrint([1, 2, 3, 4].map(square), true)).toBe('[ 1  4  9 16]')
    expect(numpyPrint([1, 2, 3, 4].map(pow2), true)).toBe('[ 2  4  8 16]')
  })
})

describe('squared error (step 5)', () => {
  it('the predictions lie on y = 0.5x + 0.5', () => {
    expect(ERROR_XS.map(predictionAt)).toEqual([-1, 0, 1, 2])
  })

  it('errors are true value minus prediction', () => {
    expect(errorsFor([...ERROR_TARGETS, 3])).toEqual([0.5, 0.5, -0.5, 1])
  })

  it('the starting biggest square is 57% of the total', () => {
    expect(Math.round(largestShare(errorsFor([...ERROR_TARGETS, 3]).map(square)) * 100)).toBe(57)
    expect(largestShare([0, 0])).toBe(0)
  })

  it('doubling a miss quadruples its cost', () => {
    expect(square(2) / square(1)).toBe(4)
    expect(square(4)).toBe(16)
  })

  // Expected strings were printed by NumPy 2.4 for the same code.
  it('prints what NumPy prints', () => {
    const out = (last: number) => {
      const e = errorsFor([...ERROR_TARGETS, last])
      return [pyFloat(meanAbsoluteError(e)), pyFloat(meanSquaredError(e))]
    }
    expect(out(3)).toEqual(['0.625', '0.4375'])
    expect(out(5)).toEqual(['1.125', '2.4375'])
    expect(out(-4.5)).toEqual(['2.0', '10.75'])
    expect(out(2)).toEqual(['0.375', '0.1875'])
  })

  it('the gap square has the squared gap as its area', () => {
    expect(area(gapSquare(3, 2, 5))).toBe(9)
    expect(area(gapSquare(3, 2, -1))).toBe(9)
  })
})

describe('distance (steps 5 and 6)', () => {
  // Expected strings were printed by NumPy 2.4 for the same code.
  it('prints what NumPy prints', () => {
    expect(pyFloat(distance(EMBED_A, EMBED_B))).toBe('3.605551275463989')
    expect(pyFloat(distance([0, 0], [0, 0]))).toBe('0.0')
    expect(pyFloat(distance([3, 4], [0, 0]))).toBe('5.0')
    expect(pyFloat(distance([-5, 5], [5, -5]))).toBe('14.142135623730951')
    expect(pyFloat(distance([0.5, 0], [0, 0]))).toBe('0.5')
  })

  it('the leg squares add up to the distance squared', () => {
    for (const b of [[2, 1.5], [-3, 4], [-2, -2], [4, -0.5]] as Vec2[]) {
      const legs = legSquares(PRACTICE_A, b)
      expect(area(legs.across) + area(legs.upDown)).toBeCloseTo(square(distance(PRACTICE_A, b)))
      expect(area(legs.across)).toBeCloseTo(square(legs.dx))
      expect(area(legs.upDown)).toBeCloseTo(square(legs.dy))
    }
  })

  it('the leg squares sit outside the triangle', () => {
    const legs = legSquares([0, 0], [3, 2])
    expect(legs.corner).toEqual([3, 0])
    expect(legs.across.every(([, y]) => y <= 0)).toBe(true)
    expect(legs.upDown.every(([x]) => x >= 3)).toBe(true)
  })

  it('the step 5 example: Δ = (3, 2), squares 9 + 4 = 13', () => {
    const legs = legSquares(EMBED_B, EMBED_A)
    expect([legs.dx, legs.dy]).toEqual([3, 2])
    expect(square(legs.dx) + square(legs.dy)).toBe(13)
  })
})

describe('practice goals', () => {
  const all = half(-5, 5).flatMap((x) => half(-5, 5).map((y): Vec2 => [x, y]))
  const solutions = (id: string) => all.filter(PRACTICE_CHECKS[id])

  it('none is met at the start', () => {
    for (const check of Object.values(PRACTICE_CHECKS)) expect(check(PRACTICE_B_START)).toBe(false)
  })

  it('area 6.25: B is 2.5 left or right of A', () => {
    expect(new Set(solutions('area').map((b) => b[0]))).toEqual(new Set([1.5, -3.5]))
  })

  it('negative: only B = (-3, -3)', () => {
    expect(solutions('negative')).toEqual([[-3, -3]])
    expect(distance(PRACTICE_A, [-3, -3])).toBeCloseTo(2.83, 2)
  })

  it('exactly 5 on a slant: only the 3-4-5 positions, all reachable', () => {
    const found = solutions('five')
    expect(found.length).toBeGreaterThan(0)
    for (const b of found) {
      const d = [Math.abs(b[0] - PRACTICE_A[0]), Math.abs(b[1] - PRACTICE_A[1])].sort()
      expect(d).toEqual([3, 4])
    }
  })
})

describe('helpers', () => {
  it('snapToStep and pyFloat', () => {
    expect(snapToStep(6.3, 0.25)).toBe(6.25)
    expect(Object.is(snapToStep(-0.01, 0.5), 0)).toBe(true)
    expect(pyFloat(-0)).toBe('-0.0')
    expect(pyFloat(16)).toBe('16.0')
  })
})
