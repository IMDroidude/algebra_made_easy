import { describe, expect, it } from 'vitest'
import {
  cloneNetwork,
  countCorrect,
  createNetwork,
  forward,
  gradients,
  meanLoss,
  mulberry32,
  predict,
  trainEpoch,
} from '../../src/linalg/neuralNet'
import type { Activation, Network, Sample } from '../../src/linalg/neuralNet'

describe('mulberry32', () => {
  it('repeats exactly for the same seed and stays in [0, 1)', () => {
    const a = mulberry32(7)
    const b = mulberry32(7)
    for (let i = 0; i < 200; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
    expect(mulberry32(8)()).not.toBe(mulberry32(7)())
  })
})

describe('createNetwork', () => {
  it('makes one matrix per layer, rows = neurons, columns = inputs', () => {
    const net = createNetwork([2, 4, 2, 1], 'tanh', mulberry32(1))
    expect(net.layers.map((l) => [l.w.length, l.w[0].length])).toEqual([
      [4, 2],
      [2, 4],
      [1, 2],
    ])
    for (const layer of net.layers) {
      expect(layer.b).toEqual(new Array(layer.w.length).fill(0.1))
      for (const w of layer.w.flat()) expect(Math.abs(w)).toBeLessThanOrEqual(0.5)
    }
  })
})

describe('forward', () => {
  // a = f(Wx + b), worked by hand
  const net: Network = {
    activation: 'relu',
    layers: [
      { w: [[1, -1], [0.5, 2]], b: [0, -1] },
      { w: [[2, -1]], b: [0.5] },
    ],
  }

  it('computes each layer as a matrix times a vector plus a bias, then the activation', () => {
    const values = forward(net, [3, 1])
    expect(values[0]).toEqual([3, 1])
    expect(values[1]).toEqual([2, 2.5]) // relu([3 - 1, 1.5 + 2 - 1])
    expect(values[2][0]).toBeCloseTo(Math.tanh(2 * 2 - 2.5 + 0.5), 12)
    expect(predict(net, [3, 1])).toBe(values[2][0])
  })

  it('ReLU replaces negative hidden values with 0', () => {
    expect(forward(net, [0, 2])[1]).toEqual([0, 3])
  })

  it('with the linear activation, any stack of layers equals one matrix and one bias', () => {
    const deep = createNetwork([2, 4, 2, 1], 'linear', mulberry32(3))
    const [l1, l2, l3] = deep.layers
    // multiply the three layers out: W = W3 W2 W1, b = W3 (W2 b1 + b2) + b3
    const matVec = (m: number[][], v: number[]) => m.map((row) => row.reduce((s, x, j) => s + x * v[j], 0))
    const matMat = (a: number[][], b: number[][]) => a.map((row) => b[0].map((_, j) => row.reduce((s, x, k) => s + x * b[k][j], 0)))
    const w = matMat(l3.w, matMat(l2.w, l1.w))[0]
    const inner = matVec(l2.w, l1.b).map((v, i) => v + l2.b[i])
    const b = matVec(l3.w, inner)[0] + l3.b[0]
    for (const x of [[1, 2], [-3, 0.5], [4, -4]]) {
      expect(predict(deep, x)).toBeCloseTo(Math.tanh(w[0] * x[0] + w[1] * x[1] + b), 12)
    }
  })
})

describe('gradients', () => {
  const loss = (net: Network, s: Sample) => 0.5 * (predict(net, s.x) - s.y) ** 2

  it.each<Activation>(['tanh', 'relu', 'linear'])('match a finite-difference check (%s)', (activation) => {
    const net = createNetwork([2, 3, 2, 1], activation, mulberry32(11))
    const sample: Sample = { x: [0.7, -1.3], y: -1 }
    const grads = gradients(net, sample)
    const h = 1e-6
    net.layers.forEach((layer, l) => {
      layer.w.forEach((row, i) => {
        row.forEach((_, j) => {
          const keep = row[j]
          row[j] = keep + h
          const up = loss(net, sample)
          row[j] = keep - h
          const down = loss(net, sample)
          row[j] = keep
          expect(grads[l].w[i][j]).toBeCloseTo((up - down) / (2 * h), 6)
        })
        const keep = layer.b[i]
        layer.b[i] = keep + h
        const up = loss(net, sample)
        layer.b[i] = keep - h
        const down = loss(net, sample)
        layer.b[i] = keep
        expect(grads[l].b[i]).toBeCloseTo((up - down) / (2 * h), 6)
      })
    })
  })
})

describe('training', () => {
  const data: Sample[] = [
    { x: [-2, 0], y: -1 },
    { x: [-1, 1], y: -1 },
    { x: [1, -1], y: 1 },
    { x: [2, 0.5], y: 1 },
  ]

  it('lowers the loss and learns a separable set', () => {
    const net = createNetwork([2, 1], 'tanh', mulberry32(1))
    const before = meanLoss(net, data)
    for (let e = 0; e < 50; e++) trainEpoch(net, data, 0.1, 2)
    expect(meanLoss(net, data)).toBeLessThan(before)
    expect(meanLoss(net, data)).toBeLessThan(0.05)
    expect(countCorrect(net, data)).toBe(4)
  })

  it('a network that always outputs 0 has loss 0.5', () => {
    const zero: Network = { activation: 'tanh', layers: [{ w: [[0, 0]], b: [0] }] }
    expect(meanLoss(zero, data)).toBe(0.5)
    expect(countCorrect(zero, data)).toBe(0)
    expect(meanLoss(zero, [])).toBe(0)
  })

  it('cloneNetwork gives a copy that training does not touch', () => {
    const net = createNetwork([2, 3, 1], 'tanh', mulberry32(2))
    const copy = cloneNetwork(net)
    expect(copy).toEqual(net)
    trainEpoch(copy, data, 0.1)
    expect(copy).not.toEqual(net)
    expect(net).toEqual(createNetwork([2, 3, 1], 'tanh', mulberry32(2)))
  })
})
