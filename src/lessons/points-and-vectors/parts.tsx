import { Circle } from 'mafs'
import type { CardinalDirection } from 'mafs'
import { Arrow, DraggablePoint } from '../../components/Plane'
import { usePlaneBounds } from '../../lib/planeBounds'
import type { Vec2 } from '../../linalg'
import { PlaneLabel } from '../../components/PlaneLabel'
import { approxEqualVec, scale } from '../../linalg'
import { clampStart, labelSide, moveBy, vectorFrom } from './model'

/**
 * A draggable start point that never lets the things drawn from it leave the
 * plane: every `offsets` entry, added to the point, stays visible.
 */
export function StartHandle({
  value,
  onChange,
  offsets,
  color,
}: {
  value: Vec2
  onChange: (next: Vec2) => void
  offsets: Vec2[]
  color: string
}) {
  const bounds = usePlaneBounds()
  return (
    <DraggablePoint
      value={value}
      onChange={onChange}
      color={color}
      snap={(p) => clampStart(p, offsets, bounds)}
    />
  )
}

/**
 * The arrow from one point to another. A movement of length 0 has no arrow,
 * so it is drawn as a small ring instead.
 */
export function TripArrow({
  from,
  to,
  color,
  label,
  dashed,
  opacity,
  side,
}: {
  from: Vec2
  to: Vec2
  color: string
  label?: string
  dashed?: boolean
  opacity?: number
  /** Which side of the arrow the label goes on; by default the side facing up. */
  side?: CardinalDirection
}) {
  if (approxEqualVec(vectorFrom(from, to), [0, 0])) {
    return <Circle center={from} radius={0.35} color={color} fillOpacity={0} strokeStyle="dashed" />
  }
  const mid = moveBy(from, scale(vectorFrom(from, to), 0.5))
  return (
    <>
      <Arrow tail={from} tip={to} color={color} dashed={dashed} opacity={opacity} showCoords={false} />
      {label && (
        <PlaneLabel
          x={mid[0]}
          y={mid[1]}
          attach={side ?? labelSide(vectorFrom(from, to))}
          distance={10}
          size={16}
          color={color}
        >
          {label}
        </PlaneLabel>
      )}
    </>
  )
}
