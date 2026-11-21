import { Coordinates, Mafs } from 'mafs'
import type { ReactNode } from 'react'

/**
 * A plane with its own x and y ranges. The shared Plane is always square
 * around the origin; graphs of x² and pictures of squares in the first
 * quadrant need a different window.
 */
export function GraphPlane({
  children,
  x,
  y,
  label,
  height = 380,
  yStep = 1,
  stretch = false,
}: {
  children?: ReactNode
  x: [number, number]
  y: [number, number]
  /** Short description for screen readers; the live values go in a text readout next to it. */
  label: string
  height?: number
  /** Distance between labelled grid lines on the y-axis. */
  yStep?: number
  /** Let x and y use different scales so the whole window fills the box (for steep graphs). */
  stretch?: boolean
}) {
  return (
    <div role="group" aria-label={label} className="overflow-hidden rounded-xl border border-line">
      <Mafs
        height={height}
        pan={false}
        zoom={false}
        viewBox={{ x, y, padding: 0.2 }}
        preserveAspectRatio={stretch ? false : 'contain'}
      >
        <Coordinates.Cartesian subdivisions={false} yAxis={{ lines: yStep }} />
        {children}
      </Mafs>
    </div>
  )
}
