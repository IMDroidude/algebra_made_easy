import { Line, Polygon } from 'mafs'
import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, Plane } from '../../components/Plane'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { BOUNDARY_SET, isSplit } from './practiceData'
import { ClassPoints, SideShading } from './BoundarySection'
import { GROUPS, groupsCode, groupsOutput } from './boundaryData'
import { leastSquaresLine, lineEquation, lineY, misclassified, pyFloat, residualSquare, sumSquaredError } from './lineMath'
import { DATA_SETS, isSolved } from './practiceData'
import type { DataSet } from './practiceData'
import { SliderField } from './SliderField'

const START_M = 1
const START_B = 0

function bestText(set: DataSet) {
  const best = leastSquaresLine(set.points)
  return `${lineEquation(best.m, best.b)}, with an error of ${fmt(sumSquaredError(best.m, best.b, set.points))}`
}

const ITEMS: Challenge[] = [
  {
    id: 'row',
    title: 'Three in a row',
    task: (
      <p className="m-0">
        Choose <strong>Three in a row</strong>. Make the line pass through all three points, so
        the error is exactly 0.
      </p>
    ),
    insight: (
      <p className="m-0">
        Any two of the points fix the slope: from (1, 1) to (3, 2) is a rise of 1 over a run of 2,
        so m = 0.5. Then b = 1 − 0.5 · 1 = 0.5. Real data is never this tidy, which is why the
        next two tasks ask for &ldquo;small&rdquo; rather than zero.
      </p>
    ),
  },
  {
    id: 'down',
    title: 'Downhill',
    task: (
      <p className="m-0">
        Choose <strong>Downhill</strong>. No line goes through every point. Get the error below{' '}
        <strong>{DATA_SETS[1].target}</strong>.
      </p>
    ),
    insight: (
      <p className="m-0">
        The data falls as x grows, so the slope must be negative. The best possible line is{' '}
        {bestText(DATA_SETS[1])}. Your hand-fitted line is close to it.
      </p>
    ),
  },
  {
    id: 'up',
    title: 'Noisy uphill',
    task: (
      <p className="m-0">
        Choose <strong>Noisy uphill</strong>. Get the error below{' '}
        <strong>{DATA_SETS[2].target}</strong>.
      </p>
    ),
    insight: (
      <p className="m-0">
        The best possible line here is {bestText(DATA_SETS[2])}. Finding it by formula instead of
        by hand is <em>least squares</em> (lesson 5.1), and finding it by repeated small nudges is
        how neural networks are trained.
      </p>
    ),
  },
  {
    id: BOUNDARY_SET.id,
    title: 'Split the groups',
    task: (
      <p className="m-0">
        Choose <strong>{BOUNDARY_SET.name}</strong>. This time the line is a boundary, not a fit:
        put every A above the line and every B below it, with <strong>0 mistakes</strong>.
      </p>
    ),
    insight: (
      <p className="m-0">
        The groups lean the other way from the fruit: the line has to slope downhill, such as y =
        −0.5x. Many lines work; any line with 0 mistakes is a perfect boundary for this data. A
        linear classifier is trained to find one like it, and when no line can do it perfectly,
        it settles for the fewest mistakes.
      </p>
    ),
  },
]

/** Turns a number into a Python float literal: 2 → "2.0". */
const lit = (x: number) => pyFloat(Number(fmt(x)))

export function PracticeStep() {
  const [setId, setSetId] = useState(DATA_SETS[0].id)
  const [m, setMValue] = useState(START_M)
  const [b, setBValue] = useState(START_B)
  const [showSquares, setShowSquares] = useState(false)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const boundary = setId === BOUNDARY_SET.id
  const set = DATA_SETS.find((d) => d.id === setId) ?? DATA_SETS[0]
  const error = sumSquaredError(m, b, set.points)
  const wrong = misclassified(m, b, GROUPS)

  const update = (nextId: string, nextM: number, nextB: number) => {
    const nextSet = DATA_SETS.find((d) => d.id === nextId)
    const solved = nextSet ? isSolved(nextSet, nextM, nextB) : isSplit(nextM, nextB)
    if (solved && !done.has(nextId)) setDone(new Set([...done, nextId]))
  }
  const setM = (next: number) => {
    setMValue(next)
    update(setId, next, b)
  }
  const setB = (next: number) => {
    setBValue(next)
    update(setId, m, next)
  }
  const choose = (nextId: string) => {
    setSetId(nextId)
    update(nextId, m, b)
  }

  const xs = set.points.map((q) => q[0])
  const ys = set.points.map((q) => q[1])
  const code = [
    'import numpy as np',
    '',
    `x = np.array([${xs.join(', ')}])`,
    `y = np.array([${ys.join(', ')}])`,
    `m, b = ${lit(m)}, ${lit(b)}`,
    '',
    'pred = m * x + b                  # the line at each x',
    'error = np.sum((y - pred) ** 2)   # sum of squared gaps',
    'print(error)',
  ].join('\n')

  const goal = set.target === 0 ? 'exactly 0' : `below ${set.target}`

  return (
    <Step
      n={6}
      kind="Practice"
      title="Fit a line to data by hand"
      visual={
        <>
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Data set">
            {[...DATA_SETS, BOUNDARY_SET].map((d) => (
              <Button
                key={d.id}
                variant={d.id === setId ? 'primary' : 'secondary'}
                aria-pressed={d.id === setId}
                onClick={() => choose(d.id)}
              >
                {d.name}
              </Button>
            ))}
          </div>
          {boundary ? (
            <Plane label={`Data set "${BOUNDARY_SET.name}": groups A and B, and your line as the boundary between them`}>
              <SideShading m={m} b={b} x={[-5, 5]} y={[-5, 5]} />
              <Line.ThroughPoints point1={[0, b]} point2={[1, lineY(m, b, 1)]} color={COLOR.v} />
              <ClassPoints points={GROUPS} m={m} b={b} marker={0.15} />
            </Plane>
          ) : (
          <Plane label={`Data set "${set.name}" with your line and the vertical gaps to it`}>
            {showSquares &&
              set.points.map((q) => (
                <Polygon
                  key={`sq${q[0]}`}
                  points={residualSquare(m, b, q)}
                  color={COLOR.j}
                  fillOpacity={0.15}
                  weight={1}
                />
              ))}
            <Line.ThroughPoints point1={[0, b]} point2={[1, lineY(m, b, 1)]} color={COLOR.v} />
            {set.points.map((q) => (
              <Line.Segment
                key={`r${q[0]}`}
                point1={q}
                point2={[q[0], lineY(m, b, q[0])]}
                color={COLOR.j}
                style="dashed"
                weight={2}
              />
            ))}
            {set.points.map((q) => (
              <CoordPoint key={`p${q[0]}`} at={q} color={COLOR.i} />
            ))}
          </Plane>
          )}
          <div className="mt-4 grid gap-3">
            <SliderField
              symbol="m"
              label="practice slope m"
              value={m}
              onChange={setM}
              min={-4}
              max={4}
              step={0.25}
              accent={COLOR.v}
            />
            <SliderField
              symbol="b"
              label="practice intercept b"
              value={b}
              onChange={setB}
              min={-5}
              max={5}
              step={0.25}
              accent={COLOR.result}
            />
          </div>
          {!boundary && (
            <div className="mt-3">
              <Toggle checked={showSquares} onChange={setShowSquares}>
                Draw each squared gap as a square
              </Toggle>
            </div>
          )}
          {boundary ? (
            <Readout>
              <Tag color={COLOR.v}>Your boundary</Tag>: {lineEquation(m, b)}.{' '}
              <strong>Mistakes = {wrong.length}</strong> (goal: 0). Every A should be above the line,
              every B below.
              {wrong.length > 0 && <> On the wrong side: {wrong.map((q) => q.name).join(', ')}.</>}
            </Readout>
          ) : (
          <Readout>
            <Tag color={COLOR.v}>Your line</Tag>: {lineEquation(m, b)}.{' '}
            <strong>
              Error = {fmt(error, 4)}
            </strong>{' '}
            (goal: {goal}). Gaps to the <Tag color={COLOR.i}>data points</Tag>:{' '}
            {set.points.map((q) => fmt(q[1] - lineY(m, b, q[0]))).join(', ')}.
          </Readout>
          )}
          <div className="mt-4">
            {boundary ? (
              <NumpySnippet code={groupsCode(m, b)} output={groupsOutput(m, b)} />
            ) : (
              <NumpySnippet code={code} output={pyFloat(error)} />
            )}
          </div>
        </>
      }
    >
      <p>
        Each orange dot is a data point. Move the sliders until your{' '}
        <Tag color={COLOR.v}>line</Tag> runs through the middle of the dots.
      </p>
      <p>
        &ldquo;Through the middle&rdquo; needs a number, or you cannot tell which of two lines is
        better. For each point, measure the vertical <Tag color={COLOR.j}>gap</Tag> between it and
        the line, square it, and add them up. That total is the <strong>error</strong>; smaller is
        better, and 0 means the line hits every point. Squaring makes every gap count as positive
        and makes big misses cost far more than small ones (lesson 2.4 shows why).
      </p>
      <p>
        The last set, <strong>{BOUNDARY_SET.name}</strong>, uses the line the other way, as in the
        fruit example: not to run through the points but to keep two groups apart.
      </p>
      <p>No answers are shown. A task is ticked as soon as your line meets its goal.</p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
