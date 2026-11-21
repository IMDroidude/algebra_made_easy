import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Readout } from '../../components/ui'
import { HOUSES } from '../../data/houses'
import { Choice } from './LivingRoom'
import { AVERAGE_HOUSE, HOUSE_FRAME_CODE, HOUSE_FRAME_OUTPUT, SQFT_PER_M2, cellText, houseInFrame } from './houses'
import type { HouseOrigin, SizeUnit } from './houses'

const ORIGINS: { id: HouseOrigin; label: string }[] = [
  { id: 'zero', label: 'Zero (raw numbers)' },
  { id: 'average', label: 'The average house' },
]
const UNITS: { id: SizeUnit; label: string }[] = [
  { id: 'sqft', label: 'Square feet' },
  { id: 'm2', label: 'Square metres' },
]

/** Running example: the same houses with a different origin (the average house) and a different unit (m²). */
export function HouseExample() {
  const [origin, setOrigin] = useState<HouseOrigin>('zero')
  const [unit, setUnit] = useState<SizeUnit>('sqft')
  const sizeName = unit === 'm2' ? 'm²' : 'sqft'
  const a = houseInFrame(HOUSES[0], origin, unit)
  const text = (v: number[]) => `(${v.map((x, i) => cellText(x, i, unit)).join(', ')})`

  return (
    <RunningExample title="Choosing an origin and units for the houses">
      <p>
        Data needs an origin and units too. The whole house dataset is a <strong>matrix</strong>,
        a table of numbers: <strong>rows are examples</strong> (8 houses) and{' '}
        <strong>columns are features</strong> (size, bedrooms, distance). Its shape is (8, 3).
        Choosing a new origin or unit changes every number in it, but no house changes.
      </p>
      <div className="flex flex-wrap gap-x-6">
        <Choice legend="Measure from" value={origin} options={ORIGINS} onChange={setOrigin} />
        <Choice legend="Size in" value={unit} options={UNITS} onChange={setUnit} />
      </div>
      <HouseTable
        columns={[]}
        caption={`The houses measured from ${origin === 'zero' ? 'zero' : 'the average house'}, size in ${sizeName}`}
        highlight={['A']}
        extra={[0, 1, 2].map((i) => ({
          heading: [`size (${sizeName})`, 'bedrooms', 'distance (km)'][i],
          cell: (h) => cellText(houseInFrame(h, origin, unit)[i], i, unit),
        }))}
      />
      <Readout>
        House A is {text(a)}
        {origin === 'average'
          ? ', measured from the average house. A minus sign means below average.'
          : ', the raw numbers, measured from zero.'}
        {unit === 'm2' && ` Size is in square metres: sqft ÷ ${SQFT_PER_M2}, rounded to 0.1.`}
      </Readout>
      <p className="mt-4">
        <strong>Centring</strong> moves the origin to the average house, ({cellText(AVERAGE_HOUSE[0], 0, 'sqft')} sqft,{' '}
        {AVERAGE_HOUSE[1]} bedrooms, {AVERAGE_HOUSE[2]} km). After it, each number says how far a house is above
        or below average. Many models train better this way. <strong>Changing units</strong>{' '}
        divides one column: 1 m² is {SQFT_PER_M2} sqft.
      </p>
      <p>
        In the code, <code>X.mean(axis=0)</code> averages down each column, giving one number per
        feature. <code>X - average</code> subtracts that row from every row (broadcasting, as
        above).
      </p>
      <NumpySnippet code={HOUSE_FRAME_CODE} output={HOUSE_FRAME_OUTPUT} />
    </RunningExample>
  )
}
