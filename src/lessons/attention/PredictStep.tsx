import { Arrow, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { useTween } from '../../lib/useTween'
import { add, scale, sub } from '../../linalg'
import { attentionScores, softmax } from '../../linalg/attention'
import {
  EXTENT,
  PREDICT_K,
  PREDICT_K3_AFTER,
  PREDICT_Q,
  QUERY_COLOR,
  TOKEN_COLOR,
  name,
  setAt,
} from './data'
import { WeightBars } from './widgets'

const KEY_NAMES = ['k1', 'k2', 'k3'] as const

export function PredictStep() {
  const reveal = useTween(1400)
  const k3 = add(PREDICT_K[2], scale(sub(PREDICT_K3_AFTER, PREDICT_K[2]), reveal.t))
  const keys = setAt(PREDICT_K, 2, k3)
  const scores = attentionScores([PREDICT_Q], keys)[0]
  const weights = softmax(scores, Math.SQRT2)
  const beforeScores = attentionScores([PREDICT_Q], PREDICT_K)[0]
  const afterScores = attentionScores([PREDICT_Q], setAt(PREDICT_K, 2, PREDICT_K3_AFTER))[0]
  const before = softmax(beforeScores, Math.SQRT2)
  const after = softmax(afterScores, Math.SQRT2)

  return (
    <Step
      n={3}
      kind="Predict"
      title="Before you look: turn one key towards the query"
      visual={
        <>
          <Plane label="A query and three keys; key 3 turns to match the query" extent={EXTENT}>
            {keys.map((k, j) => (
              <Arrow key={j} tip={k} color={TOKEN_COLOR[j]} label={name('k', j)} />
            ))}
            <Arrow tip={PREDICT_Q} color={QUERY_COLOR} label="q" labelDistance={22} />
          </Plane>
          <div className="mt-4">
            <WeightBars
              weights={weights}
              names={KEY_NAMES}
              colors={TOKEN_COLOR}
              caption="How much q listens to each word (the weights, which always sum to 1)"
            />
          </div>
          <Readout>
            {reveal.t === 0
              ? `k3 is at ${fmtVec(k3)}, pointing away from q. Weights: ${weights.map((w) => fmt(w)).join(', ')}. Lock in a prediction to turn k3.`
              : `k3 is at ${fmtVec(k3)}. Scores: ${scores.map((s) => fmt(s)).join(', ')}. Weights: ${weights.map((w) => fmt(w)).join(', ')}.`}
          </Readout>
        </>
      }
    >
      <p>
        A new, fixed example. The query is <Tag color={QUERY_COLOR}>q</Tag> = {fmtVec(PREDICT_Q)}.
        Of the three keys, <Tag color={TOKEN_COLOR[0]}>k1</Tag> = {fmtVec(PREDICT_K[0])} matches it
        best, so word 1 gets most of the attention ({fmt(before[0])}).{' '}
        <Tag color={TOKEN_COLOR[2]}>k3</Tag> = {fmtVec(PREDICT_K[2])} points away and gets only{' '}
        {fmt(before[2])}.
      </p>
      <p>
        The bars show the <strong>weights</strong>: the scores turned into shares of attention
        that add up to 1. Step 4 shows exactly how. For now, all you need is: a higher score
        means a bigger share.
      </p>
      <p>
        Now <Tag color={TOKEN_COLOR[2]}>k3</Tag> is turned to {fmtVec(PREDICT_K3_AFTER)}: exactly
        the same direction as q, and the same length. Nothing else changes.
      </p>
      <Predict
        question="What happens to the weights?"
        onReveal={reveal.play}
        onRetry={() => reveal.reset(0)}
        options={[
          {
            id: 'most',
            label: 'k3 takes most of the attention, and the weights of k1 and k2 shrink.',
            correct: true,
            explain: (
              <p className="m-0">
                k3 now matches q perfectly, so its score jumps from {fmt(beforeScores[2])} to{' '}
                {fmt(afterScores[2])}, the highest of the three. Its weight rises from{' '}
                {fmt(before[2])} to {fmt(after[2])}. k1 and k2 kept their scores, yet their
                weights fell: the weights must still sum to 1, so a bigger share for one word
                means smaller shares for the others.
              </p>
            ),
          },
          {
            id: 'others-same',
            label: 'k3’s weight goes up; k1 and k2 keep the weights they had.',
            correct: false,
            explain: (
              <p className="m-0">
                Their <em>scores</em> stay the same, but the weights are shares of a fixed total:
                they always add up to 1. If k3&rsquo;s share grows, the others have to shrink, even
                though nothing about them changed. k1 drops from {fmt(before[0])} to {fmt(after[0])}.
              </p>
            ),
          },
          {
            id: 'exactly-one',
            label: 'k3’s weight becomes exactly 1, and the others become exactly 0.',
            correct: false,
            explain: (
              <p className="m-0">
                Softmax never gives exactly 0 or 1 for finite scores: every word keeps some share,
                however small. k1 still has a decent score here ({fmt(afterScores[0])}), so it keeps{' '}
                {fmt(after[0])} of the attention.
              </p>
            ),
          },
          {
            id: 'down',
            label: 'k3’s weight goes down: it now duplicates the query, so it adds nothing new.',
            correct: false,
            explain: (
              <p className="m-0">
                Attention does not look for novelty. The score is a dot product, and a dot product
                is largest when two arrows point the same way. Matching the query is exactly what
                earns a big weight.
              </p>
            ),
          },
        ]}
      />
    </Step>
  )
}
