import { describe, expect, it } from 'vitest'
import { dot, norm } from '../../../src/linalg'
import type { Vec2 } from '../../../src/linalg'
import {
  EMPTY_BASKET,
  SHELF,
  START_BASKET,
  SUPERMARKET_ZERO_PERCENT,
  density,
  kindsOutput,
  nonZeroCount,
  sparsePairs,
  unitOf,
  zeroShare,
} from '../../../src/lessons/scalars-and-vectors/kinds'
import {
  BILL,
  BILL_LINES,
  EX_A,
  EX_B,
  EX_CROSS,
  crossDirection,
  productsOutput,
} from '../../../src/lessons/scalars-and-vectors/products'
import {
  BEST,
  BEST_LINE,
  NOSE,
  PEOPLE,
  START,
  projection,
  transformOutput,
  transformPoint,
} from '../../../src/lessons/scalars-and-vectors/transforms'
import fixtures from './further-fixtures.json'

describe('kinds of vector: numbers shown', () => {
  it('v = (3, 4) has length 5 and unit vector (0.6, 0.8)', () => {
    expect(norm([3, 4])).toBe(5)
    expect(unitOf([3, 4])).toEqual([0.6, 0.8])
    expect(norm(unitOf([3, 4]))).toBeCloseTo(1, 12)
  })

  it('the starting basket is sparse: 3 of 12 entries, 75% zeros', () => {
    expect(START_BASKET).toHaveLength(SHELF.length)
    expect(nonZeroCount(START_BASKET)).toBe(3)
    expect(zeroShare(START_BASKET)).toBe(0.75)
    expect(density(START_BASKET)).toBe('sparse')
    expect(sparsePairs(START_BASKET)).toEqual([[1, 2], [2, 1], [3, 6]])
  })

  it('names the zero vector and a dense basket', () => {
    expect(density(EMPTY_BASKET)).toBe('zero')
    expect(density([1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0])).toBe('dense')
    expect(density([1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])).toBe('sparse')
  })

  it('a real supermarket basket is over 99.9% zeros', () => {
    expect(SUPERMARKET_ZERO_PERCENT).toBeGreaterThan(99.9)
    expect(SUPERMARKET_ZERO_PERCENT).toBeLessThan(99.95)
  })

  it('the NumPy output matches real NumPy for every position v can be dragged to', () => {
    expect(fixtures.unit).toHaveLength(441)
    for (const c of fixtures.unit) {
      expect(kindsOutput(c.v as Vec2), JSON.stringify(c.v)).toBe(`${c.out}\n${fixtures.static.shapes}`)
    }
  })
})

describe('transformations and projections: numbers shown', () => {
  it('the starting settings move the nose (3, 1) as the text says', () => {
    const close = (got: Vec2, want: Vec2) => got.forEach((x, i) => expect(x).toBeCloseTo(want[i], 12))
    close(transformPoint('rotate', START, NOSE), [-1, 3])
    expect(transformPoint('scale', START, NOSE)).toEqual([4.5, 0.5])
    expect(transformPoint('translate', START, NOSE)).toEqual([5, 0])
  })

  it('rotation keeps the length of the nose vector', () => {
    for (let angle = -180; angle <= 180; angle += 15) {
      expect(norm(transformPoint('rotate', { ...START, angle }, NOSE))).toBeCloseTo(norm(NOSE), 12)
    }
  })

  it('the people are centred, and their total spread is 7.25', () => {
    expect(PEOPLE.reduce((s, p) => s + p[0], 0)).toBe(0)
    expect(PEOPLE.reduce((s, p) => s + p[1], 0)).toBe(0)
    expect(projection(0).total).toBeCloseTo(7.25, 12)
  })

  it('the x-axis keeps 64% of the spread; the best line, at 36.5°, keeps 99.3%', () => {
    expect(projection(0).kept).toBeCloseTo(28 / 6, 12)
    expect(projection(0).percent).toBeCloseTo(64.37, 2)
    expect(BEST_LINE).toBeCloseTo(36.52, 2)
    expect(BEST.kept).toBeCloseTo(7.197, 3)
    expect(BEST.percent).toBeCloseTo(99.27, 2)
  })

  it('no slider position beats the best line, and 35° is the best slider position', () => {
    let top = 0
    for (let line = 0; line < 180; line += 5) {
      expect(projection(line).kept).toBeLessThanOrEqual(BEST.kept + 1e-12)
      if (projection(line).kept > projection(top).kept) top = line
    }
    expect(top).toBe(35)
  })

  it('the NumPy output matches real NumPy at every slider position', () => {
    for (const c of fixtures.rotate)
      expect(transformOutput('rotate', { ...START, angle: c.angle }), `rotate ${c.angle}`).toBe(c.out)
    for (const c of fixtures.scale)
      expect(transformOutput('scale', { ...START, sx: c.sx, sy: c.sy }), `scale ${c.sx} ${c.sy}`).toBe(c.out)
    for (const c of fixtures.translate)
      expect(transformOutput('translate', { ...START, tx: c.tx, ty: c.ty }), `translate ${c.tx} ${c.ty}`).toBe(c.out)
    for (const c of fixtures.project)
      expect(transformOutput('project', { ...START, line: c.line }), `project ${c.line}`).toBe(c.out)
  })
})

describe('dot and cross products: numbers shown', () => {
  it('the bill is 2·0.5 + 1·2 + 3·1.5 = 7.5, as NumPy prints it', () => {
    expect(BILL_LINES).toEqual([1, 2, 4.5])
    expect(BILL).toBe(7.5)
    expect(String(BILL)).toBe(fixtures.static.bill)
  })

  it('(1, 2, 3) × (4, 5, 6) = (−3, 6, −3), at right angles to both', () => {
    expect(EX_CROSS).toEqual([-3, 6, -3])
    expect(`[${EX_CROSS.map((x) => String(x).padStart(2)).join(' ')}]`).toBe(fixtures.static.cross123)
    expect(dot(EX_CROSS, EX_A)).toBe(0)
    expect(dot(EX_CROSS, EX_B)).toBe(0)
  })

  it('reads the direction from the sign of z', () => {
    expect(crossDirection(6)).toBe('up')
    expect(crossDirection(-6)).toBe('down')
    expect(crossDirection(0)).toBe('none')
  })

  it('the NumPy output matches real NumPy for 407 pairs of vectors', () => {
    expect(fixtures.products).toHaveLength(407)
    for (const c of fixtures.products) {
      expect(productsOutput(c.a as Vec2, c.b as Vec2), JSON.stringify(c)).toBe(c.out)
    }
  })
})
