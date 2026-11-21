/**
 * Singular value decomposition.
 *
 * 2×2 matrices get a closed form arranged for animation: A = U Σ Vᵀ where V is
 * always a rotation (by an angle in (−90°, 90°]), Σ = diag(σ₁, σ₂) with
 * σ₁ ≥ σ₂ ≥ 0, and U is a rotation, or a rotation after a flip of the second
 * axis when det A < 0. Larger matrices use ml-matrix.
 */
import { SingularValueDecomposition } from 'ml-matrix'
import { apply2, det2, mul2, rotation2, transpose } from './matrix'
import { isZero } from './tolerance'
import { norm } from './vector'
import type { Mat2, Matrix, Vec2 } from './types'

export type Svd2 = {
  U: Mat2
  sigma: [number, number]
  V: Mat2
  /** V = rotation by this many degrees. */
  thetaV: number
  /** U = rotation by this many degrees, after a flip of the second axis if `reflects`. */
  thetaU: number
  /** True when U includes a reflection (det A < 0). */
  reflects: boolean
}

const deg = (rad: number) => (rad * 180) / Math.PI

export function diag2(a: number, b: number): Mat2 {
  return [
    [a, 0],
    [0, b],
  ]
}

export function transpose2(m: Mat2): Mat2 {
  return transpose(m) as Mat2
}

export function svd2(a: Mat2): Svd2 {
  // AᵀA is symmetric; its eigenvectors are the columns of V, its eigenvalues σ².
  const ata = mul2(transpose2(a), a)
  const p = ata[0][0]
  const q = ata[0][1]
  const r = ata[1][1]
  const scale = Math.max(1, Math.abs(p), Math.abs(r))
  // Angle of the first eigenvector of [[p, q], [q, r]].
  let thetaV = isZero(q / scale) && isZero((p - r) / scale) ? 0 : deg(Math.atan2(2 * q, p - r) / 2)
  // Keep the angle in (−90°, 90°]: v₁ and −v₁ are the same line.
  if (thetaV <= -90) thetaV += 180
  if (thetaV > 90) thetaV -= 180
  const V = rotation2(thetaV)
  const v1: Vec2 = [V[0][0], V[1][0]]
  const v2: Vec2 = [V[0][1], V[1][1]]
  const Av1 = apply2(a, v1)
  const Av2 = apply2(a, v2)
  const s1 = norm(Av1)
  const s2 = norm(Av2)
  // Numerically AᵀA's eigen-split already orders them, but guard anyway.
  if (s2 > s1 + 1e-12) {
    // Swap by rotating V a quarter turn.
    return svd2FromV(a, thetaV > 0 ? thetaV - 90 : thetaV + 90)
  }
  return svd2FromV(a, thetaV, Av1, Av2, s1, s2)
}

function svd2FromV(
  a: Mat2,
  thetaV: number,
  Av1?: Vec2,
  Av2?: Vec2,
  s1?: number,
  s2?: number,
): Svd2 {
  const V = rotation2(thetaV)
  const v1: Vec2 = [V[0][0], V[1][0]]
  const v2: Vec2 = [V[0][1], V[1][1]]
  const w1 = Av1 ?? apply2(a, v1)
  const w2 = Av2 ?? apply2(a, v2)
  const sigma1 = s1 ?? norm(w1)
  const sigma2 = s2 ?? norm(w2)
  const reflects = det2(a) < 0 && !isZero(det2(a))
  let u1: Vec2
  if (isZero(sigma1)) {
    // The zero matrix: any U works.
    u1 = [1, 0]
  } else {
    u1 = [w1[0] / sigma1, w1[1] / sigma1]
  }
  // u₂ is perpendicular to u₁; which way round decides rotation vs reflection.
  const perp: Vec2 = [-u1[1], u1[0]]
  const u2: Vec2 = reflects ? [-perp[0], -perp[1]] : perp
  const thetaU = deg(Math.atan2(u1[1], u1[0]))
  const U: Mat2 = [
    [u1[0], u2[0]],
    [u1[1], u2[1]],
  ]
  return { U, sigma: [sigma1, isZero(sigma2) ? 0 : sigma2], V, thetaV, thetaU, reflects }
}

/** U Σ Vᵀ multiplied back together. */
export function recompose2({ U, sigma, V }: Svd2): Mat2 {
  return mul2(mul2(U, diag2(sigma[0], sigma[1])), transpose2(V))
}

/**
 * The matrix that has been applied after `stage` ∈ [0, 3] of the three steps:
 * 0 → identity, 1 → Vᵀ, 2 → Σ Vᵀ, 3 → U Σ Vᵀ = A. In between, rotations turn
 * by angle (so they never shrink), stretches and flips blend linearly.
 */
export function svdStage(s: Svd2, stage: number): Mat2 {
  const t1 = Math.min(1, Math.max(0, stage))
  const t2 = Math.min(1, Math.max(0, stage - 1))
  const t3 = Math.min(1, Math.max(0, stage - 2))
  const Vt = rotation2(-s.thetaV * t1)
  const Sigma = diag2(1 + (s.sigma[0] - 1) * t2, 1 + (s.sigma[1] - 1) * t2)
  const flip = s.reflects ? diag2(1, 1 - 2 * t3) : diag2(1, 1)
  const Upart = mul2(rotation2(s.thetaU * t3), flip)
  return mul2(Upart, mul2(Sigma, Vt))
}

// ------------------------------------------------------- general matrices

export type Svd = {
  /** m×r, columns are left singular vectors */
  U: Matrix
  /** singular values, largest first */
  s: number[]
  /** n×r, columns are right singular vectors */
  V: Matrix
}

export function svd(m: Matrix): Svd {
  const d = new SingularValueDecomposition(m, { autoTranspose: true })
  return {
    U: d.leftSingularVectors.to2DArray(),
    s: d.diagonal,
    V: d.rightSingularVectors.to2DArray(),
  }
}

/** The best rank-k approximation: keep the k largest singular values, drop the rest. */
export function lowRank({ U, s, V }: Svd, k: number): Matrix {
  const rows = U.length
  const cols = V.length
  const out: Matrix = Array.from({ length: rows }, () => new Array<number>(cols).fill(0))
  for (let t = 0; t < Math.min(k, s.length); t++) {
    for (let i = 0; i < rows; i++) {
      const ui = U[i][t] * s[t]
      if (ui === 0) continue
      const row = out[i]
      for (let j = 0; j < cols; j++) row[j] += ui * V[j][t]
    }
  }
  return out
}

/** Frobenius norm: the square root of the sum of every entry squared. */
export function frobenius(m: Matrix): number {
  return Math.sqrt(m.reduce((sum, row) => sum + row.reduce((s, x) => s + x * x, 0), 0))
}

/** Numbers stored by a rank-k approximation of an m×n matrix: k columns of U, k of V, k σ's. */
export function lowRankStorage(rows: number, cols: number, k: number): number {
  return k * (rows + cols + 1)
}
