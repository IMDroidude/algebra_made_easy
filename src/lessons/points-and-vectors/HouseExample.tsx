import type { ReactNode } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { RunningExample } from '../../components/RunningExample'
import { Tag } from '../../components/ui'
import { FEATURE_LABEL, FEATURES, featureVector } from '../../data/houses'
import { COLOR } from '../../lib/palette'
import { DIFF_AB, HOUSE_A, HOUSE_B, HOUSE_CODE, HOUSE_OUTPUT, RENOVATED_A, RENOVATION, diffWords, signedPart, tripleText } from './houses'

/** Running example: the gap between two houses is a vector, and so is a renovation. */
export function HouseExample() {
  const a = featureVector(HOUSE_A)
  const b = featureVector(HOUSE_B)
  return (
    <RunningExample title="How two houses differ is a vector">
      <p>
        House A is the list {tripleText(a)}: sqft, bedrooms, km to the centre. House B is{' '}
        {tripleText(b)}. Subtract, feature by feature, and you get the vector from A to B:
      </p>
      <SumTable
        caption="House B minus house A, feature by feature"
        rows={[
          { name: <Tag color={COLOR.i}>house B (point)</Tag>, values: b },
          { name: <>minus <Tag color={COLOR.ghost}>house A (point)</Tag></>, values: a },
          { name: <Tag color={COLOR.v}>B − A (vector)</Tag>, values: DIFF_AB, signed: true },
        ]}
      />
      <p>
        <strong>B − A = {tripleText(DIFF_AB)}</strong>: B is {diffWords(DIFF_AB)}. It is the
        movement that takes you from A to B in &ldquo;house space&rdquo;.
      </p>
      <p>
        A <strong>renovation</strong> that adds 200 sqft and one bedroom, and of course does not
        move the house, is the vector {tripleText(RENOVATION)}. Add it to house A:
      </p>
      <SumTable
        caption="House A plus a renovation"
        rows={[
          { name: <Tag color={COLOR.ghost}>house A (point)</Tag>, values: a },
          { name: <>plus <Tag color={COLOR.v}>renovation (vector)</Tag></>, values: RENOVATION, signed: true },
          { name: <Tag color={COLOR.result}>renovated A (point)</Tag>, values: RENOVATED_A },
        ]}
      />
      <p>
        Point + vector = new point, exactly as on the map. Notice that a vector can be read two
        ways. As a <strong>movement</strong>: {tripleText(DIFF_AB)} says how to get from A to B.
        As <strong>information</strong>: {tripleText(a)} is simply house A&rsquo;s list of
        features. Same kind of object, same arithmetic; the meaning comes from what the numbers
        stand for.
      </p>
      <NumpySnippet code={HOUSE_CODE} output={HOUSE_OUTPUT} />
    </RunningExample>
  )
}

function SumTable({
  caption,
  rows,
}: {
  caption: string
  rows: { name: ReactNode; values: readonly number[]; signed?: boolean }[]
}) {
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-left">
            <th className="py-1 pr-3 font-semibold"> </th>
            {FEATURES.map((f) => (
              <th key={f} className="py-1 pr-3 text-right font-semibold">
                {FEATURE_LABEL[f]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={k} className={k === rows.length - 1 ? 'border-t-2 border-line font-semibold' : 'border-b border-line'}>
              <th className="py-1 pr-3 text-left font-normal">{r.name}</th>
              {r.values.map((v, i) => (
                <td key={i} className="py-1 pr-3 text-right font-mono">
                  {r.signed ? signedPart(v) : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
