import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { Button, Step, Tag } from '../../components/ui'
import { COLOR } from '../../lib/palette'
import { VectorOps } from './VectorOps'
import { PRACTICE_START, solvedChallenges } from './practice'
import type { Op } from './ops'
import type { Vec2 } from '../../linalg'

const ITEMS: Challenge[] = [
  {
    id: 'sum',
    title: 'Hit a target with a sum',
    task: (
      <p className="m-0">
        In <strong>Add</strong> mode, make u + v equal (−3, 2).
      </p>
    ),
    insight: (
      <p className="m-0">
        There are many answers, for example (−1, 0) + (−2, 2) or (−4, 4) + (1, −2). Only the
        entry-by-entry totals have to be −3 and 2.
      </p>
    ),
  },
  {
    id: 'diff',
    title: 'Straight down',
    task: (
      <p className="m-0">
        In <strong>Subtract</strong> mode, make u − v point straight down with length 3, that is
        u − v = (0, −3).
      </p>
    ),
    insight: (
      <p className="m-0">
        u must sit exactly 3 below v: same x, y smaller by 3. The arrow from the tip of v to the
        tip of u is then vertical.
      </p>
    ),
  },
  {
    id: 'negative',
    title: 'Flip and stretch',
    task: (
      <p className="m-0">
        In <strong>Scale</strong> mode, use a <em>negative</em> k to make k·u = (−3, 1.5).
      </p>
    ),
    insight: (
      <p className="m-0">
        u has to point the opposite way to (−3, 1.5), into the bottom-right. For example u = (2, −1)
        with k = −1.5, or u = (3, −1.5) with k = −1.
      </p>
    ),
  },
  {
    id: 'zero',
    title: 'Make it vanish',
    task: (
      <p className="m-0">
        In <strong>Scale</strong> mode, make k·u the zero vector (0, 0) while u itself is not zero.
      </p>
    ),
    insight: (
      <p className="m-0">
        k = 0 sends every vector to the origin. No other k can do that to a non-zero u, which is
        why dividing by a scalar fails only for 0.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [op, setOp] = useState<Op>(PRACTICE_START.op)
  const [u, setU] = useState<Vec2>(PRACTICE_START.u)
  const [v, setV] = useState<Vec2>(PRACTICE_START.v)
  const [k, setK] = useState(PRACTICE_START.k)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  // Tick challenges from the live state. Ticks stay once earned.
  const now = solvedChallenges({ op, u, v, k })
  if (now.some((id) => !done.has(id))) setDone(new Set([...done, ...now]))

  const reset = () => {
    setU(PRACTICE_START.u)
    setV(PRACTICE_START.v)
    setK(PRACTICE_START.k)
  }

  return (
    <Step
      n={6}
      kind="Practice"
      title="Four targets to hit"
      visual={
        <>
          <VectorOps op={op} setOp={setOp} u={u} setU={setU} v={v} setV={setV} k={k} setK={setK} />
          <div className="mt-3">
            <Button variant="secondary" onClick={reset}>
              Reset u, v and k
            </Button>
          </div>
        </>
      }
    >
      <p>
        No answers are shown. Choose the operation, then drag <Tag color={COLOR.i}>u</Tag> and{' '}
        <Tag color={COLOR.j}>v</Tag> (or click a tip and use the arrow keys) and move the k slider
        until each task is ticked. The readout under the plane gives the exact numbers.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
