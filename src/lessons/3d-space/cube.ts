import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { CORNER_VIEW, FRONT_VIEW, SIDE_VIEW, TOP_VIEW, sameView } from '../../linalg/project3d'
import type { Vec3, View, Wall } from '../../linalg/project3d'

/** Colours of the three axes. Each axis also carries its letter, so colour is not the only cue. */
export const AXIS_COLOR = { x: COLOR.i, y: COLOR.j, z: COLOR.result } as const

/** Length of the cube's edges; coordinates inside the cube run from 0 to SIZE. */
export const SIZE = 5

export const coord3Text = ([x, y, z]: Vec3) => `(${fmt(x)}, ${fmt(y)}, ${fmt(z)})`

export const WALL_NAME: Record<Wall, string> = {
  xy: 'back wall (xy)',
  yz: 'side wall (yz)',
  xz: 'floor (xz)',
}

/** Words for the current view, for the live readout. */
export function describeView(view: View): string {
  if (sameView(view, FRONT_VIEW)) return 'Front view: looking straight at the back wall (xy); z points at you.'
  if (sameView(view, SIDE_VIEW)) return 'Side view: looking straight at the side wall (yz); x points at you.'
  if (sameView(view, TOP_VIEW)) return 'Top view: looking straight down at the floor (xz); y points at you.'
  if (sameView(view, CORNER_VIEW)) return 'Corner view: all three axes visible.'
  return `Turned ${fmt(view.yaw, 0)}°, tilted ${fmt(view.pitch, 0)}°.`
}

/** The point in the prediction question. */
export const Q: Vec3 = [3, 2, 4]

/** Multiplying by these keeps two coordinates and sets the third to 0. */
export const WALL_MASK: Record<Wall, Vec3> = {
  xy: [1, 1, 0],
  yz: [0, 1, 1],
  xz: [1, 0, 1],
}
