/**
 * The NumPy code shown in the SVD lesson and the text NumPy prints for it.
 * Tests compare these outputs with real NumPy (tests/lessons/svd).
 */
import { svd2 } from '../../linalg/svd'
import type { Mat2 } from '../../linalg'
import { asTyped2 as literalValues, numpyMat2 as matLiteral } from '../../lib/format'
import { npArray, npRound } from '../../lib/numpy'

const npFloatArray = (values: number[]) => npArray(values, false)
import { IMAGE_CODE, SIZE } from './image'

export function svd2Code(m: Mat2): string {
  return [
    'import numpy as np',
    '',
    matLiteral('A', m),
    '',
    'U, s, Vt = np.linalg.svd(A)   # Vt is Vᵀ; s = [σ₁, σ₂]',
    'print(np.round(s, 2))',
    'print(np.allclose(U @ np.diag(s) @ Vt, A))   # gives A back?',
  ].join('\n')
}

export function svd2Output(m: Mat2): string {
  const { sigma } = svd2(literalValues(m))
  return `${npFloatArray(sigma.map((x) => npRound(x, 2)))}\nTrue`
}

export function imageCode(k: number): string {
  return [
    'import numpy as np',
    '',
    IMAGE_CODE,
    '',
    'U, s, Vt = np.linalg.svd(img)',
    `k = ${k}`,
    'approx = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]   # top k',
    '',
    'print(np.linalg.matrix_rank(img))   # number of non-zero σ',
    'print(np.round(s[:4], 2))           # the four largest',
    `print(k * (${SIZE} + ${SIZE} + 1), "numbers instead of", img.size)`,
    'err = np.linalg.norm(img - approx) / np.linalg.norm(img)',
    'print(f"error: {100 * err:.1f}%")',
  ].join('\n')
}

/**
 * NumPy's matrix_rank counts singular values above σ₁ · max(m, n) · machine
 * epsilon.
 */
export function numpyRank(s: number[], rows: number, cols: number): number {
  const tol = s[0] * Math.max(rows, cols) * Number.EPSILON
  return s.filter((x) => x > tol).length
}

export function imageOutput(k: number, s: number[], relativeError: number): string {
  return [
    String(numpyRank(s, SIZE, SIZE)),
    npFloatArray(s.slice(0, 4).map((x) => npRound(x, 2))),
    `${k * (SIZE + SIZE + 1)} numbers instead of ${SIZE * SIZE}`,
    `error: ${(100 * relativeError).toFixed(1)}%`,
  ].join('\n')
}
