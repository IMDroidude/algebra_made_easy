import { describe, expect, it } from 'vitest'
import {
  IDENTITY2,
  apply2,
  approxEqualVec,
  columns2,
  det2,
  fromColumns2,
  inverse2,
  isSingular2,
  lerp2,
  matMul,
  matVec,
  mul2,
  rotation2,
  transpose,
} from '../../src/linalg'
import type { Mat2, Vec2 } from '../../src/linalg'

const A: Mat2 = [
  [2, 1],
  [0, 3],
]

describe('conventions', () => {
  it('y = A x with column vectors', () => {
    // [2 1; 0 3] [2; 1] = [2*2 + 1*1; 0*2 + 3*1]
    expect(apply2(A, [2, 1])).toEqual([5, 3])
    expect(matVec(A, [2, 1])).toEqual([5, 3])
  })

  it('columns are where the basis vectors land', () => {
    const [c1, c2] = columns2(A)
    expect(c1).toEqual(apply2(A, [1, 0]))
    expect(c2).toEqual(apply2(A, [0, 1]))
    expect(fromColumns2(c1, c2)).toEqual(A)
  })

  it('A v equals x·(column 1) + y·(column 2)', () => {
    const v: Vec2 = [2, 1]
    const [c1, c2] = columns2(A)
    expect(apply2(A, v)).toEqual([v[0] * c1[0] + v[1] * c2[0], v[0] * c1[1] + v[1] * c2[1]])
  })

  it('rotation by +90° turns î into ĵ (counter-clockwise, y up)', () => {
    expect(approxEqualVec(apply2(rotation2(90), [1, 0]), [0, 1])).toBe(true)
  })
})

describe('matrix multiplication', () => {
  it('multiplies row by column', () => {
    const B: Mat2 = [
      [1, 2],
      [4, 0],
    ]
    expect(matMul(A, B)).toEqual([
      [6, 4],
      [12, 0],
    ])
  })

  it('A B means: apply B first, then A', () => {
    const B = rotation2(90)
    const v: Vec2 = [1, 2]
    expect(approxEqualVec(apply2(mul2(A, B), v), apply2(A, apply2(B, v)))).toBe(true)
  })

  it('is not commutative in general', () => {
    const shear: Mat2 = [
      [1, 1],
      [0, 1],
    ]
    expect(mul2(A, shear)).not.toEqual(mul2(shear, A))
  })

  it('handles non-square shapes and rejects incompatible ones', () => {
    expect(matMul([[1, 2, 3]], [[1], [1], [1]])).toEqual([[6]])
    expect(() => matMul([[1, 2, 3]], [[1, 2]])).toThrow(/Shape mismatch/)
    expect(() => matVec(A, [1, 2, 3])).toThrow(/Shape mismatch/)
  })

  it('transposes', () => {
    expect(
      transpose([
        [1, 2, 3],
        [4, 5, 6],
      ]),
    ).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ])
  })
})

describe('determinant and inverse', () => {
  it('determinant is the signed area scaling', () => {
    expect(det2(IDENTITY2)).toBe(1)
    expect(det2(A)).toBe(6)
    // reflection flips orientation
    expect(
      det2([
        [-1, 0],
        [0, 1],
      ]),
    ).toBe(-1)
  })

  it('inverse undoes the transform', () => {
    const inv = inverse2(A)
    expect(inv).not.toBeNull()
    const product = mul2(A, inv!)
    expect(approxEqualVec(product.flat(), IDENTITY2.flat())).toBe(true)
  })

  it('a singular matrix has no inverse', () => {
    const collapsed: Mat2 = [
      [1, 2],
      [2, 4],
    ]
    expect(isSingular2(collapsed)).toBe(true)
    expect(inverse2(collapsed)).toBeNull()
  })

  it('treats a near-zero determinant as singular', () => {
    const nearly: Mat2 = [
      [1, 2],
      [2, 4.0000000001],
    ]
    expect(det2(nearly)).not.toBe(0)
    expect(isSingular2(nearly)).toBe(true)
    expect(inverse2(nearly)).toBeNull()
  })
})

describe('lerp2', () => {
  it('starts at a, ends at b', () => {
    expect(lerp2(IDENTITY2, A, 0)).toEqual(IDENTITY2)
    expect(lerp2(IDENTITY2, A, 1)).toEqual(A)
    expect(lerp2(IDENTITY2, A, 0.5)).toEqual([
      [1.5, 0.5],
      [0, 2],
    ])
  })
})

describe('signed zero', () => {
  it('apply2 never returns -0, matching NumPy matmul', () => {
    const r = apply2([[-1, -2], [-0.5, -2.5]], [0, 0])
    expect(Object.is(r[0], -0)).toBe(false)
    expect(Object.is(r[1], -0)).toBe(false)
  })
})
