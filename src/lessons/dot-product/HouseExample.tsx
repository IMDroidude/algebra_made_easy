import { Link } from 'react-router-dom'
import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { HOUSES, housesNumpy } from '../../data/houses'
import { fmt } from '../../lib/format'
import { BIAS, HOUSE_OUTPUT, WEIGHTS, predict, residual } from './houseMath'

const B = HOUSES[1]
const signed = (x: number) => (x > 0 ? `+${fmt(x)}` : fmt(x))

const CODE = [
  'import numpy as np',
  '',
  housesNumpy(),
  '',
  `w = np.array([${WEIGHTS.join(', ')}])  # $k per sqft, per bedroom, per km`,
  `pred = X @ w + ${BIAS}   # one dot product per house`,
  'print(pred)',
  'print(y - pred)     # real price minus prediction',
].join('\n')

/** Running example for 3.3: a linear price model is a dot product of weights and features. */
export function HouseExample() {
  return (
    <RunningExample title="A price model is a dot product">
      <p>
        Give each feature a weight: ${fmt(WEIGHTS[0])}k per sqft, ${fmt(WEIGHTS[1])}k per bedroom
        and −${fmt(-WEIGHTS[2])}k per km from the centre, plus a base price of ${BIAS}k. The
        predicted price is the dot product of the weights with the house, plus that base. For
        house B ({B.name}):
      </p>
      <Tex block>
        {String.raw`\mathbf{w}\cdot\mathbf{b} + ${BIAS} = ${fmt(WEIGHTS[0])}\cdot${B.sqft} + ${fmt(WEIGHTS[1])}\cdot${B.bedrooms} + (${fmt(WEIGHTS[2])})\cdot${B.distanceKm} + ${BIAS} = ${fmt(predict(B))}`}
      </Tex>
      <p>
        Its real price is ${B.priceK}k, so the model is off by ${fmt(Math.abs(residual(B)))}k. Here
        is every house:
      </p>
      <HouseTable
        extra={[
          { heading: 'predicted ($k)', cell: (h) => fmt(predict(h)) },
          { heading: 'real − predicted', cell: (h) => signed(residual(h)) },
        ]}
      />
      <p>
        The negative weight says &ldquo;further out is cheaper&rdquo;. A large dot product means
        the house lines up with what the weights reward. None of the errors is bigger than $
        {fmt(Math.max(...HOUSES.map((h) => Math.abs(residual(h)))))}k: a good fit for three
        multiplications and a sum.
      </p>
      <NumpySnippet code={CODE} output={HOUSE_OUTPUT} />
      <p className="mt-3 text-sm text-muted">
        <code>X @ w</code> takes the dot product of <code>w</code> with every row of{' '}
        <code>X</code> at once, giving one number per house. These weights were picked by hand;{' '}
        <Link to="/lessons/projection-least-squares">lesson 5.2</Link> shows how to find the best
        ones from the data.
      </p>
    </RunningExample>
  )
}
