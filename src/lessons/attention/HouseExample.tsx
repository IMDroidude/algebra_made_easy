import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { HOUSES } from '../../data/houses'
import { fmt } from '../../lib/format'
import { HOUSE_CODE, HOUSE_ESTIMATE, HOUSE_OUTPUT, HOUSE_SCORES, HOUSE_WEIGHTS, TOP_TWO, WANTED } from './houses'

const index = (id: string) => HOUSES.findIndex((h) => h.id === id)
const name = (id: string) => HOUSES[index(id)].name

export function HouseExample() {
  const [first, second] = TOP_TWO
  return (
    <RunningExample title="Similar houses vote on the price">
      <p>
        A buyer wants about {WANTED[0]} sqft, {WANTED[1]} bedrooms, {WANTED[2]} km from the
        centre. What might that cost? Treat it as attention with a single query.
      </p>
      <p>
        The <strong>query</strong> is the buyer&rsquo;s wish, the <strong>keys</strong> are the
        eight houses&rsquo; features, and the <strong>values</strong> are their prices. Score each
        house by q·k / √3, softmax the scores into weights, and average the prices with those
        weights.
      </p>
      <p>
        Scale the features first (subtract the mean, divide by the standard deviation), or sqft, in
        the thousands, would decide every dot product on its own.
      </p>
      <HouseTable
        highlight={TOP_TWO}
        caption="Each house's score against the buyer's wish and its softmax weight. The two largest weights are highlighted."
        extra={[
          { heading: 'score', cell: (h) => fmt(HOUSE_SCORES[index(h.id)], 2) },
          { heading: 'weight', cell: (h) => fmt(HOUSE_WEIGHTS[index(h.id)], 2) },
        ]}
      />
      <Tex block>{String.raw`\text{estimate} = \sum_j w_j\,\text{price}_j \approx ${fmt(HOUSE_ESTIMATE, 1)}\text{ (\$k)}`}</Tex>
      <p>
        The {name(first)} ({first}) and the {name(second)} ({second}) get most of the weight, so
        the estimate, ${fmt(HOUSE_ESTIMATE, 1)}k, lands between their prices. Notice that the{' '}
        {name(first)} beats the {name(second)} even though it is further from the wish on distance:
        a dot product rewards keys that point the same way <em>and are longer</em>, not keys that
        are closest.
      </p>
      <div className="my-5">
        <NumpySnippet code={HOUSE_CODE} output={HOUSE_OUTPUT} />
      </div>
      <p className="text-sm text-muted">
        Honest note: this is an analogy that uses the same arithmetic. A real transformer does not
        compare raw features. It learns matrices W_Q, W_K and W_V that turn each token into its
        query, key and value, so it decides for itself what &ldquo;similar&rdquo; should mean.
      </p>
    </RunningExample>
  )
}
