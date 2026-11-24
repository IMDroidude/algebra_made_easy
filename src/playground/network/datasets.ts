import { mulberry32 } from '../../linalg/neuralNet'
import type { Sample } from '../../linalg/neuralNet'

/**
 * Made-up animals for the network lab. Each one is two measurements, both on
 * a 0 to 10 scale, so it is a point on a plane:
 *
 *   size    0 = mouse-sized … 10 = tiger-sized
 *   stripes 0 = plain coat   … 10 = striped all over
 *
 * The numbers are invented to make each dataset's shape clear; they are not
 * real measurements.
 */

export type Kind = 'cat' | 'tiger' | 'mouse' | 'inner' | 'outer'

export type Animal = {
  kind: Kind
  size: number
  stripes: number
  /** The class the network should learn: +1 or -1. */
  y: 1 | -1
}

export type DatasetId = 'cat-tiger' | 'cat-among' | 'ring'

export type Dataset = {
  id: DatasetId
  /** Button label. */
  label: string
  /** What a positive output means, and a negative one. */
  positive: string
  negative: string
  /** Axis names: horizontal, vertical. */
  axes: [string, string]
  /** One line on the shape of the data and what it takes to separate it. */
  note: string
  train: Animal[]
  test: Animal[]
}

/** How each kind is drawn, and what it is called in text. */
export const KINDS: Record<Kind, { mark: string; name: string }> = {
  cat: { mark: '🐱', name: 'cat' },
  tiger: { mark: '🐯', name: 'tiger' },
  mouse: { mark: '🐭', name: 'mouse' },
  inner: { mark: '●', name: 'inner dot' },
  outer: { mark: '▲', name: 'outer triangle' },
}

/** The network sees measurements centred on 0: 0…10 becomes -5…+5. */
export function toInput(size: number, stripes: number): [number, number] {
  return [size - 5, stripes - 5]
}

export function toSamples(animals: Animal[]): Sample[] {
  return animals.map((a) => ({ x: toInput(a.size, a.stripes), y: a.y }))
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const round1 = (v: number) => Math.round(v * 10) / 10

/** A bell-shaped random number around `mean`, never further than 2 spreads away. */
function bell(rand: () => number, mean: number, spread: number): number {
  const u = Math.max(rand(), 1e-9)
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
  return mean + spread * clamp(z, -2, 2)
}

function herd(
  rand: () => number,
  kind: Kind,
  y: 1 | -1,
  n: number,
  size: [mean: number, spread: number],
  stripes: [lo: number, hi: number],
): Animal[] {
  const out: Animal[] = []
  for (let i = 0; i < n; i++) {
    out.push({
      kind,
      y,
      size: round1(clamp(bell(rand, size[0], size[1]), 0.2, 9.8)),
      stripes: round1(stripes[0] + rand() * (stripes[1] - stripes[0])),
    })
  }
  return out
}

function ring(rand: () => number, n: number): Animal[] {
  const out: Animal[] = []
  const place = (kind: Kind, y: 1 | -1, rMin: number, rMax: number) => {
    const r = rMin + rand() * (rMax - rMin)
    const angle = rand() * 2 * Math.PI
    out.push({ kind, y, size: round1(5 + r * Math.cos(angle)), stripes: round1(5 + r * Math.sin(angle)) })
  }
  for (let i = 0; i < n; i++) place('inner', 1, 0, 2)
  for (let i = 0; i < n; i++) place('outer', -1, 3.2, 4.6)
  return out
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SIZE_AXIS = 'Body size (0 = mouse, 10 = tiger)'
const STRIPE_AXIS = 'Stripes (0 = plain, 10 = striped all over)'

export const DATASET_INFO: Record<DatasetId, Omit<Dataset, 'train' | 'test'>> = {
  'cat-tiger': {
    id: 'cat-tiger',
    label: 'Cat or tiger?',
    positive: 'cat',
    negative: 'tiger',
    axes: [SIZE_AXIS, STRIPE_AXIS],
    note: 'Tabby cats are striped too, so stripes alone cannot decide; size can. One straight line separates the two groups.',
  },
  'cat-among': {
    id: 'cat-among',
    label: 'Cat, or something else?',
    positive: 'cat',
    negative: 'not a cat',
    axes: [SIZE_AXIS, STRIPE_AXIS],
    note: 'Cats sit in the middle: bigger than a mouse, smaller than a tiger. No single straight line can cut out a middle band.',
  },
  ring: {
    id: 'ring',
    label: 'Ring (the Playground circle)',
    positive: 'inside',
    negative: 'outside',
    axes: ['x₁ (0 to 10)', 'x₂ (0 to 10)'],
    note: 'One class is surrounded by the other. The boundary has to close into a loop, which takes at least three hidden neurons.',
  },
}

/** Builds a dataset from a seed and splits it in half: one half to train on, one held back to test. */
export function makeDataset(id: DatasetId, seed = 1): Dataset {
  const rand = mulberry32(seed)
  let animals: Animal[]
  if (id === 'cat-tiger') {
    animals = [
      ...herd(rand, 'cat', 1, 40, [3.6, 0.6], [0, 9]),
      ...herd(rand, 'tiger', -1, 40, [8.2, 0.6], [6, 10]),
    ]
  } else if (id === 'cat-among') {
    animals = [
      ...herd(rand, 'mouse', -1, 26, [1.3, 0.45], [0, 3]),
      ...herd(rand, 'cat', 1, 44, [5, 0.6], [0, 9]),
      ...herd(rand, 'tiger', -1, 26, [8.7, 0.45], [6, 10]),
    ]
  } else {
    animals = ring(rand, 60)
  }
  const mixed = shuffle(animals, rand)
  const half = Math.ceil(mixed.length / 2)
  return { ...DATASET_INFO[id], train: mixed.slice(0, half), test: mixed.slice(half) }
}

export const DATASET_IDS: DatasetId[] = ['cat-tiger', 'cat-among', 'ring']
