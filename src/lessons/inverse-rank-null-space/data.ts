import { isInteger } from '../../lib/format'
import { numpyMatrixRank2, outer2, solve2 } from '../../linalg/systems'
import { npArray, npRound } from '../../lib/numpy'
import type { Mat2, Vec2 } from '../../linalg'

/** An asymmetric "F", small enough to stay on the plane after the lesson's matrices. */
export const F_SHAPE: Vec2[] = [
  [0, 0],
  [0, 1.5],
  [1.125, 1.5],
  [1.125, 1.125],
  [0.375, 1.125],
  [0.375, 0.9375],
  [0.75, 0.9375],
  [0.75, 0.5625],
  [0.375, 0.5625],
  [0.375, 0],
]

/** Step 1: a matrix with a tidy inverse, [[1, -1], [-1, 2]]. */
export const SEE_A: Mat2 = [
  [2, 1],
  [1, 1],
]

/**
 * Step 2: determinants the squeeze slider walks through. 0.0000001 is below
 * the app's tolerance, so it is shown as "≈ 0, treated as singular".
 */
export const SQUEEZE_DETS = [2, 1, 0.5, 0.1, 0.01, 0.001, 0.0000001, 0] as const

/** î stays at (2, 0); ĵ = (1, det / 2) slides down onto î's line, the x-axis, as det → 0. */
export function squeezeMatrix(det: number): Mat2 {
  return [
    [2, 1],
    [0, det / 2],
  ]
}

/** Step 3: a singular matrix and three different inputs that all land on (2, 1). */
export const PREDICT_A: Mat2 = [
  [1, 2],
  [0.5, 1],
]
export const PREDICT_POINTS: Vec2[] = [
  [2, 0],
  [0, 1],
  [-2, 2],
]

/** Step 4 starting system: x + y = 3, x − y = 1, solved by (2, 1). */
export const SYSTEM_A: Mat2 = [
  [1, 1],
  [1, -1],
]
export const SYSTEM_B: Vec2 = [3, 1]

export const SYSTEM_PRESETS: { id: string; label: string; A: Mat2; b: Vec2 }[] = [
  { id: 'cross', label: 'One crossing', A: SYSTEM_A, b: SYSTEM_B },
  {
    id: 'parallel',
    label: 'Parallel',
    A: [
      [1, 1],
      [1, 1],
    ],
    b: [3, 1],
  },
  {
    id: 'same',
    label: 'Same line',
    A: [
      [1, 1],
      [2, 2],
    ],
    b: [3, 6],
  },
]

/** A number exactly as typed, so the code holds the same value as the app (0.5000001 stays 0.5000001). */
export { pyLiteral as lit } from '../../lib/numpy'
import { pyLiteral as lit } from '../../lib/numpy'

const vecLiteral = (name: string, v: Vec2) => `${name} = np.array([${lit(v[0])}, ${lit(v[1])}])`

function matLiteral(name: string, m: Mat2): string {
  const head = `${name} = np.array([`
  return `${head}[${lit(m[0][0])}, ${lit(m[0][1])}],\n${' '.repeat(head.length)}[${lit(m[1][0])}, ${lit(m[1][1])}]])`
}

/** Step 4 NumPy: rank, then solve when there is exactly one answer. */
export function systemSnippet(A: Mat2, b: Vec2): { code: string; output: string } {
  const npRank = numpyMatrixRank2(A)
  const head = ['import numpy as np', '', matLiteral('A', A), vecLiteral('b', b), '', 'print(np.linalg.matrix_rank(A))']
  const sol = solve2(A, b)
  if (sol.kind === 'unique') {
    return {
      code: [
        ...head,
        'x = np.linalg.solve(A, b)',
        '# tidy float noise; + 0.0 turns -0. into 0.',
        'print(np.round(x, 4) + 0.0)',
      ].join('\n'),
      output: `${npRank}\n${npArray(sol.x.map((x) => npRound(x, 4) + 0))}`,
    }
  }
  const note =
    npRank === 2
      ? "# NumPy says rank 2: its cut-off for zero is far\n# smaller than this app's 0.000001"
      : '# rank < 2: A has no inverse, so\n# np.linalg.solve(A, b) has no single answer'
  return { code: [...head, note].join('\n'), output: String(npRank) }
}

/** Step 5 NumPy: a 2×2 update built from a thin column and a thin row, and the size argument. */
export function lowRankSnippet(u: Vec2, v: Vec2, d: number, r: number): { code: string; output: string } {
  // NumPy's matmul adds onto 0, so a product of -0 comes out as +0.
  const dW = outer2(u, v).map((row) => row.map((x) => x + 0)) as Mat2
  const integer = isInteger(...u, ...v)
  const code = [
    'import numpy as np',
    '',
    '# B: a thin column (2×1). A: a thin row (1×2).',
    `B = np.array([[${lit(u[0])}], [${lit(u[1])}]])`,
    `A = np.array([[${lit(v[0])}, ${lit(v[1])}]])`,
    'dW = B @ A  # a full 2×2 matrix from 4 numbers',
    'print(dW)',
    'print(np.linalg.matrix_rank(dW))',
    '',
    `d, r = ${d}, ${r}`,
    'print(d * d)      # full d×d update',
    'print(2 * d * r)  # B (d×r) plus A (r×d)',
  ].join('\n')
  const output = [npArray(dW, integer), String(numpyMatrixRank2(dW)), String(d * d), String(2 * d * r)].join('\n')
  return { code, output }
}
