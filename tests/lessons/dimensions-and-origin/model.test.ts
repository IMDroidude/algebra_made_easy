import { describe, expect, it } from 'vitest'
import {
  HOUSE,
  LIMIT,
  PRACTICE_CHECKS,
  PRACTICE_START,
  PREDICT_ORIGIN_TO,
  PREDICT_PLACE,
  WEATHER_DIMS,
  beadCode,
  bracket,
  describeNumber,
  featureText,
  houseCode,
  houseDrawing,
  houseText,
  labelEvery,
  numberOf,
  oblique,
  pointText,
  ruleText,
  seeSentence,
  showsNumber,
  signed,
  snapOnLine,
} from '../../../src/lessons/dimensions-and-origin/model'
import { takeaways } from '../../../src/lessons/dimensions-and-origin/takeaways'

describe('numbers on the wire', () => {
  it('measures from the origin: number = place − origin', () => {
    expect(numberOf(3, 0)).toBe(3)
    expect(numberOf(3, 4)).toBe(-1)
    expect(numberOf(2, -3)).toBe(5)
    expect(Object.is(numberOf(4, 4), 0)).toBe(true)
  })

  it('writes negatives with a real minus sign and never "-0"', () => {
    expect(signed(-3)).toBe('−3')
    expect(signed(5)).toBe('5')
    expect(signed(-0)).toBe('0')
    expect(bracket(-3)).toBe('(−3)')
    expect(bracket(4)).toBe('4')
  })

  it('describes distance and direction', () => {
    expect(describeNumber(3)).toBe('3 steps right of the origin')
    expect(describeNumber(-1)).toBe('1 step left of the origin')
    expect(describeNumber(0)).toBe('exactly at the origin')
  })

  it('writes the step 4 sum', () => {
    expect(ruleText(3, 0)).toBe('3 = 3 − 0')
    expect(ruleText(3, 4)).toBe('−1 = 3 − 4')
    expect(ruleText(2, -3)).toBe('5 = 2 − (−3)')
  })

  it('snaps to whole steps on the wire, within ±LIMIT', () => {
    expect(LIMIT).toBe(8)
    expect(snapOnLine([2.4, 0.7])).toEqual([2, 0])
    expect(snapOnLine([-12, -3])).toEqual([-8, 0])
    expect(Object.is(snapOnLine([-0.2, 0])[0], 0)).toBe(true)
  })

  it('numbers every tick on wide lines, every second one (always counted from the origin) on narrow ones', () => {
    expect(labelEvery(40)).toBe(1)
    expect(labelEvery(20)).toBe(2)
    expect(showsNumber(5, 1, 2)).toBe(true)
    expect(showsNumber(4, 1, 2)).toBe(false)
    expect(showsNumber(4, 1, 1)).toBe(true)
  })
})

describe('the prediction', () => {
  it('moving the origin 4 right turns the bead at 3 into −1', () => {
    expect(numberOf(PREDICT_PLACE, PREDICT_ORIGIN_TO)).toBe(-1)
  })
})

describe('step 1 pictures', () => {
  it('writes the first d numbers of the point', () => {
    expect(pointText([3, 2, 1], 1)).toBe('(3)')
    expect(pointText([3, 2, 1], 2)).toBe('(3, 2)')
    expect(pointText([3, 2, 1], 3)).toBe('(3, 2, 1)')
  })

  it('says one, two, three numbers', () => {
    expect(seeSentence(1)).toBe('The bead is at 3: 3 steps along the wire from the origin. One number, so one dimension.')
    expect(seeSentence(2)).toMatch(/^The ant is at \(3, 2\).*Two numbers, so two dimensions\.$/)
    expect(seeSentence(3)).toMatch(/^The drone is at \(3, 2, 1\): 3 right, 2 up, 1 toward you\./)
  })

  it('draws x right, y up and z toward the viewer (down-left on screen)', () => {
    expect(oblique([0, 0, 0], 10, [100, 100])).toEqual([100, 100])
    expect(oblique([1, 0, 0], 10, [100, 100])).toEqual([110, 100])
    expect(oblique([0, 1, 0], 10, [100, 100])).toEqual([100, 90])
    const [zx, zy] = oblique([0, 0, 1], 10, [100, 100])
    expect(zx).toBeLessThan(100)
    expect(zy).toBeGreaterThan(100)
  })
})

describe('NumPy output (checked against NumPy 2.4)', () => {
  it('bead minus origin', () => {
    expect(beadCode(3, 0).output).toBe('[3]\n(1,)')
    expect(beadCode(3, 4).output).toBe('[-1]\n(1,)')
    expect(beadCode(2, -3).output).toBe('[5]\n(1,)')
    expect(beadCode(-8, 8).output).toBe('[-16]\n(1,)')
    expect(beadCode(0, 0).output).toBe('[0]\n(1,)')
    expect(beadCode(3, 4).code).toContain('bead = np.array([3])')
    expect(beadCode(3, 4).code).toContain('origin = np.array([4])')
  })

  it('the house with 1 to 5 features', () => {
    expect(houseCode(1).output).toBe('[120]\n(1,)\n1')
    expect(houseCode(2).output).toBe('[120   3]\n(2,)\n2')
    expect(houseCode(3).output).toBe('[120   3  15]\n(3,)\n3')
    expect(houseCode(4).output).toBe('[120   3  15   8]\n(4,)\n4')
    expect(houseCode(5).output).toBe('[120   3  15   8  40]\n(5,)\n5')
    expect(houseCode(3).code).toContain('house = np.array([120, 3, 15])   # size, rooms, age')
  })
})

describe('house space', () => {
  it('lists the features and scales them for the picture', () => {
    expect(HOUSE).toHaveLength(5)
    expect(houseText(3)).toBe('(120, 3, 15)')
    expect(featureText(HOUSE[0])).toBe('size 120 m²')
    expect(featureText(HOUSE[1])).toBe('rooms 3')
    expect(houseDrawing(3)).toEqual([2.4, 2, 1.5])
  })
})

describe('practice checks', () => {
  const at = (place: number, origin: number, dims = 0) => ({ place, origin, dims })
  it('none is solved at the start', () => {
    for (const check of Object.values(PRACTICE_CHECKS)) expect(check(at(PRACTICE_START.place, PRACTICE_START.origin))).toBe(false)
  })
  it('−6 can be reached by the bead, the origin, or both', () => {
    expect(PRACTICE_CHECKS.neg(at(-6, 0))).toBe(true)
    expect(PRACTICE_CHECKS.neg(at(2, 8))).toBe(true)
    expect(PRACTICE_CHECKS.neg(at(-6, 1))).toBe(false)
  })
  it('"same place" needs the bead at its start and number 5', () => {
    expect(PRACTICE_CHECKS.still(at(2, -3))).toBe(true)
    expect(PRACTICE_CHECKS.still(at(5, 0))).toBe(false)
  })
  it('a weather reading has 4 dimensions', () => {
    expect(WEATHER_DIMS).toBe(4)
    expect(PRACTICE_CHECKS.dims(at(2, 0, 4))).toBe(true)
    expect(PRACTICE_CHECKS.dims(at(2, 0, 3))).toBe(false)
  })
})

describe('takeaways', () => {
  it('has 3 to 5 short sentences', () => {
    expect(takeaways.length).toBeGreaterThanOrEqual(3)
    expect(takeaways.length).toBeLessThanOrEqual(5)
    for (const t of takeaways) expect(t).toMatch(/\.$/)
  })
})
