import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { DraggablePoint, Plane } from '../../components/Plane'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { fitLine, sumSquaredResiduals } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'
import { CHECKS } from './challenges'
import { PRACTICE_DATA, tidy } from './data'
import { FitDrawing } from './FitDrawing'
import { lineText } from './text'

const ITEMS: Challenge[] = [
  {
    id: 'flat',
    title: 'No trend',
    task: <p className="m-0">Move the points so that the best-fit line is horizontal (slope 0).</p>,
    insight: (
      <p className="m-0">
        Slope 0 means x tells you nothing about y: the best guess is the same everywhere, the
        average of the y-values. A model with weight 0 has learned to ignore its input.
      </p>
    ),
  },
  {
    id: 'perfect',
    title: 'Perfect fit',
    task: <p className="m-0">Make the sum of squared residuals exactly 0.</p>,
    insight: (
      <p className="m-0">
        All points sit on one line, so y is already in the column space of X: the projection is y
        itself and the residual vector is zero. Real data almost never does this.
      </p>
    ),
  },
  {
    id: 'diagonal',
    title: 'Hit y = x',
    task: (
      <p className="m-0">
        Make the best line exactly y = x (slope 1, intercept 0) while at least one point is off it.
      </p>
    ),
    insight: (
      <p className="m-0">
        Points above and below the line balance out: the residuals add up to zero, and so do the
        residuals weighted by x. That is the normal equations at work.
      </p>
    ),
  },
  {
    id: 'vertical',
    title: 'Break it',
    task: <p className="m-0">Arrange the points so that there is no single best line at all.</p>,
    insight: (
      <p className="m-0">
        With every point at the same x, the x column is a multiple of the ones column: XᵀX is
        singular, exactly the lesson 4.5 situation. Infinitely many lines through that column fit
        equally well.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [points, setPointsState] = useState<Vec2[]>(PRACTICE_DATA)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setPoints = (next: Vec2[]) => {
    setPointsState(next)
    const solved = Object.keys(CHECKS).filter((id) => CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }
  const move = (k: number) => (q: Vec2) => setPoints(points.map((p, i) => (i === k ? tidy(q) : p)))
  const fit = fitLine(points)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Shape the data"
      visual={
        <>
          <Plane label="Four draggable data points with their best-fit line">
            {fit && <FitDrawing points={points} line={fit} color={COLOR.result} squares />}
            {points.map((p, k) => (
              <DraggablePoint key={k} value={p} onChange={move(k)} color={COLOR.v} />
            ))}
          </Plane>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => setPoints(PRACTICE_DATA)}>
              Reset points
            </Button>
          </div>
          <Readout>
            <Tag color={COLOR.v}>Points</Tag>: {points.map((p) => fmtVec(p)).join(', ')}.{' '}
            {fit ? (
              <>
                <Tag color={COLOR.result}>Best line</Tag>: {lineText(fit)}, sum of squared residuals{' '}
                {fmt(sumSquaredResiduals(points, fit))}.
              </>
            ) : (
              'No single best line: every point has the same x.'
            )}
          </Readout>
        </>
      }
    >
      <p>
        A new dataset of four points. Drag them (or focus one and use the arrow keys) until the best
        line does what each task asks. Tasks tick themselves as soon as the data satisfies them.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
