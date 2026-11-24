import { forward } from '../../linalg/neuralNet'
import type { Network } from '../../linalg/neuralNet'
import { toInput } from './datasets'

/** Pictures of the plane are GRID × GRID cells. */
export const GRID = 48

export type Rgb = [number, number, number]

/** Positive outputs (teal) and negative outputs (orange), the course's two basis colours. */
export const POSITIVE: Rgb = [12, 133, 153]
export const NEGATIVE: Rgb = [232, 89, 12]
const MIDDLE: Rgb = [247, 245, 240]

/**
 * What every neuron outputs at every cell of the 0…10 plane. One array per
 * neuron, in layer order (the two inputs first, the output last). Row 0 is
 * the top of the picture, where the vertical measurement is 10.
 */
export function fieldValues(net: Network): Float32Array[] {
  const fields: Float32Array[] = []
  for (let row = 0; row < GRID; row++) {
    const vertical = 10 * (1 - (row + 0.5) / GRID)
    for (let col = 0; col < GRID; col++) {
      const horizontal = (10 * (col + 0.5)) / GRID
      const values = forward(net, toInput(horizontal, vertical))
      let k = 0
      for (let l = 0; l < values.length; l++) {
        // the raw inputs run from -5 to 5; scale them so their pictures use the full colour range
        const scale = l === 0 ? 1 / 5 : 1
        for (const v of values[l]) {
          if (fields.length <= k) fields.push(new Float32Array(GRID * GRID))
          fields[k++][row * GRID + col] = v * scale
        }
      }
    }
  }
  return fields
}

/** Colour for a value: orange at -1, near-white at 0, teal at +1. Values outside are clamped. */
export function shade(value: number): Rgb {
  const t = Math.min(1, Math.abs(value)) * 0.8
  const end = value >= 0 ? POSITIVE : NEGATIVE
  return [
    Math.round(MIDDLE[0] + (end[0] - MIDDLE[0]) * t),
    Math.round(MIDDLE[1] + (end[1] - MIDDLE[1]) * t),
    Math.round(MIDDLE[2] + (end[2] - MIDDLE[2]) * t),
  ]
}

/** Width of the line drawn for a weight: thicker means the weight is further from 0. */
export function linkWidth(weight: number): number {
  return Math.min(7, Math.max(0.6, Math.abs(weight) * 2.4))
}

export const rgb = (c: Rgb, alpha = 1) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`
