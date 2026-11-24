import type { Activation } from '../../linalg/neuralNet'
import type { DatasetId } from './datasets'

export type Setup = { dataset: DatasetId; hidden: number[]; activation: Activation }

/** Ready-made experiments. Each claim made here is checked in tests/playground/experiments.test.ts. */
export const EXPERIMENTS: (Setup & { id: string; title: string; expect: string })[] = [
  {
    id: 'one-neuron',
    title: '1. One neuron: cat or tiger',
    dataset: 'cat-tiger',
    hidden: [],
    activation: 'tanh',
    expect: 'No hidden layers, so the network is a single neuron: one straight line. That is enough here.',
  },
  {
    id: 'one-neuron-fails',
    title: '2. One neuron: find the cat in the middle',
    dataset: 'cat-among',
    hidden: [],
    activation: 'tanh',
    expect: 'It fails. One straight line cannot keep cats on one side and both mice and tigers on the other.',
  },
  {
    id: 'two-hidden',
    title: '3. Add two hidden neurons',
    dataset: 'cat-among',
    hidden: [2],
    activation: 'tanh',
    expect: 'Each hidden neuron draws one line (smaller than a tiger; bigger than a mouse). The output combines them into a band.',
  },
  {
    id: 'linear',
    title: '4. Same data, more layers, no activation',
    dataset: 'cat-among',
    hidden: [4, 2],
    activation: 'linear',
    expect: 'It fails again. Without an activation, the layers multiply out to one matrix: one straight line.',
  },
  {
    id: 'ring',
    title: '5. The Playground circle: 4 + 2 neurons, tanh',
    dataset: 'ring',
    hidden: [4, 2],
    activation: 'tanh',
    expect: 'The boundary bends until it closes into a loop around the inner dots.',
  },
]
