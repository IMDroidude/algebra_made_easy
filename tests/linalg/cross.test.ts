import { describe, expect, it } from 'vitest'
import { dot, norm } from '../../src/linalg'
import { cross3 } from '../../src/linalg/cross'
import type { Vec3 } from '../../src/linalg/project3d'

describe('cross3', () => {
  it('x × y = z, and the other two cyclic pairs', () => {
    expect(cross3([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1])
    expect(cross3([0, 1, 0], [0, 0, 1])).toEqual([1, 0, 0])
    expect(cross3([0, 0, 1], [1, 0, 0])).toEqual([0, 1, 0])
  })

  it('matches a hand-worked example', () => {
    expect(cross3([1, 2, 3], [4, 5, 6])).toEqual([-3, 6, -3])
  })

  it('is at right angles to both inputs', () => {
    const a: Vec3 = [2, -1, 4]
    const b: Vec3 = [0.5, 3, -2]
    const c = cross3(a, b)
    expect(dot(c, a)).toBeCloseTo(0, 12)
    expect(dot(c, b)).toBeCloseTo(0, 12)
  })

  it('flips when the inputs are swapped', () => {
    const a: Vec3 = [2, -1, 4]
    const b: Vec3 = [0.5, 3, -2]
    expect(cross3(b, a)).toEqual(cross3(a, b).map((x) => -x))
  })

  it('gives the zero vector for parallel inputs', () => {
    expect(norm(cross3([1, 2, 3], [2, 4, 6]))).toBe(0)
  })

  it('has the area of the parallelogram as its length', () => {
    // a 3-by-2 rectangle on the floor
    expect(norm(cross3([3, 0, 0], [0, 2, 0]))).toBe(6)
    // slanting one side keeps base 3 and height 2
    expect(norm(cross3([3, 0, 0], [1, 2, 0]))).toBe(6)
  })
})
