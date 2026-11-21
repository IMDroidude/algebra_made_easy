import { describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { fmt } from '../../../src/lib/format'
import { miss, weightCode, weightFrom, weightOutput } from '../../../src/lessons/variables-and-equations/houseWeight'

const house = (id: string) => HOUSES.find((h) => h.id === id)!

describe('running example: one weight from one house', () => {
  it('solves 1500 w = 370 for house B', () => {
    expect(weightFrom(house('B'))).toBe(370 / 1500)
    expect(fmt(weightFrom(house('B')), 3)).toBe('0.247')
    expect(fmt(weightFrom(house('B')) * 1000, 0)).toBe('247')
  })

  it('misses every other house, worst by 53 for house D', () => {
    const w = weightFrom(house('B'))
    expect(HOUSES.map((h) => miss(w, h))).toEqual([6, 0, -26, 53, -14, 26, 32, 42])
  })

  it('each house wants its own w, from 0.205 (H) to 0.276 (C), and none fits another exactly', () => {
    expect(HOUSES.map((h) => fmt(weightFrom(h), 3))).toEqual(['0.241', '0.247', '0.276', '0.22', '0.258', '0.232', '0.233', '0.205'])
    for (const a of HOUSES)
      for (const b of HOUSES) if (a !== b) expect(miss(weightFrom(a), b)).not.toBe(0)
  })

  it('prints what NumPy prints (checked against NumPy 2)', () => {
    expect(weightCode(house('B'))).toContain('w = 370 / 1500   # solve 1500 * w = 370  (house B)')
    expect(weightCode(house('B'))).toContain('sqft = np.array([1100, 1500, 900, 2000, 1300, 1800, 2400, 1000])')
    expect(weightOutput(house('B'))).toBe('0.24666666666666667\n[271. 370. 222. 493. 321. 444. 592. 247.]')
    expect(weightOutput(house('A'))).toBe('0.2409090909090909\n[265. 361. 217. 482. 313. 434. 578. 241.]')
    expect(weightOutput(house('H'))).toBe('0.205\n[226. 308. 184. 410. 266. 369. 492. 205.]')
  })
})
