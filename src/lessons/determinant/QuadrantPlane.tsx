import { Coordinates, Mafs } from 'mafs'
import type { ReactNode } from 'react'

/**
 * A plane showing only the top-right quarter, from 0 to `size` on both axes.
 * The shared Plane is always centred on the origin, which would waste three
 * quarters of the space for the box picture of ad − bc.
 */
export function QuadrantPlane({
  children,
  size = 6,
  height = 380,
  label,
}: {
  children?: ReactNode
  size?: number
  height?: number
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="overflow-hidden rounded-xl border border-line">
      <Mafs
        height={height}
        pan={false}
        zoom={false}
        viewBox={{ x: [-0.4, size], y: [-0.4, size], padding: 0.3 }}
      >
        <Coordinates.Cartesian subdivisions={false} />
        {children}
      </Mafs>
    </div>
  )
}
