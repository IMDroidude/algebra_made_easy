import { createContext, useContext } from 'react'
import type { Bounds } from './snap'

export const PADDING = 0.3

/** The exact part of the plane that is visible, in maths coordinates. */
export const BoundsContext = createContext<Bounds | null>(null)

/** The visible area of the enclosing Plane (null outside a Plane, or before it has been measured). */
export function usePlaneBounds(): Bounds | null {
  return useContext(BoundsContext)
}

/**
 * The visible range for a plane of the given pixel size. Mirrors how Mafs
 * fits the requested view box: with `contain`, the shorter direction is
 * widened so one unit has the same length on both axes.
 */
export function visibleBounds(
  x: [number, number],
  y: [number, number],
  width: number,
  height: number,
  stretch: boolean,
): Bounds {
  let [xMin, xMax] = [x[0] - PADDING, x[1] + PADDING]
  let [yMin, yMax] = [y[0] - PADDING, y[1] + PADDING]
  if (!stretch && width > 0 && height > 0) {
    const aspect = width / height
    if ((xMax - xMin) / (yMax - yMin) > aspect) {
      const c = (yMax + yMin) / 2
      const half = (xMax - xMin) / aspect / 2
      ;[yMin, yMax] = [c - half, c + half]
    } else {
      const c = (xMax + xMin) / 2
      const half = ((yMax - yMin) * aspect) / 2
      ;[xMin, xMax] = [c - half, c + half]
    }
  }
  return { x: [xMin, xMax], y: [yMin, yMax] }
}
