import { fmt } from '../../lib/format'
import { approxEqual, isZero } from '../../linalg'
import type { Vec3 } from '../../linalg/project3d'

export type Axis = 'x' | 'y' | 'z'
export const AXES: Axis[] = ['x', 'y', 'z']

/**
 * Physical names for the three directions, matching the convention used
 * everywhere on the site: x to the right, y up, z toward the viewer.
 */
export const AXIS_INFO: Record<Axis, { name: string; ends: string; plus: string; minus: string }> = {
  x: { name: 'width', ends: 'left / right', plus: 'right', minus: 'left' },
  y: { name: 'height', ends: 'down / up', plus: 'up', minus: 'down' },
  z: { name: 'depth', ends: 'back / front', plus: 'forward', minus: 'back' },
}

const index: Record<Axis, number> = { x: 0, y: 1, z: 2 }

/** Short label for one leg of the walk, drawn in the room: "4 right", "2 up", "1 forward". */
export function legLabel(axis: Axis, v: number): string {
  if (isZero(v)) return `${axis}: stay put`
  const info = AXIS_INFO[axis]
  return `${fmt(Math.abs(v))} ${v > 0 ? info.plus : info.minus}`
}

/** One line of "How to reach this point", in words. */
export function walkStep(axis: Axis, v: number): string {
  const a = fmt(Math.abs(v))
  if (isZero(v)) return `Stay put along ${axis}: the ${AXIS_INFO[axis].name} is 0.`
  if (axis === 'x') return `Move ${a} ${v > 0 ? 'right' : 'left'} along the width (x).`
  if (axis === 'y') return `Move ${a} ${v > 0 ? 'up' : 'down'} (y).`
  return v > 0 ? `Move ${a} forward, toward you (z).` : `Move ${a} back, away from you (z).`
}

/** The three steps from the corner (0, 0, 0) to the point, always in the order x, y, z. */
export function walkSteps(p: Vec3): string[] {
  return AXES.map((a) => walkStep(a, p[index[a]]))
}

/** The three legs as segments: along x, then up y, then forward z. */
export function walkLegs([x, y, z]: Vec3): { axis: Axis; from: Vec3; to: Vec3; label: string }[] {
  return [
    { axis: 'x', from: [0, 0, 0], to: [x, 0, 0], label: legLabel('x', x) },
    { axis: 'y', from: [x, 0, 0], to: [x, y, 0], label: legLabel('y', y) },
    { axis: 'z', from: [x, y, 0], to: [x, y, z], label: legLabel('z', z) },
  ]
}

/** Where the preset buttons in step 2 put the point. */
export const START: Vec3 = [2, 3, 1]
export const ORIGIN: Vec3 = [0, 0, 0]
export const EQUAL: Vec3 = [3, 3, 3]

/** A sentence for the two special kinds of point the presets show; null otherwise. */
export function pointNote([x, y, z]: Vec3): string | null {
  if (isZero(x) && isZero(y) && isZero(z)) {
    return 'This is the origin, the corner where the three walls meet. No walking at all: every number is 0.'
  }
  if (approxEqual(x, y) && approxEqual(y, z)) {
    return `All three numbers are ${fmt(x)}: the same distance right, up and forward. Points like this sit on the diagonal that runs from the corner straight through the middle of the room.`
  }
  return null
}
