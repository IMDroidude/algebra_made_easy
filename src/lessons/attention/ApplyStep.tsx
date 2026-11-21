import { Text } from 'mafs'
import { useRef, useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, CoordPoint, DraggableArrow, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { add, scale } from '../../linalg'
import { attention, weightedSum } from '../../linalg/attention'
import type { Vec2 } from '../../linalg'
import {
  EXTENT,
  OUTPUT_COLOR,
  QUERY_COLOR,
  SNAP,
  TOKENS,
  TOKEN_COLOR,
  name,
  setAt,
} from './data'
import { applyCode, applyOutput } from './snippets'
import { TokenPicker } from './widgets'

const EQUAL = [1 / 3, 1 / 3, 1 / 3]

export function ApplyStep({
  Q,
  K,
  V,
  sel,
  onSelect,
  onChangeV,
  onChangeQ,
}: {
  Q: Vec2[]
  K: Vec2[]
  V: Vec2[]
  sel: number
  onSelect: (i: number) => void
  onChangeV: (next: Vec2[]) => void
  onChangeQ: (next: Vec2[]) => void
}) {
  const [showAverage, setShowAverage] = useState(false)
  const saved = useRef<{ i: number; q: Vec2 } | null>(null)

  const r = attention(Q, K, V)
  const w = r.weights[sel]
  const out = r.output[sel] as Vec2
  const average = weightedSum(EQUAL, V) as Vec2
  // Tip-to-tail: w1·v1, then + w2·v2, then + w3·v3 arrives at the output.
  const parts = V.map((v, j) => scale(v, w[j]) as Vec2)
  const tails: Vec2[] = [[0, 0], parts[0], add(parts[0], parts[1])]

  return (
    <Step
      n={5}
      kind="Apply"
      title="The output: a weighted average of the values"
      visual={
        <>
          <TokenPicker names={TOKENS} value={sel} onChange={onSelect} />
          <div className="mt-3">
            <Plane
              label={`The three value vectors, draggable, and the output for query ${sel + 1}`}
              extent={EXTENT}
            >
              {V.map((v, j) => (
                <DraggableArrow
                  key={j}
                  value={v}
                  onChange={(next) => onChangeV(setAt(V, j, next))}
                  color={TOKEN_COLOR[j]}
                  label={name('v', j)}
                  snap={SNAP}
                />
              ))}
              {parts.map((part, j) => (
                <Arrow
                  key={j}
                  tail={tails[j]}
                  tip={add(tails[j], part)}
                  color={TOKEN_COLOR[j]}
                  dashed
                  weight={2}
                />
              ))}
              {showAverage && (
                <>
                  <CoordPoint at={average} color={COLOR.ghost} />
                  <Text
                    x={average[0]}
                    y={average[1]}
                    attach="s"
                    attachDistance={14}
                    size={13}
                    color={COLOR.ghost}
                  >
                    plain average
                  </Text>
                </>
              )}
              <Arrow tip={out} color={OUTPUT_COLOR} label={`out${sel + 1}`} />
            </Plane>
          </div>
          <div className="mt-3">
            <Toggle checked={showAverage} onChange={setShowAverage}>
              Show the plain average of the three values
            </Toggle>
          </div>
          <Readout>
            Weights for <Tag color={QUERY_COLOR}>{name('q', sel)}</Tag> ({TOKENS[sel]}):{' '}
            {w.map((x, j) => `${TOKENS[j]} ${fmt(x)}`).join(', ')}. Output{' '}
            <Tag color={OUTPUT_COLOR}>out{sel + 1}</Tag> ={' '}
            {w.map((x, j) => `${fmt(x)} × ${fmtVec(V[j])}`).join(' + ')} = {fmtVec(out)}.
            {showAverage && <> The plain average of the values is {fmtVec(average)}.</>}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={applyCode(Q, K, V)} output={applyOutput(Q, K, V)} />
          </div>
        </>
      }
    >
      <p>
        The weights say how much to listen to each word. What is heard is each word&rsquo;s{' '}
        <strong>value</strong>. The output for a word is the weighted sum of all the values, the
        same kind of mix <em>a</em>·<strong>u</strong> + <em>b</em>·<strong>v</strong> you built in
        the lesson on linear combinations, except that here the weights are positive and sum to 1,
        so it is a weighted <em>average</em>:
      </p>
      <Tex block>
        {String.raw`\text{out}_{${sel + 1}} = ${w.map((x, j) => `${fmt(x)}\\,\\textcolor{${TOKEN_COLOR[j]}}{v_${j + 1}}`).join(' + ')} = \begin{bmatrix} ${fmt(out[0])} \\ ${fmt(out[1])} \end{bmatrix}`}
      </Tex>
      <p>
        On the plane, the dashed arrows walk the sum tip to tail: a share of{' '}
        <Tag color={TOKEN_COLOR[0]}>v1</Tag>, then of <Tag color={TOKEN_COLOR[1]}>v2</Tag>, then
        of <Tag color={TOKEN_COLOR[2]}>v3</Tag>. Drag the values and watch the output follow
        the one with the biggest weight. The output can never leave the triangle with corners at
        the three values.
      </p>
      <p>
        Doing this for every query at once is one more matrix product, weights × <em>V</em>. That
        completes the formula, and the NumPy code with the picture is a complete, working attention
        function:
      </p>
      <Tex block>{String.raw`\text{Attention}(Q, K, V) = \underbrace{\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)}_{\text{weights}\;(3\times3)} \underbrace{V}_{3\times2}`}</Tex>

      <Predict
        question={
          <>
            Suppose the query {name('q', sel)} were (0, 0), so every score is 0. Where would{' '}
            <Tag color={OUTPUT_COLOR}>out{sel + 1}</Tag> land?
          </>
        }
        onReveal={() => {
          saved.current = { i: sel, q: Q[sel] }
          onChangeQ(setAt(Q, sel, [0, 0]))
          setShowAverage(true)
        }}
        onRetry={() => {
          if (saved.current) onChangeQ(setAt(Q, saved.current.i, saved.current.q))
          saved.current = null
        }}
        options={[
          {
            id: 'average',
            label: 'Exactly on the plain average of the three values.',
            correct: true,
            explain: (
              <p className="m-0">
                Equal scores give equal weights: e⁰ = 1 for each word, divided by 3, so every
                weight is 1/3. The output is then (v1 + v2 + v3) / 3, the plain average,{' '}
                {fmtVec(average)}. The plane now shows it: q{sel + 1} has been set to (0, 0).
              </p>
            ),
          },
          {
            id: 'origin',
            label: 'At the origin, because the query is zero.',
            correct: false,
            explain: (
              <p className="m-0">
                The query only decides the <em>weights</em>. The output is built from the values,
                and the weights still sum to 1, so the output is still a mix of v1, v2 and v3. A
                zero query means &ldquo;no preference&rdquo;, not &ldquo;no output&rdquo;.
              </p>
            ),
          },
          {
            id: 'longest',
            label: 'On the longest value vector, because it counts most.',
            correct: false,
            explain: (
              <p className="m-0">
                The length of a value plays no part in the weights. Weights come only from query ·
                key scores, and here all of those are 0, so every value counts the same.
              </p>
            ),
          },
          {
            id: 'undefined',
            label: 'Nowhere: with all scores 0, softmax divides by zero.',
            correct: false,
            explain: (
              <p className="m-0">
                Softmax divides by the sum of e<sup>score</sup>, not by the scores. e⁰ = 1, so the
                total is 1 + 1 + 1 = 3, never zero. Softmax is defined for any scores at all.
              </p>
            ),
          },
        ]}
      />

      <h3 className="mt-8 mb-2 text-lg font-semibold">Where this runs: inside every transformer</h3>
      <p>
        This is the core operation of transformers, the models behind GPT-style chatbots. Each
        word (really, each <em>token</em>) starts as an embedding vector. Attention lets every
        token pull in information from the others: after it, the vector for &ldquo;bank&rdquo; can
        carry a bit of &ldquo;river&rdquo; or of &ldquo;money&rdquo;, depending on which words got
        the weight. The smallest GPT-2 runs 12 attention heads in each of its 12 layers.
      </p>
      <p>
        In this lesson you dragged <em>Q</em>, <em>K</em> and <em>V</em> by hand. In a real
        model they are made from the token embeddings <em>X</em> (one row per token) by three
        learned weight matrices, exactly the layers from the matrices lesson:
      </p>
      <Tex block>{String.raw`Q = XW_Q, \qquad K = XW_K, \qquad V = XW_V`}</Tex>
      <p>
        Training adjusts <Tex>{String.raw`W_Q`}</Tex>, <Tex>{String.raw`W_K`}</Tex> and{' '}
        <Tex>{String.raw`W_V`}</Tex> so that the right words end up matching.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: those learned projections; <strong>many heads</strong>{' '}
        running side by side, each with its own three matrices, their outputs joined together;{' '}
        <strong>high dimensions</strong> (GPT-2 embeds each token in 768 numbers and each head
        uses <em>d_k</em> = 64, where we used 2); and <strong>masking</strong>: a GPT-style model
        must not look at words that come later, so those scores are set to −∞ before softmax,
        giving them weight exactly 0. None of these changes the arithmetic you have just done.
      </p>
    </Step>
  )
}
