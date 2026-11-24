import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Slider } from '../../components/Slider'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec } from '../../linalg'
import { pyFixed } from '../dot-product/pyFormat'
import { DOC_A, DOC_C, DOC_MAX_K, DOC_START_K, DOC_WORDS, docB, docScores, docSnippet } from './content'

const DOC_COLOR = { A: COLOR.j, B: COLOR.grid, C: COLOR.i } as const

/** One document's word counts as a row of bars, each with its number. */
function CountRow({ name, what, counts, max }: { name: 'A' | 'B' | 'C'; what: string; counts: Vec; max: number }) {
  return (
    <tr className="border-b border-line">
      <th scope="row" className="py-1.5 pr-3 text-left align-top font-normal">
        <Tag color={DOC_COLOR[name]}>{name}</Tag> <span className="text-muted">{what}</span>
      </th>
      {counts.map((c, k) => (
        <td key={DOC_WORDS[k]} className="py-1.5 pr-2 align-top">
          <span className="font-mono">{fmt(c)}</span>
          <span
            aria-hidden="true"
            className="mt-0.5 block h-1.5 rounded-full"
            style={{ width: `${(100 * c) / max}%`, background: DOC_COLOR[name] }}
          />
        </td>
      ))}
    </tr>
  )
}

export function ApplyStep() {
  const [k, setK] = useState(DOC_START_K)
  const B = docB(k)
  const s = docScores(k)
  const snippet = docSnippet(k)
  const max = Math.max(...B, ...DOC_A, ...DOC_C)
  // Which document each measure calls nearest to A. At k = 1, B is A itself.
  const byDistance = s.ab.distance <= s.ac.distance ? 'B' : 'C'
  const byCosine = s.ab.cosine >= s.ac.cosine ? 'B' : 'C'

  return (
    <Step
      n={5}
      kind="Apply"
      title="Long and short documents: where distance gets the wrong answer"
      visual={
        <>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface px-4 py-3">
            <table className="w-full border-collapse text-sm">
              <caption className="mb-2 text-left text-xs font-semibold tracking-widest text-muted uppercase">
                Word counts
              </caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-1 pr-3 font-semibold">Document</th>
                  {DOC_WORDS.map((w) => (
                    <th key={w} className="w-1/5 py-1 pr-2 font-semibold">
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CountRow name="A" what="short sports note" counts={DOC_A} max={max} />
                <CountRow name="B" what="sports article" counts={B} max={max} />
                <CountRow name="C" what="short politics note" counts={DOC_C} max={max} />
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Slider name="length of B" value={k} onChange={setK} min={1} max={DOC_MAX_K} step={1} accent={DOC_COLOR.B} />
            <p className="mt-1 mb-0 text-xs text-muted">How many times longer the sports article is than the note.</p>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Euclidean distance and cosine similarity from document A</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-1 pr-3 font-semibold">From A to…</th>
                  <th className="py-1 pr-3 text-right font-semibold">Euclidean distance</th>
                  <th className="py-1 text-right font-semibold">Cosine similarity</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ['B', 'same topic', s.ab],
                    ['C', 'different topic', s.ac],
                  ] as const
                ).map(([name, what, x]) => (
                  <tr key={name} className="border-b border-line">
                    <th scope="row" className="py-1 pr-3 text-left font-normal">
                      <Tag color={DOC_COLOR[name]}>{name}</Tag> <span className="text-muted">({what})</span>
                    </th>
                    <td className={`py-1 pr-3 text-right font-mono ${byDistance === name ? 'font-bold' : ''}`}>
                      {pyFixed(x.distance, 2)}
                      {byDistance === name && <span className="font-sans font-normal"> nearest</span>}
                    </td>
                    <td className={`py-1 text-right font-mono ${byCosine === name ? 'font-bold' : ''}`}>
                      {pyFixed(x.cosine, 3)}
                      {byCosine === name && <span className="font-sans font-normal"> most alike</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Readout>
            B is {k === 1 ? 'the same length as A' : `${k} times as long as A`}. Euclidean distance
            from A: {pyFixed(s.ab.distance, 2)} to B and {pyFixed(s.ac.distance, 2)} to C, so it calls{' '}
            {byDistance} the nearest. Cosine similarity with A: {pyFixed(s.ab.cosine, 3)} for B and{' '}
            {pyFixed(s.ac.cosine, 3)} for C, so it calls {byCosine} the most alike.{' '}
            <strong>
              {byDistance === byCosine
                ? 'The two measures agree.'
                : 'The two measures disagree: distance has picked the politics note, only because it is short.'}
            </strong>
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        A search system has to decide which stored document is most like a new one. Count three
        words in each document, {DOC_WORDS.join(', ')}, and every document becomes a vector:
      </p>
      <ul className="mt-0 mb-4 list-disc pl-6">
        <li>
          <Tag color={DOC_COLOR.A}>A</Tag>, a short sports note: (2, 1, 0);
        </li>
        <li>
          <Tag color={DOC_COLOR.B}>B</Tag>, a sports article with the same mix of words, only more
          of them;
        </li>
        <li>
          <Tag color={DOC_COLOR.C}>C</Tag>, a short politics note: (0, 1, 2).
        </li>
      </ul>
      <p>
        A and B are about the same thing. Start with B the same length as A, then drag the slider
        to make the article longer. Watch the two columns. The cosine similarity of A and B stays
        at 1.000: B points the same way however long it gets. The Euclidean distance keeps
        growing, and from 3 times the length it is larger than the distance to C.
      </p>
      <p>
        Distance treats &ldquo;more words&rdquo; as &ldquo;a different document&rdquo;. For text
        that is the wrong question: the topic is the <em>direction</em> of the vector, and the
        length only says how much was written. That is why text and embedding search use cosine
        similarity.
      </p>
      <p>
        The opposite mistake exists too. Cosine cannot tell (1, 1) from (100, 100). If those are a
        small order and a huge order of the same two products, the size is the whole point, and a
        distance is the right tool. And when length should count <em>in favour</em> of a match,
        such as a more popular film, the raw dot product from lesson 3.3 keeps it.
      </p>
      <p>
        In the code, <code>def cos(u, v):</code> defines a small function so the formula is
        written once, and <code>{'{…:.2f}'}</code> prints a number with 2 decimals.
      </p>
      <p className="text-sm text-muted">
        What this leaves out: real systems count thousands of words, or use embeddings with
        hundreds of numbers, and usually scale every vector to length 1 first. For vectors of
        length 1, ranking by Euclidean distance and ranking by cosine give the same order, so the
        choice disappears.
      </p>
    </Step>
  )
}
