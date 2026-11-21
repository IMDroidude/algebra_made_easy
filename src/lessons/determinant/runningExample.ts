/**
 * The running example for this lesson: a feature transform of (sqft, bedrooms)
 * with determinant 0 sends different houses to the same output; one with
 * determinant 1 keeps them apart. Plain functions only, for the unit tests.
 */
import { HOUSES } from '../../data/houses'
import type { House } from '../../data/houses'
import { fmtVec } from '../../lib/format'
import { npArray, npFloat } from '../../lib/numpy'
import { apply2, det2 } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'

/** Row 1: spare space = sqft − 200 per bedroom. Row 2: the same number doubled. */
export const FLAT: Mat2 = [
  [1, -200],
  [2, -400],
]
/** Row 1: spare space. Row 2: bedrooms, kept as they are. */
export const KEEP: Mat2 = [
  [1, -200],
  [0, 1],
]

export type Which = 'flat' | 'keep'
export const TRANSFORMS: Record<Which, { m: Mat2; label: string }> = {
  flat: { m: FLAT, label: 'T: spare space, twice' },
  keep: { m: KEEP, label: 'S: spare space, bedrooms' },
}

export const sqftBeds = (h: House): Vec2 => [h.sqft, h.bedrooms]
export const output = (m: Mat2, h: House): Vec2 => apply2(m, sqftBeds(h))
export const outputText = (m: Mat2, h: House) => fmtVec(output(m, h))

/** The other houses that land on exactly the same output as h. */
export function sameAs(m: Mat2, h: House): House[] {
  const [a, b] = output(m, h)
  return HOUSES.filter((o) => o.id !== h.id && output(m, o)[0] === a && output(m, o)[1] === b)
}

/** Every pair of houses (in dataset order) that m sends to the same output. */
export function collidingPairs(m: Mat2): [House, House][] {
  return HOUSES.flatMap((h, i) =>
    sameAs(m, h)
      .filter((o) => HOUSES.indexOf(o) > i)
      .map((o): [House, House] => [h, o]),
  )
}

/** The houses in the NumPy snippet: A and C collide under T. */
export const PAIR: [House, House] = [HOUSES[0], HOUSES[2]]

export function houseSnippet(which: Which): { code: string; output: string } {
  const m = TRANSFORMS[which].m
  const name = which === 'flat' ? 'T' : 'S'
  const [p, q] = PAIR
  const lit = which === 'flat' ? '[[1, -200],\n              [2, -400]]' : '[[1, -200],\n              [0, 1]]'
  const code = [
    'import numpy as np',
    '',
    `${name} = np.array(${lit})`,
    `a = np.array([${p.sqft}, ${p.bedrooms}])   # house ${p.id}: sqft, bedrooms`,
    `c = np.array([${q.sqft}, ${q.bedrooms}])    # house ${q.id}`,
    '',
    `print(np.linalg.det(${name}))`,
    `print(${name} @ a)`,
    `print(${name} @ c)`,
  ].join('\n')
  const out = [npFloat(det2(m)), npArray(output(m, p), true), npArray(output(m, q), true)].join('\n')
  return { code, output: out }
}
