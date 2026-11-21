import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, DraggableArrow, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec2 } from '../../linalg'
import { isZeroVec, rankBySimilarity } from '../../linalg/projection'
import { DOCS, DOC_NAMES, QUERY, TOP_K, searchSnippet } from './content'
import { pyFixed } from './pyFormat'

export function ApplyStep() {
  const [q, setQ] = useState<Vec2>(QUERY)
  const [docs, setDocs] = useState<Vec2[]>(DOCS)
  const [editDocs, setEditDocs] = useState(false)
  const [byDot, setByDot] = useState(false)
  const [refused, setRefused] = useState(false)

  const by = byDot ? 'dot' : 'cosine'
  // Neither the query nor a document can be the zero vector (see the guard below), so this is never null.
  const ranked = rankBySimilarity(q, docs, by) ?? []
  const rankOf = new Map(ranked.map((r, k) => [r.index, k]))
  const snippet = searchSnippet(docs, q, by, ranked)
  const score = (s: number) => (byDot ? fmt(s) : pyFixed(s, 3))

  /** A zero vector has no direction to compare, so the demo refuses to put one at the origin. */
  const guard = (set: (v: Vec2) => void) => (next: Vec2) => {
    if (isZeroVec(next)) {
      setRefused(true)
      return
    }
    setRefused(false)
    set(next)
  }

  return (
    <Step
      n={5}
      kind="Apply"
      title="Finding similar documents: embedding search"
      visual={
        <>
          <Plane extent={6} label="Five document vectors and a draggable query vector q; the three most similar documents are marked">
            {docs.map((d, k) => {
              const rank = rankOf.get(k) ?? 0
              const top = rank < TOP_K
              const label = top ? `D${k + 1} #${rank + 1}` : `D${k + 1}`
              const color = top ? COLOR.result : COLOR.ghost
              return editDocs ? (
                <DraggableArrow
                  key={k}
                  value={d}
                  onChange={guard((v) => setDocs(docs.map((x, i) => (i === k ? v : x))))}
                  color={color}
                  label={label}
                />
              ) : (
                <Arrow key={k} tip={d} color={color} label={label} weight={top ? 3 : 2} />
              )
            })}
            <DraggableArrow value={q} onChange={guard(setQ)} color={COLOR.v} label="q" />
          </Plane>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Toggle checked={editDocs} onChange={setEditDocs}>
              Let me move the documents too
            </Toggle>
            <Toggle checked={byDot} onChange={setByDot}>
              Rank by raw dot product instead
            </Toggle>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Documents ranked by similarity to the query</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-1 pr-3 font-semibold">Rank</th>
                  <th className="py-1 pr-3 font-semibold">Document</th>
                  <th className="py-1 pr-3 font-semibold">Vector</th>
                  <th className="py-1 text-right font-semibold">{byDot ? 'd · q' : 'cosine'}</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((r, k) => (
                  <tr
                    key={r.index}
                    className={`border-b border-line ${k < TOP_K ? 'font-semibold' : 'text-muted'}`}
                  >
                    <td className="py-1 pr-3">
                      {k + 1}
                      {k < TOP_K && <span className="sr-only"> (returned)</span>}
                    </td>
                    <td className="py-1 pr-3">
                      D{r.index + 1} {DOC_NAMES[r.index]}
                    </td>
                    <td className="py-1 pr-3 font-mono whitespace-nowrap">{fmtVec(docs[r.index])}</td>
                    <td className="py-1 text-right font-mono">{score(r.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Readout>
            Query <Tag color={COLOR.v}>q</Tag> = {fmtVec(q)}. Top {TOP_K} by{' '}
            {byDot ? 'dot product' : 'cosine similarity'}:{' '}
            {ranked
              .slice(0, TOP_K)
              .map((r) => `${DOC_NAMES[r.index]} (${score(r.score)})`)
              .join(', ')}
            .
            {refused && (
              <strong className="block">
                That move was refused: a vector at the origin has no direction, so its cosine
                similarity with anything is undefined.
              </strong>
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        Language models turn a piece of text into a long list of numbers, an{' '}
        <strong>embedding</strong>, chosen so that texts with similar meanings get vectors that
        point in similar directions. To find documents that match a question, a search system
        embeds the question as a query vector <Tag color={COLOR.v}>q</Tag> and ranks every document
        vector by cosine similarity with it:
      </p>
      <Tex block>{String.raw`\text{score}(\mathbf{d}) = \frac{\mathbf{d}\cdot\mathbf{q}}{|\mathbf{d}|\,|\mathbf{q}|}`}</Tex>
      <p>
        In the picture are five made-up documents, D1 to D5. Drag <Tag color={COLOR.v}>q</Tag> and
        watch the ranking change. The top {TOP_K} (marked <Tag color={COLOR.result}>#1 to #3</Tag>)
        are what the search would return. This is the &ldquo;retrieval&rdquo; step in
        retrieval-augmented generation (RAG): the chatbot is handed the top documents before it
        answers.
      </p>
      <p>
        Look at D4, &ldquo;Pet-friendly cafes&rdquo;. It is a short arrow, but it points exactly
        along the default q, so its cosine is 1.000 and it ranks first. Now switch on{' '}
        <strong>rank by raw dot product</strong>: D4 drops out of the top three, beaten by longer
        arrows that point less precisely the right way. Length often reflects things like how long
        a text is, not what it is about, which is why search usually normalises first.
      </p>
      <p>
        In the code, <code>docs @ q</code> works out all five dot products at once (one per row),
        and <code>np.linalg.norm(docs, axis=1)</code> gives the length of each row.{' '}
        <code>np.argsort(-scores)</code> lists the row numbers from highest score to lowest
        (sorting the negated scores puts the biggest first), and <code>[:{TOP_K}]</code> keeps
        the first {TOP_K}.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real embeddings have hundreds or thousands of numbers (384,
        768 and 1536 are common), not two, and their directions have no tidy names. You cannot
        draw them, but the formula is exactly the one above, applied to longer lists. With
        millions of documents, systems use approximate search to avoid scoring every one.
      </p>
    </Step>
  )
}
