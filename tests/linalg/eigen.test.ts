import { EigenvalueDecomposition, Matrix } from 'ml-matrix'
import { describe, expect, it } from 'vitest'
import { apply2, approxEqual, approxEqualVec, dot, norm, rotation2 } from '../../src/linalg'
import {
  angleGap,
  angleOf,
  canonicalDirection,
  centre2,
  characteristic2,
  covariance2,
  eigen2,
  eigenAngles,
  lineTest,
  makeCloud,
  mean2,
  nextEigenAngle,
  pca2,
  projectOnto,
  snapToEigenAngle,
  unitAt,
} from '../../src/linalg/eigen'
import type { Mat2, Vec2 } from '../../src/linalg'

const SQ = Math.SQRT1_2

/** A v = λ v, checked numerically. */
const isEigenpair = (m: Mat2, value: number, v: Vec2) =>
  approxEqualVec(apply2(m, v), [value * v[0], value * v[1]])

describe('eigen2: the four cases', () => {
  it('symmetric stretch [[2,1],[1,2]]: λ = 3 along (1,1), λ = 1 along (1,−1)', () => {
    const e = eigen2([[2, 1], [1, 2]])
    expect(e.kind).toBe('distinct')
    if (e.kind !== 'distinct') return
    expect(e.pairs[0].value).toBeCloseTo(3, 12)
    expect(e.pairs[1].value).toBeCloseTo(1, 12)
    expect(approxEqualVec(e.pairs[0].vector, [SQ, SQ])).toBe(true)
    expect(approxEqualVec(e.pairs[1].vector, [SQ, -SQ])).toBe(true)
  })

  it('a flip [[1,2],[2,1]] has a negative eigenvalue −1 along (1,−1)', () => {
    const e = eigen2([[1, 2], [2, 1]])
    if (e.kind !== 'distinct') throw new Error(e.kind)
    expect(e.pairs.map((p) => p.value)).toEqual([3, -1])
    expect(approxEqualVec(e.pairs[1].vector, [SQ, -SQ])).toBe(true)
  })

  it('upper triangular [[3,1],[0,2]]: λ = 3 along x, λ = 2 along (1,−1)', () => {
    const m: Mat2 = [[3, 1], [0, 2]]
    const e = eigen2(m)
    if (e.kind !== 'distinct') throw new Error(e.kind)
    expect(e.pairs[0]).toEqual({ value: 3, vector: [1, 0] })
    expect(approxEqualVec(e.pairs[1].vector, [SQ, -SQ])).toBe(true)
    for (const p of e.pairs) expect(isEigenpair(m, p.value, p.vector)).toBe(true)
  })

  it('a rotation has no real eigenvectors: complex, not NaN', () => {
    const e = eigen2([[0, -1], [1, 0]])
    expect(e).toEqual({ kind: 'complex', re: 0, im: 1 })
    const e30 = eigen2(rotation2(30))
    if (e30.kind !== 'complex') throw new Error(e30.kind)
    expect(e30.re).toBeCloseTo(Math.cos(Math.PI / 6), 12)
    expect(e30.im).toBeCloseTo(0.5, 12)
  })

  it('[[1,−2],[1,1]] has eigenvalues 1 ± 1.41i', () => {
    const e = eigen2([[1, -2], [1, 1]])
    if (e.kind !== 'complex') throw new Error(e.kind)
    expect(e.re).toBe(1)
    expect(e.im).toBeCloseTo(Math.SQRT2, 12)
  })

  it('a scaling 2I makes every direction an eigenvector with λ = 2', () => {
    expect(eigen2([[2, 0], [0, 2]])).toEqual({ kind: 'scalar', value: 2 })
    expect(eigen2([[-2, 0], [0, -2]])).toEqual({ kind: 'scalar', value: -2 })
  })

  it('a shear [[1,1],[0,1]] has one line only: defective, λ = 1 along x', () => {
    expect(eigen2([[1, 1], [0, 1]])).toEqual({ kind: 'defective', value: 1, vector: [1, 0] })
  })

  it('a singular matrix has eigenvalue 0 along its null direction', () => {
    const e = eigen2([[1, 2], [2, 4]])
    if (e.kind !== 'distinct') throw new Error(e.kind)
    expect(e.pairs[0].value).toBeCloseTo(5, 12)
    expect(e.pairs[1].value).toBeCloseTo(0, 12)
    expect(approxEqualVec(e.pairs[1].vector, canonicalDirection([2, -1]))).toBe(true)
  })

  it('the zero matrix is the scalar case with λ = 0', () => {
    expect(eigen2([[0, 0], [0, 0]])).toEqual({ kind: 'scalar', value: 0 })
  })

  it('characteristic2 gives trace, det and discriminant', () => {
    expect(characteristic2([[2, 1], [1, 2]])).toEqual({ trace: 4, det: 3, disc: 4 })
    expect(characteristic2([[0, -1], [1, 0]])).toEqual({ trace: 0, det: 1, disc: -4 })
  })
})

describe('eigen2 agrees with ml-matrix on a grid of matrices', () => {
  const values = [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3]
  const all: Mat2[] = []
  for (const a of values) for (const b of values) for (const c of values) for (const d of values) all.push([[a, b], [c, d]])

  it(`checks ${all.length} matrices`, () => {
    let checked = 0
    for (const m of all) {
      const e = eigen2(m)
      const ref = new EigenvalueDecomposition(new Matrix(m))
      const re = [...ref.realEigenvalues].sort((x, y) => y - x)
      const im = ref.imaginaryEigenvalues.map(Math.abs)
      if (e.kind === 'complex') {
        expect(Math.max(...im)).toBeCloseTo(e.im, 6)
        expect(re[0]).toBeCloseTo(e.re, 6)
      } else if (e.kind === 'distinct') {
        expect(Math.max(...im)).toBeLessThan(1e-6)
        expect(re[0]).toBeCloseTo(e.pairs[0].value, 6)
        expect(re[1]).toBeCloseTo(e.pairs[1].value, 6)
        for (const p of e.pairs) {
          expect(norm(p.vector)).toBeCloseTo(1, 12)
          expect(isEigenpair(m, p.value, p.vector)).toBe(true)
        }
      } else {
        // repeated: both eigenvalues equal (ml-matrix may show a tiny imaginary part)
        expect(re[0]).toBeCloseTo(e.value, 3)
        expect(re[1]).toBeCloseTo(e.value, 3)
        if (e.kind === 'defective') expect(isEigenpair(m, e.value, e.vector)).toBe(true)
      }
      checked++
    }
    expect(checked).toBe(all.length)
  })

  it('eigenvalues always add up to the trace and multiply to the determinant', () => {
    for (const m of all) {
      const e = eigen2(m)
      const { trace, det } = characteristic2(m)
      if (e.kind === 'distinct') {
        expect(approxEqual(e.pairs[0].value + e.pairs[1].value, trace)).toBe(true)
        expect(e.pairs[0].value * e.pairs[1].value).toBeCloseTo(det, 6)
      } else if (e.kind === 'complex') {
        expect(2 * e.re).toBeCloseTo(trace, 12)
        expect(e.re ** 2 + e.im ** 2).toBeCloseTo(det, 9)
      }
    }
  })
})

describe('sweeping a vector around the circle', () => {
  const A: Mat2 = [[2, 1], [1, 2]]

  it('lineTest: (1,0) is knocked 26.57° off its line, (1,1) is kept with factor 3', () => {
    const off = lineTest(A, [1, 0])
    expect(off.kept).toBe(false)
    expect(off.Av).toEqual([2, 1])
    expect(off.offLineDeg).toBeCloseTo(26.565, 3)
    const on = lineTest(A, unitAt(45))
    expect(on.kept).toBe(true)
    expect(on.factor).toBeCloseTo(3, 12)
  })

  it('lineTest: a negative eigenvalue is a kept line with a negative factor', () => {
    const t = lineTest([[1, 2], [2, 1]], unitAt(-45))
    expect(t.kept).toBe(true)
    expect(t.factor).toBeCloseTo(-1, 12)
  })

  it('lineTest: a rotation keeps no line; 90° turns every vector by 90°', () => {
    for (let deg = 0; deg < 360; deg += 15) {
      const t = lineTest([[0, -1], [1, 0]], unitAt(deg))
      expect(t.kept).toBe(false)
      expect(t.offLineDeg).toBeCloseTo(90, 9)
    }
  })

  it('lineTest: a vector squashed to zero counts as kept with factor 0', () => {
    const t = lineTest([[1, 2], [2, 4]], canonicalDirection([2, -1]))
    expect(t.collapsed).toBe(true)
    expect(t.kept).toBe(true)
    expect(t.factor).toBeCloseTo(0, 12)
  })

  it('eigenAngles lists both ends of each eigen line', () => {
    expect(eigenAngles(eigen2(A)).map((a) => Math.round(a))).toEqual([45, 225, 315, 135])
    expect(eigenAngles(eigen2([[0, -1], [1, 0]]))).toEqual([])
  })

  it('snapToEigenAngle pulls a nearby angle onto the eigen line', () => {
    const e = eigen2(A)
    expect(snapToEigenAngle(e, 44)).toBeCloseTo(45, 9)
    expect(snapToEigenAngle(e, 40)).toBe(40)
  })

  it('nextEigenAngle walks counter-clockwise through the eigen directions', () => {
    const e = eigen2(A)
    expect(nextEigenAngle(e, 0)).toBeCloseTo(45, 9)
    expect(nextEigenAngle(e, 45)).toBeCloseTo(135, 9)
    expect(nextEigenAngle(e, 320)).toBeCloseTo(45, 9)
    expect(nextEigenAngle(eigen2([[0, -1], [1, 0]]), 0)).toBeNull()
  })

  it('angle helpers', () => {
    expect(angleOf([0, -1])).toBe(270)
    expect(angleGap(350, 10)).toBe(20)
    expect(approxEqualVec(unitAt(90), [0, 1])).toBe(true)
    expect(canonicalDirection([-2, 0])).toEqual([1, 0])
    expect(canonicalDirection([0, -3])).toEqual([0, 1])
  })
})

describe('PCA', () => {
  const pts: Vec2[] = [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 5],
  ]

  it('centres the data on the mean', () => {
    expect(mean2(pts)).toEqual([2.5, 2.75])
    const c = centre2(pts)
    expect(approxEqualVec(mean2(c), [0, 0])).toBe(true)
  })

  it('covariance matches the textbook formula (n − 1 in the denominator)', () => {
    const C = covariance2(pts)
    // Same numbers as NumPy: np.cov(X.T) = [[1.66666667 2.16666667] [2.16666667 2.91666667]]
    expect(C[0][0]).toBeCloseTo(1.666667, 6)
    expect(C[1][1]).toBeCloseTo(2.916667, 6)
    expect(C[0][1]).toBeCloseTo(2.166667, 6)
    expect(C[0][1]).toBe(C[1][0])
  })

  it('principal directions are perpendicular eigenvectors of the covariance, largest variance first', () => {
    const p = pca2(pts)
    const [pc1, pc2] = p.components
    expect(pc1.value).toBeGreaterThan(pc2.value)
    expect(dot(pc1.vector, pc2.vector)).toBeCloseTo(0, 12)
    expect(isEigenpair(p.covariance, pc1.value, pc1.vector)).toBe(true)
    expect(isEigenpair(p.covariance, pc2.value, pc2.vector)).toBe(true)
    // Total variance is preserved: eigenvalues add up to the trace.
    expect(pc1.value + pc2.value).toBeCloseTo(p.covariance[0][0] + p.covariance[1][1], 12)
  })

  it('the variance of the projected data along PC1 equals its eigenvalue', () => {
    const p = pca2(pts)
    const t = p.centred.map((q) => dot(q, p.components[0].vector))
    const variance = t.reduce((s, x) => s + x * x, 0) / (t.length - 1)
    expect(variance).toBeCloseTo(p.components[0].value, 12)
  })

  it('points on a line have zero variance across it', () => {
    const p = pca2([[0, 0], [1, 2], [2, 4], [-1, -2]])
    expect(p.components[1].value).toBe(0)
    expect(approxEqualVec(p.components[0].vector, canonicalDirection([1, 2]))).toBe(true)
  })

  it('a round cloud has no preferred direction', () => {
    const p = pca2([[1, 0], [-1, 0], [0, 1], [0, -1]])
    expect(p.isotropic).toBe(true)
    expect(p.components[0].value).toBeCloseTo(p.components[1].value, 12)
  })

  it('agrees with ml-matrix on generated clouds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const p = pca2(makeCloud(seed))
      const ref = new EigenvalueDecomposition(new Matrix(p.covariance), { assumeSymmetric: true })
      const vals = [...ref.realEigenvalues].sort((x, y) => y - x)
      expect(p.components[0].value).toBeCloseTo(vals[0], 9)
      expect(p.components[1].value).toBeCloseTo(vals[1], 9)
    }
  })

  it('makeCloud is repeatable, has 16 points on a 0.25 grid inside the plane', () => {
    const a = makeCloud(7)
    expect(a).toEqual(makeCloud(7))
    expect(a).toHaveLength(16)
    for (const [x, y] of a) {
      expect(Number.isInteger(x * 4) && Number.isInteger(y * 4)).toBe(true)
      expect(Math.abs(x)).toBeLessThanOrEqual(4.75)
      expect(Math.abs(y)).toBeLessThanOrEqual(4.75)
    }
  })

  it('projectOnto drops a point onto a line through the origin', () => {
    expect(approxEqualVec(projectOnto([2, 0], [SQ, SQ]), [1, 1])).toBe(true)
  })
})
