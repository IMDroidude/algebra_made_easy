import { Matrix, SingularValueDecomposition, solve } from 'ml-matrix'
import { describe, expect, it } from 'vitest'
import { IDENTITY2, apply2, approxEqualVec, det2, inverse2, isZero, mul2 } from '../../src/linalg'
import type { Mat2, Vec2 } from '../../src/linalg'
import {
  closestOnLine,
  columnSpace2,
  designMatrix,
  fitLine,
  lineThrough,
  lowRankParams,
  normalEquations,
  nullSpace2,
  numpyMatrixRank2,
  outer2,
  predict,
  project2,
  rank2,
  residuals,
  rowLine,
  solve2,
  sumSquaredResiduals,
  thereAndBack2,
  xtResiduals,
} from '../../src/linalg/systems'

const close = (a: readonly number[], b: readonly number[], digits = 9) =>
  a.forEach((x, i) => expect(x).toBeCloseTo(b[i], digits))

describe('rank2', () => {
  it('is the dimension of the output', () => {
    expect(rank2(IDENTITY2)).toBe(2)
    expect(rank2([[1, 2], [0.5, 1]])).toBe(1)
    expect(rank2([[0, 0], [0, 0]])).toBe(0)
  })

  it('uses the shared tolerance: a determinant of 1e-7 counts as singular', () => {
    expect(rank2([[2, 1], [0, 0.00000005]])).toBe(1)
    expect(rank2([[2, 1], [0, 0.0005]])).toBe(2)
  })

  it('agrees with the rank from ml-matrix SVD on clear cases', () => {
    for (const m of [[[3, 1], [6, 2]], [[1, 4], [2, -1]], [[0, 0], [0, 0]]] as Mat2[]) {
      expect(rank2(m)).toBe(new SingularValueDecomposition(new Matrix(m)).rank)
    }
  })
})

describe('numpyMatrixRank2', () => {
  it('matches np.linalg.matrix_rank, which is much stricter than the app', () => {
    expect(numpyMatrixRank2([[1, 1], [-1, 1]])).toBe(2)
    expect(numpyMatrixRank2([[1, 1], [2, 2]])).toBe(1)
    expect(numpyMatrixRank2([[0, 0], [0, 0]])).toBe(0)
    // NumPy printed 2 for this matrix; the app treats it as singular.
    expect(numpyMatrixRank2([[2, 1], [1, 0.5000001]])).toBe(2)
    expect(rank2([[2, 1], [1, 0.5000001]])).toBe(1)
  })
})

describe('nullSpace2 and columnSpace2', () => {
  it('rank 1: the null space is crushed to zero, outputs lie along a column', () => {
    const A: Mat2 = [[1, 2], [0.5, 1]]
    const ns = nullSpace2(A)
    expect(ns).toEqual({ dim: 1, direction: [-2, 1] })
    if (ns.dim === 1) expect(approxEqualVec(apply2(A, ns.direction), [0, 0])).toBe(true)
    expect(columnSpace2(A)).toEqual({ dim: 1, direction: [2, 1] })
  })

  it('rank 2 and rank 0', () => {
    expect(nullSpace2(IDENTITY2)).toEqual({ dim: 0 })
    expect(columnSpace2(IDENTITY2)).toEqual({ dim: 2 })
    expect(nullSpace2([[0, 0], [0, 0]])).toEqual({ dim: 2 })
    expect(columnSpace2([[0, 0], [0, 0]])).toEqual({ dim: 0 })
  })

  it('rank + null-space dimension = 2', () => {
    for (const m of [IDENTITY2, [[1, 2], [2, 4]], [[0, 0], [0, 0]]] as Mat2[]) {
      expect(rank2(m) + nullSpace2(m).dim).toBe(2)
    }
  })
})

describe('thereAndBack2', () => {
  const A: Mat2 = [[2, 1], [1, 1]]
  it('goes identity → A → identity', () => {
    expect(thereAndBack2(A, 0)).toEqual(IDENTITY2)
    expect(thereAndBack2(A, 1)).toEqual(A)
    close(thereAndBack2(A, 2)!.flat(), IDENTITY2.flat())
  })
  it('has no way back for a singular matrix', () => {
    expect(thereAndBack2([[1, 2], [0.5, 1]], 1.5)).toBeNull()
  })
})

describe('rowLine', () => {
  it('turns a·x + b·y = c into a line', () => {
    const l = rowLine([1, 1], 3)
    if (typeof l === 'string') throw new Error('expected a line')
    expect(l.point[0] + l.point[1]).toBeCloseTo(3)
    expect(l.direction).toEqual([-1, 1])
  })
  it('handles 0 = c', () => {
    expect(rowLine([0, 0], 0)).toBe('everywhere')
    expect(rowLine([0, 0], 2)).toBe('nowhere')
  })
})

describe('solve2', () => {
  it('one crossing: x + y = 3, x − y = 1 gives (2, 1)', () => {
    expect(solve2([[1, 1], [1, -1]], [3, 1])).toEqual({ kind: 'unique', x: [2, 1] })
  })
  it('agrees with ml-matrix on an invertible system', () => {
    const sol = solve2([[3, 1], [1, 2]], [1, -1])
    const ref = solve(new Matrix([[3, 1], [1, 2]]), Matrix.columnVector([1, -1])).to1DArray()
    if (sol.kind !== 'unique') throw new Error('expected one solution')
    close(sol.x, ref)
  })
  it('parallel lines: no solution', () => {
    expect(solve2([[1, 1], [1, 1]], [3, 1]).kind).toBe('none')
  })
  it('same line: a line of solutions, each differing by the null space', () => {
    const sol = solve2([[1, 1], [2, 2]], [3, 6])
    if (sol.kind !== 'line') throw new Error('expected a line')
    for (const t of [-2, 0, 3]) {
      const x: Vec2 = [sol.line.point[0] + t * sol.line.direction[0], sol.line.point[1] + t * sol.line.direction[1]]
      expect(approxEqualVec(apply2([[1, 1], [2, 2]], x), [3, 6])).toBe(true)
    }
  })
  it('zero matrix', () => {
    expect(solve2([[0, 0], [0, 0]], [0, 0]).kind).toBe('all')
    expect(solve2([[0, 0], [0, 0]], [1, 0]).kind).toBe('none')
  })
})

describe('projection', () => {
  it('projects onto a line and leaves a perpendicular residual', () => {
    expect(project2([1, 3], [2, 1])).toEqual([2, 1])
    const r: Vec2 = [1 - 2, 3 - 1]
    expect(r).toEqual([-1, 2])
    expect(r[0] * 2 + r[1] * 1).toBe(0)
  })
  it('finds the closest point on a line', () => {
    close(closestOnLine({ point: [0, 1], direction: [1, 0] }, [3, 5]), [3, 1])
  })
})

describe('least squares', () => {
  const DATA: Vec2[] = [[-4, -2.5], [-2, -0.5], [-1, -1], [1, 1], [2, 0.5], [4, 3]]

  it('builds the normal equations', () => {
    expect(designMatrix([[2, 5]])).toEqual([[2, 1]])
    expect(normalEquations(DATA)).toEqual({ XtX: [[42, 0], [0, 6]], Xty: [26, 0.5] })
  })

  it('fits the lesson data: slope 26/42 ≈ 0.619, intercept 0.5/6 ≈ 0.0833, error ≈ 1.6131', () => {
    const fit = fitLine(DATA)!
    expect(fit.slope).toBeCloseTo(26 / 42, 12)
    expect(fit.intercept).toBeCloseTo(0.5 / 6, 12)
    expect(sumSquaredResiduals(DATA, fit)).toBeCloseTo(1.6131, 4)
  })

  it('agrees with ml-matrix least squares', () => {
    const pts: Vec2[] = [[-3, 1], [-1, 2], [1, -1], [3, 0.5], [0.5, 2]]
    const X = new Matrix(designMatrix(pts))
    const ref = solve(X, Matrix.columnVector(pts.map((p) => p[1])), true).to1DArray()
    const fit = fitLine(pts)!
    close([fit.slope, fit.intercept], ref)
  })

  it('residuals are perpendicular to both columns of X', () => {
    const fit = fitLine(DATA)!
    close(xtResiduals(DATA, fit), [0, 0], 12)
  })

  it('beats any other line', () => {
    const fit = fitLine(DATA)!
    const best = sumSquaredResiduals(DATA, fit)
    for (const d of [-0.1, 0.05]) {
      expect(sumSquaredResiduals(DATA, { slope: fit.slope + d, intercept: fit.intercept })).toBeGreaterThan(best)
      expect(sumSquaredResiduals(DATA, { slope: fit.slope, intercept: fit.intercept + d })).toBeGreaterThan(best)
    }
  })

  it('has no answer when every x is the same', () => {
    expect(fitLine([[1, 0], [1, 2], [1, -1]])).toBeNull()
  })

  it('residuals and predictions', () => {
    expect(residuals([[2, 3]], { slope: 1, intercept: 0 })).toEqual([1])
    expect(predict({ slope: 0.7, intercept: 0.1 }, 2.5)).toBeCloseTo(1.85)
  })

  it('lineThrough', () => {
    expect(lineThrough([-4, 0], [4, 2])).toEqual({ slope: 0.25, intercept: 1 })
    expect(lineThrough([1, 0], [1, 2])).toBeNull()
  })
})

describe('low rank', () => {
  it('a column times a row has rank 1', () => {
    const dW = outer2([2, 1], [1, -0.5])
    expect(dW).toEqual([[2, -1], [1, -0.5]])
    expect(rank2(dW)).toBe(1)
    expect(isZero(det2(dW))).toBe(true)
    expect(rank2(outer2([0, 0], [1, 1]))).toBe(0)
  })
  it('counts the numbers saved', () => {
    expect(lowRankParams(4096, 8)).toEqual({ full: 16777216, factored: 65536 })
    expect(lowRankParams(768, 1)).toEqual({ full: 589824, factored: 1536 })
  })
  it('inverse round trip', () => {
    const A: Mat2 = [[2, 1], [1, 1]]
    close(mul2(inverse2(A)!, A).flat(), IDENTITY2.flat())
  })
})
