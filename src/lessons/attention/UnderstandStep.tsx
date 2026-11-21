import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { attentionScores, softmaxSteps } from '../../linalg/attention'
import type { Vec2 } from '../../linalg'
import { QUERY_COLOR, SQRT_DK_INDEX, TEMPERATURES, TOKENS, TOKEN_COLOR, name } from './data'
import { isSqrtDk, understandCode, understandOutput } from './snippets'
import { TokenPicker, WeightBars } from './widgets'

/** e^x for display: plain below 10 000, otherwise 1.9 × 10^31 style. */
function bigText(x: number): string {
  if (x < 1e4) return fmt(x)
  const [m, e] = x.toExponential(1).split('e')
  return `${m} × 10^${Number(e)}`
}
function bigTex(x: number): string {
  if (x < 1e4) return fmt(x)
  const [m, e] = x.toExponential(1).split('e')
  return `${m}\\times10^{${Number(e)}}`
}

const tLabel = (T: number) => (isSqrtDk(T) ? '√2 ≈ 1.41 (= √d_k)' : fmt(T))

export function UnderstandStep({
  Q,
  K,
  sel,
  onSelect,
}: {
  Q: Vec2[]
  K: Vec2[]
  sel: number
  onSelect: (i: number) => void
}) {
  const [tIndex, setTIndex] = useState(SQRT_DK_INDEX)
  const T = TEMPERATURES[tIndex]
  const scores = attentionScores(Q, K)[sel]
  const st = softmaxSteps(scores, T)
  const top = st.weights.indexOf(Math.max(...st.weights))
  const tTex = isSqrtDk(T) ? String.raw`\sqrt{2}` : fmt(T)
  const vecTex = (xs: string[]) => String.raw`\begin{bmatrix} ${xs.join(' & ')} \end{bmatrix}`

  return (
    <Step
      n={4}
      kind="Understand"
      title="Scale, then softmax: from scores to weights"
      visual={
        <>
          <TokenPicker names={TOKENS} value={sel} onChange={onSelect} />
          <div className="mt-4">
            <label htmlFor="temperature" className="block text-sm font-medium">
              Divide the scores by <strong>T = {tLabel(T)}</strong>
            </label>
            <input
              id="temperature"
              type="range"
              min={0}
              max={TEMPERATURES.length - 1}
              step={1}
              value={tIndex}
              onChange={(e) => setTIndex(Number(e.target.value))}
              aria-valuetext={`T = ${tLabel(T)}`}
              className="mt-1 w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs text-muted" aria-hidden="true">
              <span>sharper</span>
              <span>flatter</span>
            </div>
          </div>
          <div className="mt-4">
            <WeightBars
              weights={st.weights}
              names={TOKENS}
              colors={TOKEN_COLOR}
              caption={
                <>
                  Weights for <Tag color={QUERY_COLOR}>{name('q', sel)}</Tag> ({TOKENS[sel]})
                </>
              }
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-right font-mono text-sm">
              <caption className="mb-1 text-left font-sans text-muted">
                The softmax, column by column
              </caption>
              <thead className="font-sans">
                <tr>
                  <th scope="col" className="text-left">key</th>
                  <th scope="col">score s</th>
                  <th scope="col">x = s ÷ T</th>
                  <th scope="col">
                    e<sup>x</sup>
                  </th>
                  <th scope="col">weight</th>
                </tr>
              </thead>
              <tbody>
                {TOKENS.map((t, j) => (
                  <tr key={t}>
                    <th scope="row" className="text-left font-sans">
                      <Tag color={TOKEN_COLOR[j]}>{name('k', j)}</Tag>
                    </th>
                    <td>{fmt(scores[j])}</td>
                    <td>{fmt(st.scaled[j])}</td>
                    <td>{bigText(st.exps[j])}</td>
                    <td>{fmt(st.weights[j])}</td>
                  </tr>
                ))}
                <tr className="border-t border-line">
                  <th scope="row" className="text-left font-sans font-normal text-muted">sum</th>
                  <td />
                  <td />
                  <td>{bigText(st.total)}</td>
                  <td>1</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Readout>
            Dividing by T = {tLabel(T)}, the scores of {name('q', sel)} become{' '}
            {st.scaled.map((x) => fmt(x)).join(', ')}, and softmax turns them into weights{' '}
            {st.weights.map((x) => fmt(x)).join(', ')}. The biggest share goes to{' '}
            <Tag color={TOKEN_COLOR[top]}>{TOKENS[top]}</Tag>.
            {st.weights[top] > 0.99 && ' Almost all the attention is on that one word.'}
            {!isSqrtDk(T) && ' (Real attention always divides by √d_k; this is only an experiment.)'}
          </Readout>
          <div className="mt-4">
            <NumpySnippet
              code={understandCode(Q, K, sel, T)}
              output={understandOutput(Q, K, sel, T)}
            />
          </div>
        </>
      }
    >
      <p>
        Scores can be any size and any sign. To mix the values you need something better:{' '}
        <strong>weights</strong> that are all positive and add up to 1, like percentages. Two
        operations get you there.
      </p>
      <h3 className="mt-6 mb-2 text-lg font-semibold">1. Scale: divide by √d_k</h3>
      <p>
        <em>d_k</em> is the number of entries in each key; here it is 2. A dot product adds up{' '}
        <em>d_k</em> products, so with more entries the scores get bigger. If the entries are
        random numbers of typical size 1, the score&rsquo;s typical size grows like{' '}
        <Tex>{String.raw`\sqrt{d_k}`}</Tex>: about 1.4 in 2D, but about 8 in a GPT-2 attention
        head, where <em>d_k</em> = 64. Dividing by <Tex>{String.raw`\sqrt{d_k}`}</Tex> brings
        scores back to around 1, whatever the dimension.
      </p>
      <h3 className="mt-6 mb-2 text-lg font-semibold">2. Softmax: scores into weights</h3>
      <p>
        Raise <em>e</em> (≈ 2.718) to the power of each scaled score, then divide each result by
        their total. Powers of <em>e</em> are always positive and keep the order, and dividing by
        the total makes them sum to 1. For <Tag color={QUERY_COLOR}>{name('q', sel)}</Tag> right
        now, first the scaling, then the softmax:
      </p>
      <Tex block>
        {String.raw`\frac{1}{${tTex}}${vecTex(scores.map((s) => fmt(s)))} = ${vecTex(st.scaled.map((x) => fmt(x)))}`}
      </Tex>
      <Tex block>
        {String.raw`\frac{${vecTex(st.scaled.map((x) => `e^{${fmt(x)}}`))}}{${bigTex(st.total)}} = ${vecTex(st.weights.map((x) => fmt(x)))}`}
      </Tex>
      <p>
        Because of the power, gaps between scores get magnified: two scores 1 apart end up with
        weights in the ratio <em>e</em> ≈ 2.7 to 1; 5 apart, about 150 to 1.
      </p>
      <h3 className="mt-6 mb-2 text-lg font-semibold">Why the scaling matters: feel the temperature</h3>
      <p>
        Move the slider. Dividing by a small T makes the scores bigger, as they would be in many
        dimensions without the scaling: softmax then hands nearly everything to the top word and
        the rest get almost nothing. That is bad for learning, because nudging a score then
        barely changes any weight, so training gets no signal. A large T flattens the weights
        towards an even split. The <Tex>{String.raw`\sqrt{d_k}`}</Tex> keeps the scores in the
        useful middle; it is fixed by the dimension, not learned. (Language models use the same
        idea, called <em>temperature</em>, when they pick the next word.)
      </p>
      <p className="text-sm text-muted">
        About the code: <code>K.T</code> is the transpose; <code>axis=1</code> means &ldquo;along
        each row&rdquo;, and <code>keepdims=True</code> keeps the result as a column so it lines up
        with every row. Subtracting each row&rsquo;s largest score before <code>np.exp</code> does
        not change the weights (it cancels in the division) but stops <code>e^1000</code> from
        overflowing to infinity. <code>set_printoptions</code> only shortens what is printed to 2
        decimals.
      </p>
    </Step>
  )
}
