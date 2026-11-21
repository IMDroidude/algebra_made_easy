import { describe, expect, it } from 'vitest'
import { visibleBounds } from '../../src/lib/planeBounds'
import { keepInside, snapTo } from '../../src/lib/snap'

describe('visibleBounds', () => {
  it('widens x on a wide plane so units stay square', () => {
    const b = visibleBounds([-5, 5], [-5, 5], 1000, 500, false)
    expect(b.y[0]).toBeCloseTo(-5.3)
    expect(b.y[1]).toBeCloseTo(5.3)
    expect(b.x[1]).toBeCloseTo(10.6)
  })

  it('widens y on a tall plane', () => {
    const b = visibleBounds([-5, 5], [-5, 5], 400, 800, false)
    expect(b.x[1]).toBeCloseTo(5.3)
    expect(b.y[1]).toBeCloseTo(10.6)
  })

  it('keeps the requested ranges when stretched', () => {
    const b = visibleBounds([0, 100], [0, 10], 1000, 300, true)
    expect(b.x).toEqual([-0.3, 100.3])
    expect(b.y).toEqual([-0.3, 10.3])
  })
})

describe('keepInside', () => {
  const bounds = { x: [-7.45, 7.45] as [number, number], y: [-5.3, 5.3] as [number, number] }

  it('lets points go all the way to the visible x edge, not just ±5', () => {
    expect(keepInside([7, 0], snapTo(0.5), bounds)).toEqual([7, 0])
    expect(keepInside([-7.2, 0], snapTo(0.5), bounds)).toEqual([-7, 0])
  })

  it('never snaps a point past the edge', () => {
    const [x, y] = keepInside([50, -50], snapTo(0.5), bounds)
    expect(x).toBe(7)
    expect(y).toBe(-5)
  })

  it('still honours a lesson-chosen limit', () => {
    expect(keepInside([7, 7], snapTo(0.5, 3), bounds)).toEqual([3, 3])
  })
})
