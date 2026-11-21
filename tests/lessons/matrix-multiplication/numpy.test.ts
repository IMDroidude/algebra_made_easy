import { describe, expect, it } from 'vitest'
import { IDENTITY2, apply2, approxEqualVec, mul2 } from '../../../src/linalg'
import type { Mat2, Vec2 } from '../../../src/linalg'
import {
  LAYER_X,
  PRACTICE_A,
  PRACTICE_CHECKS,
  PREDICT_A,
  PREDICT_B,
  QUARTER_TURN,
  SEE_A,
  SEE_B,
  START_A,
  START_B,
  START_W1,
  START_W2,
  layerSnippet,
  network,
  networkGrid,
  productSnippet,
  staged,
} from '../../../src/lessons/matrix-multiplication/content'
import fixtures from './numpy-fixtures.json'

describe('worked examples', () => {
  it('step 1: stretch then quarter turn is AB = [[0, −1], [2, 0]]', () => {
    expect(mul2(SEE_A, SEE_B)).toEqual([
      [0, -1],
      [2, 0],
    ])
    // AB x = A(B x): B first, then A.
    const x: Vec2 = [1.5, 2]
    expect(apply2(mul2(SEE_A, SEE_B), x)).toEqual(apply2(SEE_A, apply2(SEE_B, x)))
  })

  it('step 2 defaults: quarter turn and shear do not commute', () => {
    expect(mul2(START_A, START_B)).toEqual([
      [0, -1],
      [1, 1],
    ])
    expect(mul2(START_B, START_A)).toEqual([
      [1, -1],
      [1, 0],
    ])
  })

  it('step 3: AB mirrors across y = x and BA across y = −x', () => {
    const AB = mul2(PREDICT_A, PREDICT_B)
    const BA = mul2(PREDICT_B, PREDICT_A)
    expect(AB).toEqual([
      [0, 1],
      [1, 0],
    ])
    expect(BA.flat().map((x) => x + 0)).toEqual([0, -1, -1, 0])
    expect(apply2(AB, [1.5, 2])).toEqual([2, 1.5])
    expect(apply2(BA, [1.5, 2]).map((x) => x + 0)).toEqual([-2, -1.5])
  })

  it('step 4: a cell of AB is a row of A dotted with a column of B', () => {
    const AB = mul2(START_A, START_B)
    // row 1 of A = (0, −1), column 2 of B = (1, 1): 0·1 + (−1)·1 = −1
    expect(AB[0][1]).toBe(-1)
    // column 2 of AB = A times column 2 of B
    expect(apply2(START_A, [1, 1])).toEqual([AB[0][1], AB[1][1]])
  })
})

describe('staged animation', () => {
  it('runs from the identity, through the first matrix, to the product', () => {
    expect(staged(START_B, START_A, 0)).toEqual(IDENTITY2)
    expect(staged(START_B, START_A, 0.5)).toEqual(START_B)
    expect(staged(START_B, START_A, 1)).toEqual(mul2(START_A, START_B))
    expect(staged(START_A, START_B, 1)).toEqual(mul2(START_B, START_A))
  })
})

describe('step 4 snippet matches real NumPy', () => {
  it('defaults', () => {
    expect(productSnippet(START_A, START_B).output).toBe('[[ 0 -1]\n [ 1  1]]\n[[ 1 -1]\n [ 1  0]]')
  })

  it.each(fixtures.product)('A = $A, B = $B', ({ A, B, numpy }) => {
    expect(productSnippet(A as Mat2, B as Mat2).output).toBe(numpy)
  })
})

describe('step 5: stacked layers', () => {
  it('without an activation, two layers equal one matrix W = W2 W1', () => {
    const s = layerSnippet(START_W1, START_W2, false)
    expect(s.W).toEqual([
      [1.5, 0.5],
      [-0.5, 1.5],
    ])
    expect(s.same).toBe(true)
    expect(s.output).toBe('[[ 3.5  0.5]\n [-0.5  3.5]\n [-3.5 -0.5]\n [ 0.5 -3.5]]\nTrue')
  })

  it('with ReLU, three of the four points no longer match W x', () => {
    const s = layerSnippet(START_W1, START_W2, true)
    expect(s.same).toBe(false)
    expect(s.output).toBe('[[ 3.   1.5]\n [-0.5  3.5]\n [-0.5  1. ]\n [ 0.   0. ]]\nFalse')
    expect(LAYER_X.map((x) => network(START_W1, START_W2, x, true).h)).toEqual([
      [3, 0],
      [1, 3],
      [0, 1],
      [0, 0],
    ])
    const differ = s.Y.filter((y, k) => !approxEqualVec(y, s.collapsed[k]))
    expect(differ).toHaveLength(3)
  })

  it.each(fixtures.layers)('W1 = $W1, W2 = $W2, relu $relu', ({ W1, W2, relu, numpy }) => {
    expect(layerSnippet(W1 as Mat2, W2 as Mat2, relu).output).toBe(numpy)
  })

  it('grid lines stay straight without ReLU and bend with it', () => {
    const straight = networkGrid(START_W1, START_W2, false)
    expect(straight.every((line) => line.length === 2)).toBe(true)
    const bent = networkGrid(START_W1, START_W2, true)
    expect(bent.some((line) => line.length > 2)).toBe(true)
    // Every vertex is a real network output: the bend points are exact.
    const line = bent.find((l) => l.length > 2)!
    for (const p of line) expect(p.every(Number.isFinite)).toBe(true)
  })
})

describe('step 6 challenges (A = [[2, 0], [0, 0.5]])', () => {
  const solved = (B: Mat2) => Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](B))

  it('the identity start solves nothing', () => {
    expect(solved(IDENTITY2)).toEqual([])
  })

  it('each challenge has a solution reachable in steps of 0.5', () => {
    expect(solved([[0.5, 0], [0, 2]])).toEqual(['undo', 'commute'])
    expect(solved([[0, -0.5], [2, 0]])).toEqual(['turn'])
    expect(mul2(PRACTICE_A, [[0, -0.5], [2, 0]])).toEqual(QUARTER_TURN)
    expect(solved([[1, 0], [0, 3]])).toEqual(['commute'])
  })

  it('plain scalings of the identity do not count as commuting', () => {
    expect(solved([[2, 0], [0, 2]])).toEqual([])
    expect(solved([[1, 1], [0, 1]])).toEqual([])
  })
})
