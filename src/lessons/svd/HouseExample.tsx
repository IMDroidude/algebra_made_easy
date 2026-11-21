import { NumpySnippet } from '../../components/NumpySnippet'
import { RunningExample } from '../../components/RunningExample'
import { fmt } from '../../lib/format'
import {
  BIG_FULL,
  BIG_RANK2,
  BIG_ROWS,
  HOUSE_CODE,
  HOUSE_COLS,
  HOUSE_DIRECTIONS,
  HOUSE_KEPT,
  HOUSE_OUTPUT,
  HOUSE_ROWS,
  HOUSE_S,
  HOUSE_STORAGE,
} from './houses'

const pct = (x: number) => `${fmt(100 * x, 1)}%`
const full = HOUSE_ROWS * HOUSE_COLS

export function HouseExample() {
  const [d1, d2] = HOUSE_DIRECTIONS
  return (
    <RunningExample title="How many ideas are in the house table?">
      <p>
        Stack the eight houses as an {HOUSE_ROWS} × {HOUSE_COLS} matrix (size, bedrooms, distance)
        and take its SVD. First standardise each column (subtract its mean, divide by its standard
        deviation), otherwise sqft, in the thousands, would swamp the other two.
      </p>
      <p>
        The singular values are {HOUSE_S.map((s) => fmt(s, 2)).join(', ')}. The third is tiny, so
        a rank-2 approximation keeps almost everything:
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse text-sm">
          <caption className="mb-2 text-left text-muted">
            Keeping the k largest singular values of the house matrix.
          </caption>
          <thead>
            <tr className="border-b-2 border-line text-left">
              <th className="py-1.5 pr-3 font-semibold">rank k</th>
              <th className="py-1.5 pr-3 text-right font-semibold">spread kept</th>
              <th className="py-1.5 pr-3 text-right font-semibold">numbers stored</th>
            </tr>
          </thead>
          <tbody>
            {HOUSE_KEPT.map((kept, k) => (
              <tr key={k} className="border-b border-line">
                <td className="py-1.5 pr-3 font-mono">{k + 1}</td>
                <td className="py-1.5 pr-3 text-right font-mono">{pct(kept)}</td>
                <td className="py-1.5 pr-3 text-right font-mono">{HOUSE_STORAGE[k]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        The two kept directions have meanings. The first mixes size ({fmt(d1[0], 2)}) and bedrooms (
        {fmt(d1[1], 2)}) with a little distance ({fmt(d1[2], 2)}): <strong>overall size</strong>.
        The second is mostly distance ({fmt(d2[2], 2)}): <strong>how far out</strong>. Three
        columns, but really two ideas, because size and bedrooms rise together.
      </p>
      <div className="my-5">
        <NumpySnippet code={HOUSE_CODE} output={HOUSE_OUTPUT} />
      </div>
      <p className="text-sm text-muted">
        Storage, honestly: the full table is {full} numbers, rank 1 stores {HOUSE_STORAGE[0]} (and
        keeps {pct(HOUSE_KEPT[0])}), and rank 2 stores {HOUSE_STORAGE[1]}, no saving at this size.
        The saving shows on tall tables: for {BIG_ROWS.toLocaleString('en-US')} houses, rank 2
        stores {BIG_RANK2.toLocaleString('en-US')} numbers instead of{' '}
        {BIG_FULL.toLocaleString('en-US')}. The signs of the directions can flip between libraries,
        so the snippet prints their sizes only.
      </p>
    </RunningExample>
  )
}
