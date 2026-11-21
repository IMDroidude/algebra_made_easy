/**
 * The transformation gallery: four families of 2×2 matrices, each with one
 * parameter control. Pure data and maths only; the cards live in Gallery.tsx.
 */
import { asTyped2, fmt, fmtVec, isInteger, numpyMat2, numpyPrint } from '../../lib/format'
import { apply2, columns2, det2, isSingular2, rotation2 } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'

export type FamilyId = 'rotation' | 'scaling' | 'reflection' | 'shear'
export type MirrorId = 'x-axis' | 'y-axis' | 'diagonal' | 'antidiagonal'

export type GalleryParams = {
  /** rotation angle in degrees, counter-clockwise */
  theta: number
  sx: number
  sy: number
  mirror: MirrorId
  k: number
}

export const DEFAULT_PARAMS: GalleryParams = {
  theta: 30,
  sx: 2,
  sy: 0.5,
  mirror: 'x-axis',
  k: 1,
}

export const THETA_RANGE = { min: -180, max: 180, step: 15 }
export const SCALE_RANGE = { min: 0.25, max: 2, step: 0.25 }
export const SHEAR_RANGE = { min: -1.5, max: 1.5, step: 0.25 }

export type Mirror = {
  id: MirrorId
  label: string
  /** Two points on the mirror line, for drawing it. */
  line: [Vec2, Vec2]
  matrix: Mat2
}

export const MIRRORS: Mirror[] = [
  { id: 'x-axis', label: 'x-axis', line: [[-3, 0], [3, 0]], matrix: [[1, 0], [0, -1]] },
  { id: 'y-axis', label: 'y-axis', line: [[0, -3], [0, 3]], matrix: [[-1, 0], [0, 1]] },
  { id: 'diagonal', label: 'line y = x', line: [[-3, -3], [3, 3]], matrix: [[0, 1], [1, 0]] },
  {
    id: 'antidiagonal',
    label: 'line y = −x',
    line: [[-3, 3], [3, -3]],
    matrix: [[0, -1], [-1, 0]],
  },
]

export const mirrorById = (id: MirrorId): Mirror => MIRRORS.find((m) => m.id === id)!

/**
 * Rotation by θ degrees. Entries within 1e-12 of a whole number are rounded,
 * so a quarter turn reads [[0, −1], [1, 0]] instead of carrying 6e-17.
 */
export function rotationMatrix(theta: number): Mat2 {
  const clean = (x: number) => {
    const r = Math.round(x)
    return Math.abs(x - r) < 1e-12 ? r + 0 : x
  }
  const [[a, b], [c, d]] = rotation2(theta)
  return [
    [clean(a), clean(b)],
    [clean(c), clean(d)],
  ]
}

export const scalingMatrix = (sx: number, sy: number): Mat2 => [
  [sx, 0],
  [0, sy],
]

export const shearMatrix = (k: number): Mat2 => [
  [1, k],
  [0, 1],
]

export function familyMatrix(id: FamilyId, p: GalleryParams): Mat2 {
  switch (id) {
    case 'rotation':
      return rotationMatrix(p.theta)
    case 'scaling':
      return scalingMatrix(p.sx, p.sy)
    case 'reflection':
      return mirrorById(p.mirror).matrix
    case 'shear':
      return shearMatrix(p.k)
  }
}

export type Family = {
  id: FamilyId
  name: string
  /** The general matrix, in LaTeX. */
  general: string
  meaning: string
}

export const FAMILIES: Family[] = [
  {
    id: 'rotation',
    name: 'Rotation',
    general: String.raw`\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}`,
    meaning: 'Turns the whole plane about the origin by the angle θ.',
  },
  {
    id: 'scaling',
    name: 'Scaling',
    general: String.raw`\begin{bmatrix} s_x & 0 \\ 0 & s_y \end{bmatrix}`,
    meaning: 'Stretches or shrinks along the axes, by its own factor on each one.',
  },
  {
    id: 'reflection',
    name: 'Reflection',
    general: String.raw`\begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}`,
    meaning: 'Flips the plane across a mirror line through the origin.',
  },
  {
    id: 'shear',
    name: 'Shear',
    general: String.raw`\begin{bmatrix} 1 & k \\ 0 & 1 \end{bmatrix}`,
    meaning: 'Slides each point sideways by k times its height.',
  },
]

/** LaTeX for a concrete matrix, entries rounded like the rest of the lesson. */
export function matrixTex(m: Mat2): string {
  return String.raw`\begin{bmatrix} ${fmt(m[0][0])} & ${fmt(m[0][1])} \\ ${fmt(m[1][0])} & ${fmt(m[1][1])} \end{bmatrix}`
}

export const UNIT_SQUARE: Vec2[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
]

export const squareImage = (m: Mat2): Vec2[] => UNIT_SQUARE.map((q) => apply2(m, q))

/** One-line live description of a card, for its readout. */
export function describe(m: Mat2): string {
  const [i, j] = columns2(m)
  const det = det2(m)
  const area = isSingular2(m)
    ? 'The square is squashed flat (determinant 0).'
    : `Area × ${fmt(Math.abs(det))}${det < 0 ? ', flipped over' : ''} (determinant ${fmt(det)}).`
  return `î → ${fmtVec(i)}, ĵ → ${fmtVec(j)}. ${area}`
}

/** The NumPy code for "apply this matrix to the corners of the unit square", and its output. */
export function squareSnippet(m: Mat2): { code: string; output: string } {
  const typed = asTyped2(m)
  const corners = UNIT_SQUARE.map((q) => apply2(typed, q))
  const out = [corners.map((q) => q[0]), corners.map((q) => q[1])]
  const code = [
    'import numpy as np',
    '',
    numpyMat2('A', m),
    '# the corners of the unit square, one per column',
    'square = np.array([[0, 1, 1, 0],',
    '                   [0, 0, 1, 1]])',
    '',
    'print(A @ square)',
  ].join('\n')
  return { code, output: numpyPrint(out, isInteger(...typed.flat())) }
}
