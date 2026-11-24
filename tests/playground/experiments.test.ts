import { describe, expect, it } from 'vitest'
import { countCorrect, createNetwork, meanLoss, mulberry32, trainEpoch } from '../../src/linalg/neuralNet'
import { makeDataset, toSamples } from '../../src/playground/network/datasets'
import { EXPERIMENTS } from '../../src/playground/network/experiments'
import type { Setup } from '../../src/playground/network/experiments'

/** Trains the way the lab does (learning rate 0.03, batches of 10) and reports the training set. */
function train(setup: Setup, epochs: number, seed = 1) {
  const data = toSamples(makeDataset(setup.dataset).train)
  const net = createNetwork([2, ...setup.hidden, 1], setup.activation, mulberry32(seed))
  for (let e = 0; e < epochs; e++) trainEpoch(net, data, 0.03)
  return { correct: countCorrect(net, data), total: data.length, loss: meanLoss(net, data) }
}

const experiment = (id: string) => EXPERIMENTS.find((e) => e.id === id)!

describe('what the lab says each experiment does (from the weights the button loads)', () => {
  it('1: a single neuron separates cats from tigers', () => {
    const r = train(experiment('one-neuron'), 100)
    expect(r.correct).toBe(r.total)
    expect(r.loss).toBeLessThan(0.01)
  })

  it('2: a single neuron cannot pick out the cats in the middle', () => {
    for (const epochs of [150, 600]) {
      const r = train(experiment('one-neuron-fails'), epochs)
      expect(r.correct).toBeLessThan(r.total)
      expect(r.loss).toBeGreaterThan(0.4)
    }
  })

  it('3: two hidden tanh neurons can', () => {
    const r = train(experiment('two-hidden'), 300)
    expect(r.correct).toBe(r.total)
    expect(r.loss).toBeLessThan(0.05)
  })

  it('4: with the linear activation, 4 + 2 hidden neurons do no better than one neuron', () => {
    for (const seed of [1, 2, 3]) {
      const r = train(experiment('linear'), 600, seed)
      expect(r.correct).toBeLessThan(r.total)
      expect(r.loss).toBeGreaterThan(0.4)
    }
  })

  it('5: 4 + 2 tanh neurons close a loop around the ring', () => {
    const r = train(experiment('ring'), 300)
    expect(r.correct).toBe(r.total)
    expect(r.loss).toBeLessThan(0.05)
  })

  it('the ring is not solved by two hidden neurons, from any of six starting points', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const r = train({ dataset: 'ring', hidden: [2], activation: 'tanh' }, 600, seed)
      expect(r.correct).toBeLessThan(r.total)
    }
  })

  it('some starting weights get stuck: 4 + 2 tanh on the ring from seed 6', () => {
    const r = train(experiment('ring'), 600, 6)
    expect(r.correct).toBeLessThan(r.total)
  })
})
