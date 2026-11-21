import { Coordinates, Mafs } from 'mafs'
import type { ReactNode } from 'react'

/**
 * A plane for the house data, whose axes measure different things (square
 * feet, $k, km) and so are scaled independently, with grid lines spaced to
 * suit each axis. The shared Plane draws a line at every unit, which would be
 * thousands of lines here.
 */
export function HousePlane({
  children,
  x,
  y,
  xLines,
  yLines,
  height = 320,
  label,
}: {
  children?: ReactNode
  x: [number, number]
  y: [number, number]
  xLines: number
  yLines: number
  height?: number
  label: string
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
