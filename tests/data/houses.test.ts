import { describe, expect, it } from 'vitest'
import { HOUSES, featureMatrix, housesNumpy, prices } from '../../src/data/houses'

describe('house dataset', () => {
  it('has eight houses with unique ids and three positive features each', () => {
    expect(HOUSES).toHaveLength(8)
    expect(new Set(HOUSES.map((h) => h.id)).size).toBe(8)
    for (const row of featureMatrix()) {
      expect(row).toHaveLength(3)
      row.forEach((x) => expect(x).toBeGreaterThan(0))
    }
  })

  it('prices follow the stated pattern within a small noise band', () => {
    HOUSES.forEach((h) => {
      const rule = 0.2 * h.sqft + 15 * h.bedrooms - 6 * h.distanceKm + 60
      expect(Math.abs(h.priceK - rule)).toBeLessThanOrEqual(10)
    })
    expect(prices()).toEqual(HOUSES.map((h) => h.priceK))
  })

  it('writes the NumPy literal row by row', () => {
    const code = housesNumpy()
    expect(code).toContain('X = np.array([[1100, 2, 8],')
    expect(code).toContain('y = np.array([265, 370, 248, 440, 335, 418, 560, 205])')
  })
})

describe('claims made about the dataset elsewhere', () => {
  it('the best-fit line of price on size is about 0.22 × sqft + 30 (Reference page)', () => {
    const x = HOUSES.map((h) => h.sqft)
    const y = prices()
    const mx = x.reduce((a, b) => a + b) / x.length
    const my = y.reduce((a, b) => a + b) / y.length
    const m = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0)
    const b = my - m * mx
    expect(m).toBeCloseTo(0.217, 2)
    expect(b).toBeCloseTo(29.8, 0)
  })
})
