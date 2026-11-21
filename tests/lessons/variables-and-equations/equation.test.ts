import { describe, expect, it } from 'vitest'
import { numpyPrint } from '../../../src/lib/format'
import {
  applyOp,
  bestWeight,
  boxPieces,
  constantPieces,
  eq,
  equationTex,
  equationText,
  imbalance,
  isAllowed,
  isBalanced,
  isSolved,
  isolatedValue,
  opLabel,
  pyFloat,
  recipe,
  replay,
  sideText,
  solve,
  tiltDeg,
  trainFrom,
} from '../../../src/lessons/variables-and-equations/equation'
import type { Move } from '../../../src/lessons/variables-and-equations/equation'
import { PRACTICE, practiceDone } from '../../../src/lessons/variables-and-equations/practice'

const both = (op: Move['op'], n: number): Move => ({ op, n, target: 'both' })

describe('solving the lesson equations', () => {
  it('finds x for the step 2 examples', () => {
    expect(solve(eq(1, 5, 0, 12))).toBe(7)
    expect(solve(eq(3, 0, 0, 15))).toBe(5)
    expect(solve(eq(2, 3, 0, 11))).toBe(4)
  })

  it('finds x for the practice equations, including x on the right', () => {
    expect(PRACTICE.map((e) => equationText(e))).toEqual(['5x + 4 = 29', '2x − 6 = 8', '20 = 4x + 8'])
    expect(PRACTICE.map(solve)).toEqual([5, 7, 3])
  })

  it('has no single solution when x cancels', () => {
    expect(solve(eq(2, 1, 2, 5))).toBeNull()
  })

  it('solves each example with its recipe, keeping the scale level', () => {
    for (const e of [eq(1, 5, 0, 12), eq(3, 0, 0, 15), eq(2, 3, 0, 11), ...PRACTICE.slice(0, 2)]) {
      const xTrue = solve(e)!
      const moves = recipe(e).map((m) => both(m.op, m.n))
      const steps = replay(e, moves)
      expect(steps.every((q) => isBalanced(q, xTrue))).toBe(true)
      expect(isSolved(steps[steps.length - 1], xTrue)).toBe(true)
    }
  })

  it('gives the recipes the lesson states', () => {
    expect(recipe(eq(1, 5, 0, 12))).toEqual([{ op: 'sub', n: 5 }])
    expect(recipe(eq(3, 0, 0, 15))).toEqual([{ op: 'div', n: 3 }])
    expect(recipe(eq(2, 3, 0, 11))).toEqual([
      { op: 'sub', n: 3 },
      { op: 'div', n: 2 },
    ])
    expect(recipe(eq(2, -6, 0, 8))).toEqual([
      { op: 'add', n: 6 },
      { op: 'div', n: 2 },
    ])
  })
})

describe('moves on the scale', () => {
  it('subtracting 5 from both sides of x + 5 = 12 leaves x = 7', () => {
    const after = applyOp(eq(1, 5, 0, 12), 'sub', 5, 'both')
    expect(equationText(after)).toBe('x = 7')
    expect(isolatedValue(after)).toBe(7)
    expect(isSolved(after, 7)).toBe(true)
  })

  it('dividing both sides of 3x = 15 by 3 leaves x = 5', () => {
    expect(equationText(applyOp(eq(3, 0, 0, 15), 'div', 3, 'both'))).toBe('x = 5')
  })

  it('the prediction: 3x = 15 minus 3 on both sides is 3x − 3 = 12, level, x not alone', () => {
    const after = applyOp(eq(3, 0, 0, 15), 'sub', 3, 'both')
    expect(equationText(after)).toBe('3x − 3 = 12')
    expect(isBalanced(after, 5)).toBe(true)
    expect(isolatedValue(after)).toBeNull()
  })

  it('a one-sided move tips the scale towards the heavier side', () => {
    const leftOnly = applyOp(eq(1, 5, 0, 12), 'sub', 5, 'left')
    expect(equationText(leftOnly)).toBe('x = 12')
    expect(imbalance(leftOnly, 7)).toBe(-5)
    expect(isBalanced(leftOnly, 7)).toBe(false)
    // x looks alone, but the scale is not level, so it is not solved
    expect(isSolved(leftOnly, 7)).toBe(false)
    expect(tiltDeg(imbalance(leftOnly, 7))).toBeGreaterThan(0) // right pan down

    const rightOnly = applyOp(eq(1, 5, 0, 12), 'mul', 2, 'right')
    expect(equationText(rightOnly)).toBe('x + 5 = 24')
    expect(tiltDeg(imbalance(rightOnly, 7))).toBeGreaterThan(0)
    expect(tiltDeg(imbalance(applyOp(eq(1, 5, 0, 12), 'add', 1, 'left'), 7))).toBeLessThan(0)
  })

  it('tilts visibly for any imbalance, but never past the limit', () => {
    expect(tiltDeg(0)).toBe(0)
    expect(Math.abs(tiltDeg(0.1))).toBeGreaterThanOrEqual(5)
    expect(Math.abs(tiltDeg(1000))).toBe(14)
    expect(tiltDeg(0.1, true)).toBeCloseTo(-0.25)
  })

  it('refuses ×0 and ÷0', () => {
    expect(isAllowed('div', 0)).toBe(false)
    expect(isAllowed('mul', 0)).toBe(false)
    expect(isAllowed('sub', 0)).toBe(true)
    const e = eq(1, 5, 0, 12)
    expect(applyOp(e, 'div', 0, 'both')).toBe(e)
  })
})

describe('text and drawing', () => {
  it('writes sides the way a person would', () => {
    expect(sideText({ x: 1, k: 5 })).toBe('x + 5')
    expect(sideText({ x: 3, k: -3 })).toBe('3x − 3')
    expect(sideText({ x: 0, k: 12 })).toBe('12')
    expect(sideText({ x: 0, k: -7 })).toBe('−7')
    expect(sideText({ x: -1, k: 0 })).toBe('−x')
    expect(sideText({ x: 0.5, k: 0 })).toBe('0.5x')
    expect(sideText({ x: 4, k: 0 }, 'w')).toBe('4w')
    expect(equationTex(eq(2, -6, 0, 8))).toBe('2x - 6 = 8')
  })

  it('names moves on the buttons', () => {
    expect(opLabel('sub', 5, 'both')).toBe('Subtract 5 from both sides')
    expect(opLabel('div', 3, 'both')).toBe('Divide both sides by 3')
    expect(opLabel('add', 6, 'left')).toBe('Add 6 to the left side only')
    expect(opLabel('mul', -2, 'right')).toBe('Multiply the right side only by −2')
  })

  it('breaks quantities into tens, ones, balloons or a label', () => {
    expect(constantPieces(29)).toEqual({ kind: 'blocks', tens: 2, ones: 9 })
    expect(constantPieces(12)).toEqual({ kind: 'blocks', tens: 1, ones: 2 })
    expect(constantPieces(-6)).toEqual({ kind: 'balloons', count: 6 })
    expect(constantPieces(-20)).toEqual({ kind: 'label', text: '−20' })
    expect(constantPieces(2.5)).toEqual({ kind: 'label', text: '2.5' })
    expect(constantPieces(0)).toEqual({ kind: 'none' })
    expect(boxPieces(5)).toEqual({ count: 5 })
    expect(boxPieces(1.5)).toEqual({ label: '1.5x' })
    expect(boxPieces(0)).toBeNull()
  })
})

describe('Understand step code output (checked against real NumPy)', () => {
  it('prints x as a float and as a one-element array', () => {
    expect(pyFloat(7)).toBe('7.0')
    expect(numpyPrint([7], false)).toBe('[7.]')
    expect(pyFloat(5)).toBe('5.0')
    expect(numpyPrint([5], false)).toBe('[5.]')
    expect(pyFloat(4)).toBe('4.0')
    expect(numpyPrint([4], false)).toBe('[4.]')
  })
})

describe('Apply step: training as approximate solving', () => {
  it('nudges w towards 10 / 4 = 2.5, printing what Python prints', () => {
    const run = (k: number) => pyFloat(trainFrom(1, k, 4, 10, 0.05))
    expect(run(0)).toBe('1.0')
    expect(run(1)).toBe('2.2')
    expect(run(2)).toBe('2.44')
    expect(run(3)).toBe('2.488')
    expect(run(5)).toBe('2.49952')
    expect(run(10)).toBe('2.4999998464')
    expect(run(20)).toBe('2.4999999999999845')
    expect(pyFloat(trainFrom(1.5, 2, 4, 10, 0.05))).toBe('2.46')
  })

  it('finds the compromise weight for two disagreeing examples', () => {
    expect(bestWeight([4], [10])).toBe(2.5)
    expect(bestWeight([4, 2], [10, 6])).toBeCloseTo(2.6, 12)
  })
})

describe('practice challenges', () => {
  it('tick only when solved, and "neat" only for two level moves', () => {
    expect(practiceDone([[], [], []])).toEqual([])
    const a = [both('sub', 4), both('div', 5)]
    expect(practiceDone([a, [], []])).toEqual(['five', 'neat'])
    const b = [both('add', 6), both('div', 2)]
    const c = [both('sub', 8), both('div', 4)]
    expect(practiceDone([[], b, c])).toEqual(['minus', 'right', 'neat'])
    // three moves: solved, but not neat
    const slow = [both('sub', 2), both('sub', 2), both('div', 5)]
    expect(practiceDone([slow, [], []])).toEqual(['five'])
  })
})
