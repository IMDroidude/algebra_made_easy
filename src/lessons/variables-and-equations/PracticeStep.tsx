import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { Button, Step } from '../../components/ui'
import { EquationSolver } from './EquationSolver'
import { equationText } from './equation'
import type { Move } from './equation'
import { PRACTICE, practiceDone } from './practice'
import type { Moves } from './practice'

const ITEMS: Challenge[] = [
  {
    id: 'five',
    title: `Solve ${equationText(PRACTICE[0])}`,
    task: <p className="m-0">Get x alone, keeping the scale level.</p>,
    insight: (
      <p className="m-0">
        x = 5. Check: 5 × 5 + 4 = 29. Two inverse operations, in the reverse of the order they
        were applied to x: first remove the +4, then divide by 5.
      </p>
    ),
  },
  {
    id: 'minus',
    title: `Solve ${equationText(PRACTICE[1])}`,
    task: (
      <p className="m-0">
        The balloons pull upwards: each takes 1 off the weight of its pan. Get rid of them.
      </p>
    ),
    insight: (
      <p className="m-0">
        x = 7. The opposite of subtracting 6 is adding 6, which pops all six balloons at once.
        Then 2x = 14, so x = 7.
      </p>
    ),
  },
  {
    id: 'right',
    title: `Solve ${equationText(PRACTICE[2])}`,
    task: <p className="m-0">This time x is on the right. Leave it there and get it alone.</p>,
    insight: (
      <p className="m-0">
        x = 3. An equation reads the same both ways: 3 = x and x = 3 say the same thing. The scale
        has no &ldquo;answer side&rdquo;.
      </p>
    ),
  },
  {
    id: 'neat',
    title: 'Two moves, no tipping',
    task: (
      <p className="m-0">Solve any one of these three in exactly two moves, without ever tipping the scale.</p>
    ),
    insight: (
      <p className="m-0">
        Every equation of the form <em>ax + b = c</em> takes exactly two moves: undo the +b, then
        undo the ×a. That fixed recipe is what the formula x = (c − b) / a captures.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [pick, setPick] = useState(0)
  const [all, setAllMoves] = useState<Moves>(PRACTICE.map(() => []))
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setMoves = (next: Move[]) => {
    const nextAll = all.map((m, k) => (k === pick ? next : m))
    setAllMoves(nextAll)
    const solved = practiceDone(nextAll)
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  return (
    <Step
      n={6}
      kind="Practice"
      title="Solve these on your own"
      visual={
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Choose a practice equation">
            <span className="text-sm text-muted">Equation:</span>
            {PRACTICE.map((e, k) => (
              <Button
                key={k}
                variant={k === pick ? 'primary' : 'secondary'}
                aria-pressed={k === pick}
                onClick={() => setPick(k)}
              >
                {equationText(e)}
              </Button>
            ))}
          </div>
          <EquationSolver
            key={pick}
            start={PRACTICE[pick]}
            moves={all[pick]}
            onMovesChange={setMoves}
            idPrefix="Practice"
          />
        </>
      }
    >
      <p>
        No answers are shown. Choose an equation, then use the moves until x stands alone with the
        scale level. Each task ticks itself as soon as you solve it. Your moves on each equation
        are kept when you switch between them.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
