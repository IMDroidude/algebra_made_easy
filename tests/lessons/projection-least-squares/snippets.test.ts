import { describe, expect, it } from 'vitest'
import { normalSnippet, regressionSnippet } from '../../../src/lessons/projection-least-squares/data'
import type { Vec2 } from '../../../src/linalg'
import fixture from '../inverse-rank-null-space/numpy-snippets.json'

// `numpy` is what real NumPy 2.4 printed when the `code` string was executed.
describe('step 4 snippet: normal equations and lstsq', () => {
  it.each(fixture.normal.map((c) => [JSON.stringify(c.points), c] as const))('%s', (_, c) => {
    const s = normalSnippet(c.points as Vec2[])
    expect(s.code).toBe(c.code)
    expect(s.output).toBe(c.numpy)
  })

  it('the default data prints the numbers shown in the lesson', () => {
    expect(fixture.normal[0].numpy).toBe('[[42  0]\n [ 0  6]]\n[26.   0.5]\n[0.619  0.0833]\n[0.619  0.0833]')
  })
})

describe('step 5 snippet: train and predict', () => {
  it.each(fixture.regression.map((c) => [JSON.stringify([c.points, c.xNew]), c] as const))('%s', (_, c) => {
    const s = regressionSnippet(c.points as Vec2[], c.xNew as number)
    expect(s.code).toBe(c.code)
    expect(s.output).toBe(c.numpy)
  })
})
