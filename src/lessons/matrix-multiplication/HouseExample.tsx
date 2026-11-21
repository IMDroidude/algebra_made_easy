import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { HOUSE_B, houseSnippet, oneMatrix, scoreText, swapped } from './runningExample'

/** The running example: unit conversion, then a mixing layer, as one product matrix. */
export function HouseExample() {
  const snippet = houseSnippet()
  return (
    <RunningExample title="Two steps on the houses, one matrix">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div>
          <p>
            Take each house as a column (sqft, bedrooms, km). Step 1, <strong>U</strong>, converts
            units: square feet to square metres (× 0.0929) and km to miles (× 0.6214). Step 2,{' '}
            <strong>M</strong>, mixes the features: a space score of m² plus 10 per bedroom, the
            bedrooms, and closeness (minus the miles).
          </p>
          <Tex block>{String.raw`M(U\mathbf{x}) = (MU)\,\mathbf{x}`}</Tex>
          <p>
            So the product MU does both steps in one go, with the same results. For house{' '}
            {HOUSE_B.id} the space score is {scoreText(oneMatrix(HOUSE_B)[0])} either way.
          </p>
          <p>
            Swap the order and you get UM: mix first, then convert. Now the &ldquo;10 per
            bedroom&rdquo; is added to square feet, not square metres, and then shrunk with them.
            House {HOUSE_B.id} scores {scoreText(swapped(HOUSE_B)[0])} instead. Same two matrices,
            different answer.
          </p>
        </div>
        <div>
          <HouseTable
            columns={['sqft', 'bedrooms']}
            highlight={[HOUSE_B.id]}
            caption="Space score per house, with the two matrices in each order"
            extra={[
              { heading: 'MU: convert, then mix', cell: (h) => scoreText(oneMatrix(h)[0]) },
              { heading: 'UM: mix, then convert', cell: (h) => scoreText(swapped(h)[0]) },
            ]}
          />
          <NumpySnippet code={snippet.code} output={snippet.output} />
        </div>
      </div>
    </RunningExample>
  )
}
