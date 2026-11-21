import { Matrix, SingularValueDecomposition } from 'ml-matrix'
import { describe, expect, it } from 'vitest'
import {
  canReach2,
  cleanZero2,
  combine2,
  isIndependent2,
  isOnLine2,
  isZeroVec,
  latticePoints2,
  numpySolve2,
  rank2,
  solveCombination2,
  spanDirection2,
  spanKind2,
} from '../../src/linalg/span'
import type { Vec2 } from '../../src/linalg'

describe('combine2', () => {
  it('computes a·u + b·v', () => {
    expect(combine2(1, [2, 1], 2, [-1, 1])).toEqual([0, 3])
    expect(combine2(-1.75, [2, -1], -0.5, [1, 1.5])).toEqual([-4, 1])
    expect(combine2(0, [5, 5], 0, [3, 3])).toEqual([0, 0])
  })
})

describe('independence and span', () => {
  it('two vectors on different lines span the plane', () => {
    expect(isIndependent2([2, 1], [-1, 1])).toBe(true)
    expect(spanKind2([[2, 1], [-1, 1]])).toBe('plane')
    expect(rank2([[2, 1], [-1, 1]])).toBe(2)
  })

  it('parallel vectors, even pointing opposite ways, span only a line', () => {
    expect(isIndependent2([1, 2], [-1.5, -3])).toBe(false)
    expect(spanKind2([[1, 2], [-1.5, -3]])).toBe('line')
    expect(spanKind2([[2, 1], [4, 2]])).toBe('line')
    expect(rank2([[2, 1], [-2, -1]])).toBe(1)
  })

  it('a single vector spans a line, the zero vector only a point', () => {
    expect(spanKind2([[3, 1]])).toBe('line')
    expect(spanKind2([[0, 0]])).toBe('point')
    expect(spanKind2([[0, 0], [0, 0]])).toBe('point')
    expect(rank2([[0, 0], [0, 0]])).toBe(0)
  })

  it('one zero vector plus one non-zero vector spans a line', () => {
    expect(spanKind2([[0, 0], [1, 1]])).toBe('line')
    expect(spanDirection2([[0, 0], [1, 1]])).toEqual([1, 1])
    expect(spanDirection2([[0, 0]])).toBeNull()
  })

  it('agrees with the rank computed by ml-matrix', () => {
    const cases: [Vec2, Vec2][] = [
      [[2, 1], [-1, 1]],
      [[1, 2], [-1.5, -3]],
      [[0, 0], [0, 0]],
      [[0, 0], [2, -0.5]],
      [[0.5, 1.5], [1, 3]],
    ]
    for (const [u, v] of cases) {
      const m = new Matrix([
        [u[0], v[0]],
        [u[1], v[1]],
      ])
      expect(rank2([u, v])).toBe(new SingularValueDecomposition(m).rank)
    }
  })
})

describe('reaching a point', () => {
  it('the predict step: u = (1, 2), v = (−1.5, −3) reach the line y = 2x only', () => {
    expect(isOnLine2([1, 2], [3, 6])).toBe(true)
    expect(canReach2([1, 2], [-1.5, -3], [-2, -4])).toBe(true)
    expect(canReach2([1, 2], [-1.5, -3], [1, 0])).toBe(false)
    // they cancel for a = 1.5, b = 1
    expect(combine2(1.5, [1, 2], 1, [-1.5, -3])).toEqual([0, 0])
    // v = −1.5 u
    expect(combine2(-1.5, [1, 2], 0, [0, 0])).toEqual([-1.5, -3])
  })

  it('independent vectors reach any point; zero vectors only the origin', () => {
    expect(canReach2([2, -1], [1, 1.5], [-4, 1])).toBe(true)
    expect(canReach2([0, 0], [0, 0], [0, 0])).toBe(true)
    expect(canReach2([0, 0], [0, 0], [1, 0])).toBe(false)
  })

  it('solves a·u + b·v = target', () => {
    expect(solveCombination2([2, -1], [1, 1.5], [-4, 1])).toEqual([-1.75, -0.5])
    expect(solveCombination2([2, 1], [-1, 1], [0, 3])).toEqual([1, 2])
    expect(solveCombination2([1, 2], [2, 4], [1, 2])).toBeNull()
  })
})

describe('numpySolve2 (mirrors np.linalg.solve)', () => {
  it('matches values printed by NumPy, including the sign of zero', () => {
    const f1: Vec2 = [1, 1]
    const f2: Vec2 = [1, -1]
    expect(numpySolve2(f1, f2, [3, 1])).toEqual([2, 1])
    expect(numpySolve2(f1, f2, [1.5, -2.5])).toEqual([-0.5, 2])
    const c = numpySolve2(f1, f2, [2, 2])!
    expect(c[0]).toBe(2)
    expect(Object.is(c[1], -0)).toBe(true) // NumPy prints [ 2. -0.]
  })

  it('pivots on the larger entry and still gives the right answer', () => {
    const c = numpySolve2([1, 4], [2, 1], [5, 6])! // x = 1, y = 2
    expect(c[0]).toBeCloseTo(1)
    expect(c[1]).toBeCloseTo(2)
  })

  it('returns null where NumPy raises "Singular matrix"', () => {
    expect(numpySolve2([1, 1], [-1, -1], [3, 1])).toBeNull()
    expect(numpySolve2([0, 0], [1, 0], [1, 1])).toBeNull()
  })
})

describe('helpers', () => {
  it('latticePoints2 samples every whole-number pair in range', () => {
    const pts = latticePoints2([1, 0], [0, 1], 2)
    expect(pts).toHaveLength(25)
    expect(pts).toContainEqual([-2, 2])
  })

  it('cleanZero2 removes negative zeros', () => {
    const [x, y] = cleanZero2([-0, -0])
    expect(Object.is(x, 0) && Object.is(y, 0)).toBe(true)
    expect(isZeroVec([0, 1e-9])).toBe(true)
  })
})
