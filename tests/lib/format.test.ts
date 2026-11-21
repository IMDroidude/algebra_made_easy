import { describe, expect, it } from 'vitest'
import { coordText, fmt, fmtDet, fmtVec, numpyMat2, numpyPrint, numpyVec } from '../../src/lib/format'

describe('fmt', () => {
  it('rounds and drops trailing zeros', () => {
    expect(fmt(2)).toBe('2')
    expect(fmt(2.5)).toBe('2.5')
    expect(fmt(0.70710678)).toBe('0.71')
  })

  it('never prints negative zero', () => {
    expect(fmt(-0)).toBe('0')
    expect(fmt(-0.0001)).toBe('0')
  })

  it('formats vectors', () => {
    expect(fmtVec([2, -1.5])).toBe('(2, -1.5)')
  })
})

describe('fmtDet', () => {
  it('distinguishes exactly zero from nearly zero', () => {
    expect(fmtDet(0)).toBe('0')
    expect(fmtDet(0.00000002)).toBe('≈ 0')
    expect(fmtDet(-2)).toBe('-2')
  })
})

describe('NumPy output', () => {
  it('writes array literals', () => {
    expect(numpyVec('v', [2, 1])).toBe('v = np.array([2, 1])')
    expect(numpyMat2('A', [[1, 0], [0.5, 1]])).toBe(
      'A = np.array([[1, 0],\n              [0.5, 1]])',
    )
  })

  it('prints integer arrays the way NumPy does', () => {
    expect(numpyPrint([5, 3], true)).toBe('[5 3]')
    expect(numpyPrint([-1, 10], true)).toBe('[-1 10]')
  })

  it('prints float arrays with aligned decimal points', () => {
    expect(numpyPrint([5, 3], false)).toBe('[5. 3.]')
    expect(numpyPrint([5.5, 3], false)).toBe('[5.5 3. ]')
    expect(numpyPrint([0.25, -1], false)).toBe('[ 0.25 -1.  ]')
  })

  it('prints 2D arrays row by row', () => {
    expect(numpyPrint([[1.5, 1.5], [3, 1.5]], false)).toBe('[[1.5 1.5]\n [3.  1.5]]')
  })
})

describe('coordText', () => {
  it('reads like the tooltip', () => {
    expect(coordText([3, 4])).toBe('x = 3, y = 4')
    expect(coordText([-1.5, 0])).toBe('x = -1.5, y = 0')
  })
})

describe('fmtDet for small values', () => {
  it('never shows a non-singular determinant as plain 0', () => {
    expect(fmtDet(0.001)).toBe('0.001')
    expect(fmtDet(-0.0042)).toBe('-0.0042')
    expect(fmtDet(0.0000001)).toBe('≈ 0')
  })
})

describe('NumPy fidelity (shared printer)', () => {
  it('handles negative zero, ties and long floats like NumPy', () => {
    expect(numpyPrint([-0, 1], false)).toBe('[-0.  1.]')
    expect(numpyPrint([1 / 3, 1], false)).toBe('[0.33333333 1.        ]')
  })
})
