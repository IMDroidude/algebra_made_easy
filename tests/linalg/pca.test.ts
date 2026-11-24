import { describe, expect, it } from 'vitest'
import { coordsAlong, principalAngleDeg, totalVariance, unitAt, variance } from '../../src/linalg/pca'
import type { Vec2 } from '../../src/linalg'

const LINE: Vec2[] = [[-2, -2], [-1, -1], [1, 1], [2, 2]]

describe('pca helpers', () => {
  it('unitAt gives a unit vector at the angle', () => {
    expect(unitAt(0)).toEqual([1, 0])
    expect(unitAt(90)[1]).toBe(1)
    expect(Math.hypot(...unitAt(37))).toBeCloseTo(1, 12)
  })

  it('variance divides by n', () => {
    expect(variance([1, 3])).toBe(1)
    expect(variance([2, 2, 2])).toBe(0)
  })

  it('points on the 45° line keep all their spread on that line and none across it', () => {
    expect(principalAngleDeg(LINE)).toBeCloseTo(45, 12)
    expect(variance(coordsAlong(LINE, 45))).toBeCloseTo(totalVariance(LINE), 12)
    expect(variance(coordsAlong(LINE, 135))).toBeCloseTo(0, 12)
  })

  it('reports angles from 0 up to 180', () => {
    expect(principalAngleDeg([[-1, 1], [1, -1]])).toBeCloseTo(135, 12)
  })

  it('spread along a line and across it add up to the total', () => {
    const pts: Vec2[] = [[-3, -2], [-2, -1.5], [-1, -1], [1, 0.5], [2, 2], [3, 2]]
    for (const deg of [0, 20, 35, 70]) {
      const along = variance(coordsAlong(pts, deg))
      const across = variance(coordsAlong(pts, deg + 90))
      expect(along + across).toBeCloseTo(totalVariance(pts), 12)
    }
  })
})
