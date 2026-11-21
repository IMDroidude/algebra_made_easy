import { approxEqualVec } from '../../linalg'
import type { Vec2 } from '../../linalg'

/** At most this many pinned points (A to H): enough for a shape, few enough to stay readable. */
export const MAX_PINS = 8

export const pinName = (i: number) => String.fromCharCode(65 + i)

/** Adds p to the pinned points unless it is already pinned or the list is full. */
export function addPin(pins: Vec2[], p: Vec2): Vec2[] {
  if (pins.length >= MAX_PINS || pins.some((q) => approxEqualVec(q, p))) return pins
  return [...pins, p]
}
