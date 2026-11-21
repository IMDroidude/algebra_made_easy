import { Text } from 'mafs'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { CoordPoint, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { add, scale, sub } from '../../linalg'
import { fitLine, residuals, sumSquaredResiduals } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { DATA, PREDICT_DATA, PREDICT_FROM, PREDICT_TO } from './data'
import { FitDrawing } from './FitDrawing'
import { HouseExample } from './HouseExample'
import { ManipulateStep } from './ManipulateStep'
import { PracticeStep } from './PracticeStep'
import { lineText } from './text'
import { UnderstandStep } from './UnderstandStep'

function SeeStep() {
  const fit = fitLine(DATA)!
  const res = residuals(DATA, fit)
  return (
    <Step
      n={1}
      kind="See"
      title="No line goes through every point"
      visual={
        <>
          <Plane label="Six data points, the best-fit line and the vertical gap from each point to the line">
            <FitDrawing points={DATA} line={fit} color={COLOR.result} />
            {DATA.map((p, k) => (
              <CoordPoint key={k} at={p} color={COLOR.v} />
            ))}
          </Plane>
          <Readout>
            Six <Tag color={COLOR.v}>data points</Tag>. <Tag color={COLOR.result}>Best-fit line</Tag>:{' '}
            {lineText(fit)}. Residuals (point minus line, left to right):{' '}
            {res.map((r) => fmt(r)).join(', ')}. Sum of squared residuals: {fmt(sumSquaredResiduals(DATA, fit))}.
          </Readout>
        </>
      }
    >
      <p>
        Real data is noisy. These six points roughly follow a line, but no straight line passes
        through all of them. So which line is <em>best</em>?
      </p>
      <p>
        For each point, measure the vertical gap between the point and the line: the{' '}
        <strong>residual</strong>, actual y minus predicted y. The dashed segments show them. A good
        line keeps them small.
      </p>
      <p>
        The standard choice, called <strong>least squares</strong>, squares every residual and adds
        them up, then picks the line that makes that total as small as possible:
      </p>
      <Tex block>{String.raw`\text{minimise} \quad \sum_i \big(y_i - (m x_i + b)\big)^2`}</Tex>
      <p>
        Squaring makes every gap positive, and it punishes big misses much more than small ones. The{' '}
        <Tag color={COLOR.result}>green line</Tag> is the winner for these points. In this lesson you
        will try to beat it, see why it wins, and see that finding it is a projection.
      </p>
    </Step>
  )
}

function PredictStep() {
  const reveal = useTween(1600)
  const moved = add(PREDICT_FROM, scale(sub(PREDICT_TO, PREDICT_FROM), reveal.t))
  const points: Vec2[] = [...PREDICT_DATA.slice(0, -1), moved]
  const fit = fitLine(points)!
  const before = fitLine(PREDICT_DATA)!

  return (
    <Step
      n={3}
      kind="Predict"
      title="Before you look: one point goes rogue"
      visual={
        <>
          <Plane label="Five points on a line; the last one is moved far below it">
            {reveal.t > 0 && <FitDrawing points={[]} line={before} color={COLOR.ghost} dashed />}
            <FitDrawing points={points} line={fit} color={COLOR.result} squares={reveal.t === 1} />
            {points.map((p, k) => (
              <CoordPoint key={k} at={p} color={COLOR.v} />
            ))}
            <Text x={moved[0]} y={moved[1]} attach="s" attachDistance={14} size={14} color={COLOR.v}>
              moved
            </Text>
          </Plane>
          <Readout>
            {reveal.t === 0
              ? `All five points sit on ${lineText(before)}, so the best line goes through all of them. Lock in a prediction to move the last point from ${fmtVec(PREDICT_FROM)} to ${fmtVec(PREDICT_TO)}.`
              : `The moved point is at ${fmtVec(moved)}. Best line now: ${lineText(fit)}.`}
            {reveal.t === 1 &&
              ` The old line (dashed grey) would leave that point with a residual of −5, a square of 25. Flattening to slope 0 spreads the error over all five points instead: sum of squares ${fmt(sumSquaredResiduals(points, fit))}.`}
          </Readout>
        </>
      }
    >
      <p>
        Five points lie exactly on the line y = 0.5x, so that is the best fit, with zero error. Now
        the rightmost point is dragged from (4, 2) straight down to (4, −3). The other four do not
        move.
      </p>
      <Predict
        question="What does the best-fit line do?"
        onReveal={reveal.play}
        onRetry={() => reveal.reset(0)}
        options={[
          {
            id: 'stay',
            label: 'It stays on y = 0.5x: four of the five points are still on it.',
            correct: false,
            explain: (
              <p className="m-0">
                Least squares is not a vote. Staying put would leave one residual of −5, a squared
                error of 25. Tilting lets the line trade that one huge square for several small ones.
              </p>
            ),
          },
          {
            id: 'bend',
            label: 'It bends down near the moved point and stays the same elsewhere.',
            correct: false,
            explain: (
              <p className="m-0">
                The model is a single straight line, y = mx + b. It cannot bend; it can only change
                its slope and its height, and both changes affect every point.
              </p>
            ),
          },
          {
            id: 'flat',
            label: 'It tilts a long way towards the moved point: one point can drag the whole line.',
            correct: true,
            explain: (
              <p className="m-0">
                The slope drops from 0.5 all the way to 0 and the line sinks to y = −1. Because
                errors are squared, a single far-off point (an <strong>outlier</strong>) pulls very
                hard. That is the price of least squares.
              </p>
            ),
          },
          {
            id: 'through',
            label: 'It swings until it passes through the moved point as well.',
            correct: false,
            explain: (
              <p className="m-0">
                No line passes through all five points any more, so the best line has to compromise.
                Passing through the moved point would leave big residuals at the other four.
              </p>
            ),
          },
        ]}
      />
    </Step>
  )
}

export function Lesson() {
  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="projection-least-squares">
        Given noisy data, find the line that fits it best. By the end of this lesson you will know
        what &ldquo;best&rdquo; means, see why the answer is a projection, and fit the simplest
        trainable model in ML, linear regression, with one line of NumPy.
      </LessonHeader>

      <SeeStep />
      <ManipulateStep />
      <PredictStep />
      <UnderstandStep />
      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/playground">playground</Link> has the &ldquo;Project onto x-axis&rdquo;
          preset: a matrix that does to the whole plane what least squares does to y.
        </p>
      </footer>
    </article>
  )
}
