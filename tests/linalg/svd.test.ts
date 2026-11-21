import { SingularValueDecomposition } from 'ml-matrix'
import { describe, expect, it } from 'vitest'
import { IDENTITY2, approxEqualVec, det2, mul2, rotation2 } from '../../src/linalg'
import {
  diag2,
  frobenius,
  lowRank,
  lowRankStorage,
  recompose2,
  svd,
  svd2,
  svdStage,
  transpose2,
} from '../../src/linalg/svd'
import type { Mat2, Matrix } from '../../src/linalg'

const same = (a: Mat2, b: Mat2) => approxEqualVec(a.flat(), b.flat())
const isOrthogonal = (m: Mat2) => same(mul2(transpose2(m), m), IDENTITY2)

describe('svd2', () => {
  it('a shear [[1,1],[0,1]] has singular values φ ≈ 1.62 and 1/φ ≈ 0.62', () => {
    const { sigma } = svd2([[1, 1], [0, 1]])
    expect(sigma[0]).toBeCloseTo((1 + Math.sqrt(5)) / 2, 12)
    expect(sigma[1]).toBeCloseTo((Math.sqrt(5) - 1) / 2, 12)
  })

  it('a diagonal matrix: σ are the absolute diagonal entries, largest first', () => {
    expect(svd2([[2, 0], [0, 3]]).sigma).toEqual([3, 2])
    const neg = svd2([[-2, 0], [0, 0.5]])
    expect(neg.sigma).toEqual([2, 0.5])
    expect(neg.reflects).toBe(true)
  })

  it('a rotation has σ₁ = σ₂ = 1: the circle stays a circle', () => {
    const s = svd2(rotation2(40))
    expect(s.sigma[0]).toBeCloseTo(1, 12)
    expect(s.sigma[1]).toBeCloseTo(1, 12)
    expect(same(recompose2(s), rotation2(40))).toBe(true)
  })

  it('[[2,1],[1,2]] (symmetric, positive): σ = eigenvalues 3 and 1', () => {
    const s = svd2([[2, 1], [1, 2]])
    expect(s.sigma[0]).toBeCloseTo(3, 12)
    expect(s.sigma[1]).toBeCloseTo(1, 12)
    expect(s.thetaV).toBeCloseTo(45, 9)
  })

  it('a rank-1 matrix has σ₂ = 0', () => {
    const s = svd2([[2, 4], [1, 2]])
    expect(s.sigma[0]).toBeCloseTo(5, 12)
    expect(s.sigma[1]).toBe(0)
    expect(same(recompose2(s), [[2, 4], [1, 2]])).toBe(true)
  })

  it('the zero matrix decomposes without NaN', () => {
    const s = svd2([[0, 0], [0, 0]])
    expect(s.sigma).toEqual([0, 0])
    expect(s.U.flat().every(Number.isFinite)).toBe(true)
  })

  const values = [-3, -1.5, -1, 0, 0.5, 1, 2, 3]
  const grid: Mat2[] = []
  for (const a of values) for (const b of values) for (const c of values) for (const d of values) grid.push([[a, b], [c, d]])

  it(`U Σ Vᵀ = A on ${grid.length} matrices, with V a rotation and U orthogonal`, () => {
    for (const m of grid) {
      const s = svd2(m)
      expect(same(recompose2(s), m)).toBe(true)
      expect(isOrthogonal(s.U)).toBe(true)
      expect(isOrthogonal(s.V)).toBe(true)
      expect(det2(s.V)).toBeCloseTo(1, 12)
      expect(s.sigma[0]).toBeGreaterThanOrEqual(s.sigma[1])
      expect(s.sigma[1]).toBeGreaterThanOrEqual(0)
      expect(s.thetaV).toBeGreaterThan(-90)
      expect(s.thetaV).toBeLessThanOrEqual(90)
      // the flip lives in U exactly when the matrix flips the plane
      expect(s.reflects).toBe(det2(m) < -1e-9)
    }
  })

  it('singular values agree with ml-matrix on the same grid', () => {
    for (const m of grid) {
      const ref = new SingularValueDecomposition(m).diagonal
      const { sigma } = svd2(m)
      expect(sigma[0]).toBeCloseTo(ref[0], 9)
      expect(sigma[1]).toBeCloseTo(ref[1], 9)
    }
  })
})

describe('svdStage: the three steps in order', () => {
  const A: Mat2 = [[1, 2], [-0.5, 1.5]]
  const s = svd2(A)
  const Vt = transpose2(s.V)
  const Sigma = diag2(s.sigma[0], s.sigma[1])

  it('stage 0 is the identity, 1 is Vᵀ, 2 is Σ Vᵀ, 3 is A', () => {
    expect(same(svdStage(s, 0), IDENTITY2)).toBe(true)
    expect(same(svdStage(s, 1), Vt)).toBe(true)
    expect(same(svdStage(s, 2), mul2(Sigma, Vt))).toBe(true)
    expect(same(svdStage(s, 3), A)).toBe(true)
  })

  it('after Vᵀ the right singular vectors sit on the axes', () => {
    const v1: [number, number] = [s.V[0][0], s.V[1][0]]
    const M = svdStage(s, 1)
    expect(approxEqualVec([M[0][0] * v1[0] + M[0][1] * v1[1], M[1][0] * v1[0] + M[1][1] * v1[1]], [1, 0])).toBe(true)
  })

  it('halfway through a rotation step nothing shrinks', () => {
    expect(Math.abs(det2(svdStage(s, 0.5)))).toBeCloseTo(1, 12)
  })

  it('works for a reflection too', () => {
    const R: Mat2 = [[0, 2], [1, 0]]
    const r = svd2(R)
    expect(r.reflects).toBe(true)
    expect(same(svdStage(r, 3), R)).toBe(true)
  })
})

describe('general SVD and low-rank approximation', () => {
  const M: Matrix = [
    [3, 1, 0],
    [1, 3, 1],
    [0, 1, 3],
    [1, 0, 1],
  ]

  it('keeping every singular value rebuilds the matrix', () => {
    const d = svd(M)
    expect(d.s).toHaveLength(3)
    const back = lowRank(d, 3)
    expect(approxEqualVec(back.flat(), M.flat())).toBe(true)
  })

  it('the error of the rank-k approximation is the size of the dropped singular values', () => {
    const d = svd(M)
    for (let k = 0; k <= 3; k++) {
      const diff = lowRank(d, k).map((row, i) => row.map((x, j) => M[i][j] - x))
      const dropped = Math.sqrt(d.s.slice(k).reduce((sum, x) => sum + x * x, 0))
      expect(frobenius(diff)).toBeCloseTo(dropped, 9)
    }
  })

  it('rank-1 keeps one column of U, one of V and one σ', () => {
    expect(lowRankStorage(32, 32, 1)).toBe(65)
    expect(lowRankStorage(32, 32, 5)).toBe(325)
    expect(lowRankStorage(32, 32, 16)).toBeGreaterThan(32 * 32)
  })

  it('frobenius', () => {
    expect(frobenius([[3, 4]])).toBe(5)
  })
})
