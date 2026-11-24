import { isInteger, numpyVec } from '../../lib/format'
import { npArray, npFloat } from '../../lib/numpy'
import { dot } from '../../linalg'
import { cross3 } from '../../linalg/cross'
import type { Vec3 } from '../../linalg/project3d'
import type { Vec, Vec2 } from '../../linalg'

/** A shopping bill: how many of each item, and what one of each costs. */
export const SHOP = {
  items: ['apples', 'bread', 'milk'],
  quantity: [2, 1, 3] as Vec,
  price: [0.5, 2, 1.5] as Vec,
}
/** The price of each line of the bill, and the total: quantity · price. */
export const BILL_LINES = SHOP.quantity.map((q, i) => q * SHOP.price[i])
export const BILL = dot(SHOP.quantity, SHOP.price)

/** A worked cross product with no zeros in it. */
export const EX_A: Vec3 = [1, 2, 3]
export const EX_B: Vec3 = [4, 5, 6]
export const EX_CROSS = cross3(EX_A, EX_B)

/** A vector on the floor (the x-y plane) written with three entries. */
export const lift = (v: Vec2): Vec3 => [v[0], v[1], 0]

export type CrossDirection = 'up' | 'down' | 'none'

/** Which way a × b points for two vectors on the floor, from the sign of its z entry. */
export function crossDirection(z: number): CrossDirection {
  return z > 0 ? 'up' : z < 0 ? 'down' : 'none'
}

export function productsCode(a: Vec2, b: Vec2): string {
  return [
    'import numpy as np',
    '',
    numpyVec('a', lift(a)),
    numpyVec('b', lift(b)),
    '',
    'print(a @ b)           # dot product: one number',
    'print(np.cross(a, b))  # cross product: a new vector',
    'print(np.cross(b, a))  # swapped: the opposite vector',
  ].join('\n')
}

export function productsOutput(a: Vec2, b: Vec2): string {
  const integer = isInteger(...a, ...b)
  const [a3, b3] = [lift(a), lift(b)]
  const d = dot(a3, b3)
  return [
    integer ? String(d + 0) : npFloat(d),
    npArray(cross3(a3, b3), integer),
    npArray(cross3(b3, a3), integer),
  ].join('\n')
}
