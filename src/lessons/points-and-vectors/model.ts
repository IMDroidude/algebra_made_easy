/**
 * Numbers, wording and checks for lesson 1.4. Plain functions: no React.
 * All arithmetic goes through src/linalg.
 */
import { fmt, isInteger, numpyVec } from '../../lib/format'
import { npArray, npFloat } from '../../lib/numpy'
import type { Bounds } from '../../lib/snap'
import { add, approxEqualVec, isZero, norm, sub } from '../../linalg'
import type { Vec, Vec2 } from '../../linalg'

/** Turns −0 into 0 so nothing ever prints "-0". */
export const clean = <T extends Vec>(p: T): T => p.map((x) => x + 0) as T

// ---------- Step 1 · See ----------
export const CAFE: Vec2 = [3, 2]
/** Where the "walk 3 east, 2 north" arrow is drawn in step 1: deliberately not at the café. */
export const SEE_WALK_FROM: Vec2 = [-4, -3]
export const SEE_WALK: Vec2 = [3, 2]

// ---------- Step 2 · Manipulate ----------
export const MANIP_TAIL: Vec2 = [-4, -3]
export const MANIP_V: Vec2 = [3, 2]
export const MANIP_POINT: Vec2 = [2, 3]

// ---------- Step 3 · Predict ----------
export const HOME: Vec2 = [3, 1]
export const SHOP: Vec2 = [1, 3]

// ---------- Step 4 · Understand ----------
export const START_A: Vec2 = [-2, -1]
export const START_B: Vec2 = [1, 3]

/** A short 3D example, numbers only. */
export const A3: [number, number, number] = [1, 2, 0]
export const B3: [number, number, number] = [4, 6, 2]
/** The movement from A3 to B3. */
export const V3 = clean(sub(B3, A3))

// ---------- Step 5 · Apply ----------
export const DEPOT: Vec2 = [-4, -4]
export const ROBOT_MOVES: Vec2[] = [
  [3, 1],
  [1, 3],
  [-2, 2],
]

/** A tiny model with three weights, and one training update. */
export const WEIGHTS = [0.5, -1.2, 0.3]
export const UPDATE = [0.02, -0.01, 0.03]

// ---------- Step 6 · Practice ----------
export const PRACTICE_A: Vec2 = [-3, 2]
export const PRACTICE_B: Vec2 = [-1, 3]
export const TRIP_GOAL: Vec2 = [-2, 3]
export const MOVE_M: Vec2 = [4, -1]
export const FLAG: Vec2 = [1, -2]

/** "3 east, 2 north", the way you would give directions. */
export function directions([x, y]: Vec2): string {
  const part = (n: number, pos: string, neg: string) =>
    `${fmt(Math.abs(n))} ${n < 0 ? neg : pos}`
  if (approxEqualVec([x, y], [0, 0])) return 'stay where you are'
  if (approxEqualVec([y], [0])) return part(x, 'east', 'west')
  if (approxEqualVec([x], [0])) return part(y, 'north', 'south')
  return `${part(x, 'east', 'west')}, ${part(y, 'north', 'south')}`
}

/** The vector from A to B: B − A. */
export const vectorFrom = (a: Vec2, b: Vec2): Vec2 => clean(sub(b, a))

/** Where a movement v takes you if you start at point p. */
export const moveBy = (p: Vec2, v: Vec2): Vec2 => clean(add(p, v))

/** How far a movement goes in a straight line (the arrow's length). */
export const howFar = (v: Vec): number => norm(v)

/** True when the length is a whole number, so it can be read off by counting. */
export const isWholeLength = (v: Vec): boolean => approxEqualVec([howFar(v)], [Math.round(howFar(v))])

/**
 * Which side of an arrow along v its label should sit on: the side facing up
 * (or west for a straight-up arrow), so the text never sits on the line.
 */
export function labelSide([dx, dy]: Vec2): 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' {
  const len = Math.hypot(dx, dy)
  if (isZero(len)) return 'n'
  let nx = -dy / len
  let ny = dx / len
  if (ny < 0 || (approxEqualVec([ny], [0]) && nx > 0)) [nx, ny] = [-nx, -ny]
  const v = ny > 0.38 ? 'n' : ''
  const h = nx > 0.38 ? 'e' : nx < -0.38 ? 'w' : ''
  return (v + h || 'n') as 'n' | 'e' | 'w' | 'ne' | 'nw'
}

/** Positions of a robot after each move, starting with the start itself. */
export function route(start: Vec2, moves: Vec2[]): Vec2[] {
  const out: Vec2[] = [start]
  for (const m of moves) out.push(moveBy(out[out.length - 1], m))
  return out
}

/**
 * Keeps a start point where every `offset` from it (for example the tip of
 * the arrow drawn from it) still lands on the visible plane, on the `step` grid.
 */
export function clampStart(p: Vec2, offsets: Vec2[], bounds: Bounds | null, step = 0.5): Vec2 {
  const snapped: Vec2 = [Math.round(p[0] / step) * step, Math.round(p[1] / step) * step]
  if (!bounds) return clean(snapped)
  const all = [[0, 0] as Vec2, ...offsets]
  const fit = (value: number, axis: 0 | 1) => {
    const range = axis === 0 ? bounds.x : bounds.y
    const lo = Math.ceil(range[0] / step) * step - Math.min(...all.map((o) => o[axis]))
    const hi = Math.floor(range[1] / step) * step - Math.max(...all.map((o) => o[axis]))
    if (lo > hi) return value
    return Math.max(lo, Math.min(hi, value))
  }
  return clean([fit(snapped[0], 0), fit(snapped[1], 1)])
}

/** The step 4 NumPy code: B − A and A + v. */
export function understandCode(a: Vec2, b: Vec2): string {
  return [
    'import numpy as np',
    '',
    numpyVec('A', a),
    numpyVec('B', b),
    '',
    'v = B - A        # the move from A to B',
    'print(v)',
    'print(A + v)     # start at A, move by v',
    'print(np.linalg.norm(v))  # how far',
  ].join('\n')
}

/** What real NumPy prints for `understandCode`. */
export function understandOutput(a: Vec2, b: Vec2): string {
  const integer = isInteger(...a, ...b)
  const v = vectorFrom(a, b)
  return [npArray(v, integer), npArray(moveBy(a, v), integer), npFloat(howFar(v))].join('\n')
}

/** Weights after one update: point + vector = new point. */
export const updatedWeights = (): number[] => add(WEIGHTS, UPDATE)

export type PracticeState = { a: Vec2; b: Vec2 }

/** Which practice challenges the current state satisfies. */
export function solvedChallenges({ a, b }: PracticeState): string[] {
  const out: string[] = []
  if (approxEqualVec(vectorFrom(a, b), TRIP_GOAL)) out.push('trip')
  if (approxEqualVec(moveBy(a, MOVE_M), FLAG)) out.push('flag')
  if (approxEqualVec(a, b)) out.push('zero')
  return out
}
