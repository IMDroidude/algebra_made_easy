import { describe, expect, it } from 'vitest'
import { numpyPrint } from '../../../src/lib/format'
import { apply2, columns2, det2, inverse2, lerp2 } from '../../../src/linalg'
import type { Mat2 } from '../../../src/linalg'
import {
  APPLY_W,
  APPLY_X,
  NUMPY_DET_EXAMPLE,
  PRACTICE_START,
  PREDICT_B,
  PREDICT_SWAPPED,
  SEE_M,
  UNDERSTAND_START,
} from '../../../src/lessons/determinant/data'
import {
  asShown,
  boxPictureFits,
  boxPieces,
  collapseKind,
  describeDet,
  detText,
  imageDirection,
  nullDirection,
  numpyDetFormula,
  orientation,
  pyFloat,
  sameOutputPartner,
} from '../../../src/lessons/determinant/determinant'
import { PRACTICE_CHECKS } from '../../../src/lessons/determinant/practice'

/** Shoelace area of a polygon (positive when counter-clockwise). */
const signedArea = (pts: [number, number][]) =>
  pts.reduce((s, [x, y], k) => {
    const [x2, y2] = pts[(k + 1) % pts.length]
    return s + (x * y2 - x2 * y) / 2
  }, 0)
const square = (m: Mat2) =>
  ([[0, 0], [1, 0], [1, 1], [0, 1]] as [number, number][]).map((q) => apply2(m, q))

describe('det = signed area of the unit square image', () => {
  it('holds for the lesson’s matrices and a few more', () => {
    for (const m of [SEE_M, PREDICT_B, PREDICT_SWAPPED, UNDERSTAND_START, APPLY_W, PRACTICE_START, [[3, 0], [0, -1]] as Mat2]) {
      expect(signedArea(square(m))).toBeCloseTo(det2(m), 12)
    }
  })

  it('gives the numbers quoted in the lesson', () => {
    expect(det2(SEE_M)).toBe(3)
    expect(columns2(SEE_M)).toEqual([[2, 0], [1, 1.5]])
    expect(det2(PREDICT_B)).toBe(2)
    expect(det2(PREDICT_SWAPPED)).toBe(-2)
    expect(det2(UNDERSTAND_START)).toBe(5)
    expect(det2(APPLY_W)).toBe(0)
    expect(det2(PRACTICE_START)).toBe(2)
    expect(det2([[2, 2], [-2, 2]])).toBe(8)
    expect(det2([[1, 1], [1, 1.0000001]])).toBeCloseTo(1e-7, 12)
    expect(det2(inverse2(PREDICT_B)!)).toBeCloseTo(0.5, 12)
  })

  it('passes through 0 halfway when the columns are swapped', () => {
    expect(det2(lerp2(PREDICT_B, PREDICT_SWAPPED, 0.5))).toBe(0)
  })
})

describe('reading the determinant', () => {
  it('orientation and collapse', () => {
    expect(orientation(SEE_M)).toBe('kept')
    expect(orientation(PREDICT_SWAPPED)).toBe('flipped')
    expect(orientation(APPLY_W)).toBe('collapsed')
    expect(collapseKind(APPLY_W)).toBe('line')
    expect(collapseKind([[0, 0], [0, 0]])).toBe('point')
    expect(collapseKind([[1, 1], [1, 1.0000001]])).toBe('line')
    expect(collapseKind(SEE_M)).toBe('none')
  })

  it('describes it in words', () => {
    expect(describeDet(SEE_M)).toMatch(/multiplied by 3\. .*counter-clockwise/)
    expect(describeDet(PREDICT_SWAPPED)).toMatch(/multiplied by 2, and the plane has been flipped/)
    expect(describeDet(APPLY_W)).toMatch(/flattened into a line/)
    expect(describeDet([[0, 0], [0, 0]])).toMatch(/single point/)
  })

  it('shows small determinants honestly', () => {
    expect(detText(0)).toBe('0')
    expect(detText(1e-7)).toBe('≈ 0')
    expect(detText(0.001)).toBe('0.001')
    expect(detText(-2)).toBe('-2')
  })
})

describe('the box picture', () => {
  it('leaves exactly ad − bc', () => {
    const pieces = boxPieces(UNDERSTAND_START)
    expect(pieces).toEqual({ box: 12, rect: 1, triAC: 1.5, triBD: 1, rest: 5 })
    for (const m of [[[3, 1], [1, 2]], [[1, 0.5], [2, 3]], [[2.5, 0], [0, 1.5]]] as Mat2[]) {
      expect(boxPictureFits(m)).toBe(true)
      expect(boxPieces(m).rest).toBeCloseTo(det2(m), 12)
    }
    expect(boxPictureFits([[1, 3], [3, 1]])).toBe(false)
  })
})

describe('information loss', () => {
  it('a second input lands on the same output', () => {
    expect(nullDirection(APPLY_W)).toEqual([-2, 1])
    const x2 = sameOutputPartner(APPLY_W, APPLY_X)!
    expect(x2).toEqual([-1, 2])
    expect(apply2(APPLY_W, APPLY_X)).toEqual([3, 1.5])
    expect(apply2(APPLY_W, x2)).toEqual([3, 1.5])
    expect(imageDirection(APPLY_W)).toEqual([1, 0.5])
    expect(sameOutputPartner(SEE_M, APPLY_X)).toBeNull()
    expect(sameOutputPartner([[0, 0], [0, 0]], [1, 1])).toEqual([2, 2])
    // first row zero: the direction comes from the second row
    expect(nullDirection([[0, 0], [1, 2]])).toEqual([-2, 1])
  })

  // Expected text from real NumPy: print(W @ x1), print(W @ x2).
  it('matches NumPy', () => {
    expect(numpyPrint(apply2(APPLY_W, APPLY_X), false)).toBe('[3.  1.5]')
    expect(numpyPrint(apply2([[2, 4], [1, 2]], [1, 1]), true)).toBe('[6 3]')
    expect(sameOutputPartner([[2, 4], [1, 2]], [1, 1])).toEqual([-3, 3])
    expect(apply2([[2, 4], [1, 2]], [-3, 3])).toEqual([6, 3])
  })
})

describe('NumPy text', () => {
  // Each expected string was printed by real NumPy 2.4 for A[0, 0] * A[1, 1] - A[0, 1] * A[1, 0].
  it('prints ad − bc exactly as NumPy does', () => {
    const cases: [Mat2, string][] = [
      [[[3, 1], [1, 2]], '5'],
      [[[1, 2], [2, 4]], '0'],
      [[[0.5, 1], [1, 3]], '0.5'],
      [[[-1, 0.5], [0, 1.5]], '-1.5'],
      [[[0.1, 0.2], [0.3, 0.4]], '-0.01999999999999999'],
      [[[-1, 0], [0.5, 0]], '-0.0'],
      [[[1, 1], [1, 1.0000001]], '1.0000000005838672e-07'],
      [[[2, 1], [1, 0.5]], '0.0'],
      [[[0.01, 0.01], [0.01, 0.02]], '0.0001'],
      [[[-1, 0], [0, 0]], '0'],
    ]
    for (const [m, printed] of cases) expect(numpyDetFormula(m)).toBe(printed)
  })

  it('formats floats like Python', () => {
    expect(pyFloat(5)).toBe('5.0')
    expect(pyFloat(1e-5)).toBe('1e-05')
    expect(pyFloat(1.25e-5)).toBe('1.25e-05')
    expect(pyFloat(1e16)).toBe('1e+16')
    expect(pyFloat(123.5)).toBe('123.5')
  })

  it('np.linalg.det example: exact value 5, printed with rounding', () => {
    expect(det2(NUMPY_DET_EXAMPLE.matrix)).toBe(5)
    expect(NUMPY_DET_EXAMPLE.printed).toBe('5.000000000000001')
  })

  it('rounds entries as displayed', () => {
    expect(asShown([[0.333, 1], [2, 0.005]])).toEqual([[0.33, 1], [2, 0.01]])
  })
})

describe('practice checks', () => {
  it('tick only the intended matrices', () => {
    expect(PRACTICE_CHECKS.double([[2, 2], [-2, 2]])).toBe(true)
    expect(PRACTICE_CHECKS.double(PRACTICE_START)).toBe(false)
    expect(PRACTICE_CHECKS.flip([[3, 0], [0, -1]])).toBe(true)
    expect(PRACTICE_CHECKS.flip([[0, 1], [3, 0]])).toBe(true)
    expect(PRACTICE_CHECKS.flip([[3, 0], [0, 1]])).toBe(false)
    expect(PRACTICE_CHECKS.line([[1, 2], [2, 4]])).toBe(true)
    expect(PRACTICE_CHECKS.line([[1, 0], [0, 0]])).toBe(false)
    expect(PRACTICE_CHECKS.point([[0, 0], [0, 0]])).toBe(true)
    expect(PRACTICE_CHECKS.point([[1, 2], [2, 4]])).toBe(false)
    expect(Object.values(PRACTICE_CHECKS).some((c) => c(PRACTICE_START))).toBe(false)
  })
})
