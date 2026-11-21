import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { approxEqualVec } from '../../linalg'
import {
  FLAG,
  MOVE_M,
  PRACTICE_A,
  PRACTICE_B,
  clean,
  moveBy,
  solvedChallenges,
  vectorFrom,
} from './model'
import type { PracticeState } from './model'
import { StartHandle, TripArrow } from './parts'

const ITEMS: Challenge[] = [
  {
    id: 'trip',
    title: 'Give directions',
    task: (
      <p className="m-0">
        Place A and B so that the movement from A to B is (−2, 3): 2 west, 3 north.
      </p>
    ),
    insight: (
      <p className="m-0">
        Many pairs of places work, because only B − A matters. A vector does not care where it
        starts.
      </p>
    ),
  },
  {
    id: 'flag',
    title: 'Land on the flag',
    task: (
      <p className="m-0">
        The green arrow <strong>m</strong> = (4, −1) always starts at A. Move A so that A + m lands
        exactly on the flag at (1, −2).
      </p>
    ),
    insight: (
      <p className="m-0">
        A = (−3, −1), because (−3, −1) + (4, −1) = (1, −2). Point + vector = point. To find the
        start, you worked backwards: flag − m.
      </p>
    ),
  },
  {
    id: 'zero',
    title: 'Go nowhere',
    task: <p className="m-0">Make the movement from A to B a move that goes nowhere at all.</p>,
    insight: (
      <p className="m-0">
        Put B on top of A and B − A = (0, 0): the <strong>zero vector</strong>, a movement of
        length 0. A and B are still places; only the movement between them vanished.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [state, setState] = useState<PracticeState>({ a: PRACTICE_A, b: PRACTICE_B })
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const update = (next: PracticeState) => {
    setState(next)
    const solved = solvedChallenges(next)
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const { a, b } = state
  const v = vectorFrom(a, b)
  const am = moveBy(a, MOVE_M)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Three small puzzles"
      layout="wide"
      visual={
        <>
          <Plane height={420} label="Practice plane: draggable points A and B, the arrow m from A, and a flag at (1, −2)">
            <CoordPoint at={FLAG} color={COLOR.result} />
            <PlaneLabel x={FLAG[0]} y={FLAG[1]} attach="se" distance={10} size={15} color={COLOR.result}>
              flag (1, −2)
            </PlaneLabel>
            <TripArrow from={a} to={am} color={COLOR.result} label="m" dashed />
            <TripArrow from={a} to={b} color={COLOR.v} label="B − A" />
            <StartHandle value={a} onChange={(q) => update({ a: q, b })} offsets={[MOVE_M]} color={COLOR.j} />
            <PlaneLabel x={a[0]} y={a[1]} attach="w" distance={14} size={16} color={COLOR.j}>
              A
            </PlaneLabel>
            <DraggablePoint value={b} onChange={(q) => update({ a, b: clean(q) })} color={COLOR.i} />
            <PlaneLabel x={b[0]} y={b[1]} attach="e" distance={14} size={16} color={COLOR.i}>
              B
            </PlaneLabel>
          </Plane>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => update({ a: PRACTICE_A, b: PRACTICE_B })}>
              Reset A and B
            </Button>
          </div>
          <Readout>
            <Tag color={COLOR.j}>A</Tag> = {fmtVec(a)}, <Tag color={COLOR.i}>B</Tag> = {fmtVec(b)}.
            The movement from A to B is <Tag color={COLOR.v}>B − A</Tag> = {fmtVec(v)}.{' '}
            <Tag color={COLOR.result}>A + m</Tag> = {fmtVec(am)}
            {approxEqualVec(am, FLAG) ? ', right on the flag.' : '.'}
          </Readout>
        </>
      }
    >
      <p>
        No answers are shown. Drag <Tag color={COLOR.j}>A</Tag> and{' '}
        <Tag color={COLOR.i}>B</Tag> (or Tab to them and use the arrow keys). Each puzzle ticks as
        soon as the plane matches it; they can be solved in any order.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
