import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { DraggablePoint } from '../../components/Plane'
import { Readout, Step, Tag } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec2 } from '../../linalg'
import { GridPlane } from './GridPlane'
import { usePlaneHeight } from './layout'
import { AxisNames, Guides, PointLabels, Quadrants } from './Guides'
import { describeRegion, noNegZero, snapWhole } from './plane'
import { PRACTICE_CHECKS, PRACTICE_START } from './practice'
import { QuizPanel, QuizPlane } from './QuizParts'
import { useQuiz } from './useQuiz'

const ITEMS: Challenge[] = [
  {
    id: 'target',
    title: 'Place a point',
    task: <p className="m-0">Put P at (−3, 2).</p>,
    insight: (
      <p className="m-0">
        3 steps left (x is negative), then 2 steps up. That is quadrant II: x negative, y positive.
      </p>
    ),
  },
  {
    id: 'yaxis',
    title: 'On an axis',
    task: <p className="m-0">Put P on the y-axis, below the origin.</p>,
    insight: (
      <p className="m-0">
        Every point on the y-axis has x = 0, because you took no steps left or right. Below the
        origin means y is negative. Points on an axis belong to no quadrant.
      </p>
    ),
  },
  {
    id: 'four',
    title: 'Distance from an axis',
    task: (
      <p className="m-0">Put P in quadrant IV, exactly 4 steps away from the x-axis.</p>
    ),
    insight: (
      <p className="m-0">
        Quadrant IV is x positive, y negative. The distance from the x-axis is how far up or down
        you are, so y = −4. Any positive x works: there is a whole line of answers.
      </p>
    ),
  },
  {
    id: 'swap',
    title: 'Swap-proof',
    task: (
      <p className="m-0">
        Find a point in quadrant III that stays exactly where it is when you swap its two numbers.
      </p>
    ),
    insight: (
      <p className="m-0">
        Swapping changes nothing only when x and y are equal, like (−2, −2). All such points lie
        on one diagonal line through the origin.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [p, setPoint] = useState<Vec2>(PRACTICE_START)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())
  const height = usePlaneHeight('medium')
  const [mode, setMode] = useState<'tasks' | 'quiz'>('tasks')
  const quiz = useQuiz()

  const setP = (raw: Vec2) => {
    const next = noNegZero(raw)
    setPoint(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  return (
    <Step
      n={6}
      kind="Practice"
      title="Place these points yourself"
      visual={
        mode === 'quiz' ? (
          <QuizPlane quiz={quiz} height={height} />
        ) : (
          <>
            <GridPlane height={height} label="Practice plane with a draggable point P">
              <Quadrants p={p} />
              <AxisNames />
              <Guides p={p} />
              <DraggablePoint value={p} onChange={setP} color={COLOR.v} snap={snapWhole} />
              <PointLabels p={p} />
            </GridPlane>
            <Readout>
              <Tag color={COLOR.v}>P</Tag> = {fmtVec(p)}. {describeRegion(p)}
            </Readout>
          </>
        )
      }
    >
      <div role="group" aria-label="Practice mode" className="mb-4 inline-flex rounded-lg border border-line p-1">
        {(
          [
            ['tasks', 'Place points'],
            ['quiz', 'Quick quiz'],
          ] as const
        ).map(([id, text]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold ${mode === id ? 'bg-accent text-accent-ink' : 'text-ink'}`}
          >
            {text}
          </button>
        ))}
      </div>
      {mode === 'quiz' ? (
        <>
          <p>
            Quick questions in three kinds: read a marked point, plot a given point, and follow a
            move from a starting point. A wrong answer tells you which slip it was.
          </p>
          <QuizPanel quiz={quiz} />
        </>
      ) : (
        <>
          <p>
            No answers are shown. Drag P (or click it and use the arrow keys, one step per press)
            until it does what each task asks. A task is ticked as soon as P is in the right place.
          </p>
          <Challenges items={ITEMS} done={done} />
        </>
      )}
    </Step>
  )
}
