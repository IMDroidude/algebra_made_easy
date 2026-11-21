import { approxEqual, isZero } from '../../linalg'
import { fitLine, sumSquaredResiduals } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'

/** One check per practice challenge, run against the live data points. */
export const CHECKS: Record<string, (points: Vec2[]) => boolean> = {
  /** The best line is horizontal. */
  flat: (points) => {
    const fit = fitLine(points)
    return fit !== null && isZero(fit.slope)
  },
  /** A perfect fit: every point on one (non-vertical) line. */
  perfect: (points) => {
    const fit = fitLine(points)
    return fit !== null && isZero(sumSquaredResiduals(points, fit))
  },
  /** Best line y = x, without all points on it. */
  diagonal: (points) => {
    const fit = fitLine(points)
    return (
      fit !== null &&
      approxEqual(fit.slope, 1) &&
      isZero(fit.intercept) &&
      !isZero(sumSquaredResiduals(points, fit))
    )
  },
  /** No best line at all: every point has the same x. */
  vertical: (points) => fitLine(points) === null,
}
