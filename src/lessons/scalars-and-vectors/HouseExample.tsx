import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { housesNumpy } from '../../data/houses'
import { fmt } from '../../lib/format'
import { AVERAGE_HOUSE, B_MINUS_A, HOUSE_A, HOUSE_B, HOUSE_OUTPUT, HOUSE_SUM, TWO_A } from './houseMath'

const col = (v: readonly number[]) => String.raw`\begin{bmatrix} ${v.map((x) => fmt(x, 3)).join(String.raw` \\ `)} \end{bmatrix}`

const CODE = [
  'import numpy as np',
  '',
  housesNumpy(),
  '',
  'a, b = X[0], X[1]       # Garden flat, Corner house',
  'print(b - a)',
  'print(2 * a)',
  'print(X.sum(axis=0) / 8)  # add the 8 rows, divide by 8',
].join('\n')

/** Running example for 3.1: subtract, scale and average house feature vectors. */
export function HouseExample() {
  return (
    <RunningExample title="Houses are vectors too">
      <p>
        Each house in the course dataset is a vector of three numbers: [size in sqft, bedrooms,
        distance to the centre in km]. The same three operations work on it, one entry at a time.
      </p>
      <HouseTable highlight={['A', 'B']} />
      <p>
        <strong>Subtract.</strong> b − a says how the Corner house differs from the Garden flat:
      </p>
      <Tex block>{String.raw`\mathbf{b} - \mathbf{a} = ${col(HOUSE_B)} - ${col(HOUSE_A)} = ${col(B_MINUS_A)}`}</Tex>
      <p>
        {fmt(B_MINUS_A[0])} sqft bigger, {fmt(B_MINUS_A[1])} more bedroom, and{' '}
        {fmt(-B_MINUS_A[2])} km closer to the centre.
      </p>
      <p>
        <strong>Scale.</strong> 2a = [{TWO_A.join(', ')}]. That is not &ldquo;a house twice as
        good&rdquo;. Every entry doubles, so it is also twice as far from the centre. Scaling
        stretches all the numbers equally; it knows nothing about what they mean.
      </p>
      <p>
        <strong>Average.</strong> Add all eight vectors and divide by 8. The total is [
        {HOUSE_SUM.join(', ')}], so the average house is [{AVERAGE_HOUSE.map((x) => fmt(x, 3)).join(', ')}]:{' '}
        {fmt(AVERAGE_HOUSE[0])} sqft, {fmt(AVERAGE_HOUSE[1], 3)} bedrooms,{' '}
        {fmt(AVERAGE_HOUSE[2])} km out. No real house has {fmt(AVERAGE_HOUSE[1], 3)} bedrooms,
        but the average is still a useful middle point.
      </p>
      <NumpySnippet code={CODE} output={HOUSE_OUTPUT} />
      <p className="mt-3 text-sm text-muted">
        <code>X[0]</code> is the first row of the table. <code>X.sum(axis=0)</code> adds the rows
        together, giving one total per column.
      </p>
    </RunningExample>
  )
}
