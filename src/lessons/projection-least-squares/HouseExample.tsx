import { HouseTable, RunningExample } from '../../components/RunningExample'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Tex } from '../../components/Tex'
import { HOUSES } from '../../data/houses'
import { fmt } from '../../lib/format'
import {
  HOUSE_CODE,
  HOUSE_MAX_GAP,
  HOUSE_OUTPUT,
  HOUSE_PRED,
  HOUSE_RESID,
  HOUSE_SSE,
  HOUSE_WEIGHTS,
  SIZE_FIT,
  SIZE_SSE,
} from './houses'

const index = (id: string) => HOUSES.findIndex((h) => h.id === id)

export function HouseExample() {
  const [wSqft, wBed, wDist, bias] = HOUSE_WEIGHTS
  return (
    <RunningExample title="Predict a house's price from all three features">
      <p>
        Linear regression with three inputs instead of one. Put the features in the columns of X,
        add a column of 1s for the bias, and let least squares choose four weights:
      </p>
      <Tex block>{String.raw`\widehat{\text{price}} = ${fmt(wSqft, 3)}\cdot\text{sqft} + ${fmt(wBed, 2)}\cdot\text{bedrooms} - ${fmt(-wDist, 2)}\cdot\text{distance} + ${fmt(bias, 1)}`}</Tex>
      <HouseTable
        caption="Each house's real price, the model's prediction, and the gap (residual), in $k."
        extra={[
          { heading: 'predicted', cell: (h) => fmt(HOUSE_PRED[index(h.id)], 1) },
          { heading: 'residual', cell: (h) => fmt(HOUSE_RESID[index(h.id)], 1) },
        ]}
      />
      <div className="my-5">
        <NumpySnippet code={HOUSE_CODE} output={HOUSE_OUTPUT} />
      </div>
      <p>
        Every prediction is within ${fmt(HOUSE_MAX_GAP, 1)}k of the real price, and the sum of
        squared residuals is {fmt(HOUSE_SSE, 1)}. Using size alone, the best line is price ≈{' '}
        {fmt(SIZE_FIT.slope, 3)}·sqft + {fmt(SIZE_FIT.intercept, 1)}, with a sum of squared
        residuals of {fmt(SIZE_SSE, 1)}. The extra columns help a lot.
      </p>
      <p>
        The prices were made up from roughly 0.2·sqft + 15·bedrooms − 6·distance + 60, plus noise.
        The fit recovers size ({fmt(wSqft, 3)}), distance ({fmt(wDist, 2)}) and the bias (
        {fmt(bias, 1)}) well, but gives bedrooms only {fmt(wBed, 2)}, not 15. That is honest
        behaviour, not a bug: in these eight houses, bedrooms rise almost in step with size, so the
        data cannot tell their effects apart, and the size weight absorbs most of it. The
        predictions are still good; only the split between the two features is uncertain.
      </p>
    </RunningExample>
  )
}
