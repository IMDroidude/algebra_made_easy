import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { Arrow, DraggableArrow, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { attention, closestByAngle } from '../../linalg/attention'
import type { Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import {
  EXTENT,
  QUERY_COLOR,
  SNAP,
  START_K,
  START_Q,
  START_V,
  TOKENS,
  TOKEN_COLOR,
  name,
  setAt,
} from './data'
import { PracticeStep } from './PracticeStep'
import { PredictStep } from './PredictStep'
import { UnderstandStep } from './UnderstandStep'
import { HeatMap } from './widgets'

/** Wraps negative numbers in brackets so products read correctly: 2 · (−1). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

/** LaTeX: highlight an entry in the result colour and bold. */
const hl = (on: boolean, tex: string) =>
  on ? `\\textcolor{${COLOR.result}}{\\boldsymbol{${tex}}}` : tex

export function Lesson() {
  const [Q, setQ] = useState<Vec2[]>(START_Q)
  const [K, setK] = useState<Vec2[]>(START_K)
  const [V, setV] = useState<Vec2[]>(START_V)
  const [sel, setSel] = useState(0)
  const [key, setKey] = useState(1)

  const r = attention(Q, K, V)
  const q = Q[sel]
  const k = K[key]
  const scoreRow = r.scores[sel]
  const best = scoreRow.indexOf(Math.max(...scoreRow))

  // Step 1: which key points most nearly the same way as q1 (largest cosine).
  const closest = closestByAngle(Q[0], K)

  const rowNames = TOKENS.map((t, i) => `${name('q', i)} ${t}`)
  const colNames = TOKENS.map((t, j) => `${name('k', j)} ${t}`)

  const qMatrix = Q.map(
    ([a, b], i) => `${hl(i === sel, fmt(a))} & ${hl(i === sel, fmt(b))}`,
  ).join(String.raw` \\ `)
  const ktMatrix = [0, 1]
    .map((c) => K.map((kk, j) => hl(j === key, fmt(kk[c]))).join(' & '))
    .join(String.raw` \\ `)
  const sMatrix = r.scores
    .map((row, i) => row.map((s, j) => hl(i === sel && j === key, fmt(s))).join(' & '))
    .join(String.raw` \\ `)

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="attention">
        Attention is how a transformer lets each word in a sentence gather information from the
        other words. It is built entirely from things you already know: dot products, a matrix
        product, a transpose and a weighted average. By the end you will be able to run one
        attention head by hand and predict where its output lands.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="Every word asks a question and offers an answer"
        visual={
          <>
            <Plane label="The query of the word blip and the keys of all three words" extent={EXTENT}>
              {K.map((kk, j) => (
                <Arrow key={j} tip={kk} color={TOKEN_COLOR[j]} label={name('k', j)} />
              ))}
              <Arrow tip={Q[0]} color={QUERY_COLOR} label="q1" />
            </Plane>
            <Readout>
              The query of <Tag color={QUERY_COLOR}>blip (q1)</Tag> is {fmtVec(Q[0])}. The keys are{' '}
              {K.map((kk, j) => (
                <span key={j}>
                  <Tag color={TOKEN_COLOR[j]}>{name('k', j)}</Tag> {fmtVec(kk)}
                  {j < 2 ? ', ' : '. '}
                </span>
              ))}
              {closest >= 0 && (
                <>
                  q1 points most nearly the same way as{' '}
                  <Tag color={TOKEN_COLOR[closest]}>{name('k', closest)}</Tag>.
                </>
              )}
            </Readout>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="mb-1 text-left text-muted">
                  The invented starting numbers, one row per word
                </caption>
                <thead>
                  <tr className="text-left">
                    <th scope="col">word</th>
                    <th scope="col">query q</th>
                    <th scope="col">key k</th>
                    <th scope="col">value v</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {TOKENS.map((t, i) => (
                    <tr key={t}>
                      <th scope="row" className="text-left font-sans">
                        <Tag color={TOKEN_COLOR[i]}>{t}</Tag>
                      </th>
                      <td>{fmtVec(Q[i])}</td>
                      <td>{fmtVec(K[i])}</td>
                      <td>{fmtVec(V[i])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        }
      >
        <p>
          Take a three-word sentence: <em>blip zorp fen</em>. The words are made up, and so are all
          the numbers in this lesson; in a real model they come out of training. What matters is
          what is done with them.
        </p>
        <p>Each word carries three small vectors:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            a <strong>query</strong> <em>q</em>: what this word is looking for,
          </li>
          <li>
            a <strong>key</strong> <em>k</em>: what this word advertises about itself,
          </li>
          <li>
            a <strong>value</strong> <em>v</em>: what this word hands over if it is picked.
          </li>
        </ul>
        <p>
          Attention answers one question for each word: <em>which other words should I listen to,
          and how much?</em> A word listens to the words whose keys match its query. You already
          have the tool for &ldquo;match&rdquo;: the dot product, which is large when two arrows
          point the same way, near zero when they are at right angles, and negative when they point
          apart.
        </p>
        <p>
          On the right is the query of <Tag color={QUERY_COLOR}>blip</Tag> with the three keys.
          Hover a tip to read its coordinates. Before reading on, guess which key it matches best.
        </p>
        <p>The whole lesson builds this one formula, piece by piece:</p>
        <Tex block>{String.raw`\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V`}</Tex>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Scores: every query dotted with every key"
        visual={
          <>
            <Plane label={`The query q${sel + 1} and the three keys, all draggable`} extent={EXTENT}>
              {K.map((kk, j) => (
                <DraggableArrow
                  key={j}
                  value={kk}
                  onChange={(next) => setK(setAt(K, j, next))}
                  color={TOKEN_COLOR[j]}
                  label={name('k', j)}
                  snap={SNAP}
                />
              ))}
              <DraggableArrow
                value={q}
                onChange={(next) => setQ(setAt(Q, sel, next))}
                color={QUERY_COLOR}
                label={name('q', sel)}
                snap={SNAP}
              />
            </Plane>
            <div className="mt-4">
              <HeatMap
                scores={r.scores}
                rowNames={rowNames}
                colNames={colNames}
                colColors={TOKEN_COLOR}
                selected={[sel, key]}
                onSelect={(i, j) => {
                  setSel(i)
                  setKey(j)
                }}
              />
            </div>
            <Readout>
              <Tag color={QUERY_COLOR}>{name('q', sel)}</Tag> ({TOKENS[sel]}) = {fmtVec(q)}. Its
              scores: {scoreRow.map((s, j) => `${name('k', j)} ${fmt(s)}`).join(', ')}. Highest:{' '}
              <Tag color={TOKEN_COLOR[best]}>{name('k', best)}</Tag> ({TOKENS[best]}). Selected
              cell: {name('q', sel)} · {name('k', key)} = {fmt(r.scores[sel][key])}.
            </Readout>
          </>
        }
      >
        <p>
          A <strong>score</strong> says how well one word&rsquo;s query matches another word&rsquo;s
          key. It is just their dot product. Every query is scored against every key, including
          its own word&rsquo;s key, so three words give a 3×3 table.
        </p>
        <p>
          Drag the query <Tag color={QUERY_COLOR}>{name('q', sel)}</Tag> and the three keys (or
          click a tip and use the arrow keys). Click any cell of the table to follow that query and
          see that one score worked out. Try to:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>make a key&rsquo;s score negative,</li>
          <li>turn a key so its score is 0 (where must it point?),</li>
          <li>give one key the highest score without changing its direction.</li>
        </ul>
        <p>
          The selected cell is row {sel + 1} of <em>Q</em> times column {key + 1} of{' '}
          <em>K</em>ᵀ:
        </p>
        <Tex block>
          {String.raw`${name('q', sel)} \cdot ${name('k', key)} = ${p(q[0])}\cdot${p(k[0])} + ${p(q[1])}\cdot${p(k[1])} = ${fmt(r.scores[sel][key])}`}
        </Tex>
        <p>
          Stack the queries as the rows of a matrix <em>Q</em> and the keys as the rows of{' '}
          <em>K</em>. Transposing <em>K</em> turns its rows into columns, and then one matrix
          product computes the whole table at once, because each entry of a product is a row
          dotted with a column:
        </p>
        <Tex block>
          {String.raw`\underbrace{\begin{bmatrix} ${qMatrix} \end{bmatrix}}_{Q\;(3\times2)} \underbrace{\begin{bmatrix} ${ktMatrix} \end{bmatrix}}_{K^\top\;(2\times3)} = \underbrace{\begin{bmatrix} ${sMatrix} \end{bmatrix}}_{QK^\top\;(3\times3)}`}
        </Tex>
        <p className="text-sm text-muted">
          The shapes line up as in the shapes lesson: (3×2) times (2×3) gives 3×3, one row per
          query and one column per key.
        </p>
      </Step>

      <PredictStep />

      <UnderstandStep Q={Q} K={K} sel={sel} onSelect={setSel} />

      <ApplyStep
        Q={Q}
        K={K}
        V={V}
        sel={sel}
        onSelect={setSel}
        onChangeV={setV}
        onChangeQ={setQ}
      />

      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Where to go from here</h2>
        <p className="mt-2 max-w-[62ch]">
          That is the end of the course. Every piece of attention was something you met earlier:
          dot products for matching, a transpose and a matrix product to do all the matching at
          once, and a weighted sum to mix the values. The{' '}
          <Link to="/playground">playground</Link> is there for anything you want to revisit.
        </p>
      </footer>
    </article>
  )
}
