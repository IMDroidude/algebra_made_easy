/**
 * Maths and NumPy text for the determinant lesson. Plain functions only.
 */
import { fmt, fmtDet } from '../../lib/format'
import { det2, isZero } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'

/**
 * fmtDet, except that a small determinant that is not treated as zero (such as
 * 0.001) is shown with enough digits instead of being rounded to a bare "0".
 */
export function detText(d: number): string {
  const shown = fmtDet(d)
  return shown === '0' && !isZero(d) ? fmt(d, 6) : shown
}

export type Collapse = 'none' | 'line' | 'point'

/** What the matrix does to area: keeps it (possibly scaled), flattens to a line, or to a point. */
export function collapseKind(m: Mat2): Collapse {
  if (!isZero(det2(m))) return 'none'
  return m.flat().every((x) => isZero(x)) ? 'point' : 'line'
}

export type Orientation = 'kept' | 'flipped' | 'collapsed'

/** Sign of the determinant, read as orientation: kept (det > 0), flipped (det < 0), or collapsed. */
export function orientation(m: Mat2): Orientation {
  const d = det2(m)
  if (isZero(d)) return 'collapsed'
  return d > 0 ? 'kept' : 'flipped'
}

/** Round every entry the way it is displayed, so pictures, maths and code use the same numbers. */
export function asShown(m: Mat2): Mat2 {
  const r = (x: number) => Number(fmt(x))
  return [
    [r(m[0][0]), r(m[0][1])],
    [r(m[1][0]), r(m[1][1])],
  ]
}

/**
 * A direction that a singular, non-zero matrix sends to (0, 0): moving an input
 * along it does not change the output. Null when the matrix is invertible or all
 * zeros. Taken from the first non-zero row (a, b) as (−b, a), so it stays an
 * integer vector when the entries are integers.
 */
export function nullDirection(m: Mat2): Vec2 | null {
  if (collapseKind(m) !== 'line') return null
  const [[a, b], [c, d]] = m
  return isZero(a) && isZero(b) ? [-d, c] : [-b, a]
}

/** Direction of the line the plane collapses onto (a non-zero column). Null unless collapsed to a line. */
export function imageDirection(m: Mat2): Vec2 | null {
  if (collapseKind(m) !== 'line') return null
  const [[a, b], [c, d]] = m
  return isZero(a) && isZero(c) ? [b, d] : [a, c]
}

/**
 * The pieces of the "box" picture of ad − bc, for a ≥ 0, b ≥ 0, c ≥ 0, d ≥ 0
 * with det > 0: the (a + b) × (c + d) box minus two b·c rectangles, two a·c/2
 * triangles and two b·d/2 triangles leaves the parallelogram, area ad − bc.
 */
export function boxPieces(m: Mat2) {
  const [[a, b], [c, d]] = m
  const box = (a + b) * (c + d)
  const rect = b * c
  const triAC = (a * c) / 2
  const triBD = (b * d) / 2
  return { box, rect, triAC, triBD, rest: box - 2 * rect - 2 * triAC - 2 * triBD }
}

/** Whether the box picture applies: all entries ≥ 0 and det > 0 (ĵ counter-clockwise of î). */
export function boxPictureFits(m: Mat2): boolean {
  return m.flat().every((x) => x >= 0) && det2(m) > 0 && !isZero(det2(m))
}

/** Corner points of the box picture's regions, for drawing. */
export function boxRegions(m: Mat2): { rects: Vec2[][]; triangles: Vec2[][] } {
  const [[a, b], [c, d]] = m
  const w = a + b
  const h = c + d
  return {
    rects: [
      [[a, 0], [w, 0], [w, c], [a, c]],
      [[0, d], [b, d], [b, h], [0, h]],
    ],
    triangles: [
      [[0, 0], [a, 0], [a, c]],
      [[a, c], [w, c], [w, h]],
      [[b, d], [w, h], [b, h]],
      [[0, 0], [b, d], [0, d]],
    ],
  }
}

/**
 * How Python prints a float (its shortest round-trip repr): 5.0, -0.0,
 * 0.30000000000000004, 1e-05. Integer-valued floats keep a ".0".
 */
export function pyFloat(x: number): string {
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0'
  const [mantissa, expText] = x.toExponential().split('e')
  const exp = Number(expText)
  if (exp < -4 || exp >= 16) {
    const sign = exp < 0 ? '-' : '+'
    return `${mantissa}e${sign}${String(Math.abs(exp)).padStart(2, '0')}`
  }
  const s = String(x)
  return s.includes('.') ? s : `${s}.0`
}

/**
 * What NumPy prints for A[0, 0] * A[1, 1] - A[0, 1] * A[1, 0] on the given
 * matrix: an integer when every entry is an integer, otherwise a float.
 */
export function numpyDetFormula(m: Mat2): string {
  const integer = m.flat().every((x) => Number.isInteger(x))
  const d = m[0][0] * m[1][1] - m[0][1] * m[1][0]
  return integer ? String(d === 0 ? 0 : d) : pyFloat(d)
}

/** One plain-English sentence for what the matrix does to area and orientation. */
export function describeDet(m: Mat2): string {
  const d = det2(m)
  switch (collapseKind(m)) {
    case 'point':
      return 'Every point lands on the origin: the plane has collapsed to a single point and all area is gone.'
    case 'line':
      return 'î and ĵ lie on one line, so the square is flattened into a line segment: its area is 0 and the F has vanished into a line.'
    default:
      return d > 0
        ? `The square's area is multiplied by ${detText(d)}. Going from î to ĵ is still counter-clockwise, so the F reads the normal way round.`
        : `The square's area is multiplied by ${detText(-d)}, and the plane has been flipped over: going from î to ĵ is now clockwise, and the F reads backwards, like a mirror image.`
  }
}

/**
 * A second input that the matrix sends to the same output as x, or null when
 * the matrix is invertible (then no two inputs share an output).
 */
export function sameOutputPartner(m: Mat2, x: Vec2): Vec2 | null {
  const kind = collapseKind(m)
  if (kind === 'none') return null
  const n: Vec2 = kind === 'point' ? [1, 1] : (nullDirection(m) as Vec2)
  return [x[0] + n[0], x[1] + n[1]]
}
