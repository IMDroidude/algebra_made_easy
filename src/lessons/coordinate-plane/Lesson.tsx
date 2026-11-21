import { useState } from 'react'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, CoordPoint, DraggablePoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Predict } from '../../components/Predict'
import { Slider } from '../../components/Slider'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec, isInteger, numpyVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { add, approxEqualVec, scale, sub } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { GridPlane } from './GridPlane'
import { HouseExample } from './HouseExample'
import { usePlaneHeight } from './layout'
import { AxisNames, Guides, PointLabels, Quadrants, WalkArrows } from './Guides'
import { PinControls, PinsOnPlane } from './PinParts'
import { addPin } from './pins'
import { PracticeStep } from './PracticeStep'
import {
  LIMIT,
  PREDICT_FROM,
  PREDICT_TO,
  describeRegion,
  moveText,
  noNegZero,
  numpyScalar,
  snapWhole,
  walkSentence,
} from './plane'

const SEE_POINT: Vec2 = [3, 2]

/** Two sliders linked to the point: moving one moves P in one direction only. */
function PointSliders({ p, onChange }: { p: Vec2; onChange: (next: Vec2) => void }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border border-line bg-surface px-4 py-3 sm:grid-cols-2">
      <div>
        <Slider name="x" value={p[0]} onChange={(v) => onChange([v, p[1]])} min={-LIMIT} max={LIMIT} step={1} accent={COLOR.i} />
        <p className="m-0 text-xs text-muted">width: left (−) ↔ right (+)</p>
      </div>
      <div>
        <Slider name="y" value={p[1]} onChange={(v) => onChange([p[0], v])} min={-LIMIT} max={LIMIT} step={1} accent={COLOR.j} />
        <p className="m-0 text-xs text-muted">height: down (−) ↕ up (+)</p>
      </div>
    </div>
  )
}

export function Lesson() {
  const [p, setPoint] = useState<Vec2>([3, 2])
  const setP = (next: Vec2) => setPoint(noNegZero(next))
  const [showSigns, setShowSigns] = useState(false)
  const [showPins, setShowPins] = useState(false)
  const [pins, setPins] = useState<Vec2[]>([])
  const [connect, setConnect] = useState(true)
  const [showSwap, setShowSwap] = useState(true)
  const reveal = useTween(1600)
  const big = usePlaneHeight('big')
  const medium = usePlaneHeight('medium')
  const line = usePlaneHeight('line')

  const [x, y] = p
  const swapped: Vec2 = [y, x]
  const same = approxEqualVec(p, swapped)
  const predictPoint = add(PREDICT_FROM, scale(sub(PREDICT_TO, PREDICT_FROM), reveal.t))
  const integer = isInteger(x, y)

  return (
    <article className="mx-auto max-w-7xl px-4 pb-10">
      <LessonHeader slug="coordinate-plane">
        Every picture in this course is drawn on the same grid. By the end of this lesson you will
        be able to read any point&rsquo;s two numbers, place a point from its numbers, and say
        which part of the grid negative numbers send it to.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="From a number line to a plane"
        layout="wide"
        visual={
          <>
            <p className="m-0 mb-2 text-sm font-semibold text-muted">1D · one number: x (width)</p>
            <GridPlane numberLine x={[-10.5, 10.5]} y={[-1, 1]} height={line} label="A number line with a point at x = 3">
              <AxisNames yAxis={false} />
              <Arrow tip={[3, 0]} color={COLOR.i} showCoords={false} />
              <PlaneLabel x={1.5} y={0} attach="n" distance={10} size={15} color={COLOR.i}>
                3 right (x)
              </PlaneLabel>
              <CoordPoint at={[3, 0]} color={COLOR.v} />
            </GridPlane>
            <p className="m-0 mt-5 mb-2 text-sm font-semibold text-muted">
              2D · add the y-axis (height): two numbers
            </p>
            <GridPlane height={big} label="The coordinate plane with the point P at (3, 2)">
              <Quadrants p={SEE_POINT} />
              <AxisNames />
              <PlaneLabel x={0} y={0} attach="nw" distance={8} size={14} color={COLOR.ghost}>
                origin
              </PlaneLabel>
              <WalkArrows p={SEE_POINT} />
              <CoordPoint at={SEE_POINT} color={COLOR.v} />
              <PointLabels p={SEE_POINT} />
            </GridPlane>
            <Readout>
              <Tag color={COLOR.v}>P</Tag> = (3, 2): {walkSentence(SEE_POINT)}.
            </Readout>
          </>
        }
      >
        <p>
          Start with one line of numbers, the <Tag color={COLOR.i}>x-axis</Tag>. It measures{' '}
          <strong>width</strong>: positive numbers go right, negative numbers go left, and 0 is in the
          middle. One number, like x = 3, is enough to pin a spot on a line: 3 steps right of 0.
        </p>
        <p>
          A flat page also has <strong>height</strong>. Add a second number line standing upright
          through 0: the <Tag color={COLOR.j}>y-axis</Tag>. Positive y goes up, negative y goes down.
          The two lines cross at the <strong>origin</strong>, where both numbers are 0.
        </p>
        <p>
          Now a spot needs two numbers, written in brackets with x first: <strong>(x, y)</strong>.
          To reach <Tag color={COLOR.v}>P</Tag> = (3, 2): move 3 right (x), then 2 up (y).
        </p>
        <p>
          The two axes split the plane into four <strong>quadrants</strong>, numbered I to IV
          counter-clockwise from the top right. Hover over P to see its numbers.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Drag the point anywhere, even left and down"
        layout="wide"
        visual={
          <>
            <GridPlane height={big} label="The coordinate plane with a draggable point P">
              <Quadrants p={p} signs={showSigns} />
              <AxisNames />
              {showPins && <PinsOnPlane pins={pins} connect={connect} />}
              <Guides p={p} />
              <DraggablePoint value={p} onChange={setP} color={COLOR.v} snap={snapWhole} />
              <PointLabels p={p} />
            </GridPlane>
            <PointSliders p={p} onChange={setP} />
            <div className="mt-3 flex flex-col gap-2">
              <Toggle checked={showSigns} onChange={setShowSigns}>
                Show the signs of x and y in each quadrant
              </Toggle>
              <Toggle checked={showPins} onChange={setShowPins}>
                Pin several points: a table and a shape
              </Toggle>
            </div>
            {showPins && (
              <PinControls
                p={p}
                pins={pins}
                setPins={setPins}
                connect={connect}
                setConnect={setConnect}
                onPin={() => setPins(addPin(pins, p))}
              />
            )}
            <Readout>
              <Tag color={COLOR.v}>P</Tag> = {fmtVec(p)}: {walkSentence(p)}. {describeRegion(p)}
            </Readout>
          </>
        }
      >
        <p>
          Drag <Tag color={COLOR.v}>P</Tag>, use the two sliders, or click P and use the arrow keys
          (one press is one step). The label on P names its quadrant as it moves.
        </p>
        <p>
          The axes do not stop at 0. Left of the y-axis, x is <strong>negative</strong>: &minus;2
          means 2 steps <em>left</em>. Below the x-axis, y is negative: &minus;3 means 3 steps{' '}
          <em>down</em>. The minus sign is a direction, not a smaller size.
        </p>
        <p>Try to:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>move P into each quadrant and note which numbers turn negative,</li>
          <li>put P exactly on an axis. Which number is 0 there?</li>
          <li>put P back on the origin,</li>
          <li>move only the x slider. Which way can P go?</li>
        </ul>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: flip the sign of x"
        visual={
          <>
            <GridPlane height={medium} label="A point before and after its x number changes sign">
              <Quadrants />
              <AxisNames />
              <CoordPoint at={PREDICT_FROM} color={COLOR.ghost} />
              <PlaneLabel x={PREDICT_FROM[0]} y={PREDICT_FROM[1]} attach="e" distance={12} size={15} color={COLOR.ghost}>
                before
              </PlaneLabel>
              {reveal.t > 0 && (
                <>
                  <Guides p={predictPoint} />
                  <CoordPoint at={predictPoint} color={COLOR.v} />
                  <PointLabels p={predictPoint} coords={reveal.t === 1} />
                </>
              )}
            </GridPlane>
            <Readout>
              {reveal.t === 0
                ? `The point is at ${fmtVec(PREDICT_FROM)}. Lock in a prediction to change x to ${fmt(PREDICT_TO[0])}.`
                : `The point is now at ${fmtVec(predictPoint)}. ${reveal.t === 1 ? 'Same height, same distance from the y-axis, other side.' : ''}`}
            </Readout>
          </>
        }
      >
        <p>
          A point is at {fmtVec(PREDICT_FROM)}, in quadrant I. You change only the first number, from{' '}
          {fmt(PREDICT_FROM[0])} to {fmt(PREDICT_TO[0])}, so the point becomes{' '}
          {fmtVec(PREDICT_TO)}.
        </p>
        <Predict
          question="Where does the point go?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'down',
              label: 'Straight down, below the x-axis.',
              correct: false,
              explain: (
                <p className="m-0">
                  Going below the x-axis needs a negative <strong>y</strong>, the second number.
                  You changed the first number, x, which only controls left and right. The height
                  (y = {fmt(PREDICT_TO[1])}) did not change.
                </p>
              ),
            },
            {
              id: 'mirror',
              label: 'Straight across to the other side of the y-axis, at the same height.',
              correct: true,
              explain: (
                <p className="m-0">
                  x = {fmt(PREDICT_FROM[0])} means {fmt(PREDICT_FROM[0])} steps right; x ={' '}
                  {fmt(PREDICT_TO[0])} means {fmt(PREDICT_FROM[0])} steps left. y stays{' '}
                  {fmt(PREDICT_TO[1])}, so the height does not change. The new point is the mirror
                  image of the old one, with the y-axis as the mirror: quadrant I becomes quadrant II.
                </p>
              ),
            },
            {
              id: 'closer',
              label: `Closer to the origin, because ${fmt(PREDICT_TO[0])} is smaller than ${fmt(PREDICT_FROM[0])}.`,
              correct: false,
              explain: (
                <p className="m-0">
                  On a coordinate axis the minus sign means &ldquo;the other way&rdquo;, not
                  &ldquo;less far&rdquo;. {fmt(PREDICT_TO[0])} is exactly as far from 0 as{' '}
                  {fmt(PREDICT_FROM[0])}; it is just on the left instead of the right.
                </p>
              ),
            },
            {
              id: 'off',
              label: 'Nowhere: negative numbers are off the grid.',
              correct: false,
              explain: (
                <p className="m-0">
                  The grid carries on past both axes in every direction. Everything left of the
                  y-axis has a negative x; everything below the x-axis has a negative y. Half the
                  plane is negative x.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="Order matters: x first, then y"
        layout="wide"
        visual={
          <>
            <GridPlane height={big} label="The walk to P along x then y, and the point with its numbers swapped">
              <Quadrants p={p} />
              <AxisNames />
              <WalkArrows p={p} />
              {showSwap && !same && (
                <>
                  <CoordPoint at={swapped} color={COLOR.ghost} />
                  <PlaneLabel x={swapped[0]} y={swapped[1]} attach={swapped[0] < 0 ? 'nw' : 'ne'} distance={10} size={15} color={COLOR.ghost}>
                    {`swapped ${fmtVec(swapped)}`}
                  </PlaneLabel>
                </>
              )}
              <DraggablePoint value={p} onChange={setP} color={COLOR.v} snap={snapWhole} />
              <PointLabels p={p} tag={false} />
            </GridPlane>
            <div className="mt-3">
              <Toggle checked={showSwap} onChange={setShowSwap}>
                Show the point with x and y swapped
              </Toggle>
            </div>
            <Readout>
              Walk <Tag color={COLOR.i}>{moveText(x, 'right', 'left', 'x')}</Tag>, then{' '}
              <Tag color={COLOR.j}>{moveText(y, 'up', 'down', 'y')}</Tag>: you reach{' '}
              <Tag color={COLOR.v}>P</Tag> = {fmtVec(p)}.
              {showSwap &&
                (same
                  ? ' Swapping the numbers gives the same point, because x and y are equal.'
                  : ` Swapping the numbers gives ${fmtVec(swapped)}, a different point.`)}
            </Readout>
            <div className="mt-4">
              <NumpySnippet
                code={`import numpy as np\n\n${numpyVec('p', p)}   # [x, y]\n\nprint(p[0])   # x\nprint(p[1])   # y`}
                output={`${numpyScalar(x, integer)}\n${numpyScalar(y, integer)}`}
              />
            </div>
          </>
        }
      >
        <p>
          This is the same <Tag color={COLOR.v}>P</Tag> as in step 2; you can keep dragging it here.
          Its two numbers are two walks, always named in the same order:
        </p>
        <Tex block>
          {String.raw`P = (\,\textcolor{${COLOR.i}}{x},\ \textcolor{${COLOR.j}}{y}\,) = (\,\textcolor{${COLOR.i}}{${fmt(x)}},\ \textcolor{${COLOR.j}}{${fmt(y)}}\,)`}
        </Tex>
        <p>
          <Tag color={COLOR.i}>x</Tag> is width: right (+) or left (&minus;).{' '}
          <Tag color={COLOR.j}>y</Tag> is height: up (+) or down (&minus;). The first number is
          always the left-right one. So {fmtVec(p)} and {fmtVec(swapped)} are{' '}
          {same ? 'the same point only because both numbers are equal' : 'different points'}. Mixing
          them up is the most common slip; when in doubt, think &ldquo;along the corridor, then up
          the stairs&rdquo;.
        </p>
        <p>The signs alone tell you the quadrant (laid out as they sit on the plane):</p>
        <Tex block>
          {String.raw`\begin{array}{ll} \text{II}: (-,+) & \text{I}: (+,+) \\ \text{III}: (-,-) & \text{IV}: (+,-) \end{array}`}
        </Tex>
        <p>
          In code, a point is a list of two numbers. In NumPy, <code>np.array([x, y])</code> holds
          them, and <code>p[0]</code> and <code>p[1]</code> read them back. Python counts positions
          from 0, so <code>p[0]</code> is x and <code>p[1]</code> is y.
        </p>
      </Step>

      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <section aria-labelledby="whats-next" className="border-t border-line py-10">
        <h2 id="whats-next" className="mt-0 mb-3 font-display text-2xl">
          Next: a third axis, and more
        </h2>
        <div className="prose-lesson max-w-[62ch]">
          <p>
            One number (x, width) placed a point on a line. Two numbers (x, y: width and height)
            place it on a plane. The real world has a third direction, <strong>depth</strong>, and
            a third axis for it, z. That is the next lesson,{' '}
            <a href="#/lessons/3d-space">1.3: 3D space: the room</a>.
          </p>
          <p>
            Data does not stop at three. A row with 50 features is a point with 50 numbers, in a
            space with <strong>more dimensions</strong> than we can draw. The rules you learned here
            (one number per axis, order matters, signs give direction) carry over unchanged.
          </p>
        </div>
      </section>
    </article>
  )
}
