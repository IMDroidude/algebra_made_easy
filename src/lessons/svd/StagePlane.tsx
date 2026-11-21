import { Circle, Polygon } from 'mafs'
import { Arrow, Plane, TransformedGrid } from '../../components/Plane'
import { COLOR } from '../../lib/palette'
import { apply2 } from '../../linalg'
import { svdStage } from '../../linalg/svd'
import type { Svd2 } from '../../linalg/svd'
import type { Vec2 } from '../../linalg'
import { SIGMA1, SIGMA2 } from './colors'

const CIRCLE: Vec2[] = Array.from({ length: 96 }, (_, k) => {
  const t = (2 * Math.PI * k) / 96
  return [Math.cos(t), Math.sin(t)]
})

/** Labels for the two tracked arrows after each whole step: v → e → σe → σu. */
function labels(stage: number): [string, string] {
  if (stage < 0.5) return ['v₁', 'v₂']
  if (stage < 1.5) return ['Vᵀv₁', 'Vᵀv₂']
  if (stage < 2.5) return ['σ₁e₁', 'σ₂e₂']
  return ['σ₁u₁', 'σ₂u₂']
}

/**
 * The unit circle and the two right singular vectors v₁, v₂, carried through
 * `stage` ∈ [0, 3] of the decomposition: 1 = after Vᵀ, 2 = after Σ, 3 = after U.
 */
export function StagePlane({
  svd,
  stage,
  extent,
  label,
  showGrid = false,
}: {
  svd: Svd2
  stage: number
  extent: number
  label: string
  showGrid?: boolean
}) {
  const M = svdStage(svd, stage)
  const v1: Vec2 = [svd.V[0][0], svd.V[1][0]]
  const v2: Vec2 = [svd.V[0][1], svd.V[1][1]]
  const [l1, l2] = labels(stage)
  const a1 = apply2(M, v1)
  const a2 = apply2(M, v2)
  return (
    <Plane label={label} extent={extent}>
      {showGrid && <TransformedGrid matrix={M} color={COLOR.ghost} opacity={0.35} />}
      <Circle center={[0, 0]} radius={1} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
      <Polygon points={CIRCLE.map((q) => apply2(M, q))} color={COLOR.grid} fillOpacity={0.12} weight={2} />
      {Math.hypot(...a2) > 1e-6 && <Arrow tip={a2} color={SIGMA2} label={l2} />}
      {Math.hypot(...a1) > 1e-6 && <Arrow tip={a1} color={SIGMA1} label={l1} />}
    </Plane>
  )
}
