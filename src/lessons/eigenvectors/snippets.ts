/**
 * The NumPy code shown in this lesson and the exact text NumPy prints for it.
 * The outputs repeat NumPy's arithmetic step by step (same operations, same
 * order) so they match bit for bit; tests compare them with real NumPy.
 */
import { fmt } from '../../lib/format'
import { covariance2 } from '../../linalg/eigen'
import type { Mat2, Vec2 } from '../../linalg'
import { npComplexArray, npFloatArray, npFloatMatrix, npRound } from './numpyText'

/** NumPy literal for a 2×2 matrix, entries to 3 decimals (as the matrix boxes show them). */
export function matLiteral(name: string, m: Mat2): string {
  const head = `${name} = np.array([`
  const pad = ' '.repeat(head.length)
  const row = (r: [number, number]) => `[${fmt(r[0], 3)}, ${fmt(r[1], 3)}]`
  return `${head}${row(m[0])},\n${pad}${row(m[1])}])`
}

/** The entries NumPy actually receives: the literal's rounded numbers. */
export const literalValues = (m: Mat2): Mat2 => [
  [Number(fmt(m[0][0], 3)), Number(fmt(m[0][1], 3))],
  [Number(fmt(m[1][0], 3)), Number(fmt(m[1][1], 3))],
]

export function eigenCode(m: Mat2): string {
  const [[a, b], [c, d]] = literalValues(m)
  const { disc } = numpyCharacteristic(a, b, c, d)
  const sqrt = disc < 0 ? 'np.sqrt(disc + 0j)' : 'np.sqrt(disc)'
  return [
    'import numpy as np',
    '',
    matLiteral('A', m),
    '',
    'tr = A[0, 0] + A[1, 1]                       # trace',
    'det = A[0, 0] * A[1, 1] - A[0, 1] * A[1, 0]  # determinant',
    'disc = tr**2 - 4 * det',
    ...(disc < 0 ? ['# disc < 0: "+ 0j" lets NumPy take a complex square root'] : []),
    `lam = (tr + np.array([1, -1]) * ${sqrt}) / 2   # (tr ± √disc) / 2`,
    'print(np.round(lam, 2))',
    '',
    '# Library call: np.linalg.eigvals(A) gives the same values,',
    '# maybe in another order and with tiny rounding errors.',
  ].join('\n')
}

/** The same arithmetic NumPy does, with the same rounding at each step. */
function numpyCharacteristic(a: number, b: number, c: number, d: number) {
  const tr = a + d
  const det = a * d - b * c
  const disc = tr * tr - 4 * det
  return { tr, disc }
}

export function eigenOutput(m: Mat2): string {
  const [[a, b], [c, d]] = literalValues(m)
  const { tr, disc } = numpyCharacteristic(a, b, c, d)
  if (disc >= 0) {
    const s = Math.sqrt(disc)
    const lam = [(tr + s) / 2, (tr + -s) / 2]
    return npFloatArray(lam.map((x) => npRound(x, 2)))
  }
  // Complex: sqrt(disc + 0j) = (0, s); times [1, −1] gives (0, s) and (−0, −s).
  const s = Math.sqrt(-disc)
  const re = [(tr + 0) / 2, (tr + -0) / 2]
  const im = [s / 2, -s / 2]
  return npComplexArray(
    re.map((x) => npRound(x, 2)),
    im.map((x) => npRound(x, 2)),
  )
}

// ---------------------------------------------------------------- PCA

const lit = (p: Vec2) => `[${fmt(p[0])}, ${fmt(p[1])}]`

export function pcaCode(points: Vec2[]): string {
  const rows: string[] = []
  for (let k = 0; k < points.length; k += 3) {
    rows.push(points.slice(k, k + 3).map(lit).join(', '))
  }
  const head = 'X = np.array(['
  const pad = ' '.repeat(head.length)
  return [
    'import numpy as np',
    '',
    `# ${points.length} points, one per row`,
    `${head}${rows.join(`,\n${pad}`)}])`,
    '',
    'Xc = X - X.mean(axis=0)          # centre',
    'C = Xc.T @ Xc / (len(X) - 1)     # covariance (= np.cov(X.T))',
    'vals, vecs = np.linalg.eigh(C)   # smallest eigenvalue first',
    '',
    'print(np.round(C, 2))',
    'print(np.round(vals, 2) + 0.0)   # + 0.0 turns "-0." into "0."',
  ].join('\n')
}

export function pcaOutput(points: Vec2[], ascendingValues: [number, number]): string {
  const C = covariance2(points)
  const Cr = C.map((row) => row.map((x) => npRound(x, 2)))
  const vals = ascendingValues.map((x) => npRound(x, 2) + 0)
  return `${npFloatMatrix(Cr)}\n${npFloatArray(vals)}`
}
