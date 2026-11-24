import { describe, expect, it } from 'vitest'
import { DATASET_IDS, makeDataset, toInput, toSamples } from '../../src/playground/network/datasets'

describe('network lab datasets', () => {
  it.each(DATASET_IDS)('%s: same seed gives the same data, split in half, inside 0…10', (id) => {
    const d = makeDataset(id)
    expect(makeDataset(id)).toEqual(d)
    expect(Math.abs(d.train.length - d.test.length)).toBeLessThanOrEqual(1)
    for (const a of [...d.train, ...d.test]) {
      expect(a.size).toBeGreaterThanOrEqual(0)
      expect(a.size).toBeLessThanOrEqual(10)
      expect(a.stripes).toBeGreaterThanOrEqual(0)
      expect(a.stripes).toBeLessThanOrEqual(10)
    }
  })

  it('cat or tiger: 40 of each, and size alone separates them while stripes overlap', () => {
    const d = makeDataset('cat-tiger')
    const all = [...d.train, ...d.test]
    const cats = all.filter((a) => a.kind === 'cat')
    const tigers = all.filter((a) => a.kind === 'tiger')
    expect([cats.length, tigers.length]).toEqual([40, 40])
    expect(cats.every((a) => a.y === 1) && tigers.every((a) => a.y === -1)).toBe(true)
    expect(Math.max(...cats.map((a) => a.size))).toBeLessThan(Math.min(...tigers.map((a) => a.size)))
    // tabby cats: some cats are as striped as some tigers
    expect(Math.max(...cats.map((a) => a.stripes))).toBeGreaterThan(Math.min(...tigers.map((a) => a.stripes)))
  })

  it('cat or something else: cats sit between mice and tigers in size', () => {
    const d = makeDataset('cat-among')
    const all = [...d.train, ...d.test]
    const sizes = (kind: string) => all.filter((a) => a.kind === kind).map((a) => a.size)
    expect([sizes('mouse').length, sizes('cat').length, sizes('tiger').length]).toEqual([26, 44, 26])
    expect(Math.max(...sizes('mouse'))).toBeLessThan(Math.min(...sizes('cat')))
    expect(Math.max(...sizes('cat'))).toBeLessThan(Math.min(...sizes('tiger')))
    expect(all.every((a) => (a.kind === 'cat') === (a.y === 1))).toBe(true)
  })

  it('ring: inner dots within 2 of the centre, outer triangles 3.2 to 4.6 away', () => {
    const d = makeDataset('ring')
    const all = [...d.train, ...d.test]
    expect(all.length).toBe(120)
    for (const a of all) {
      const r = Math.hypot(a.size - 5, a.stripes - 5)
      // positions are rounded to 1 decimal, which can move a point by up to 0.08
      if (a.kind === 'inner') expect(r).toBeLessThanOrEqual(2.08)
      else expect(r > 3.12 && r < 4.68).toBe(true)
    }
  })

  it('centres measurements on 0 for the network', () => {
    expect(toInput(0, 10)).toEqual([-5, 5])
    const d = makeDataset('cat-tiger')
    const s = toSamples(d.train)
    expect(s[0]).toEqual({ x: [d.train[0].size - 5, d.train[0].stripes - 5], y: d.train[0].y })
  })
})
