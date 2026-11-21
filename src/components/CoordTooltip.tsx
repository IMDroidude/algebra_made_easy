import { usePaneContext, useTransformContext, vec } from 'mafs'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { coordText } from '../lib/format'
import type { Vec2 } from '../linalg'

const CHAR_PX = 7.8
const PAD_X = 8
const HEIGHT = 24
/** Distance from the point to the nearest corner of the box, so it clears a drag handle. */
const OFFSET = 18

/**
 * A small box showing a point's coordinates, drawn inside a Mafs plane. It
 * sits above-right of the point and flips side near the edges of the plane.
 */
export function CoordTooltip({ point }: { point: Vec2 }) {
  const { viewTransform, userTransform } = useTransformContext()
  const { xPaneRange, yPaneRange } = usePaneContext()
  const [px, py] = vec.transform(point, vec.matrixMult(viewTransform, userTransform))

  const text = coordText(point)
  const width = text.length * CHAR_PX + PAD_X * 2
  const spanX = xPaneRange[1] - xPaneRange[0]
  const spanY = yPaneRange[1] - yPaneRange[0]
  const left = point[0] > xPaneRange[1] - spanX * 0.3
  const below = point[1] > yPaneRange[1] - spanY * 0.12

  const boxX = left ? px - OFFSET - width : px + OFFSET
  const boxY = below ? py + OFFSET : py - OFFSET - HEIGHT

  return (
    <g className="coord-tooltip" pointerEvents="none" role="presentation">
      <rect
        x={boxX}
        y={boxY}
        width={width}
        height={HEIGHT}
        rx={5}
        style={{ fill: 'var(--ink)', opacity: 0.92 }}
      />
      <text
        x={boxX + width / 2}
        y={boxY + HEIGHT / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: 'var(--surface)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
      >
        {text}
      </text>
    </g>
  )
}

/**
 * Wraps something drawn on a plane and shows the coordinates of `point` while
 * the pointer is over it, while it is being dragged, or while it has keyboard
 * focus.
 */
export function WithCoordTooltip({ point, children }: { point: Vec2; children: ReactNode }) {
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [dragging, setDragging] = useState(false)

  // A drag can end anywhere on the page, not only over the point.
  useEffect(() => {
    if (!dragging) return
    const end = () => setDragging(false)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
  }, [dragging])

  return (
    <>
      <g
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onPointerDown={() => setDragging(true)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      >
        {children}
      </g>
      {(hover || focus || dragging) && <CoordTooltip point={point} />}
    </>
  )
}

/** An invisible circle that makes a spot on the plane hoverable for its coordinates. */
export function CoordHoverTarget({ point, radiusPx = 14 }: { point: Vec2; radiusPx?: number }) {
  const { viewTransform, userTransform } = useTransformContext()
  const [px, py] = vec.transform(point, vec.matrixMult(viewTransform, userTransform))
  return (
    <WithCoordTooltip point={point}>
      <circle cx={px} cy={py} r={radiusPx} fill="transparent" />
    </WithCoordTooltip>
  )
}
