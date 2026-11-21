import { describe, expect, it } from 'vitest'
import { npArray, npFloat, npRound } from '../../src/lib/numpy'
import fixture from './fixtures/numpy-print.json'

// Every expected string below was printed by real NumPy 2.4 (str(array), str(np.float64), np.round).
type ArrayCase = { v: number[] | number[][]; neg0: boolean[][]; int: boolean; two: boolean; out: string }

function restoreNegativeZero(c: ArrayCase): number[] | number[][] {
  const rows = (c.two ? c.v : [c.v]) as number[][]
  const fixed = rows.map((r, i) => r.map((x, j) => (c.neg0[i][j] ? -0 : x)))
  return c.two ? fixed : fixed[0]
}

describe('npArray matches NumPy print output', () => {
  it.each((fixture.arrays as ArrayCase[]).map((c, k) => [k, c] as const))('case %i', (_, c) => {
    expect(npArray(restoreNegativeZero(c), c.int)).toBe(c.out)
  })

  it('covers the tricky cases', () => {
    expect(npArray([2, 1])).toBe('[2. 1.]')
    expect(npArray([0.619, 0.0833])).toBe('[0.619  0.0833]')
    expect(npArray([1 / 3, -0])).toBe('[ 0.33333333 -0.        ]')
    expect(npArray([1e-7, 1])).toBe('[1.e-07 1.e+00]')
    expect(npArray([[42, 0], [0, 6]], true)).toBe('[[42  0]\n [ 0  6]]')
  })
})

describe('npFloat matches str(np.float64)', () => {
  it.each(fixture.scalars.map((c) => [c.x, c.out] as const))('%s', (x, out) => {
    expect(npFloat(x)).toBe(out)
  })
})

describe('npRound matches np.round', () => {
  it('rounds half to even and keeps the sign of zero', () => {
    for (const c of fixture.round) {
      const got = npRound(c.x, c.d)
      expect(got).toBe(c.out)
      if (got === 0) expect(Object.is(got, -0)).toBe(c.neg)
    }
    expect(npRound(0.125, 2)).toBe(0.12)
    expect(Object.is(npRound(-0.00001, 4), -0)).toBe(true)
  })
})
