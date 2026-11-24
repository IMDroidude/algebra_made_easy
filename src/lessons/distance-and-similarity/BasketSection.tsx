import { useState } from 'react'
import { Button, Readout, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec } from '../../linalg'
import { euclidean, hamming, jaccard, pearson } from '../../linalg/distance'
import { cosineSimilarity } from '../../linalg/projection'
import { ContinuedStep } from '../dot-product/ContinuedStep'
import { pyFixed } from '../dot-product/pyFormat'
import { BASKETS, FILMS, PRODUCTS, RATINGS, SHOPPERS, SHOP_SIZES } from './content'

const SHOPPER_COLOR = [COLOR.j, COLOR.i] as const

const RATERS = Object.keys(RATINGS) as (keyof typeof RATINGS)[]
const RATING_PAIRS: [keyof typeof RATINGS, keyof typeof RATINGS][] = [
  ['Ali', 'Sara'],
  ['Ali', 'Omar'],
]

/** Step 5, continued: yes/no data, compared with Hamming distance and Jaccard similarity. */
export function BasketSection() {
  const [baskets, setBaskets] = useState<[Vec, Vec]>(BASKETS)
  const [shop, setShop] = useState<number>(SHOP_SIZES[0])

  const toggle = (who: number, item: number) =>
    setBaskets(
      baskets.map((b, w) => (w === who ? b.map((x, k) => (k === item ? 1 - x : x)) : b)) as [Vec, Vec],
    )

  const [a, b] = baskets
  const differ = hamming(a, b)
  const both = a.filter((x, k) => x === 1 && b[k] === 1).length
  const either = a.filter((x, k) => x === 1 || b[k] === 1).length
  const j = jaccard(a, b)
  // Products beyond the six listed are bought by nobody, so they always match.
  const matching = (shop - differ) / shop
  const names = (keep: (k: number) => boolean) => PRODUCTS.filter((_, k) => keep(k)).join(', ') || 'none'

  return (
    <ContinuedStep
      id="baskets-heading"
      kicker="Step 5 · Apply, continued"
      title="Yes/no data: shopping baskets"
      visual={
        <>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface px-4 py-3">
            <table className="w-full border-collapse text-sm">
              <caption className="mb-2 text-left text-xs font-semibold tracking-widest text-muted uppercase">
                Who bought what (tick to change)
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <td />
                  {PRODUCTS.map((p) => (
                    <th key={p} className="px-1 py-1 text-center text-xs font-semibold">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHOPPERS.map((who, w) => (
                  <tr key={who} className="border-b border-line">
                    <th scope="row" className="py-1.5 pr-2 text-left">
                      <Tag color={SHOPPER_COLOR[w]}>{who}</Tag>
                    </th>
                    {PRODUCTS.map((p, k) => (
                      <td key={p} className="px-1 py-1.5 text-center">
                        <input
                          type="checkbox"
                          aria-label={`${who} buys ${p}`}
                          checked={baskets[w][k] === 1}
                          onChange={() => toggle(w, k)}
                          style={{ accentColor: SHOPPER_COLOR[w] }}
                        />
                        <span className="block font-mono text-xs text-muted">{baskets[w][k]}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span>Products the shop sells:</span>
            {SHOP_SIZES.map((n) => (
              <Button
                key={n}
                variant={n === shop ? 'primary' : 'secondary'}
                aria-pressed={n === shop}
                onClick={() => setShop(n)}
              >
                {n.toLocaleString('en-US')}
              </Button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border-2 border-line bg-surface px-2 py-2">
              <p className="m-0 text-xs font-semibold tracking-widest text-muted uppercase">Hamming</p>
              <p className="m-0 font-mono text-2xl font-bold">{differ}</p>
              <p className="m-0 text-xs text-muted">products differ</p>
            </div>
            <div className="rounded-lg border-2 border-line bg-surface px-2 py-2">
              <p className="m-0 text-xs font-semibold tracking-widest text-muted uppercase">Matching</p>
              <p className="m-0 font-mono text-2xl font-bold">{pyFixed(matching, 4)}</p>
              <p className="m-0 text-xs text-muted">share of all products</p>
            </div>
            <div className="rounded-lg border-2 border-accent bg-surface px-2 py-2">
              <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">Jaccard</p>
              <p className="m-0 font-mono text-2xl font-bold">{j === null ? 'none' : pyFixed(j, 3)}</p>
              <p className="m-0 text-xs text-muted">
                {both} shared of {either}
              </p>
            </div>
          </div>

          <Readout>
            <Tag color={SHOPPER_COLOR[0]}>Ali</Tag> = {fmtVec(a)}, <Tag color={SHOPPER_COLOR[1]}>Sara</Tag>{' '}
            = {fmtVec(b)}. Both bought: {names((k) => a[k] === 1 && b[k] === 1)}. Only one bought:{' '}
            {names((k) => a[k] !== b[k])}. Hamming distance {differ}.{' '}
            {j === null
              ? 'Both baskets are empty, so there is nothing to share and Jaccard similarity is undefined.'
              : `Jaccard similarity ${both} ÷ ${either} = ${pyFixed(j, 3)}.`}{' '}
            In a shop of {shop.toLocaleString('en-US')} products they match on{' '}
            {(shop - differ).toLocaleString('en-US')}, a share of {pyFixed(matching, 4)}.
          </Readout>
        </>
      }
    >
      <p>
        Not every vector holds measurements. A shopping basket is a list of yes/no answers, one
        per product: 1 for &ldquo;bought it&rdquo;, 0 for &ldquo;did not&rdquo;. For data like
        this, two other measures are the usual choice.
      </p>
      <p>
        <strong>Hamming distance</strong> counts the positions where the two vectors differ. It
        suits anything made of positions that are simply the same or not: bits, letters in a
        code, answers in a multiple-choice test.
      </p>
      <p>
        <strong>Jaccard similarity</strong> is the number of items both have, divided by the
        number of items at least one has. Ali and Sara share milk and bread, and between them
        bought five different things: 2 ÷ 5 = 0.4.
      </p>
      <p>
        Now press <strong>10,000</strong>. A real shop sells thousands of products, and almost
        none of them is in either basket. Counted position by position, Ali and Sara now agree
        on 9,997 of 10,000: they look almost identical, like every other pair of customers. Jaccard
        does not move, because it ignores everything neither of them bought. That is the rule of
        thumb: when a 0 means &ldquo;nothing to report&rdquo; and most entries are 0, use Jaccard.
      </p>

    </ContinuedStep>
  )
}

/** Step 5, continued: ratings with different baselines, compared with Pearson correlation. */
export function RatingsSection() {
  return (
    <ContinuedStep
      id="ratings-heading"
      kicker="Step 5 · Apply, continued"
      title="Ratings: when everyone has their own baseline"
      visual={
        <div className="rounded-xl border border-line bg-surface px-4 py-1">
      <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Ratings of four films by three people</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-1 pr-3 font-semibold">Rater</th>
                  {FILMS.map((f) => (
                    <th key={f} className="py-1 pr-2 text-right font-semibold">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RATERS.map((r) => (
                  <tr key={r} className="border-b border-line">
                    <th scope="row" className="py-1 pr-3 text-left font-normal">
                      {r}
                    </th>
                    {RATINGS[r].map((x, k) => (
                      <td key={FILMS[k]} className="py-1 pr-2 text-right font-mono">
                        {x}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Three measures on two pairs of raters</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-1 pr-3 font-semibold">Pair</th>
                  <th className="py-1 pr-2 text-right font-semibold">Euclidean</th>
                  <th className="py-1 pr-2 text-right font-semibold">Cosine</th>
                  <th className="py-1 text-right font-semibold">Pearson</th>
                </tr>
              </thead>
              <tbody>
                {RATING_PAIRS.map(([x, y]) => (
                  <tr key={`${x}-${y}`} className="border-b border-line">
                    <th scope="row" className="py-1 pr-3 text-left font-normal">
                      {x} and {y}
                    </th>
                    <td className="py-1 pr-2 text-right font-mono">{fmt(euclidean([...RATINGS[x]], [...RATINGS[y]]))}</td>
                    <td className="py-1 pr-2 text-right font-mono">
                      {pyFixed(cosineSimilarity([...RATINGS[x]], [...RATINGS[y]]) ?? 0, 3)}
                    </td>
                    <td className="py-1 text-right font-mono font-bold">
                      {pyFixed(pearson([...RATINGS[x]], [...RATINGS[y]]) ?? 0, 3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }
    >
      <p>
        Three people rate the same four films from 1 to 5. Sara has Ali&rsquo;s taste exactly but
        always gives one star less. Omar likes what Ali dislikes.
      </p>
      <p>
        <strong>Pearson correlation</strong> subtracts each person&rsquo;s own average first, then
        takes the cosine. Sara&rsquo;s strictness vanishes and her agreement with Ali is a perfect
        1.000. It also exposes Omar: his cosine with Ali is 0.794, which looks like agreement,
        only because all ratings are positive numbers and so all point roughly the same way.
        Pearson gives −0.926. Use it when every vector has its own baseline.
      </p>
    </ContinuedStep>
  )
}
