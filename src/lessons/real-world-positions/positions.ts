/**
 * The maths of "giving something an address": choose an origin, directions and
 * a unit, then a position is a list of numbers. Plain functions, no React.
 */
import { add, approxEqual, approxEqualVec, scale, sub } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { fmt } from '../../lib/format'
import { npArray } from '../../lib/numpy'

/** Never show "-0". */
const clean = (x: number) => x + 0

// ---------------------------------------------------------------- frames

export type Unit = 'm' | 'tiles'
/** Which way the second axis points on the map: up (maths) or down (screens). */
export type YDir = 'up' | 'down'

/** One floor tile is half a metre. */
export const TILE = 0.5

export type Frame = { origin: Vec2; unit: Unit; yDir: YDir }

export const UNIT_NAME: Record<Unit, string> = { m: 'metres', tiles: 'floor tiles' }

/**
 * The coordinates of a place (given in metres from the room's bottom-left
 * corner) in the chosen frame: subtract the origin, divide by the unit, and
 * flip the second number if y points down.
 */
export function toLocal(place: Vec2, frame: Frame): Vec2 {
  const [dx, dy] = sub(place, frame.origin)
  const perUnit = frame.unit === 'm' ? 1 : TILE
  const sign = frame.yDir === 'up' ? 1 : -1
  return [clean(dx / perUnit), clean((sign * dy) / perUnit)]
}

export const pairText = ([a, b]: Vec2) => `(${fmt(a)}, ${fmt(b)})`

// ---------------------------------------------------------------- snapping

/** Snap to half metres and stay inside a w × h room. */
export function roomSnap(w: number, h: number) {
  const c = (v: number, hi: number) => Math.min(hi, Math.max(0, Math.round(v * 2) / 2))
  return ([px, py]: Vec2): Vec2 => [c(px, w), c(py, h)]
}

// ---------------------------------------------------------------- the living room (steps 1–4)

/** The room is 8 m wide and 5 m deep, drawn from its bottom-left corner. */
export const ROOM = { w: 8, h: 5 }

/** `attach`: which side of the dot its label goes (labels near the right wall go left). */
export type Thing = { id: string; name: string; at: Vec2; attach?: 'e' | 'w' }

export const LAMP: Thing = { id: 'lamp', name: 'lamp', at: [5, 3] }
export const PLANT: Thing = { id: 'plant', name: 'plant', at: [7, 1], attach: 'w' }
export const SOFA: Thing = { id: 'sofa', name: 'sofa', at: [2, 1] }
export const THINGS: Thing[] = [LAMP, PLANT, SOFA]

export type OriginPreset = { id: string; name: string; at: Vec2 }

export const ORIGINS: OriginPreset[] = [
  { id: 'corner', name: 'the corner', at: [0, 0] },
  { id: 'door', name: 'the door', at: [0, 2.5] },
  { id: 'window', name: 'the window', at: [4, 5] },
  { id: 'centre', name: 'the middle of the room', at: [4, 2.5] },
]

/** The point a fraction t of the way from `from` to `to` (for animating the origin). */
export const slide = (from: Vec2, to: Vec2, t: number): Vec2 => add(from, scale(sub(to, from), t))

export const DOOR: Vec2 = [0, 2.5]
export const WINDOW: Vec2 = [4, 5]

/** Which preset (if any) sits at this origin. */
export function presetAt(origin: Vec2): OriginPreset | undefined {
  return ORIGINS.find((o) => approxEqual(o.at[0], origin[0]) && approxEqual(o.at[1], origin[1]))
}

export const START_FRAME: Frame = { origin: [0, 0], unit: 'm', yDir: 'up' }

/** Predict: the origin moves from the corner to the door. */
export const PREDICT_FROM: Vec2 = [0, 0]
export const PREDICT_TO: Vec2 = DOOR

/** "2 m right, 0.5 m up": the walk from the origin to a place, in words. */
export function walkWords(local: Vec2, frame: Frame): string {
  const unit = frame.unit === 'm' ? ' m' : ' tiles'
  const [a, b] = local
  const across =
    a === 0 ? 'no steps across' : `${fmt(Math.abs(a))}${unit} ${a > 0 ? 'right' : 'left'}`
  const vertical = frame.yDir === 'up' ? (b > 0 ? 'up the map' : 'down the map') : b > 0 ? 'down the map' : 'up the map'
  const along = b === 0 ? 'no steps up or down' : `${fmt(Math.abs(b))}${unit} ${vertical}`
  return `${across}, ${along}`
}

// ---------------------------------------------------------------- NumPy (step 4)

/** Python literal for a number: 2.5, 3, -1 (never "-0"). */
const lit = (x: number) => fmt(x, 3)

export function understandCode(origin: OriginPreset, unit: Unit): string {
  const rows = THINGS.map((t, k) => {
    const head = k === 0 ? 'positions = np.array([' : '                      '
    const tail = k === THINGS.length - 1 ? '])' : ','
    return `${head}[${lit(t.at[0])}, ${lit(t.at[1])}]${tail}`
  })
  const width = Math.max(...rows.map((r) => r.length)) + 3
  const commented = rows.map((r, k) => `${r.padEnd(width)}# ${THINGS[k].name}`)
  return [
    'import numpy as np',
    '',
    '# metres from the bottom-left corner of the room',
    ...commented,
    `new_origin = np.array([${lit(origin.at[0])}, ${lit(origin.at[1])}])   # ${origin.name}`,
    '',
    unit === 'm'
      ? 'print(positions - new_origin)'
      : `print((positions - new_origin) / ${TILE})   # 1 tile = ${TILE} m`,
  ].join('\n')
}

/** The coordinates of the three things in the chosen frame (y up). */
export function understandRows(origin: Vec2, unit: Unit): Vec2[] {
  return THINGS.map((t) => toLocal(t.at, { origin, unit, yDir: 'up' }))
}

/** Exactly what NumPy prints for `understandCode`. */
export function understandOutput(origin: Vec2, unit: Unit): string {
  const integer =
    unit === 'm' && [...origin, ...THINGS.flatMap((t) => t.at)].every((x) => Number.isInteger(x))
  return npArray(understandRows(origin, unit), integer)
}

// ---------------------------------------------------------------- chessboard (step 5)

export const FILES = 'abcdefgh'

/** Square centre on the board (0…8 in both directions) → its name and its (column, row) numbers. */
export function chessSquare([x, y]: Vec2): { name: string; col: number; row: number } {
  const col = Math.min(8, Math.max(1, Math.floor(x) + 1))
  const row = Math.min(8, Math.max(1, Math.floor(y) + 1))
  return { name: `${FILES[col - 1]}${row}`, col, row }
}

/** Snaps a dragged piece to the centre of the nearest square. */
export function snapToSquare([x, y]: Vec2): Vec2 {
  const c = (v: number) => Math.min(7.5, Math.max(0.5, Math.floor(v) + 0.5))
  return [c(x), c(y)]
}

export const KNIGHT_START: Vec2 = [6.5, 0.5] // g1

// ---------------------------------------------------------------- cinema (step 5)

export const CINEMA = { rows: 6, seats: 10 }
export const ROW_LETTERS = 'ABCDEF'

/** Row letter and seat number → (seat, row) as numbers. Row A is nearest the screen. */
export function seatPair(row: number, seat: number): Vec2 {
  return [seat, row]
}

export const seatName = (row: number, seat: number) => `${ROW_LETTERS[row - 1]}${seat}`

// ---------------------------------------------------------------- fruit (step 5)

export type Fruit = { name: string; grams: number; sweet: number }

export const FRUITS: Fruit[] = [
  { name: 'lemon', grams: 100, sweet: 2 },
  { name: 'apple', grams: 180, sweet: 6 },
  { name: 'banana', grams: 120, sweet: 8 },
]

export const FRUIT_X: [number, number] = [0, 300]
export const FRUIT_Y: [number, number] = [0, 10]

export function snapFruit([g, s]: Vec2): Vec2 {
  const clamp = (v: number, [lo, hi]: [number, number]) => Math.min(hi, Math.max(lo, v))
  return [clamp(Math.round(g / 10) * 10, FRUIT_X), clamp(Math.round(s * 2) / 2, FRUIT_Y)]
}

/** The closest of the known fruits to a (weight, sweetness) point, measured on the chart. */
export function nearestFruit([g, s]: Vec2): Fruit {
  // Grams and sweetness have different scales; compare them as fractions of each axis.
  const d = (f: Fruit) => ((f.grams - g) / FRUIT_X[1]) ** 2 + ((f.sweet - s) / FRUIT_Y[1]) ** 2
  return FRUITS.reduce((best, f) => (d(f) < d(best) ? f : best))
}

// ---------------------------------------------------------------- practice (step 6)

/** A classroom, 9 m by 6 m, with a chair in it. */
export const CLASSROOM = { w: 9, h: 6 }
export const CHAIR: Vec2 = [6, 3.5]
export const BIN: Vec2 = [1, 5]
export const CHAIR_TARGET: Vec2 = [2, 1]
export const PRACTICE_ORIGIN: Vec2 = [0, 0]

/** A building wall 12 m wide and 12 m tall, with a 3 × 3 grid of windows. */
export const BUILDING = { w: 12, h: 12 }
export const WINDOWS: Vec2[] = [2, 6, 10].flatMap((y) => [2, 6, 10].map((x) => [x, y] as Vec2))
/** The marked window: top floor, right-hand side. */
export const TARGET_WINDOW: Vec2 = [10, 10]
/** Hover this far in front of the window. */
export const HOVER = 2
export type Vec3 = [number, number, number]
export const DRONE_START: Vec3 = [3, 1, 6]
export const DRONE_TARGET: Vec3 = [TARGET_WINDOW[0], TARGET_WINDOW[1], HOVER]

export const triple = ([x, y, z]: Vec3) => `(${fmt(x)}, ${fmt(y)}, ${fmt(z)})`

export const PLUM: Fruit = { name: 'plum', grams: 60, sweet: 5 }
export const MYSTERY_START: Vec2 = [250, 1]

export type PracticeState = { origin: Vec2; drone: Vec3; fruit: Vec2 }

const same = approxEqualVec

export const PRACTICE_CHECKS: Record<string, (s: PracticeState) => boolean> = {
  chair: (s) => same(toLocal(CHAIR, { origin: s.origin, unit: 'm', yDir: 'up' }), CHAIR_TARGET),
  drone: (s) => same(s.drone, DRONE_TARGET),
  plum: (s) => same(s.fruit, [PLUM.grams, PLUM.sweet]),
}

// ---------------------------------------------------------------- module recap

export type RecapItem = { q: string; a: string; slug: string }

export const RECAP: RecapItem[] = [
  {
    q: 'What is a dimension?',
    a: 'One independent direction you can move in, so one number you need. A line has 1, a flat page has 2, a room has 3.',
    slug: 'dimensions-and-origin',
  },
  {
    q: 'What are coordinates?',
    a: 'The list of numbers that says where a point is, one number per dimension, always in the same order: (x, y) or (x, y, z).',
    slug: 'coordinate-plane',
  },
  {
    q: 'What is an origin?',
    a: 'The agreed starting point, where every coordinate is 0. Every position is measured from it, and you are free to choose it.',
    slug: 'dimensions-and-origin',
  },
  {
    q: 'What is a coordinate plane?',
    a: 'A flat surface with two number lines (the x-axis and y-axis) crossing at the origin. Every point on it is a pair (x, y).',
    slug: 'coordinate-plane',
  },
  {
    q: 'What is 3D space, and what is a plane inside it?',
    a: 'Space where a position needs three numbers (x, y, z): width, height and depth. A plane inside it is a flat sheet, like the floor, where one number is fixed (on the floor, y = 0).',
    slug: '3d-space',
  },
  {
    q: 'What is the difference between a point and a vector?',
    a: 'A point is a place; a vector is a movement (how far and which way). (3, 2) can mean either: "the spot 3 right, 2 up" or "move 3 right, 2 up from wherever you are".',
    slug: 'points-and-vectors',
  },
  {
    q: 'How can a real-world position be written as numbers?',
    a: 'Choose an origin, directions for the axes and a unit. Then measure: the position is the list of distances along each axis. Change the choices and the numbers change, but the thing stays put.',
    slug: 'real-world-positions',
  },
]
