/**
 * Every NumPy output in the lesson must be what real NumPy prints.
 * numpy-fixtures.json was produced by real NumPy (see its "generatedWith"):
 * random arrays, and 60 random Q, K, V on the lesson's half-step grid, printed
 * with np.set_printoptions(precision=2, suppress=True), using the same
 * expressions as the lesson's snippets.
 */
import { describe, expect, it } from 'vitest'
import { attention, attentionScores } from '../../../src/linalg/attention'
import type { Vec2 } from '../../../src/linalg'
import { allIntegers, npArray, npLiteral } from '../../../src/lessons/attention/numpyText'
import {
  applyCode,
  applyOutput,
  understandCode,
  understandOutput,
} from '../../../src/lessons/attention/snippets'
import fixtures from './numpy-fixtures.json'

type Case = {
  Q: Vec2[]
  K: Vec2[]
  V: Vec2[]
  scores: string
  scaled: string
  weights: string
  output: string
  scaledRows: string[]
  weightRows: string[]
  outputRows: string[]
  temperatureRows: Record<string, { scaled: string[]; weights: string[] }>
}

const cases = fixtures.cases as unknown as Case[]

describe('npArray prints like NumPy (precision=2, suppress=True)', () => {
  it.each(fixtures.arrays.map((a, k) => [k, a] as const))('array %i', (_, a) => {
    expect(npArray(a.values as number[] | number[][], a.integer)).toBe(a.printed)
  })
})

describe('attention outputs match NumPy for random inputs', () => {
  it.each(cases.map((c, k) => [k, c] as const))('case %i', (_, c) => {
    const r = attention(c.Q, c.K, c.V)
    expect(npArray(r.scores, allIntegers(c.Q, c.K))).toBe(c.scores)
    expect(npArray(r.scaled)).toBe(c.scaled)
    expect(npArray(r.weights)).toBe(c.weights)
    expect(npArray(r.output)).toBe(c.output)
    expect(applyOutput(c.Q, c.K, c.V)).toBe(c.output)
    for (let i = 0; i < 3; i++) {
      expect(understandOutput(c.Q, c.K, i, Math.SQRT2)).toBe(`${c.scaledRows[i]}\n${c.weightRows[i]}`)
      expect(npArray(r.output[i])).toBe(c.outputRows[i])
      for (const [T, rows] of Object.entries(c.temperatureRows)) {
        expect(understandOutput(c.Q, c.K, i, Number(T))).toBe(`${rows.scaled[i]}\n${rows.weights[i]}`)
      }
    }
    expect(attentionScores(c.Q, c.K)).toHaveLength(3)
  })
})

describe('the lesson’s own starting numbers (checked with NumPy 2.4)', () => {
  const Q: Vec2[] = [
    [1, 1.5],
    [2, -0.5],
    [-1, 0.5],
  ]
  const K: Vec2[] = [
    [2, 0],
    [0, 2],
    [-1.5, -0.5],
  ]
  const V: Vec2[] = [
    [2, 1],
    [-1.5, 2],
    [0.5, -2],
  ]

  it('scores, weights and outputs', () => {
    const r = attention(Q, K, V)
    expect(npArray(r.scores)).toBe('[[ 2.    3.   -2.25]\n [ 4.   -1.   -2.75]\n [-2.    1.    1.25]]')
    expect(npArray(r.weights)).toBe('[[0.32 0.66 0.02]\n [0.96 0.03 0.01]\n [0.05 0.43 0.52]]')
    expect(applyOutput(Q, K, V)).toBe('[[-0.33  1.61]\n [ 1.89  1.  ]\n [-0.29 -0.12]]')
  })

  it('step 4 output for query 1', () => {
    expect(understandOutput(Q, K, 0, Math.SQRT2)).toBe('[ 1.41  2.12 -1.59]\n[0.32 0.66 0.02]')
  })
})

describe('snippet code', () => {
  it('writes literals NumPy can read, rows aligned', () => {
    expect(npLiteral('Q', [[1, 1.5], [2, -0.5]])).toBe('Q = np.array([[1, 1.5],\n              [2, -0.5]])')
  })

  it('step 4 uses √d_k by default and T otherwise', () => {
    const Q: Vec2[] = [[1, 0], [0, 1], [1, 1]]
    expect(understandCode(Q, Q, 0, Math.SQRT2)).toContain('scores = Q @ K.T / np.sqrt(d_k)')
    const t = understandCode(Q, Q, 2, 0.5)
    expect(t).toContain('T = 0.5')
    expect(t).toContain('scores = Q @ K.T / T')
    expect(t).toContain('print(weights[2])')
  })

  it('step 5 defines softmax with the max trick and attention', () => {
    const Q: Vec2[] = [[1, 0], [0, 1], [1, 1]]
    const code = applyCode(Q, Q, Q)
    expect(code).toContain('np.exp(x - x.max(axis=-1, keepdims=True))')
    expect(code).toContain('softmax(Q @ K.T / np.sqrt(d_k))')
    expect(code).toContain('return weights @ V')
  })
})
