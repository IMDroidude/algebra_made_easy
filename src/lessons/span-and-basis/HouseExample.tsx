import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { Readout, Toggle } from '../../components/ui'
import { fmt } from '../../lib/format'
import { B_FULL, B_TWO, HOUSE_B, HOUSE_OUTPUT, LOOKALIKES } from './houseMath'

const CODE = [
  'import numpy as np',
  '',
  'e_sqft = np.array([1, 0, 0])',
  'e_bed  = np.array([0, 1, 0])',
  'e_dist = np.array([0, 0, 1])',
  '',
  `# house B: ${HOUSE_B.sqft} sqft, ${HOUSE_B.bedrooms} bedrooms, ${HOUSE_B.distanceKm} km`,
  `print(${HOUSE_B.sqft} * e_sqft + ${HOUSE_B.bedrooms} * e_bed + ${HOUSE_B.distanceKm} * e_dist)`,
  `print(${HOUSE_B.sqft} * e_sqft + ${HOUSE_B.bedrooms} * e_bed)  # no distance direction`,
].join('\n')

/** Running example for 3.2: a house is a mix of basis directions, and the span is what the features can describe. */
export function HouseExample() {
  const [withDistance, setWithDistance] = useState(false)
  const [a, h] = LOOKALIKES
  return (
    <RunningExample title="What your features can describe">
      <p>
        A house in the course dataset is a vector [sqft, bedrooms, distance]. Each feature is one
        basis direction, and every house is a mix of the three. House B ({HOUSE_B.name}) is:
      </p>
      <Tex block>
        {String.raw`${HOUSE_B.sqft}\,\mathbf{e}_{\text{sqft}} + ${HOUSE_B.bedrooms}\,\mathbf{e}_{\text{bed}} + ${HOUSE_B.distanceKm}\,\mathbf{e}_{\text{dist}} = [${B_FULL.join(', ')}]`}
      </Tex>
      <p>
        Now drop the distance feature. With only e<sub>sqft</sub> and e<sub>bed</sub>, the span is
        a flat plane inside 3D house space. The best you can build for B is [{B_TWO.join(', ')}]:
        the last entry is always 0, as if every house were in the city centre.
      </p>
      <p>
        That matters. Look at houses {a.id} and {h.id} through only two features:
      </p>
      <HouseTable
        houses={LOOKALIKES}
        columns={withDistance ? ['sqft', 'bedrooms', 'distanceKm', 'priceK'] : ['sqft', 'bedrooms', 'priceK']}
      />
      <Toggle checked={withDistance} onChange={setWithDistance}>
        Add the third basis direction: distance
      </Toggle>
      <Readout>
        {withDistance
          ? `With distance: ${a.id} is ${fmt(a.distanceKm)} km out and ${h.id} is ${fmt(h.distanceKm)} km out. That is most of the $${fmt(a.priceK - h.priceK)}k price gap.`
          : `With sqft and bedrooms only, ${a.id} and ${h.id} differ by just ${fmt(a.sqft - h.sqft)} sqft, yet ${h.id} costs $${fmt(a.priceK - h.priceK)}k less. Nothing in the span explains why.`}
      </Readout>
      <div className="mt-4">
        <NumpySnippet code={CODE} output={HOUSE_OUTPUT} />
      </div>
      <p className="mt-3 text-sm text-muted">
        The span of your features is everything a model built on them can tell apart. If a fact
        is outside it, no amount of mixing will bring it back; you have to add a feature.
      </p>
    </RunningExample>
  )
}
