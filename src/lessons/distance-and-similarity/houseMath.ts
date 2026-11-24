import { HOUSES, featureMatrix } from '../../data/houses'
import { npArray, npRound } from '../../lib/numpy'
import { euclidean, minMaxScale } from '../../linalg/distance'

/** The house everything is compared with: B, the Corner house. */
export const TARGET = 1

const X = featureMatrix()
const S = minMaxScale(X)

/** Euclidean distance from every house to the target, on the raw features. */
export const RAW_DISTANCES = X.map((row) => euclidean(row, X[TARGET]))
/** The same, after scaling every feature to 0…1. */
export const SCALED_DISTANCES = S.map((row) => euclidean(row, S[TARGET]))
export const SCALED_FEATURES = S

/** Index of the nearest other house. */
function nearest(distances: number[]): number {
  let best = -1
  distances.forEach((d, k) => {
    if (k !== TARGET && (best < 0 || d < distances[best])) best = k
  })
  return best
}

export const NEAREST_RAW = HOUSES[nearest(RAW_DISTANCES)]
export const NEAREST_SCALED = HOUSES[nearest(SCALED_DISTANCES)]

/** What the lesson's NumPy snippet prints: raw distances, then scaled ones. */
export const HOUSE_OUTPUT = [
  npArray(RAW_DISTANCES.map((d) => npRound(d, 1)), false),
  npArray(SCALED_DISTANCES.map((d) => npRound(d, 3)), false),
].join('\n')
