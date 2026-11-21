import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { DraggableArrow, Plane } from '../../components/Plane'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { attentionScores, softmax } from '../../linalg/attention'
import type { Vec2 } from '../../linalg'
import {
  EXTENT,
  PRACTICE_K,
  PRACTICE_Q,
  PRACTICE_TOKENS,
  QUERY_COLOR,
  SNAP,
  TOKEN_COLOR,
  name,
  setAt,
} from './data'
import { solvedBy } from './practice'
import { WeightBars } from './widgets'

const [T1, T2, T3] = PRACTICE_TOKENS

const ITEMS: Challenge[] = [
  {
    id: 'focus',
    title: 'Spotlight',
    task: (
      <p className="m-0">
        Make <em>{T1}</em> attend almost entirely to <em>{T3}</em>: a weight of at least 0.9 on
        k3.
      </p>
    ),
    insight: (
      <p className="m-0">
        You needed k3 to beat the other scores by a wide margin, about 4 points before scaling.
        Pointing q1 and k3 the same way helps, and so does making them long: a dot product grows
        with length as well as with alignment.
      </p>
    ),
  },
  {
    id: 'uniform',
    title: 'No favourites',
    task: (
      <p className="m-0">
        Make the attention of <em>{T1}</em> uniform: all three weights within 0.02 of 1/3.
      </p>
    ),
    insight: (
      <p className="m-0">
        All three scores are equal. The quickest way is a zero query, but keys whose tips lie on
        one line at right angles to q1 work too: they all have the same shadow on q1, so the same
        dot product. Either way the output would be the plain average of the values.
      </p>
    ),
  },
  {
    id: 'split',
    title: 'Fifty-fifty',
    task: (
      <p className="m-0">
        Split the attention of <em>{T1}</em> evenly between <em>{T1}</em> and <em>{T2}</em>{' '}
        (weights within 0.05 of each other) while almost ignoring <em>{T3}</em> (below 0.05).
      </p>
    ),
    insight: (
      <p className="m-0">
        k1 and k2 need equal scores, so equal shadows on q1, and k3 needs a much lower one. The
        output would land halfway between v1 and v2: attention can blend two words, not only pick
        one.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [q, setQState] = useState<Vec2>(PRACTICE_Q)
  const [K, setKState] = useState<Vec2[]>(PRACTICE_K)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const weightsFor = (qq: Vec2, kk: Vec2[]) => softmax(attentionScores([qq], kk)[0], Math.SQRT2)

  const update = (nextQ: Vec2, nextK: Vec2[]) => {
    setQState(nextQ)
    setKState(nextK)
    const solved = solvedBy(weightsFor(nextQ, nextK))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const scores = attentionScores([q], K)[0]
  const w = weightsFor(q, K)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Steer the attention yourself"
      visual={
        <>
          <Plane label="Practice plane: the query of kib and three keys, all draggable" extent={EXTENT}>
            {K.map((k, j) => (
              <DraggableArrow
                key={j}
                value={k}
                onChange={(next) => update(q, setAt(K, j, next))}
                color={TOKEN_COLOR[j]}
                label={name('k', j)}
                snap={SNAP}
              />
            ))}
            <DraggableArrow
              value={q}
              onChange={(next) => update(next, K)}
              color={QUERY_COLOR}
              label="q1"
              snap={SNAP}
            />
          </Plane>
          <div className="mt-4">
            <WeightBars
              weights={w}
              names={PRACTICE_TOKENS}
              colors={TOKEN_COLOR}
              caption={
                <>
                  Weights for <Tag color={QUERY_COLOR}>q1</Tag> ({T1}), scaled by √2 as in real
                  attention
                </>
              }
            />
          </div>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => update(PRACTICE_Q, PRACTICE_K)}>
              Reset vectors
            </Button>
          </div>
          <Readout>
            <Tag color={QUERY_COLOR}>q1</Tag> = {fmtVec(q)}; keys{' '}
            {K.map((k, j) => `${name('k', j)} ${fmtVec(k)}`).join(', ')}. Scores{' '}
            {scores.map((s) => fmt(s)).join(', ')}; weights{' '}
            {w.map((x, j) => `${PRACTICE_TOKENS[j]} ${fmt(x)}`).join(', ')}.
          </Readout>
        </>
      }
    >
      <p>
        A new sentence, <em>{PRACTICE_TOKENS.join(' ')}</em>, with new invented vectors. Only the
        query of the first word matters here. Drag <Tag color={QUERY_COLOR}>q1</Tag> and the
        three keys (or focus a tip and use the arrow keys) until the weights do what each task
        asks. A task is ticked as soon as the weights satisfy it; you can do them in any order.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
