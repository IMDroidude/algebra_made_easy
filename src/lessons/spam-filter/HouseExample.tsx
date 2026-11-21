import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import {
  FISHER_VERDICTS,
  HOUSE_B,
  HOUSE_CENTRES,
  HOUSE_D,
  HOUSE_FISHER,
  HOUSE_FISHER_B,
  HOUSE_MID,
  PLAIN_VERDICTS,
  PRICEY_FROM,
  houseSnippet,
  isPricey,
  rightCount,
} from './runningExample'

const wrongIds = (v: typeof PLAIN_VERDICTS) => v.filter((x) => !x.right).map((x) => x.house.id)

/** Running example for 5.1: the same recipe sorts the houses into expensive and not. */
export function HouseExample() {
  const [corrected, setCorrected] = useState(false)
  const verdicts = corrected ? FISHER_VERDICTS : PLAIN_VERDICTS
  const byId = new Map(verdicts.map((v) => [v.house.id, v]))
  const snippet = houseSnippet(corrected)
  const plainWrong = wrongIds(PLAIN_VERDICTS)

  return (
    <RunningExample title="The same recipe sorts the houses">
      <p>
        Call a house <strong>expensive</strong> if it costs at least ${PRICEY_FROM}k: that is D, F and G. Describe each
        house by two features, size in thousands of sqft and distance to the centre in km, and follow the recipe:
      </p>
      <Tex block>
        {String.raw`\mu_{\text{cheap}} = ${fmtVec(HOUSE_CENTRES.normal)}, \quad \mu_{\text{expensive}} = ${fmtVec(HOUSE_CENTRES.spam)}, \quad \mathbf{w} = \mathbf{d} = ${fmtVec(HOUSE_D)}, \quad b = \mathbf{w}\cdot${fmtVec(HOUSE_MID)} = ${fmt(HOUSE_B)}`}
      </Tex>
      <Toggle checked={corrected} onChange={setCorrected}>
        Use the scatter correction from step 4 (w = S_w⁻¹ d)
      </Toggle>
      <HouseTable
        columns={['sqft', 'distanceKm', 'priceK']}
        extra={[
          { heading: 'expensive?', cell: (h) => (isPricey(h) ? 'yes' : 'no') },
          { heading: 'score', cell: (h) => fmt(byId.get(h.id)!.score) },
          { heading: 'says', cell: (h) => (byId.get(h.id)!.pricey ? 'yes' : 'no') },
          { heading: 'right?', cell: (h) => (byId.get(h.id)!.right ? '✓' : '✗ wrong') },
        ]}
        caption={
          corrected
            ? `Scores with w = ${fmtVec(HOUSE_FISHER)}, threshold ${fmt(HOUSE_FISHER_B)}: ${rightCount(verdicts)} of 8 right.`
            : `Scores with w = ${fmtVec(HOUSE_D)}, threshold ${fmt(HOUSE_B)}: ${rightCount(verdicts)} of 8 right.`
        }
      />
      {!corrected ? (
        <p>
          Honest result: only {rightCount(PLAIN_VERDICTS)} of 8, wrong on {plainWrong.join(', ')}. The distances run
          from 2 to 15 km while sizes only run from 0.9 to 2.4, so the score is mostly distance. And in these eight
          houses the expensive ones happen to be a little further out on average (9 km against 6.6), so the recipe
          learns &ldquo;far means expensive&rdquo;: the remote cottage H is called expensive and the biggest house, G,
          is not. Round, equal clouds were what made the plain recipe work for the emails.
        </p>
      ) : (
        <p>
          With the correction, {rightCount(FISHER_VERDICTS)} of 8. S_w notices that distance varies a lot{' '}
          <em>inside</em> each group, so it tells you little, and S_w⁻¹ turns its weight right down: w ={' '}
          {fmtVec(HOUSE_FISHER)} leans almost entirely on size. That is the &ldquo;stretched clouds&rdquo; case from the
          advanced part of step 4. With only eight houses, treat this as a picture of the idea, not a tested model.
        </p>
      )}
      <NumpySnippet code={snippet.code} output={snippet.output} />
      <p className="mt-3 text-sm text-muted">
        <code>X[:, [0, 2]]</code> keeps columns 0 and 2 (size and distance); dividing by <code>[1000, 1]</code> turns
        sqft into thousands. <code>~pricey</code> flips True and False, so <code>F[~pricey]</code> is the cheaper
        houses.
      </p>
    </RunningExample>
  )
}
