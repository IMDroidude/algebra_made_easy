/**
 * Step 5's named vectors: a cat, a tiger and a car, each described by a few
 * hand-made features. Data, wording rules and the NumPy code live here, out of
 * the components, so the unit tests can check every number.
 */
import { npArray, npRound } from '../../lib/numpy'
import { COLOR } from '../../lib/palette'
import { isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { isZeroVec } from '../../linalg/projection'
import { pairwiseCosines, pairwiseDots } from '../../linalg/similarity'

export const ANIMALS = [
  { name: 'cat', emoji: '🐱', color: COLOR.j },
  { name: 'tiger', emoji: '🐯', color: COLOR.i },
  { name: 'car', emoji: '🚗', color: COLOR.v },
] as const

export const CAT = 0
export const TIGER = 1
export const CAR = 2

/** The third feature, wheels, is switched on by the learner. */
export const FEATURES = ['furry', 'big', 'wheels'] as const

/** Every feature is a whole number from 0 (not at all) to 5 (very). */
export const FEATURE_MAX = 5

/** One row per thing: [furry, big, wheels]. */
export type Features = number[][]

export const START: Features = [
  [4, 1, 0],
  [4, 4, 0],
  [0, 3, 4],
]

/** The vectors actually compared: two features, or all three once wheels is on. */
export function activeVectors(features: Features, wheels: boolean): number[][] {
  return features.map((f) => (wheels ? [...f] : f.slice(0, 2)))
}

/** The part of each vector the flat picture can show: (furry, big). */
export function planePoint(f: number[]): Vec2 {
  return [f[0], f[1]]
}

/** A vector of all zeros has no direction, so the demo never lets one appear. */
export function hasZeroVector(features: Features, wheels: boolean): boolean {
  return activeVectors(features, wheels).some(isZeroVec)
}

/** Rounds a feature to a whole number in range (dragging and sliders both go through this). */
export function clampFeature(x: number): number {
  return Math.max(0, Math.min(FEATURE_MAX, Math.round(x))) + 0
}

/**
 * Words for a cosine similarity between vectors with no negative entries
 * (so it lies between 0 and 1).
 */
export function grade(cos: number): string {
  if (isZero(cos)) return 'nothing in common'
  if (cos >= 0.95) return 'almost the same direction'
  if (cos >= 0.75) return 'very similar'
  if (cos >= 0.45) return 'somewhat similar'
  if (cos >= 0.15) return 'only a little alike'
  return 'almost nothing in common'
}

/** Practice goals inside step 5, checked against the live features. */
export const ANIMAL_CHECKS: Record<string, (features: Features, wheels: boolean) => boolean> = {
  /** The car is more like the cat than the tiger is. */
  impostor: (features, wheels) => {
    const cos = pairwiseCosines(activeVectors(features, wheels))
    return cos !== null && cos[CAT][CAR] > cos[CAT][TIGER] && !isZero(cos[CAT][CAR] - cos[CAT][TIGER])
  },
  /** Two different things share no feature at all. */
  nothing: (features, wheels) => {
    if (hasZeroVector(features, wheels)) return false
    const dots = pairwiseDots(activeVectors(features, wheels))
    return isZero(dots[CAT][TIGER]) || isZero(dots[CAT][CAR]) || isZero(dots[TIGER][CAR])
  },
}

/** NumPy code for all pairs at once, and exactly what it prints. */
export function animalSnippet(features: Features, wheels: boolean) {
  const X = activeVectors(features, wheels)
  const head = 'X = np.array(['
  const pad = ' '.repeat(head.length)
  const rows = X.map((r) => `[${r.join(', ')}]`).join(`,\n${pad}`)
  const code = [
    'import numpy as np',
    '',
    `# rows: ${ANIMALS.map((a) => a.name).join(', ')}   columns: ${FEATURES.slice(0, X[0].length).join(', ')}`,
    `${head}${rows}])`,
    '',
    'dots = X @ X.T                        # every pair at once',
    'lengths = np.linalg.norm(X, axis=1)   # one length per row',
    'cos = dots / np.outer(lengths, lengths)',
    '',
    'print(dots)',
    'print(np.round(cos, 3))',
  ].join('\n')
  const cos = pairwiseCosines(X)
  // The demo never lets a zero vector in; this keeps the function total for the tests.
  const cosText = cos
    ? npArray(cos.map((row) => row.map((c) => npRound(c, 3))), false)
    : 'nan'
  const output = `${npArray(pairwiseDots(X), true)}\n${cosText}`
  return { code, output }
}
