import { fmt, isInteger, numpyVec } from '../../lib/format'
import { npArray, npFloat, npRound } from '../../lib/numpy'
import { add, apply2, rotation2 } from '../../linalg'
import { coordsAlong, principalAngleDeg, totalVariance, variance } from '../../linalg/pca'
import type { Vec2 } from '../../linalg'

export type Mode = 'rotate' | 'scale' | 'translate' | 'project'

export const MODES: { id: Mode; label: string }[] = [
  { id: 'rotate', label: 'Rotate' },
  { id: 'scale', label: 'Scale' },
  { id: 'translate', label: 'Translate' },
  { id: 'project', label: 'Project' },
]

/** The corners of a small spaceship sprite, pointing right. */
export const SHIP: Vec2[] = [[1, 0], [3, 1], [1, 2], [1.5, 1]]
/** The corner the equations follow: the nose of the ship. */
export const NOSE: Vec2 = [3, 1]

/**
 * Six people as [height, weight], each measured as the difference from the
 * group average (so the points are centred on the origin). Invented numbers.
 */
export const PEOPLE: Vec2[] = [[-3, -2], [-2, -1.5], [-1, -1], [1, 0.5], [2, 2], [3, 2]]

export type Settings = {
  /** rotation, degrees counter-clockwise */
  angle: number
  /** stretch factors for x and y */
  sx: number
  sy: number
  /** the move added to every point */
  tx: number
  ty: number
  /** angle of the line the people are projected onto */
  line: number
}

export const START: Settings = { angle: 90, sx: 1.5, sy: 0.5, tx: 2, ty: -1, line: 0 }

/** Where a point of the ship goes under the chosen transformation. */
export function transformPoint(mode: Exclude<Mode, 'project'>, s: Settings, p: Vec2): Vec2 {
  if (mode === 'rotate') return apply2(rotation2(s.angle), p)
  if (mode === 'scale') return [s.sx * p[0], s.sy * p[1]]
  return add(p, [s.tx, s.ty])
}

export type Projection = {
  /** one number per person: where their shadow falls along the line */
  coords: number[]
  /** spread of the shadows */
  kept: number
  /** spread of the original points */
  total: number
  /** kept / total, in percent */
  percent: number
}

export function projection(line: number): Projection {
  const coords = coordsAlong(PEOPLE, line)
  const kept = variance(coords)
  const total = totalVariance(PEOPLE)
  return { coords, kept, total, percent: (kept / total) * 100 }
}

/** The line PCA would choose for the six people, and how much spread it keeps. */
export const BEST_LINE = principalAngleDeg(PEOPLE)
export const BEST = projection(BEST_LINE)

const pairs = (people: Vec2[]) => people.map((p) => `[${p.join(', ')}]`).join(', ')
const PEOPLE_LITERAL = `X = np.array([${pairs(PEOPLE.slice(0, 3))},\n              ${pairs(PEOPLE.slice(3))}])`

export function transformCode(mode: Mode, s: Settings): string {
  const head = ['import numpy as np', '']
  const nose = `${numpyVec('p', NOSE)}  # the nose of the ship`
  if (mode === 'rotate')
    return [
      ...head,
      nose,
      `t = np.radians(${fmt(s.angle)})`,
      'R = np.array([[np.cos(t), -np.sin(t)],',
      '              [np.sin(t),  np.cos(t)]])',
      'print((R @ p).round(2))',
    ].join('\n')
  if (mode === 'scale')
    return [...head, nose, `${numpyVec('s', [s.sx, s.sy])}      # one factor per entry`, 'print(s * p)'].join('\n')
  if (mode === 'translate')
    return [...head, nose, `${numpyVec('t', [s.tx, s.ty])}          # the move`, 'print(p + t)'].join('\n')
  return [
    ...head,
    '# six people: [height, weight] minus the group average',
    PEOPLE_LITERAL,
    `a = np.radians(${fmt(s.line)})`,
    'd = np.array([np.cos(a), np.sin(a)])  # unit vector',
    'coords = X @ d                        # one per person',
    'print(coords.round(2))',
    'print(coords.var().round(2))',
  ].join('\n')
}

/** What the snippet for this mode prints in real NumPy. */
export function transformOutput(mode: Mode, s: Settings): string {
  if (mode === 'rotate')
    return npArray(transformPoint('rotate', s, NOSE).map((x) => npRound(x, 2)), false)
  if (mode === 'scale') return npArray(transformPoint('scale', s, NOSE), isInteger(s.sx, s.sy))
  if (mode === 'translate') return npArray(transformPoint('translate', s, NOSE), isInteger(s.tx, s.ty))
  const { coords, kept } = projection(s.line)
  return [npArray(coords.map((x) => npRound(x, 2)), false), npFloat(npRound(kept, 2))].join('\n')
}
