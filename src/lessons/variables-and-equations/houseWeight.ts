/**
 * The running example for lesson 2.1: the one-weight model price = w × sqft,
 * solved from a single house and then tried on all the others. Pure maths.
 */
import { HOUSES } from '../../data/houses'
import type { House } from '../../data/houses'
import { npArray, npFloat, npRound } from '../../lib/numpy'

/** Solve sqft · w = price for w, using one house. */
export function weightFrom(h: House): number {
  return h.priceK / h.sqft
}

/** The model's guess for a house: w × sqft, in $k. Same order as NumPy's `w * sqft`. */
export function guess(w: number, h: House): number {
  return w * h.sqft
}

/** Guess minus the real price, rounded to whole $k as the table shows it. */
export function miss(w: number, h: House): number {
  return npRound(guess(w, h), 0) - h.priceK
}

/** The NumPy code for "solve w from one house, then try it on every house". */
export function weightCode(h: House): string {
  return [
    'import numpy as np',
    '',
    `w = ${h.priceK} / ${h.sqft}   # solve ${h.sqft} * w = ${h.priceK}  (house ${h.id})`,
    'print(w)',
    '',
    `sqft = np.array([${HOUSES.map((x) => x.sqft).join(', ')}])`,
    'print(np.round(w * sqft))   # its guess for every house, in $k',
  ].join('\n')
}

export function weightOutput(h: House): string {
  const w = weightFrom(h)
  return `${npFloat(w)}\n${npArray(HOUSES.map((x) => npRound(guess(w, x), 0)))}`
}
