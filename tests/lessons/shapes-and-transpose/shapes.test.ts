import { describe, expect, it } from 'vitest'
import { numpyPrint } from '../../../src/lib/format'
import { matMul, matVec, transpose } from '../../../src/linalg'
import { SEE_A, SEE_V, PREDICT_M, PREDICT_POINTS, X, xLiteral } from '../../../src/lessons/shapes-and-transpose/data'
import { PRACTICE_CHECKS } from '../../../src/lessons/shapes-and-transpose/practice'
import {
  asShown,
  checkMatmul,
  collisions,
  effectiveB,
  eye,
  filled,
  lift,
  numpyMat,
  numpyMatmulError,
  pyShape,
  sameOutputDirection,
  shapeOf,
  size,
  squash,
  transposeShape,
} from '../../../src/lessons/shapes-and-transpose/shapes'
import type { PickerState, Shape } from '../../../src/lessons/shapes-and-transpose/shapes'

describe('shape rule for A @ B', () => {
  it('gives the outer sizes when the inner sizes match', () => {
    expect(checkMatmul([2, 3], [3, 4])).toEqual({ ok: true, result: [2, 4] })
    expect(checkMatmul([1, 2], [2, 1])).toEqual({ ok: true, result: [1, 1] })
    expect(checkMatmul([3, 1], [1, 3])).toEqual({ ok: true, result: [3, 3] })
  })

  it('agrees with linalg.matMul, which throws on a mismatch', () => {
    const shapes: Shape[] = [1, 2, 3].flatMap((r) => [1, 2, 3].map((c) => [r, c] as Shape))
    for (const a of shapes)
      for (const b of shapes) {
        const check = checkMatmul(a, b)
        if (check.ok) expect(shapeOf(matMul(filled(a, 1), filled(b, 1)))).toEqual(check.result)
        else expect(() => matMul(filled(a, 1), filled(b, 1))).toThrow()
      }
  })

  // Strings copied from real NumPy 2.4 (print(e) after A @ B on np.ones arrays).
  it('reproduces the exact NumPy error message', () => {
    const sig = 'matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?)'
    expect(numpyMatmulError([2, 3], [2, 4])).toBe(`${sig} (size 2 is different from 3)`)
    expect(numpyMatmulError([1, 1], [2, 1])).toBe(`${sig} (size 2 is different from 1)`)
    expect(numpyMatmulError([4, 1], [4, 1])).toBe(`${sig} (size 4 is different from 1)`)
    expect(numpyMatmulError([3, 2], [3, 2])).toBe(`${sig} (size 3 is different from 2)`)
    expect(checkMatmul([1, 4], [1, 4])).toEqual({ ok: false, error: `${sig} (size 1 is different from 4)` })
  })

  it('prints shapes like Python tuples and transposes them', () => {
    expect(pyShape([2, 4])).toBe('(2, 4)')
    expect(transposeShape([2, 3])).toEqual([3, 2])
    expect(size([3, 3])).toBe(9)
    expect(effectiveB({ a: [2, 3], b: [2, 3], transposeB: true })).toEqual([3, 2])
    expect(checkMatmul([2, 3], effectiveB({ a: [2, 3], b: [2, 3], transposeB: true }))).toEqual({
      ok: true,
      result: [2, 2],
    })
  })
})

describe('step 1: the 2×3 example', () => {
  it('has shape (2, 3) and sends (1, 1, 1) to (4, 2)', () => {
    expect(pyShape(shapeOf(SEE_A))).toBe('(2, 3)')
    expect(matVec(SEE_A, SEE_V)).toEqual([4, 2])
    expect(numpyPrint(matVec(SEE_A, SEE_V), true)).toBe('[4 2]')
    expect(numpyMat('A', SEE_A)).toBe('A = np.array([[3, 0, 1],\n              [1, 2, -1]])')
  })
})

describe('transpose, identity and zero', () => {
  it('swaps rows and columns', () => {
    expect(transpose(SEE_A)).toEqual([
      [3, 1],
      [0, 2],
      [1, -1],
    ])
    expect(transpose(SEE_A)[2][0]).toBe(SEE_A[0][2])
    expect(transpose(transpose(SEE_A))).toEqual(SEE_A)
    expect(transpose(PREDICT_M)).toEqual([[1], [1]])
  })

  it('I2 A = A = A I3, and a (2, 3) zero matrix sends everything to (0, 0)', () => {
    expect(matMul(eye(2), SEE_A)).toEqual(SEE_A)
    expect(matMul(SEE_A, eye(3))).toEqual(SEE_A)
    expect(() => matMul(eye(3), SEE_A)).toThrow()
    expect(matVec(filled([2, 3], 0), [4, 5, 6]).map((x) => x + 0)).toEqual([0, 0])
  })
})

describe('steps 3 and 4: 1×2 squash and 2×1 lift', () => {
  it('sends the five points to x + y, with p1 and p4 colliding', () => {
    const out = PREDICT_POINTS.map((q) => squash(PREDICT_M, q))
    expect(out).toEqual([3, 1, -1, 3, -3])
    expect(collisions(out)).toEqual([[0, 3]])
    PREDICT_POINTS.forEach((q, k) => expect(matVec(PREDICT_M, q)).toEqual([out[k]]))
  })

  // Expected text from real NumPy: print(M @ v), print(N @ t).
  it('matches NumPy for the snippet outputs', () => {
    expect(numpyPrint([squash([[1, 1]], [2, 1])], true)).toBe('[3]')
    expect(numpyPrint([squash([[1, 0.5]], [2, 1])], false)).toBe('[2.5]')
    expect(numpyPrint([squash([[-1, 2]], [1.5, -0.5])], false)).toBe('[-2.5]')
    expect(numpyPrint(lift([[1], [1]], 2), true)).toBe('[2 2]')
    expect(numpyPrint(lift([[1], [-0.5]], 3), false)).toBe('[ 3.  -1.5]')
    expect(numpyPrint(lift([[1], [1]], -1.5), false)).toBe('[-1.5 -1.5]')
    expect(numpyMat('N', [[1], [1]])).toBe('N = np.array([[1],\n              [1]])')
  })

  it('finds the direction of equal outputs', () => {
    const dir = sameOutputDirection([[1, 1]])!
    expect(dir).toEqual([-1, 1])
    expect(squash([[1, 1]], [2 + dir[0], 1 + dir[1]])).toBe(3)
    expect(sameOutputDirection([[0, 0]])).toBeNull()
  })

  it('rounds entries the way they are displayed', () => {
    expect(asShown([[0.333, 1]])).toEqual([[0.33, 1]])
  })
})

describe('step 5: batch through a projection', () => {
  // Expected text from real NumPy: print(Y.shape); print(Y) with Y = X @ W.T.
  const run = (W: number[][]) => {
    const Y = matMul(X, transpose(W))
    return `${pyShape(shapeOf(Y))}\n${numpyPrint(Y, false)}`
  }
  it('matches NumPy', () => {
    expect(run([[1, 1]])).toBe('(4, 1)\n[[ 3. ]\n [ 3.5]\n [-0.5]\n [-3.5]]')
    expect(run([[1, 0.5]])).toBe('(4, 1)\n[[ 2.5]\n [ 2.5]\n [-1. ]\n [-2.5]]')
    expect(run([[0, -1]])).toBe('(4, 1)\n[[-1.]\n [-2.]\n [-1.]\n [ 2.]]')
    expect(run([[2, -1]])).toBe('(4, 1)\n[[ 3.]\n [ 1.]\n [-4.]\n [-1.]]')
  })

  it('writes X as valid Python, one word per row', () => {
    expect(xLiteral()).toBe(
      [
        'X = np.array([[2, 1],      # cat',
        '              [1.5, 2],    # dog',
        '              [-1.5, 1],   # car',
        '              [-1.5, -2]]) # bus',
      ].join('\n'),
    )
  })
})

describe('practice checks', () => {
  const s = (a: Shape, b: Shape, transposeB = false): PickerState => ({ a, b, transposeB })
  it('one number out', () => {
    expect(PRACTICE_CHECKS.number(s([1, 3], [3, 1]))).toBe(true)
    expect(PRACTICE_CHECKS.number(s([1, 2], [2, 1]))).toBe(false)
    expect(PRACTICE_CHECKS.number(s([1, 4], [1, 4], true))).toBe(true)
  })
  it('only one order works', () => {
    expect(PRACTICE_CHECKS.oneway(s([2, 3], [3, 4]))).toBe(true)
    expect(PRACTICE_CHECKS.oneway(s([2, 3], [3, 2]))).toBe(false)
  })
  it('both orders, different shapes', () => {
    expect(PRACTICE_CHECKS.both(s([2, 3], [3, 2]))).toBe(true)
    expect(PRACTICE_CHECKS.both(s([2, 2], [2, 2]))).toBe(false)
  })
  it('more out than in', () => {
    expect(PRACTICE_CHECKS.outer(s([3, 1], [1, 3]))).toBe(true)
    expect(PRACTICE_CHECKS.outer(s([2, 1], [1, 2]))).toBe(false)
  })
  it('nothing is solved at the starting shapes', () => {
    const start = s([3, 2], [3, 2])
    expect(Object.values(PRACTICE_CHECKS).some((check) => check(start))).toBe(false)
  })
})
