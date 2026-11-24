import { describe, expect, it } from 'vitest'
import { createNetwork, mulberry32, predict } from '../../src/linalg/neuralNet'
import { toInput } from '../../src/playground/network/datasets'
import { GRID, NEGATIVE, POSITIVE, fieldValues, linkWidth, shade } from '../../src/playground/network/field'

describe('field pictures', () => {
  it('gives one picture per neuron, inputs first and output last', () => {
    const net = createNetwork([2, 4, 2, 1], 'tanh', mulberry32(1))
    const fields = fieldValues(net)
    expect(fields.length).toBe(2 + 4 + 2 + 1)
    expect(fields.every((f) => f.length === GRID * GRID)).toBe(true)
    // top-left cell: small horizontal value, large vertical value
    const h = 5 / GRID
    expect(fields[0][0]).toBeCloseTo((h - 5) / 5, 5)
    expect(fields[1][0]).toBeCloseTo((10 - h - 5) / 5, 5)
    expect(fields[8][0]).toBeCloseTo(predict(net, toInput(h, 10 - h)), 5)
    // bottom-right cell
    const last = GRID * GRID - 1
    expect(fields[8][last]).toBeCloseTo(predict(net, toInput(10 - h, h)), 5)
  })

  it('shades negative towards orange and positive towards teal, clamped at ±1', () => {
    expect(shade(0)).toEqual([247, 245, 240])
    expect(shade(5)).toEqual(shade(1))
    expect(shade(-5)).toEqual(shade(-1))
    const pos = shade(1)
    const neg = shade(-1)
    expect(pos[0]).toBeLessThan(neg[0]) // teal has little red, orange a lot
    expect(Math.abs(pos[2] - POSITIVE[2])).toBeLessThan(Math.abs(neg[2] - POSITIVE[2]))
    expect(Math.abs(neg[0] - NEGATIVE[0])).toBeLessThan(Math.abs(pos[0] - NEGATIVE[0]))
  })

  it('draws heavier weights thicker, within limits', () => {
    expect(linkWidth(0)).toBe(0.6)
    expect(linkWidth(-1)).toBe(linkWidth(1))
    expect(linkWidth(1)).toBeGreaterThan(linkWidth(0.5))
    expect(linkWidth(100)).toBe(7)
  })
})
