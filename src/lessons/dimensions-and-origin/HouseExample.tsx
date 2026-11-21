import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Readout } from '../../components/ui'
import { FEATURE_LABEL, FEATURES } from '../../data/houses'
import { Chooser } from './Chooser'
import { DimensionPicture } from './DimensionPicture'
import { HOUSE_A, RUNNING_STEPS, houseADrawing, houseAText, housesCode } from './model'
import type { Dims } from './model'

const AXES = FEATURES.map((f) => FEATURE_LABEL[f])

/** Running example: house A becomes a point in 1, 2, then 3 dimensions as features are added. */
export function HouseExample() {
  const [k, setK] = useState<Dims>(1)
  const code = housesCode()

  return (
    <RunningExample title="One house, one more number at a time">
      <p>
        From here on, the course keeps coming back to the same eight houses. Each is described by
        three features: its size, its number of bedrooms and its distance to the city centre. Each
        also has a price.
      </p>
      <HouseTable highlight={[HOUSE_A.id]} caption="The eight houses. House A is highlighted." />
      <p>
        Take house <strong>A</strong> and add one feature at a time. Each feature is one more
        number, so one more dimension.
      </p>
      <Chooser label="Features of house A" options={RUNNING_STEPS} value={k} onChange={setK} />
      <div className="mt-3 rounded-xl border border-line bg-bg p-3">
        <DimensionPicture
          dims={k}
          values={houseADrawing(k)}
          axes={AXES.slice(0, k)}
          pointLabel={`A ${houseAText(k)}`}
          label={`House A in ${k} ${k === 1 ? 'dimension' : 'dimensions'}: ${AXES.slice(0, k).join(', ')}`}
        />
      </div>
      <Readout>
        House A is the point {houseAText(k)}: {k} {k === 1 ? 'number' : 'numbers'}, so a point in{' '}
        {k} {k === 1 ? 'dimension' : 'dimensions'}.
      </Readout>
      <p className="mt-4">
        The price, {HOUSE_A.priceK} ($k), would be a 4th number. We keep it apart, because it is
        the thing we will later try to predict from the other three. In NumPy, one house is an
        array of shape <code>(3,)</code>; all eight together make a table of shape{' '}
        <code>(8, 3)</code>: 8 rows (houses), 3 columns (features). <code>X[0]</code> picks the
        first row; NumPy counts from 0.
      </p>
      <NumpySnippet code={code.code} output={code.output} />
    </RunningExample>
  )
}
