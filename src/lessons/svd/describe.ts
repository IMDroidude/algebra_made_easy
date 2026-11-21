import { fmt, fmtVec } from '../../lib/format'
import { isZero } from '../../linalg'
import { transpose2 } from '../../linalg/svd'
import type { Svd2 } from '../../linalg/svd'
import type { Mat2, Vec2 } from '../../linalg'

/** How far the plane must reach to show the ellipse. */
export function extentFor(s: Svd2): number {
  return Math.min(9, Math.max(2, Math.ceil(s.sigma[0] + 0.6)))
}

export const columnsOf = (m: Mat2): [Vec2, Vec2] => [
  [m[0][0], m[1][0]],
  [m[0][1], m[1][1]],
]

const turn = (deg: number) =>
  isZero(deg) ? 'does not turn at all' : `turns by ${fmt(Math.abs(deg), 1)}° ${deg > 0 ? 'counter-clockwise' : 'clockwise'}`

/** One sentence per step, for the factor list. */
export function stepSentences(s: Svd2): [string, string, string] {
  return [
    `Vᵀ ${turn(-s.thetaV)}, so v₁ lands on the x-axis and v₂ on the y-axis.`,
    `Σ stretches along the axes: x by σ₁ = ${fmt(s.sigma[0])}, y by σ₂ = ${fmt(s.sigma[1])}.`,
    s.reflects
      ? `U flips the y-axis over, then ${turn(s.thetaU)}.`
      : `U ${turn(s.thetaU)}.`,
  ]
}

/** Live description of the picture at a given stage. */
export function describeStage(s: Svd2, stage: number): string {
  const [v1, v2] = columnsOf(s.V)
  const [u1, u2] = columnsOf(s.U)
  const [s1, s2] = s.sigma
  if (stage < 0.02) {
    return `Start: the unit circle, with v₁ = ${fmtVec(v1)} and v₂ = ${fmtVec(v2)} on it, at right angles.`
  }
  if (stage < 0.98) return 'Step 1 of 3 in progress: Vᵀ is turning the plane.'
  if (stage < 1.02) {
    return 'After step 1 (Vᵀ): v₁ now lies along the x-axis and v₂ along the y-axis. Nothing has changed size; it is still a circle.'
  }
  if (stage < 1.98) return 'Step 2 of 3 in progress: Σ is stretching along the axes.'
  if (stage < 2.02) {
    return `After step 2 (Σ): the circle is an ellipse lined up with the axes, reaching ${fmt(s1)} along x and ${fmt(s2)} along y.`
  }
  if (stage < 2.98) return `Step 3 of 3 in progress: U is ${s.reflects ? 'flipping and ' : ''}turning the ellipse.`
  return `After step 3 (U): the ellipse's semi-axes are σ₁u₁ = ${fmtVec([s1 * u1[0], s1 * u1[1]])} and σ₂u₂ = ${fmtVec([s2 * u2[0], s2 * u2[1]])}. This is exactly what A does to the circle.`
}

export function mat2Tex(m: Mat2): string {
  return String.raw`\begin{bmatrix} ${fmt(m[0][0])} & ${fmt(m[0][1])} \\ ${fmt(m[1][0])} & ${fmt(m[1][1])} \end{bmatrix}`
}

export function factorsTex(a: Mat2, s: Svd2): string {
  const Sigma: Mat2 = [
    [s.sigma[0], 0],
    [0, s.sigma[1]],
  ]
  return String.raw`\underbrace{${mat2Tex(a)}}_{A} \approx \underbrace{${mat2Tex(s.U)}}_{U}\,\underbrace{${mat2Tex(Sigma)}}_{\Sigma}\,\underbrace{${mat2Tex(transpose2(s.V))}}_{V^{\mathsf T}}`
}
