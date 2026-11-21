import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { Readout, Toggle } from '../../components/ui'
import { HOUSES } from '../../data/houses'
import { fmt } from '../../lib/format'
import {
  HOUSE_ERRORS,
  HOUSE_MSE,
  HOUSE_SQUARES,
  PRICE_MODEL,
  distanceCode,
  distanceOutput,
  errorCode,
  errorOutput,
  featureDistance,
  features,
  npSum,
  predictPrice,
  priceError,
} from './houseData'
import { largestShare } from './powers'

const B = HOUSES[1]
const G = HOUSES[6]
const signed = (x: number) => (x < 0 ? `−${fmt(-x)}` : fmt(x))

/** Running example: squared errors of a price model, and the distance between two houses. */
export function HouseExample() {
  const [thousands, setThousands] = useState(false)

  const total = npSum(HOUSE_SQUARES)
  const worst = HOUSES[HOUSE_SQUARES.indexOf(Math.max(...HOUSE_SQUARES))]
  const fb = features(B, thousands)
  const fg = features(G, thousands)
  const diff = fg.map((x, k) => x - fb[k])
  const d = featureDistance(fb, fg)
  const squares = diff.map((x) => x * x)

  return (
    <RunningExample title="Squared errors and distances on the houses">
      <p>
        Take the price model from lessons 2.2 and 2.3,{' '}
        <Tex>{String.raw`\text{price} = ${PRICE_MODEL.m}\,\text{sqft} + ${PRICE_MODEL.b}`}</Tex>,
        and score it on the eight houses: error, then error squared, then the mean.
      </p>
      <HouseTable
        columns={['sqft', 'priceK']}
        highlight={[worst.id]}
        extra={[
          { heading: 'prediction', cell: (h) => fmt(predictPrice(h)) },
          { heading: 'error', cell: (h) => signed(priceError(h)) },
          { heading: 'error²', cell: (h) => fmt(priceError(h) ** 2) },
        ]}
        caption="Error = actual price − prediction, in $k"
      />
      <Readout>
        Squared errors add up to {fmt(total)}, so the mean squared error is {fmt(HOUSE_MSE, 3)}.
        House {worst.id} alone (error {signed(HOUSE_ERRORS[HOUSES.indexOf(worst)])}) gives{' '}
        {fmt(largestShare(HOUSE_SQUARES) * 100, 0)}% of that total.
      </Readout>
      <p style={{ marginTop: '1rem' }}>
        The square root of the mean squared error, √{fmt(HOUSE_MSE, 3)} ≈{' '}
        {fmt(Math.sqrt(HOUSE_MSE), 1)}, is back in $k: a typical miss of about $
        {fmt(Math.sqrt(HOUSE_MSE), 0)}k.
      </p>
      <NumpySnippet code={errorCode} output={errorOutput} />

      <h3 className="mt-6 mb-2 font-display text-xl">How far apart are two houses?</h3>
      <p>
        Each house is a list of three numbers, so the distance formula works on houses too:
        square each difference, add, take the root. From house B to house G:
      </p>
      <Tex block>
        {String.raw`d = \sqrt{${diff.map((x) => `${fmt(x, 3)}^2`).join(' + ')}} \approx ${fmt(d, 3)}`}
      </Tex>
      <Toggle checked={thousands} onChange={setThousands}>
        Measure size in thousands of sqft
      </Toggle>
      <Readout>
        Differences: {diff.map((x) => fmt(x, 3)).join(', ')} ({thousands ? 'thousands of sqft' : 'sqft'},
        bedrooms, km). Squared: {squares.map((x) => fmt(x, 3)).join(' + ')} = {fmt(d * d, 3)}, so
        the distance is {fmt(d, 3)}.{' '}
        {thousands
          ? 'Now all three features count about the same.'
          : 'Size supplies almost all of it: bedrooms and distance barely count.'}
      </Readout>
      <p style={{ marginTop: '1rem' }}>
        In square feet, a difference of 900 drowns out everything else, just because sqft numbers
        are big. Change the unit and the answer changes. Before measuring distances, models usually
        put every feature on a similar scale (<em>normalisation</em>), so no feature wins just by
        its unit.
      </p>
      <NumpySnippet code={distanceCode(B, G, thousands)} output={distanceOutput(B, G, thousands)} />
    </RunningExample>
  )
}
