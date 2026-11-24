import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { HOUSES, housesNumpy } from '../../data/houses'
import { fmt } from '../../lib/format'
import {
  HOUSE_OUTPUT,
  NEAREST_RAW,
  NEAREST_SCALED,
  RAW_DISTANCES,
  SCALED_DISTANCES,
  SCALED_FEATURES,
  TARGET,
} from './houseMath'

const B = HOUSES[TARGET]
const index = (id: string) => HOUSES.findIndex((h) => h.id === id)

const CODE = [
  'import numpy as np',
  '',
  housesNumpy().split('\n').slice(0, -1).join('\n'),
  '',
  `raw = np.linalg.norm(X - X[${TARGET}], axis=1)    # distance from every house to ${B.id}`,
  '',
  'S = (X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0))   # every column to 0…1',
  `scaled = np.linalg.norm(S - S[${TARGET}], axis=1)`,
  '',
  'print(np.round(raw, 1))',
  'print(np.round(scaled, 3))',
].join('\n')

/** Running example for 3.4: the nearest house changes once the features are scaled. */
export function HouseExample() {
  return (
    <RunningExample title="Which house is most like the Corner house?">
      <p>
        A buyer likes house {B.id} ({B.name}: {B.sqft} sqft, {B.bedrooms} bedrooms, {B.distanceKm} km
        from the centre). Which other house is most like it? Each house is a vector of three
        features, so measure the Euclidean distance from {B.id} to every other house.
      </p>
      <HouseTable
        columns={['sqft', 'bedrooms', 'distanceKm']}
        highlight={[NEAREST_RAW.id, NEAREST_SCALED.id]}
        extra={[
          { heading: `raw distance to ${B.id}`, cell: (h) => fmt(RAW_DISTANCES[index(h.id)], 1) },
          { heading: 'scaled distance', cell: (h) => fmt(SCALED_DISTANCES[index(h.id)], 3) },
        ]}
      />
      <p>
        On the raw numbers the nearest is house {NEAREST_RAW.id} ({NEAREST_RAW.name}), at{' '}
        {fmt(RAW_DISTANCES[index(NEAREST_RAW.id)], 1)}. Look at where that number comes from: it is
        almost exactly the difference in square feet, {Math.abs(NEAREST_RAW.sqft - B.sqft)}.
        Bedrooms differ by 1 and kilometres by a handful, and next to hundreds of square feet
        they add nothing. The distance is measuring floor area and ignoring everything else.
      </p>
      <p>
        The fix is to <strong>scale first</strong>: rewrite each feature as a number from 0
        (smallest in the table) to 1 (largest). House {B.id} becomes ({SCALED_FEATURES[TARGET]
          .map((x) => fmt(x, 3))
          .join(', ')}). Now all three features can be heard, and the nearest house is{' '}
        {NEAREST_SCALED.id} ({NEAREST_SCALED.name}), at{' '}
        {fmt(SCALED_DISTANCES[index(NEAREST_SCALED.id)], 3)}: the same number of bedrooms, a
        little bigger and a little further out. House {NEAREST_RAW.id} drops to second, at{' '}
        {fmt(SCALED_DISTANCES[index(NEAREST_RAW.id)], 3)}.
      </p>
      <NumpySnippet code={CODE} output={HOUSE_OUTPUT} />
      <p className="mt-3 text-sm text-muted">
        <code>X - X[{TARGET}]</code> subtracts house {B.id} from every row, and{' '}
        <code>axis=1</code> asks for one length per row. <code>X.min(axis=0)</code> is the smallest
        value in each column. This scaling is called min-max scaling. Every distance in this
        lesson, and cosine similarity too, is distorted when one feature has much larger units
        than the others.
      </p>
    </RunningExample>
  )
}
