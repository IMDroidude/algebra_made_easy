import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { featureMatrix } from '../../data/houses'
import { fmt } from '../../lib/format'
import { SOLVE_HOUSES, TRUE_WEIGHTS, areaText, houseSnippet, rank, ruleFigures, solve, withArea } from './runningExample'

/** The running example: a redundant column keeps rank 3; three houses give three exact weights. */
export function HouseExample() {
  const snippet = houseSnippet()
  const b = ruleFigures()
  const w = solve(featureMatrix(SOLVE_HOUSES), b)
  const figure = new Map(SOLVE_HOUSES.map((h, k) => [h.id, fmt(b[k])]))
  const ids = SOLVE_HOUSES.map((h) => h.id)

  return (
    <RunningExample title="A column that adds nothing, and weights from three houses">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div>
          <p>
            Add a fourth column to the houses: the area in m². It looks like new data, but it is
            just sqft × 0.0929. The matrix grows from 3 to 4 columns, yet its rank stays at{' '}
            <strong data-testid="house-rank">{rank(withArea())}</strong> (it was{' '}
            {rank(featureMatrix())}): the extra column is a multiple of the first, so it points in
            no new direction and adds no information.
          </p>
          <p>
            Rank also tells you when weights can be pinned down. Say a pricing model gives
            houses {ids.join(', ')} the figures {b.map((x) => fmt(x)).join(', ')} ($k above a
            base price), from a rule you do not know. Three houses, three unknown weights:
          </p>
          <Tex block>{String.raw`X_3\,\mathbf{w} = \mathbf{b}, \qquad X_3 = \text{rows } ${ids.join(', ')} \text{ of } X`}</Tex>
          <p>
            These three houses are independent (X₃ has rank 3), so X₃ is invertible and there is
            exactly one answer: w = ({w.map((x) => fmt(x)).join(', ')}). That is $
            {fmt(TRUE_WEIGHTS[0])}k per sqft, ${fmt(TRUE_WEIGHTS[1])}k per bedroom and $
            {fmt(-TRUE_WEIGHTS[2])}k less per km. Use the m² column too and you would have 4
            unknowns but only 3 independent directions: no single answer.
          </p>
          <p className="text-sm text-muted">
            Real data matrices are often like this, with many columns but far fewer real
            directions. That is the low-rank idea from step 5.
          </p>
        </div>
        <div>
          <HouseTable
            columns={['sqft', 'bedrooms', 'distanceKm']}
            highlight={ids}
            caption="The houses with the extra column; A, B, C are used to solve for w"
            extra={[
              { heading: 'area (m²)', cell: areaText },
              { heading: 'model figure ($k)', cell: (h) => figure.get(h.id) ?? '—' },
            ]}
          />
          <NumpySnippet code={snippet.code} output={snippet.output} />
        </div>
      </div>
    </RunningExample>
  )
}
