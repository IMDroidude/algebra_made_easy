import { describe, expect, it } from 'vitest'
import { lowRankSnippet, systemSnippet } from '../../../src/lessons/inverse-rank-null-space/data'
import type { Mat2, Vec2 } from '../../../src/linalg'
import fixture from './numpy-snippets.json'

// `numpy` is what real NumPy 2.4 printed when the `code` string was executed.
describe('step 4 snippet: solve Ax = b', () => {
  it.each(fixture.system.map((c) => [JSON.stringify([c.A, c.b]), c] as const))('%s', (_, c) => {
    const s = systemSnippet(c.A as Mat2, c.b as Vec2)
    expect(s.code).toBe(c.code)
    expect(s.output).toBe(c.numpy)
  })
})

describe('step 5 snippet: low-rank update', () => {
  it.each(fixture.lowRank.map((c) => [JSON.stringify([c.u, c.v, c.d, c.r]), c] as const))('%s', (_, c) => {
    const s = lowRankSnippet(c.u as Vec2, c.v as Vec2, c.d, c.r)
    expect(s.code).toBe(c.code)
    expect(s.output).toBe(c.numpy)
  })
})
