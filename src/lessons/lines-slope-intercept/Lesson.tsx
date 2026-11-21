import { Line, Text } from 'mafs'
import { useState } from 'react'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { approxEqualVec } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { BoundarySection } from './BoundarySection'
import { HouseLineExample } from './HouseLineExample'
import {
  interceptThrough,
  lerp,
  lineEquation,
  lineY,
  pyFloat,
  riseRunTriangle,
  slopeThrough,
} from './lineMath'
import { PracticeStep } from './PracticeStep'
import { SliderField } from './SliderField'

/** The line in step 1: y = 0.5x + 1, with four of its points. */
const SEE_M = 0.5
const SEE_B = 1
const SEE_XS = [-2, 0, 2, 4]

/** Step 3 changes the slope of y = 2x + 1 from 2 to −2. */
const PREDICT_B = 1
const PREDICT_FROM = 2
const PREDICT_TO = -2

/** The rise-over-run triangle in step 2 spans two steps, so it stays visible on flat lines. */
const TRIANGLE_RUN = 2

/** Wraps negative numbers in brackets so subtractions read correctly: 0 − (−2). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

/** Two points on the line y = mx + b, for drawing it edge to edge. */
const linePoints = (m: number, b: number): [Vec2, Vec2] => [
  [0, lineY(m, b, 0)],
  [1, lineY(m, b, 1)],
]

export function Lesson() {
  const [m, setM] = useState(0.5)
  const [b, setB] = useState(1)
  const [showTriangle, setShowTriangle] = useState(true)
  const [P, setP] = useState<Vec2>([-1, -2])
  const [Q, setQ] = useState<Vec2>([3, 0])
  const reveal = useTween(1400)

  const seePoints: Vec2[] = SEE_XS.map((x) => [x, lineY(SEE_M, SEE_B, x)])
  const tri = riseRunTriangle(m, b, 1, TRIANGLE_RUN)

  const predictM = lerp(PREDICT_FROM, PREDICT_TO, reveal.t)

  const slopePQ = slopeThrough(P, Q)
  const interceptPQ = slopePQ === null ? null : interceptThrough(P, slopePQ)
  const run = Q[0] - P[0]
  const rise = Q[1] - P[1]
  const samePoint = approxEqualVec(P, Q)

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="lines-slope-intercept">
        Every straight line is described by two numbers: how steep it is and where it crosses the
        y-axis. By the end of this lesson you will read <em>y = mx + b</em> at a glance, draw it
        from two points, fit one to data by hand, and use one to split data into two groups: the
        two jobs a single neuron does.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="A line is a rule that turns x into y"
        visual={
          <>
            <Plane label={`The line ${lineEquation(SEE_M, SEE_B)} with four of its points marked`}>
              <Line.ThroughPoints point1={seePoints[0]} point2={seePoints[1]} color={COLOR.v} />
              {seePoints.map((q) => (
                <CoordPoint key={q[0]} at={q} color={COLOR.v} />
              ))}
              <Text x={4} y={3} attach="sw" attachDistance={26} size={16} color={COLOR.v}>
                {lineEquation(SEE_M, SEE_B)}
              </Text>
            </Plane>
            <Readout>
              The <Tag color={COLOR.v}>line</Tag> {lineEquation(SEE_M, SEE_B)} passes through{' '}
              {seePoints.map((q) => fmtVec(q)).join(', ')}. Hover over a point to see its
              coordinates.
            </Readout>
          </>
        }
      >
        <p>
          Pick any x, multiply it by 0.5, add 1, and you get a y. Do that for every x and plot each
          (x, y) pair: the points all fall on one straight <Tag color={COLOR.v}>line</Tag>.
        </p>
        <Tex block>{String.raw`y = 0.5\,x + 1`}</Tex>
        <p>
          Try a few in your head: x = 2 gives 0.5 · 2 + 1 = 2, so (2, 2) is on the line. x = −2
          gives −1 + 1 = 0, so (−2, 0) is on it too.
        </p>
        <p>
          Every straight line (except a perfectly vertical one) can be written as{' '}
          <Tex>{String.raw`y = mx + b`}</Tex>. The two numbers <em>m</em> and <em>b</em> are all
          you need to know about it, the same way two numbers were all you needed to know about a
          point.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Slope tilts the line, intercept slides it"
        visual={
          <>
            <Plane label="A line controlled by the slope and intercept sliders">
              <Line.ThroughPoints {...pointsProps(m, b)} color={COLOR.v} />
              {showTriangle && (
                <>
                  <Line.Segment point1={tri.start} point2={tri.corner} color={COLOR.i} weight={3} />
                  <Line.Segment point1={tri.corner} point2={tri.end} color={COLOR.j} weight={3} />
                  <Text
                    x={tri.start[0] + TRIANGLE_RUN / 2}
                    y={tri.start[1]}
                    attach={m >= 0 ? 'n' : 's'}
                    attachDistance={28}
                    size={14}
                    color={COLOR.i}
                  >
                    {`run ${TRIANGLE_RUN}`}
                  </Text>
                  <Text
                    x={tri.corner[0]}
                    y={tri.corner[1] + tri.rise / 2}
                    attach="e"
                    attachDistance={10}
                    size={14}
                    color={COLOR.j}
                  >
                    {`rise ${fmt(tri.rise)}`}
                  </Text>
                </>
              )}
              <CoordPoint at={[0, b]} color={COLOR.result} />
              <Text x={0} y={b} attach="w" attachDistance={14} size={16} color={COLOR.result}>
                b
              </Text>
            </Plane>
            <div className="mt-4 grid gap-3">
              <SliderField
                symbol="m"
                label="slope m"
                value={m}
                onChange={setM}
                min={-4}
                max={4}
                step={0.25}
                accent={COLOR.j}
              />
              <SliderField
                symbol="b"
                label="intercept b"
                value={b}
                onChange={setB}
                min={-5}
                max={5}
                step={0.25}
                accent={COLOR.result}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Toggle checked={showTriangle} onChange={setShowTriangle}>
                Show rise over run
              </Toggle>
              <Button
                variant="secondary"
                onClick={() => {
                  setM(0.5)
                  setB(1)
                }}
              >
                Reset
              </Button>
            </div>
            <Readout>
              <Tag color={COLOR.v}>{lineEquation(m, b)}</Tag>. Slope <strong>m = {fmt(m)}</strong>
              {showTriangle && <> (rise {fmt(tri.rise)} ÷ run {TRIANGLE_RUN})</>}:{' '}
              {m > 0
                ? `for every 1 step right, the line goes up ${fmt(m)}.`
                : m < 0
                  ? `for every 1 step right, the line goes down ${fmt(-m)}.`
                  : 'the line is flat: moving right does not change y.'}{' '}
              Intercept <Tag color={COLOR.result}>b = {fmt(b)}</Tag>: the line crosses the y-axis
              at (0, {fmt(b)}).
            </Readout>
          </>
        }
      >
        <p>
          Move the sliders, or type into the boxes (the up and down keys nudge them in steps of
          0.25).
        </p>
        <p>
          <strong>m is the slope</strong>: how much y changes when x goes up by 1. The triangle
          measures it: the <Tag color={COLOR.i}>run</Tag> is how far you step to the right (here
          2), the <Tag color={COLOR.j}>rise</Tag> is how far the line climbs over that step. Rise
          divided by run is the slope. On a straight line it comes out the same wherever you
          measure it and however long the run.
        </p>
        <p>
          <strong>b is the intercept</strong>: the value of y when x = 0, which is where the line
          crosses the vertical axis, at the point <Tag color={COLOR.result}>b</Tag>.
        </p>
        <p>Try to:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>make the line go downhill,</li>
          <li>make it perfectly flat (what is the rise then?),</li>
          <li>change b only. Does the steepness change?</li>
        </ul>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: flip the sign of the slope"
        visual={
          <>
            <Plane label="The line y = 2x + 1 before and after its slope changes">
              {reveal.t > 0 && (
                <Line.ThroughPoints
                  {...pointsProps(PREDICT_FROM, PREDICT_B)}
                  color={COLOR.ghost}
                  style="dashed"
                />
              )}
              <Line.ThroughPoints {...pointsProps(predictM, PREDICT_B)} color={COLOR.v} />
              <CoordPoint at={[0, PREDICT_B]} color={COLOR.result} />
              <Text x={0} y={PREDICT_B} attach="w" attachDistance={14} size={16} color={COLOR.result}>
                b
              </Text>
            </Plane>
            <Readout>
              {reveal.t === 0
                ? `Showing ${lineEquation(PREDICT_FROM, PREDICT_B)}. Lock in a prediction to change the slope.`
                : `Now showing ${lineEquation(predictM, PREDICT_B)}. The dashed grey line is where it started, ${lineEquation(PREDICT_FROM, PREDICT_B)}.`}
            </Readout>
          </>
        }
      >
        <p>The line below has slope 2 and intercept 1. Keep b = 1 and change only the slope:</p>
        <Tex block>{String.raw`y = 2x + 1 \;\longrightarrow\; y = -2x + 1`}</Tex>
        <Predict
          question="What happens to the line?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'down',
              label: 'It slides down, staying just as steep and pointing the same way.',
              correct: false,
              explain: (
                <p className="m-0">
                  Sliding up or down is the job of <strong>b</strong>, and b did not change. A
                  minus sign on the slope does not make the line lower; it changes which way it
                  tilts.
                </p>
              ),
            },
            {
              id: 'pivot',
              label: 'It tilts the other way, going downhill, and still crosses the y-axis at 1.',
              correct: true,
              explain: (
                <p className="m-0">
                  A negative slope means y <em>falls</em> by 2 for every step right. The intercept
                  is still 1, so the line pivots about the point (0, 1): uphill becomes downhill,
                  equally steep.
                </p>
              ),
            },
            {
              id: 'origin',
              label: 'It flips over, pivoting about the origin (0, 0).',
              correct: false,
              explain: (
                <p className="m-0">
                  The line never went through the origin: at x = 0 it is at y = b = 1. Changing m
                  leaves the value at x = 0 alone (m · 0 = 0), so the pivot is (0, 1), not (0, 0).
                </p>
              ),
            },
            {
              id: 'flatter',
              label: 'It gets less steep, because −2 is smaller than 2.',
              correct: false,
              explain: (
                <p className="m-0">
                  Steepness is the <em>size</em> of the slope, ignoring its sign. −2 and 2 are
                  equally steep; the sign only says uphill (+) or downhill (−). A flatter line
                  would need a slope closer to 0, such as 0.5.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="Two points are enough to pin down a line"
        visual={
          <>
            <Plane label="Two draggable points, the line through them and their rise-over-run triangle">
              {!samePoint && <Line.ThroughPoints point1={P} point2={Q} color={COLOR.v} />}
              {slopePQ !== null && (
                <>
                  <Line.Segment point1={P} point2={[Q[0], P[1]]} color={COLOR.i} weight={3} />
                  <Line.Segment point1={[Q[0], P[1]]} point2={Q} color={COLOR.j} weight={3} />
                  <Text
                    x={(P[0] + Q[0]) / 2}
                    y={P[1]}
                    attach={rise >= 0 ? 'n' : 's'}
                    attachDistance={28}
                    size={14}
                    color={COLOR.i}
                  >
                    {`run ${fmt(run)}`}
                  </Text>
                  <Text
                    x={Q[0]}
                    y={(P[1] + Q[1]) / 2}
                    attach={run >= 0 ? 'e' : 'w'}
                    attachDistance={10}
                    size={14}
                    color={COLOR.j}
                  >
                    {`rise ${fmt(rise)}`}
                  </Text>
                </>
              )}
              <DraggablePoint value={P} onChange={setP} color={COLOR.v} />
              <DraggablePoint value={Q} onChange={setQ} color={COLOR.v} />
              <Text x={P[0]} y={P[1]} attach="w" attachDistance={18} size={16} color={COLOR.v}>
                P
              </Text>
              <Text x={Q[0]} y={Q[1]} attach="w" attachDistance={18} size={16} color={COLOR.v}>
                Q
              </Text>
            </Plane>
            <Readout>
              <Tag color={COLOR.v}>P</Tag> = {fmtVec(P)}, <Tag color={COLOR.v}>Q</Tag> ={' '}
              {fmtVec(Q)}.{' '}
              {samePoint ? (
                <strong>
                  P and Q are the same point. Endless lines pass through a single point; you need
                  two different points to pin one down.
                </strong>
              ) : slopePQ === null || interceptPQ === null ? (
                <strong>
                  The run is 0: the line is vertical. Its slope would mean dividing by zero, so it
                  has no slope and cannot be written as y = mx + b.
                </strong>
              ) : (
                <>
                  <Tag color={COLOR.j}>Rise {fmt(rise)}</Tag> over <Tag color={COLOR.i}>run {fmt(run)}</Tag>{' '}
                  gives slope {fmt(slopePQ)}; the line is {lineEquation(slopePQ, interceptPQ)}.
                </>
              )}
            </Readout>
            <div className="mt-4">
              <NumpySnippet
                code={[
                  'import numpy as np',
                  '',
                  `p = np.array([${fmt(P[0])}, ${fmt(P[1])}])`,
                  `q = np.array([${fmt(Q[0])}, ${fmt(Q[1])}])`,
                  '',
                  'm = (q[1] - p[1]) / (q[0] - p[0])   # rise / run',
                  'b = p[1] - m * p[0]',
                  'print(m, b)',
                ].join('\n')}
                output={
                  slopePQ === null || interceptPQ === null
                    ? undefined
                    : `${pyFloat(slopePQ)} ${pyFloat(interceptPQ)}`
                }
              />
              {slopePQ === null && (
                <p className="mt-2 text-sm text-muted">
                  With a run of 0, NumPy divides by zero: it prints a warning and an infinite
                  slope instead of a number.
                </p>
              )}
            </div>
          </>
        }
      >
        <p>
          Drag <Tag color={COLOR.v}>P</Tag> and <Tag color={COLOR.v}>Q</Tag> (or click one and
          use the arrow keys). There is exactly one straight line through any two points, and you
          can work out its m and b from their coordinates.
        </p>
        <p>
          <strong>Slope</strong> is rise over run between the two points. With P = (x₁, y₁) and Q
          = (x₂, y₂):
        </p>
        {slopePQ === null || interceptPQ === null ? (
          <Tex block>
            {String.raw`m = \frac{y_2 - y_1}{x_2 - x_1} = \frac{${fmt(Q[1])} - ${p(P[1])}}{${fmt(Q[0])} - ${p(P[0])}} = \frac{${fmt(rise)}}{0} \quad\text{(undefined)}`}
          </Tex>
        ) : (
          <>
            <Tex block>
              {String.raw`m = \frac{y_2 - y_1}{x_2 - x_1} = \frac{${fmt(Q[1])} - ${p(P[1])}}{${fmt(Q[0])} - ${p(P[0])}} = \frac{${fmt(rise)}}{${fmt(run)}} = ${fmt(slopePQ)}`}
            </Tex>
            <p>
              <strong>Intercept</strong>: P is on the line, so y₁ = m·x₁ + b. Move m·x₁ to the
              other side:
            </p>
            <Tex block>
              {String.raw`b = y_1 - m\,x_1 = ${p(P[1])} - ${p(slopePQ)} \cdot ${p(P[0])} = ${fmt(interceptPQ)}`}
            </Tex>
            <p>
              So the line through P and Q is <strong>{lineEquation(slopePQ, interceptPQ)}</strong>.
            </p>
          </>
        )}
        <p>
          The code does the same two steps. <code>p[0]</code> is a point&rsquo;s x and{' '}
          <code>p[1]</code> its y (Python counts from 0). The slope is printed in full precision,
          so it can show more decimals than the rounded numbers in the equation.
        </p>
      </Step>

      <ApplyStep />
      <BoundarySection />
      <HouseLineExample />
      <PracticeStep />
    </article>
  )
}

/** Props for Mafs's Line.ThroughPoints that draw y = mx + b. */
function pointsProps(m: number, b: number) {
  const [point1, point2] = linePoints(m, b)
  return { point1, point2 }
}
