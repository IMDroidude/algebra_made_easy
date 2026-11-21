import { describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { fmt } from '../../../src/lib/format'
import {
  HOUSE_ERRORS,
  HOUSE_MSE,
  HOUSE_SQUARES,
  distanceCode,
  distanceOutput,
  errorCode,
  errorOutput,
  featureDistance,
  features,
  npSum,
} from '../../../src/lessons/exponents-and-roots/houseData'
import { largestShare } from '../../../src/lessons/exponents-and-roots/powers'

const B = HOUSES[1]
const G = HOUSES[6]

describe('running example: squared error of the price model', () => {
  it('errors, squares and their mean', () => {
    expect(HOUSE_ERRORS.map((e) => fmt(e))).toEqual(['-7', '10', '20', '-30', '19', '-8', '2', '-45'])
    expect(HOUSE_SQUARES.map((e) => fmt(e))).toEqual(['49', '100', '400', '900', '361', '64', '4', '2025'])
    expect(fmt(npSum(HOUSE_SQUARES))).toBe('3903')
    expect(fmt(HOUSE_MSE, 3)).toBe('487.875')
    expect(fmt(largestShare(HOUSE_SQUARES) * 100, 0)).toBe('52')
    expect(fmt(Math.sqrt(HOUSE_MSE), 1)).toBe('22.1')
    expect(fmt(Math.sqrt(HOUSE_MSE), 0)).toBe('22')
  })

  it('prints what NumPy 2 prints', () => {
    expect(errorCode).toContain('errors = y - (0.22 * sqft + 30)')
    expect(errorOutput).toBe(
      '[ -7.  10.  20. -30.  19.  -8.   2. -45.]\n[  49.  100.  400.  900.  361.   64.    4. 2025.]\n487.875',
    )
  })
})

describe('running example: distance between houses B and G', () => {
  it('in sqft, size swamps the other features', () => {
    const d = featureDistance(features(B, false), features(G, false))
    expect(fmt(d, 3)).toBe('900.001')
    expect(fmt(d * d, 3)).toBe('810002')
    expect(distanceOutput(B, G, false)).toBe('[900   1   1]\n900.0011111104252')
    expect(distanceCode(B, G, false)).toContain('b = np.array([1500, 3, 5])   # house B')
  })

  it('in thousands of sqft, every feature counts', () => {
    const fb = features(B, true)
    const fg = features(G, true)
    expect(fg.map((x, k) => fmt(x - fb[k], 3))).toEqual(['0.9', '1', '1'])
    expect(fg.map((x, k) => fmt((x - fb[k]) ** 2, 3))).toEqual(['0.81', '1', '1'])
    expect(fmt(featureDistance(fb, fg) ** 2, 3)).toBe('2.81')
    expect(fmt(featureDistance(fb, fg), 3)).toBe('1.676')
    expect(distanceOutput(B, G, true)).toBe('[0.9 1.  1. ]\n1.676305461424021')
    expect(distanceCode(B, G, true)).toContain('g = np.array([2.4, 4, 6])   # house G')
  })
})
