import { approxEqual, isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { FEATURES, HOUSES, featureVector, housesNumpy } from '../../data/houses'
import { npArray } from '../../lib/numpy'

/**
 * The small amount of arithmetic this lesson needs, kept out of the
 * components so every number on screen can be unit-tested.
 *
 * A spot on the wire is stored as its `place`: a fixed position that never
 * changes when the origin moves. The number we give it is measured from the
 * origin: number = place − origin.
 */

/** Places on the wire (and the origin) run from −LIMIT to LIMIT. */
export const LIMIT = 8

/** Turns −0 into 0 so it never shows up as "-0". */
const clean = (x: number) => x + 0

/** The bead's number: how far it is from the origin, with a sign for which way. */
export function numberOf(place: number, origin: number): number {
  return clean(place - origin)
}

/** A number for display, with a real minus sign: −3. */
export function signed(n: number): string {
  const r = Math.round(n * 100) / 100
  return isZero(r) ? '0' : String(r).replace('-', '−')
}

/** "3 steps right of the origin", "1 step left of the origin", "exactly at the origin". */
export function describeNumber(n: number): string {
  if (isZero(n)) return 'exactly at the origin'
  const size = Math.abs(n)
  return `${signed(size)} ${approxEqual(size, 1) ? 'step' : 'steps'} ${n > 0 ? 'right' : 'left'} of the origin`
}

/** Drag constraint for anything that lives on the wire: whole steps, y fixed at 0, within ±LIMIT. */
export function snapOnLine([x]: Vec2): Vec2 {
  return [clean(Math.max(-LIMIT, Math.min(LIMIT, Math.round(x)))), 0]
}

/** Axis numbers thin out to every second one when a unit is narrower than this many pixels. */
export function labelEvery(pxPerUnit: number): number {
  return pxPerUnit >= 27 ? 1 : 2
}

/** Whether the tick at `place` gets a number: always the origin's, and every `every`-th from it. */
export function showsNumber(place: number, origin: number, every: number): boolean {
  return numberOf(place, origin) % every === 0
}

// ---------------------------------------------------------------------------
// Step 3: the prediction. The bead stays at 3; the origin moves from 0 to 4.

export const PREDICT_PLACE = 3
export const PREDICT_ORIGIN_FROM = 0
export const PREDICT_ORIGIN_TO = 4

// ---------------------------------------------------------------------------
// Step 1: one, two and three numbers.

export type Dims = 1 | 2 | 3

export const SEE_POINT = [3, 2, 1] as const

export const SEE_SCENES: Record<Dims, { title: string; thing: string; axes: string[] }> = {
  1: { title: 'A bead on a wire', thing: 'bead', axes: ['along the wire'] },
  2: { title: 'An ant on a floor', thing: 'ant', axes: ['right', 'up the map'] },
  3: { title: 'A drone in a room', thing: 'drone', axes: ['right', 'up', 'toward you'] },
}

/** The first `d` numbers of the point, written in brackets: (3), (3, 2), (3, 2, 1). */
export function pointText(values: readonly number[], d: number): string {
  return `(${values.slice(0, d).map(signed).join(', ')})`
}

/**
 * Oblique drawing for the small room picture: x to the right, y up, z toward
 * the viewer drawn down and to the left. Returns SVG pixels (y down).
 */
export function oblique(
  [x, y, z]: readonly [number, number, number],
  unit: number,
  origin: readonly [number, number],
): [number, number] {
  const k = 0.5 * unit
  return [origin[0] + x * unit - z * k * 0.8, origin[1] - y * unit + z * k * 0.6]
}

// ---------------------------------------------------------------------------
// Step 4: NumPy for the bead.

/** NumPy code for the bead and origin of step 4, with exactly what it prints. */
export function beadCode(place: number, origin: number): { code: string; output: string } {
  const a = `bead = np.array([${place}])`
  const b = `origin = np.array([${origin}])`
  const w = Math.max(a.length, b.length) + 3
  const code = [
    'import numpy as np',
    '',
    `${a.padEnd(w)}# the bead's place`,
    `${b.padEnd(w)}# the origin's place`,
    '',
    "print(bead - origin)   # the bead's number",
    'print(bead.shape)      # 1 number: 1 dimension',
  ].join('\n')
  return { code, output: `${npArray([numberOf(place, origin)], true)}\n(1,)` }
}

// ---------------------------------------------------------------------------
// Step 5: house space.

export type Feature = { name: string; unit: string; value: number; max: number }

export const HOUSE: Feature[] = [
  { name: 'size', unit: 'm²', value: 120, max: 200 },
  { name: 'rooms', unit: '', value: 3, max: 6 },
  { name: 'age', unit: 'years', value: 15, max: 40 },
  { name: 'distance to town', unit: 'km', value: 8, max: 20 },
  { name: 'garden', unit: 'm²', value: 40, max: 100 },
]

/** The house as a list of its first `k` feature values. */
export const houseValues = (k: number) => HOUSE.slice(0, k).map((f) => f.value)

/** "size 120 m²", "rooms 3". */
export const featureText = (f: Feature) => `${f.name} ${f.value}${f.unit ? ` ${f.unit}` : ''}`

/** NumPy code for the house with its first `k` features, with exactly what it prints. */
export function houseCode(k: number): { code: string; output: string } {
  const values = houseValues(k)
  const names = HOUSE.slice(0, k)
    .map((f) => f.name)
    .join(', ')
  const code = [
    'import numpy as np',
    '',
    `house = np.array([${values.join(', ')}])   # ${names}`,
    '',
    'print(house)',
    'print(house.shape)   # (number of values,)',
    'print(len(house))    # the number of dimensions',
  ].join('\n')
  return { code, output: `${npArray(values, true)}\n(${k},)\n${k}` }
}

// ---------------------------------------------------------------------------
// Step 6: practice.

export const PRACTICE_START = { place: 2, origin: 0 }
/** A weather reading: temperature, humidity, wind speed, rain. */
export const WEATHER_DIMS = 4

export type PracticeState = { place: number; origin: number; dims: number }

export const PRACTICE_CHECKS: Record<string, (s: PracticeState) => boolean> = {
  neg: (s) => approxEqual(numberOf(s.place, s.origin), -6),
  still: (s) => approxEqual(s.place, PRACTICE_START.place) && approxEqual(numberOf(s.place, s.origin), 5),
  dims: (s) => approxEqual(s.dims, WEATHER_DIMS),
}

/** The live sentence under the step 1 picture. */
export function seeSentence(d: Dims): string {
  const [x, y, z] = SEE_POINT
  if (d === 1) return `The bead is at ${x}: ${x} steps along the wire from the origin. One number, so one dimension.`
  if (d === 2) return `The ant is at (${x}, ${y}): ${x} to the right, then ${y} up the map. Two numbers, so two dimensions.`
  return `The drone is at (${x}, ${y}, ${z}): ${x} right, ${y} up, ${z} toward you. Three numbers, so three dimensions.`
}

/** Wraps a negative number in brackets so a subtraction reads correctly: 3 − (−2). */
export const bracket = (x: number) => (x < 0 ? `(${signed(x)})` : signed(x))

/** The step 4 sum, e.g. "−1 = 3 − 4" or "5 = 2 − (−3)". */
export const ruleText = (place: number, origin: number) =>
  `${signed(numberOf(place, origin))} = ${signed(place)} − ${bracket(origin)}`

/** The house's first `k` features scaled to drawing units (0 to 4) for the small pictures. */
export const houseDrawing = (k: number) => HOUSE.slice(0, k).map((f) => (f.value / f.max) * 4)

/** "(120, 3, 15)". */
export const houseText = (k: number) => `(${houseValues(k).join(', ')})`

// ---------------------------------------------------------------------------
// Running example: one house from the shared dataset, one feature at a time.

/** House A, the first house of the course's dataset. */
export const HOUSE_A = HOUSES[0]

/** Which features are measured, in order: 1, 2 or 3 of them. */
export const RUNNING_STEPS = [
  [1, 'size'],
  [2, '+ bedrooms'],
  [3, '+ distance'],
] as const

/** House A as a point with its first `k` features: (1100), (1100, 2), (1100, 2, 8). */
export const houseAPoint = (k: number) => featureVector(HOUSE_A).slice(0, k)

/** "(1100, 2, 8)". */
export const houseAText = (k: number) => `(${houseAPoint(k).join(', ')})`

/** NumPy code for the whole dataset, with exactly what it prints. */
export function housesCode(): { code: string; output: string } {
  const code = [
    'import numpy as np',
    '',
    housesNumpy(),
    '',
    'print(X[0])         # house A: one point, 3 numbers',
    'print(X[0].shape)   # 3 numbers: 3 dimensions',
    'print(X.shape)      # 8 houses, 3 features each',
    "print(y[0])         # house A's price, kept apart",
  ].join('\n')
  const output = [
    npArray(featureVector(HOUSE_A), true),
    `(${FEATURES.length},)`,
    `(${HOUSES.length}, ${FEATURES.length})`,
    String(HOUSE_A.priceK),
  ].join('\n')
  return { code, output }
}

/** The dimension ladder: how many numbers, what the point looks like, where it shows up. */
export const LADDER = [
  { dims: '1D', point: 'x = 5', use: 'one feature, like a house’s size' },
  { dims: '2D', point: '(x, y)', use: 'a dataset with two features; a map' },
  { dims: '3D', point: '(x, y, z)', use: 'spatial data, 3D graphics, robotics' },
  { dims: 'n-D', point: '(x₁, x₂, …, xₙ)', use: 'embeddings and feature vectors in AI' },
] as const

/** Largest value drawn on each house axis, so house A fits the small pictures (0 to 4 units). */
const HOUSE_AXIS_MAX = [2500, 5, 16]

/** House A's first `k` features in drawing units. Each axis has its own scale. */
export const houseADrawing = (k: number) => houseAPoint(k).map((v, i) => (v / HOUSE_AXIS_MAX[i]) * 4)
