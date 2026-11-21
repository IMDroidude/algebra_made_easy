import { HOUSES, featureMatrix, housesNumpy, prices } from '../../data/houses'
import { npArray, npFloat, npRound } from '../../lib/numpy'
import { attention } from '../../linalg/attention'
import { standardise } from '../eigenvectors/houses'

/**
 * The running example for this lesson: "similar houses vote on the price".
 * Query = what a buyer wants, keys = the houses' features, values = their
 * prices, all features scaled the same way first. Same arithmetic as
 * attention, but with no learned W_Q, W_K, W_V: an analogy, not a transformer.
 */

/** What the buyer asks for: [sqft, bedrooms, distance_km]. */
export const WANTED = [2200, 4, 10]

/** The houses' column means and standard deviations, used to scale the query. */
const X = featureMatrix()
const n = X.length
const mean = X[0].map((_, j) => X.reduce((s, r) => s + r[j], 0) / n)
const sd = mean.map((m, j) => Math.sqrt(X.reduce((s, r) => s + (r[j] - m) ** 2, 0) / n))
const scaleRow = (r: number[]) => r.map((x, j) => (x - mean[j]) / sd[j])

/** Keys: every house's features, centred and divided by the standard deviation. */
export const HOUSE_KEYS = standardise(X)
/** The buyer's wish, scaled with the houses' means and standard deviations. */
export const HOUSE_QUERY = scaleRow(WANTED)

const result = attention(
  [HOUSE_QUERY],
  HOUSE_KEYS,
  prices().map((p) => [p]),
)

/** q · k / √3 for each house. */
export const HOUSE_SCORES: number[] = result.scaled[0]
/** Softmax of the scores: how much each house's price counts. */
export const HOUSE_WEIGHTS: number[] = result.weights[0]
/** The weighted average price. */
export const HOUSE_ESTIMATE: number = result.output[0][0]

/** Ids of the two houses with the largest weights, largest first. */
export const TOP_TWO: string[] = HOUSES.map((h, i) => ({ id: h.id, w: HOUSE_WEIGHTS[i] }))
  .sort((a, b) => b.w - a.w)
  .slice(0, 2)
  .map((x) => x.id)

export const HOUSE_CODE = [
  'import numpy as np',
  housesNumpy(),
  'mu, sd = X.mean(axis=0), X.std(axis=0)',
  'K = (X - mu) / sd                 # keys: every house, scaled',
  `q = (np.array([${WANTED.join(', ')}]) - mu) / sd  # query: the wish, scaled the same way`,
  's = K @ q / np.sqrt(3)            # scaled dot products',
  'w = np.exp(s) / np.exp(s).sum()   # softmax',
  'print(np.round(w, 2))',
  'print(np.round(w @ y, 1))         # values = prices',
].join('\n')

export const HOUSE_OUTPUT = [
  npArray(HOUSE_WEIGHTS.map((w) => npRound(w, 2))),
  npFloat(npRound(HOUSE_ESTIMATE, 1)),
].join('\n')
