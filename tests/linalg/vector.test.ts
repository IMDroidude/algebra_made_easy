import { describe, expect, it } from 'vitest'
import { add, angleDeg, dot, norm, scale, sub } from '../../src/linalg'

describe('vector operations', () => {
  it('adds and subtracts entry by entry', () => {
    expect(add([2, 1], [1, 3])).toEqual([3, 4])
    expect(sub([2, 1], [1, 3])).toEqual([1, -2])
  })

  it('scales every entry', () => {
    expect(scale([2, 1], 2)).toEqual([4, 2])
    expect(scale([2, 1], -1)).toEqual([-2, -1])
  })

  it('computes the dot product', () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32)
    expect(dot([1, 0], [0, 1])).toBe(0)
  })

  it('computes length', () => {
    expect(norm([3, 4])).toBe(5)
    expect(norm([2, 1])).toBeCloseTo(Math.sqrt(5))
  })

  it('measures angle counter-clockwise from the x-axis, y up', () => {
    expect(angleDeg([1, 0])).toBeCloseTo(0)
    expect(angleDeg([0, 1])).toBeCloseTo(90)
    expect(angleDeg([-1, 0])).toBeCloseTo(180)
  })

  it('rejects mismatched lengths', () => {
    expect(() => add([1, 2], [1, 2, 3])).toThrow(/mismatch/)
    expect(() => dot([1], [1, 2])).toThrow(/mismatch/)
  })
})
