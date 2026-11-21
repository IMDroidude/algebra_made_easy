import { Line, Polyline, Text } from 'mafs'
import { COLOR } from '../../lib/palette'
import { add, angleDeg, isZero, norm, scale, sub } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { normalize, projectOnto, scalarProjection } from '../../linalg/projection'

/**
 * The "shadow" of b on the line through a: the faint line through a, the
 * shadow itself, the dashed drop from b's tip, and a right-angle mark.
 */
export function Shadow({
  a,
  b,
  label = 'shadow',
  reach = 12,
  labelGap = 0.45,
}: {
  a: Vec2
  b: Vec2
  label?: string
  /** How far the faint line through a extends each way, in plane units. */
  reach?: number
  /** Distance from the shadow to its label, in plane units. */
  labelGap?: number
}) {
  const u = normalize(a)
  const proj = projectOnto(b, a)
  if (!u || !proj) return null
  const t = scalarProjection(b, a) ?? 0
  const drop = sub(b, proj)
  const n = normalize(drop)
  const s = 0.28
  // The right-angle mark sits on the side of the shadow facing the origin.
  const back = scale(u, t > 0 ? -s : s)
  const showMark = n !== null && norm(drop) > 0.4 && norm(proj) > 0.4
  // The label sits beside the middle of the shadow, on the side of the line away from b.
  const away = u[0] * b[1] - u[1] * b[0] > 0 ? -1 : 1
  const perp: Vec2 = [-u[1] * away, u[0] * away]
  const at = add(scale(proj, 0.5), scale(perp, labelGap))
  return (
    <>
      <Line.Segment
        point1={scale(u, -reach)}
        point2={scale(u, reach)}
        color={COLOR.ghost}
        opacity={0.35}
        weight={1.5}
      />
      {!isZero(norm(drop)) && (
        <Line.Segment point1={b} point2={proj} color={COLOR.ghost} style="dashed" weight={2} />
      )}
      {showMark && n && (
        <Polyline
          points={[add(proj, scale(n, s)), add(add(proj, scale(n, s)), back), add(proj, back)]}
          color={COLOR.ghost}
          weight={1.5}
          fillOpacity={0}
        />
      )}
      {!isZero(norm(proj)) && (
        <>
          <Line.Segment point1={[0, 0]} point2={proj} color={COLOR.result} weight={7} opacity={0.75} />
          <Text x={at[0]} y={at[1]} size={14} color={COLOR.result}>
            {label}
          </Text>
        </>
      )}
    </>
  )
}

/** A small arc marking the angle between a and b, with an optional label. */
export function AngleArc({
  a,
  b,
  radius = 0.9,
  label,
  color = COLOR.ghost,
}: {
  a: Vec2
  b: Vec2
  radius?: number
  label?: string
  color?: string
}) {
  if (isZero(norm(a)) || isZero(norm(b))) return null
  const start = angleDeg(a)
  let sweep = angleDeg(b) - start
  // Take the short way round, so the arc always shows the angle from 0° to 180°.
  if (sweep > 180) sweep -= 360
  if (sweep < -180) sweep += 360
  const steps = 32
  const points: Vec2[] = Array.from({ length: steps + 1 }, (_, k) => {
    const r = ((start + (sweep * k) / steps) * Math.PI) / 180
    return [radius * Math.cos(r), radius * Math.sin(r)]
  })
  const midAngle = ((start + sweep / 2) * Math.PI) / 180
  const at: Vec2 = [(radius + 0.45) * Math.cos(midAngle), (radius + 0.45) * Math.sin(midAngle)]
  return (
    <>
      <Polyline points={points} color={color} weight={2} fillOpacity={0} />
      {label && (
        <Text x={at[0]} y={at[1]} size={15} color={color}>
          {label}
        </Text>
      )}
    </>
  )
}
