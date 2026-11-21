import { HOUSES, housesNumpy } from '../../data/houses'
import type { House } from '../../data/houses'
import { npArray, npFloat, npRound } from '../../lib/numpy'
import type { Vec2 } from '../../linalg'
import { fisherDirection, learn, predictKind } from './classifier'
import type { Example, Model } from './classifier'

/**
 * Running example: the same recipe on the shared houses. "Expensive" means a
 * price of at least $400k; the two features are size in thousands of sqft and
 * distance to the centre in km. In the classifier's terms, expensive plays the
 * part of "spam" (the group the arrow points towards).
 */
export const PRICEY_FROM = 400

export const isPricey = (h: House) => h.priceK >= PRICEY_FROM

export const houseFeatures = (h: House): Vec2 => [h.sqft / 1000, h.distanceKm]

export const HOUSE_EXAMPLES: Example[] = HOUSES.map((h) => ({
  name: h.id,
  kind: isPricey(h) ? 'spam' : 'normal',
  at: houseFeatures(h),
}))

/** The plain recipe. The direction is used as it is (w = d), not tidied, to match the NumPy. */
const plain = learn(HOUSE_EXAMPLES) as Model
export const HOUSE_CENTRES = plain.centres
export const HOUSE_D = plain.difference
export const HOUSE_MID = plain.midpoint
export const HOUSE_B = HOUSE_D[0] * HOUSE_MID[0] + HOUSE_D[1] * HOUSE_MID[1]

/** The scatter-corrected direction S_w⁻¹ d, as NumPy's solve returns it. */
export const HOUSE_FISHER = fisherDirection(HOUSE_EXAMPLES) as Vec2
export const HOUSE_FISHER_B = HOUSE_FISHER[0] * HOUSE_MID[0] + HOUSE_FISHER[1] * HOUSE_MID[1]

export type HouseVerdict = { house: House; score: number; pricey: boolean; right: boolean }

function verdicts(w: Vec2, b: number): HouseVerdict[] {
  return HOUSES.map((house, i) => {
    const x = HOUSE_EXAMPLES[i].at
    const score = w[0] * x[0] + w[1] * x[1]
    const pricey = predictKind(w, b, x) === 'spam'
    return { house, score, pricey, right: pricey === isPricey(house) }
  })
}

export const PLAIN_VERDICTS = verdicts(HOUSE_D, HOUSE_B)
export const FISHER_VERDICTS = verdicts(HOUSE_FISHER, HOUSE_FISHER_B)

export const rightCount = (v: readonly HouseVerdict[]) => v.filter((x) => x.right).length

const r2 = (v: Vec2): Vec2 => [npRound(v[0], 2), npRound(v[1], 2)]

export function houseSnippet(corrected: boolean) {
  const lines = [
    'import numpy as np',
    '',
    housesNumpy(),
    '',
    'F = X[:, [0, 2]] / [1000, 1]   # size in 1000 sqft, distance in km',
    `pricey = y >= ${PRICEY_FROM}`,
    'mu_cheap = F[~pricey].mean(axis=0)',
    'mu_pricey = F[pricey].mean(axis=0)',
    'w = mu_pricey - mu_cheap',
  ]
  if (corrected) {
    lines.push(
      'dev_c = F[~pricey] - mu_cheap',
      'dev_p = F[pricey] - mu_pricey',
      'S_w = dev_c.T @ dev_c + dev_p.T @ dev_p',
      'w = np.linalg.solve(S_w, w)   # the scatter correction',
    )
  }
  lines.push(
    'b = w @ (mu_cheap + mu_pricey) / 2',
    'print(np.round(w, 2), np.round(b, 2))',
    'print(F @ w > b)',
    'print(((F @ w > b) == pricey).sum(), "of 8 right")',
  )
  const w = corrected ? HOUSE_FISHER : HOUSE_D
  const b = corrected ? HOUSE_FISHER_B : HOUSE_B
  const v = corrected ? FISHER_VERDICTS : PLAIN_VERDICTS
  const output = [
    `${npArray(r2(w))} ${npFloat(npRound(b, 2))}`,
    `[${v.map((x) => (x.pricey ? ' True' : 'False')).join(' ')}]`,
    `${rightCount(v)} of 8 right`,
  ].join('\n')
  return { code: lines.join('\n'), output }
}
