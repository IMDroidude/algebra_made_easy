import type { Plane3, Vec3, View } from '../../linalg/project3d'

export type PlaneId = 'floor' | 'wall' | 'tilted'

export type PlaneInfo = {
  name: string
  /** The plane's rule, as text: every point that obeys it is on the plane. */
  rule: string
  plane: Plane3
  /** Words for the two sides: the side the normal points to, then the other. */
  sides: [string, string]
  /** What each side means in coordinates. */
  sideRules: [string, string]
  /** One example point on each side, in the same order. */
  examples: [Vec3, Vec3]
}

/** The three planes in the "planes inside the room" section. */
export const PLANES: Record<PlaneId, PlaneInfo> = {
  floor: {
    name: 'Floor',
    rule: 'y = 0',
    plane: { normal: [0, 1, 0], d: 0 },
    sides: ['above the floor', 'below the floor'],
    sideRules: ['y > 0', 'y < 0'],
    examples: [
      [3, 2.5, 2],
      [2, -1.5, 3],
    ],
  },
  wall: {
    name: 'Back wall',
    rule: 'z = 0',
    plane: { normal: [0, 0, 1], d: 0 },
    sides: ['in front of the wall', 'behind the wall'],
    sideRules: ['z > 0', 'z < 0'],
    examples: [
      [3, 2, 3],
      [2, 3, -1.5],
    ],
  },
  tilted: {
    name: 'Tilted sheet',
    rule: 'y = z',
    plane: { normal: [0, 1, -1], d: 0 },
    sides: ['above the sheet', 'below the sheet'],
    sideRules: ['y > z', 'y < z'],
    examples: [
      [1, 4, 1.5],
      [4, 1, 3.5],
    ],
  },
}

export const PLANE_ORDER: PlaneId[] = ['floor', 'wall', 'tilted']

/**
 * The teaser: a tilted sheet x + y − z = 2.5 with a group on each side. From
 * `SPLIT_VIEW` it is seen at a slant, with the two groups on either side.
 */
export const SPLIT_PLANE: Plane3 = { normal: [1, 1, -1], d: 2.5 }
export const SPLIT_RULE = 'x + y − z = 2.5'
/** A spot on the sheet, on the room's top front edge, for its name. */
export const SPLIT_LABEL_AT: Vec3 = [2.5, 5, 5]
/** Turning a little further round than the corner view shows the sheet at a clear slant. */
export const SPLIT_VIEW: View = { yaw: -60, pitch: 22 }

/** Colours for the two sides of a plane (and the two groups). Each also has a letter. */
export const SIDE_COLOR = { a: '#d6336c', b: '#a67c00' } as const

/** Colour of the plane itself; distinct from the three axis colours. */
export const PLANE_COLOR = '#4c6ef5'

export const GROUPS: { name: string; at: Vec3 }[] = [
  { name: 'A1', at: [4, 3, 1] },
  { name: 'A2', at: [3, 4, 2] },
  { name: 'A3', at: [5, 2, 2] },
  { name: 'A4', at: [5, 4, 1] },
  { name: 'A5', at: [3, 2, 0.5] },
  { name: 'B1', at: [1, 1, 2] },
  { name: 'B2', at: [1, 3, 4] },
  { name: 'B3', at: [2, 1, 3] },
  { name: 'B4', at: [0.5, 1, 3] },
  { name: 'B5', at: [1.5, 2, 4.5] },
]

/** A plane written as a relationship among three quantities: a·x + b·y + c·z = d. */
export const RELATION = { a: 2, b: 3, c: 1, d: 10 } as const
/** A point that satisfies the relationship, and one that does not. */
export const RELATION_ON: Vec3 = [1, 2, 2]
export const RELATION_OFF: Vec3 = [1, 1, 1]

/** a·x + b·y + c·z for a point: equal to d exactly when the point is on the plane. */
export const relationValue = ([x, y, z]: Vec3) => RELATION.a * x + RELATION.b * y + RELATION.c * z

/** "2·1 + 3·2 + 2" for a point. */
export const relationSum = ([x, y, z]: Vec3) => `${RELATION.a}·${x} + ${RELATION.b}·${y} + ${z}`
