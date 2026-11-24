import { numpyVec } from '../../lib/format'
import { npArray, npFloat } from '../../lib/numpy'
import { norm } from '../../linalg'
import type { Vec, Vec2 } from '../../linalg'

/** A small shop: one vector entry per product on the shelf. */
export const SHELF = [
  'apples', 'bread', 'milk', 'eggs', 'rice', 'tea',
  'soap', 'salt', 'pasta', 'cheese', 'coffee', 'sugar',
] as const

/** The basket the section starts with: 2 bread, 1 milk, 6 eggs. */
export const START_BASKET: Vec = [0, 2, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0]
export const EMPTY_BASKET: Vec = SHELF.map(() => 0)

/** A real supermarket, for scale: products stocked and items in a typical basket. */
export const SUPERMARKET = { products: 30000, inBasket: 20 }
/** Share of a real basket vector that is zero, in percent. */
export const SUPERMARKET_ZERO_PERCENT = (1 - SUPERMARKET.inBasket / SUPERMARKET.products) * 100

export function nonZeroCount(v: Vec): number {
  return v.filter((x) => x !== 0).length
}

/** Fraction of entries that are zero, from 0 to 1. */
export function zeroShare(v: Vec): number {
  return (v.length - nonZeroCount(v)) / v.length
}

export type Density = 'zero' | 'sparse' | 'dense'

/** Zero vector, sparse (more than half the entries are zero) or dense. */
export function density(v: Vec): Density {
  if (nonZeroCount(v) === 0) return 'zero'
  return zeroShare(v) > 0.5 ? 'sparse' : 'dense'
}

/** What sparse storage keeps: only the non-zero entries, as position and value. */
export function sparsePairs(v: Vec): [index: number, value: number][] {
  return v.flatMap((x, i) => (x !== 0 ? [[i, x] as [number, number]] : []))
}

/** v divided by its own length, entry by entry, exactly as NumPy's `v / length` does. */
export function unitOf(v: Vec2): Vec2 {
  const n = norm(v)
  return [v[0] / n, v[1] / n]
}

export function kindsCode(v: Vec2): string {
  return [
    'import numpy as np',
    '',
    numpyVec('v', v),
    'length = np.linalg.norm(v)',
    'print(length)',
    'print(v / length)             # unit vector',
    '',
    'print(v.shape)                # 1-D: neither',
    'print(v.reshape(1, 2).shape)  # row: 1 by 2',
    'print(v.reshape(2, 1).shape)  # column: 2 by 1',
    'print(np.zeros(2))            # zero vector',
  ].join('\n')
}

/** What the snippet prints. Dividing the zero vector by its length 0 gives nan. */
export function kindsOutput(v: Vec2): string {
  const n = norm(v)
  const unit = n === 0 ? '[nan nan]' : npArray(unitOf(v), false)
  return [npFloat(n), unit, '(2,)', '(1, 2)', '(2, 1)', '[0. 0.]'].join('\n')
}
