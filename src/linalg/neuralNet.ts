/**
 * A small fully connected neural network, trained by gradient descent.
 *
 * Each layer is a matrix W and a bias vector b: a = f(W x + b). The hidden
 * layers share one activation f; the single output always goes through tanh,
 * so it lands between -1 and +1 and its sign is the predicted class. The loss
 * for one example is half the squared error, ½(output − y)². These are the
 * same choices TensorFlow Playground makes, so the two can be compared.
 *
 * `trainEpoch` changes the network it is given; use `cloneNetwork` first to keep the old one.
 */

export type Activation = 'tanh' | 'relu' | 'linear'

/** W has one row per neuron in this layer and one column per input to it. */
export type Layer = { w: number[][]; b: number[] }

export type Network = { activation: Activation; layers: Layer[] }

/** One labelled example: the inputs and the class, +1 or -1. */
export type Sample = { x: number[]; y: number }

/** A small seeded random generator (mulberry32), so every run can be repeated exactly. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function apply(f: Activation, z: number): number {
  if (f === 'tanh') return Math.tanh(z)
  if (f === 'relu') return z > 0 ? z : 0
  return z
}

/** The slope of the activation, written in terms of its output a = f(z). */
function slope(f: Activation, a: number): number {
  if (f === 'tanh') return 1 - a * a
  if (f === 'relu') return a > 0 ? 1 : 0
  return 1
}

/**
 * `sizes` lists the neurons per layer from input to output, e.g. [2, 4, 2, 1].
 * Weights start uniformly between -0.5 and 0.5 and biases at 0.1.
 */
export function createNetwork(sizes: number[], activation: Activation, rand: () => number): Network {
  const layers: Layer[] = []
  for (let l = 1; l < sizes.length; l++) {
    const w: number[][] = []
    for (let i = 0; i < sizes[l]; i++) {
      const row: number[] = []
      for (let j = 0; j < sizes[l - 1]; j++) row.push(rand() - 0.5)
      w.push(row)
    }
    layers.push({ w, b: new Array<number>(sizes[l]).fill(0.1) })
  }
  return { activation, layers }
}

/** An independent copy, so one can be trained while the other stays as it was. */
export function cloneNetwork(net: Network): Network {
  return { activation: net.activation, layers: net.layers.map((l) => ({ w: l.w.map((row) => row.slice()), b: l.b.slice() })) }
}

/** The activation used by layer l: tanh for the last layer, the network's own for the rest. */
function activationOf(net: Network, l: number): Activation {
  return l === net.layers.length - 1 ? 'tanh' : net.activation
}

/**
 * Runs x through the network and returns every layer's values: the inputs
 * first, then each hidden layer, then the output (a one-entry array).
 */
export function forward(net: Network, x: number[]): number[][] {
  const values: number[][] = [x]
  let prev = x
  for (let l = 0; l < net.layers.length; l++) {
    const { w, b } = net.layers[l]
    const f = activationOf(net, l)
    const out = new Array<number>(w.length)
    for (let i = 0; i < w.length; i++) {
      let z = b[i]
      const row = w[i]
      for (let j = 0; j < row.length; j++) z += row[j] * prev[j]
      out[i] = apply(f, z)
    }
    values.push(out)
    prev = out
  }
  return values
}

/** The network's output for x, between -1 and +1. */
export function predict(net: Network, x: number[]): number {
  const values = forward(net, x)
  return values[values.length - 1][0]
}

/** Gradients of the loss for one example, in the same shape as the layers. */
export function gradients(net: Network, sample: Sample): Layer[] {
  const values = forward(net, sample.x)
  const grads: Layer[] = new Array<Layer>(net.layers.length)
  // delta[i] = d loss / d z_i for the layer being processed
  let delta = [values[values.length - 1][0] - sample.y]
  for (let l = net.layers.length - 1; l >= 0; l--) {
    const { w } = net.layers[l]
    const out = values[l + 1]
    const input = values[l]
    const f = activationOf(net, l)
    for (let i = 0; i < delta.length; i++) delta[i] *= slope(f, out[i])
    grads[l] = { w: delta.map((d) => input.map((v) => d * v)), b: delta.slice() }
    if (l > 0) {
      const next = new Array<number>(input.length).fill(0)
      for (let i = 0; i < w.length; i++) {
        for (let j = 0; j < input.length; j++) next[j] += w[i][j] * delta[i]
      }
      delta = next
    }
  }
  return grads
}

/**
 * One epoch: every example is used once, in order, in batches. After each
 * batch every weight moves against its average gradient, scaled by the
 * learning rate. Changes `net` in place.
 */
export function trainEpoch(net: Network, data: Sample[], learningRate: number, batchSize = 10): void {
  for (let start = 0; start < data.length; start += batchSize) {
    const batch = data.slice(start, start + batchSize)
    const sums = batch.map((s) => gradients(net, s))
    const scale = learningRate / batch.length
    for (let l = 0; l < net.layers.length; l++) {
      const { w, b } = net.layers[l]
      for (let i = 0; i < w.length; i++) {
        for (const g of sums) {
          b[i] -= scale * g[l].b[i]
          const row = g[l].w[i]
          for (let j = 0; j < row.length; j++) w[i][j] -= scale * row[j]
        }
      }
    }
  }
}

/** Average loss, ½(output − y)², over a set of examples. 0.5 is what always answering 0 scores. */
export function meanLoss(net: Network, data: Sample[]): number {
  if (data.length === 0) return 0
  let total = 0
  for (const s of data) {
    const e = predict(net, s.x) - s.y
    total += 0.5 * e * e
  }
  return total / data.length
}

/** How many examples land on the correct side: output above 0 for +1, below 0 for -1. */
export function countCorrect(net: Network, data: Sample[]): number {
  let n = 0
  for (const s of data) if (predict(net, s.x) * s.y > 0) n++
  return n
}
