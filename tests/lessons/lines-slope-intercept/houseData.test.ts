import { describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { fmt } from '../../../src/lib/format'
import {
  BEST,
  HOUSE_START,
  PRICE_POINTS,
  PRICE_SPLIT,
  boundaryDistance,
  boundaryScoreHouse,
  houseLineCode,
  houseLineOutput,
} from '../../../src/lessons/lines-slope-intercept/houseData'
import { lineEquation, meanAbsMiss, npSum } from '../../../src/lessons/lines-slope-intercept/lineMath'

describe('running example: a line through the houses', () => {
  it('the best-fit line is about 0.217 sqft + 29.8', () => {
    expect(fmt(BEST.m, 3)).toBe('0.217')
    expect(fmt(BEST.b, 1)).toBe('29.8')
    expect(lineEquation(BEST.m, BEST.b, ' × sqft', 'price', 3)).toBe('price = 0.217 × sqft + 29.793')
  })

  it('average misses match NumPy 2 (every slider position was checked; these are samples)', () => {
    expect(houseLineOutput(HOUSE_START.m, HOUSE_START.b)).toBe('66.375')
    expect(houseLineOutput(0.22, 30)).toBe('17.625')
    expect(houseLineOutput(0.25, -10)).toBe('24.375')
    expect(houseLineOutput(0, -100)).toBe('455.125')
    expect(fmt(meanAbsMiss(0.22, 30, PRICE_POINTS))).toBe('17.63')
    expect(lineEquation(0.1, 150, ' × sqft', 'price')).toBe('price = 0.1 × sqft + 150')
  })

  it('writes the NumPy code with the learner’s m and b', () => {
    const code = houseLineCode(0.22, 30)
    expect(code).toContain('m, b = 0.22, 30   # your line')
    expect(code).toContain('price = np.array([265, 370, 248, 440, 335, 418, 560, 205])   # $k')
  })

  it('npSum adds eight entries in NumPy’s pairwise order', () => {
    expect(npSum([1e16, 1, 1, 1, 1, 1, 1, 1]) - 1e16).toBe(6)
    expect(npSum([1e16, 1, 1]) - 1e16).toBe(0)
    expect(npSum([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(45)
  })

  it('the line sqft − 40·distance = 1250 splits the houses at $350k exactly', () => {
    for (const h of HOUSES) expect(boundaryScoreHouse(h.sqft, h.distanceKm) > 0).toBe(h.priceK > PRICE_SPLIT)
    expect(HOUSES.filter((h) => h.priceK > PRICE_SPLIT).map((h) => h.id)).toEqual(['B', 'D', 'F', 'G'])
    expect(boundaryDistance(1250)).toBe(0)
    expect(boundaryDistance(1650)).toBe(10)
  })
})
