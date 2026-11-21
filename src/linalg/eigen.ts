/**
 * Eigenvalues and eigenvectors of 2×2 matrices, in closed form, plus the
 * covariance / PCA helpers built on them.
 *
 * A real 2×2 matrix falls into exactly one of four cases, and the result says
 * which one explicitly instead of returning NaN:
 *  - 'distinct'  two different real eigenvalues, each with its own line
 *  - 'scalar'    A = λI: every direction is an eigenvector
 *  - 'defective' one repeated eigenvalue with only one line (a shear)
 *  - 'complex'   no real eigenvalues, so no real eigenvectors (a rotation)
 */
import { isZero } from './tolerance'
import { apply2 } from './matrix'
import { dot, norm } from './vector'
import type { Mat2, Vec2 } from './types'

export type EigenPair = { value: number; vector: Vec2 }

export type Eigen2 =
  | { kind: 'distinct'; pairs: [EigenPair, EigenPair] }
  | { kind: 'scalar'; value: number }
  | { kind: 'defective'; value: number; vector: Vec2 }
  | { kind: 'complex'; re: number; im: number }

/** Trace, determinant and discriminant of λ² − (trace)λ + det = 0. */
export function characteristic2(m: Mat2) {
  const [[a, b], [c, d]] = m
  const trace = a + d
  const det = a * d - b * c
  return { trace, det, disc: trace * trace - 4 * det }
}

/** A unit vector with x > 0, or pointing up if it is vertical. Picks one of ±v. */
export function canonicalDirection(v: Vec2): Vec2 {
  const n = norm(v)
  const u: Vec2 = [v[0] / n, v[1] / n]
  const flip = isZero(u[0]) ? u[1] < 0 : u[0] < 0
  return flip ? [-u[0] + 0, -u[1] + 0] : [u[0] + 0, u[1] + 0]
}

/** A unit vector v with Mv ≈ 0, for a 2×2 matrix M that is singular but not zero. */
export function nullDirection2(m: Mat2): Vec2 {
  const [[a, b], [c, d]] = m
  // Each row r gives a vector perpendicular to it: (−r₂, r₁). Use the longer row.
  const row: Vec2 = Math.hypot(a, b) >= Math.hypot(c, d) ? [a, b] : [c, d]
  return canonicalDirection([-row[1], row[0]])
}

/** Eigen-decomposition of a real 2×2 matrix. Eigenvalues come largest first. */
export function eigen2(m: Mat2): Eigen2 {
  const { trace, disc } = characteristic2(m)
  const scale = Math.max(1, ...m.flat().map(Math.abs))
  // The discriminant has units of entry², so compare it against scale².
  if (isZero(disc / (scale * scale))) {
    const value = trace / 2
    const shifted: Mat2 = [
      [m[0][0] - value, m[0][1]],
      [m[1][0], m[1][1] - value],
    ]
    if (shifted.flat().every((x) => isZero(x / scale))) return { kind: 'scalar', value }
    return { kind: 'defective', value, vector: nullDirection2(shifted) }
  }
  if (disc < 0) return { kind: 'complex', re: trace / 2, im: Math.sqrt(-disc) / 2 }
  const root = Math.sqrt(disc)
  const values = [(trace + root) / 2, (trace - root) / 2]
  const pairs = values.map((value) => ({
    value,
    vector: nullDirection2([
      [m[0][0] - value, m[0][1]],
      [m[1][0], m[1][1] - value],
    ]),
  })) as [EigenPair, EigenPair]
  return { kind: 'distinct', pairs }
}

/** Every real eigen line of the matrix (empty for 'complex', none listed for 'scalar'). */
export function eigenPairs(e: Eigen2): EigenPair[] {
  if (e.kind === 'distinct') return e.pairs
  if (e.kind === 'defective') return [{ value: e.value, vector: e.vector }]
  return []
}

/** The unit vector at an angle in degrees, counter-clockwise from the x-axis. */
export function unitAt(degrees: number): Vec2 {
  const r = (degrees * Math.PI) / 180
  return [Math.cos(r), Math.sin(r)]
}

/** Angle of a direction in [0, 360). */
export function angleOf(v: Vec2): number {
  const deg = (Math.atan2(v[1], v[0]) * 180) / Math.PI
  return ((deg % 360) + 360) % 360
}

/**
 * How A treats one vector v: whether Av stays on v's line, and by how much it
 * is stretched along it (the eigenvalue) or turned off it.
 */
export function lineTest(m: Mat2, v: Vec2) {
  const Av = apply2(m, v)
  const n = norm(v)
  // Signed angle from v to Av, folded onto a line: 0 means "same line".
  const cross = v[0] * Av[1] - v[1] * Av[0]
  const crossUnit = cross / (n * Math.max(norm(Av), 1e-12))
  const collapsed = isZero(norm(Av) / n)
  const kept = collapsed || Math.abs(crossUnit) < 1e-4
  const factor = dot(v, Av) / (n * n)
  const turnDeg = collapsed ? 0 : (Math.asin(Math.min(1, Math.abs(crossUnit))) * 180) / Math.PI
  return { Av, kept, factor: kept ? factor : null, offLineDeg: kept ? 0 : turnDeg, collapsed }
}

/**
 * Angles (degrees, both directions of each line) where A keeps a vector on its
 * line. For 'scalar' every angle qualifies, so none are listed.
 */
export function eigenAngles(e: Eigen2): number[] {
  return eigenPairs(e).flatMap(({ vector }) => {
    const a = angleOf(vector)
    return [a, (a + 180) % 360]
  })
}

/** Distance between two angles in degrees, going the short way round. */
export function angleGap(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360)
  return Math.min(d, 360 - d)
}

/** If an eigen direction is within `tolerance` degrees, return its exact angle. */
export function snapToEigenAngle(e: Eigen2, degrees: number, tolerance = 2): number {
  const hit = eigenAngles(e).find((a) => angleGap(a, degrees) <= tolerance)
  return hit ?? degrees
}

/** The next eigen direction counter-clockwise from `degrees` (strictly after it), or null. */
export function nextEigenAngle(e: Eigen2, degrees: number): number | null {
  const angles = eigenAngles(e)
  if (angles.length === 0) return null
  const ahead = (a: number) => {
    const d = (((a - degrees) % 360) + 360) % 360
    return d < 1e-6 ? 360 : d
  }
  return angles.reduce((best, a) => (ahead(a) < ahead(best) ? a : best))
}

// ---------------------------------------------------------------- PCA

/** Column means of a list of 2D points. */
export function mean2(points: Vec2[]): Vec2 {
  const n = points.length
  return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n]
}

/** Subtract the mean so the cloud sits around the origin. */
export function centre2(points: Vec2[]): Vec2[] {
  const [mx, my] = mean2(points)
  return points.map(([x, y]) => [x - mx, y - my])
}

/**
 * Sample covariance matrix of 2D points: Xcᵀ Xc / (n − 1), with Xc the centred
 * data (one point per row). Same as NumPy's np.cov(X.T).
 */
export function covariance2(points: Vec2[]): Mat2 {
  const c = centre2(points)
  const n = points.length
  const sum = (f: (p: Vec2) => number) => c.reduce((s, p) => s + f(p), 0)
  const xx = sum((p) => p[0] * p[0]) / (n - 1)
  const xy = sum((p) => p[0] * p[1]) / (n - 1)
  const yy = sum((p) => p[1] * p[1]) / (n - 1)
  return [
    [xx, xy],
    [xy, yy],
  ]
}

export type Pca2 = {
  mean: Vec2
  centred: Vec2[]
  covariance: Mat2
  /** Principal directions, largest variance first. Each value is the variance along its vector. */
  components: [EigenPair, EigenPair]
  /** True when the cloud has the same spread in every direction, so no direction is preferred. */
  isotropic: boolean
}

/**
 * Principal component analysis in 2D: centre, build the covariance matrix,
 * take its eigenvectors. A covariance matrix is symmetric, so its eigenvalues
 * are real, and never negative, and its eigenvectors are perpendicular.
 */
export function pca2(points: Vec2[]): Pca2 {
  const covariance = covariance2(points)
  const e = eigen2(covariance)
  const clamp = (x: number) => (isZero(x) ? 0 : x)
  let components: [EigenPair, EigenPair]
  if (e.kind === 'distinct') {
    components = [
      { value: clamp(e.pairs[0].value), vector: e.pairs[0].vector },
      { value: clamp(e.pairs[1].value), vector: e.pairs[1].vector },
    ]
  } else {
    // Symmetric matrices are never 'complex' or 'defective': the only other case is λI.
    const value = clamp(e.kind === 'scalar' ? e.value : covariance[0][0])
    components = [
      { value, vector: [1, 0] },
      { value, vector: [0, 1] },
    ]
  }
  return {
    mean: mean2(points),
    centred: centre2(points),
    covariance,
    components,
    isotropic: e.kind !== 'distinct',
  }
}

/** Projection of a point onto the line through the origin along a unit vector. */
export function projectOnto(p: Vec2, unit: Vec2): Vec2 {
  const t = dot(p, unit)
  return [t * unit[0], t * unit[1]]
}

/** A small seeded random generator (mulberry32), so generated data is repeatable. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A stretched, tilted cloud of `n` points on a 0.25 grid (so all arithmetic on
 * it is exact). `seed` picks the cloud.
 */
export function makeCloud(seed: number, n = 16): Vec2[] {
  const rand = seededRandom(seed)
  const normal = () => {
    // Box–Muller
    const u = Math.max(rand(), 1e-9)
    const v = rand()
    // Clipped at 1.8 standard deviations so no point lands far off on its own.
    return Math.max(-1.8, Math.min(1.8, Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)))
  }
  const angle = (rand() * 160 + 10) * (Math.PI / 180)
  const long = 2.1 + rand() * 0.5
  const short = 0.3 + rand() * 0.3
  const centre: Vec2 = [rand() * 2.5 - 1, rand() * 2.5 - 1]
  const q = (x: number) => Math.max(-4.75, Math.min(4.75, Math.round(x * 4) / 4)) + 0
  return Array.from({ length: n }, () => {
    const a = normal() * long
    const b = normal() * short
    return [
      q(centre[0] + a * Math.cos(angle) - b * Math.sin(angle)),
      q(centre[1] + a * Math.sin(angle) + b * Math.cos(angle)),
    ] as Vec2
  })
}
