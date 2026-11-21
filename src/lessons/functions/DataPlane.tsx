import { Coordinates, Mafs } from 'mafs'
import type { ReactNode } from 'react'

/**
 * A plane for a small dataset that lives in the positive quadrant. Unlike the
 * shared Plane it is not centred on the origin, and its two axes are scaled
 * independently, as in any chart whose axes measure different things.
 */
export function DataPlane({
  children,
  x,
  y,
  height = 340,
  label,
  xLines = 1,
  yLines = 1,
}: {
  children?: ReactNode
  x: [number, number]
  y: [number, number]
  height?: number
  label: string
  /** Spacing of the grid lines (and axis numbers) along each axis. */
  xLines?: number
  yLines?: number
}) {
  return (
    <div role="group" aria-label={label} className="overflow-hidden rounded-xl border border-line">
      <Mafs height={height} pan={false} zoom={false} viewBox={{ x, y, padding: 0 }} preserveAspectRatio={false}>
        <Coordinates.Cartesian subdivisions={false} xAxis={{ lines: xLines }} yAxis={{ lines: yLines }} />
        {children}
      </Mafs>
    </div>
  )
}
