import { Line, Plot, Polygon, Text } from 'mafs'
import { useState } from 'react'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, numpyPrint } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import { useTween } from '../../lib/useTween'
import { isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { GraphPlane } from './GraphPlane'
import {
  diagonalSnap,
  lerp,
  pow2,
  pyFloat,
  sqrtNonNeg,
  square,
  squareAt,
  squareFromOrigin,
} from './powers'
import { PracticeStep } from './PracticeStep'
import { SliderField } from './SliderField'

const SEE_SIDE = 3

/** Step 3 doubles the side of a square from 2 to 4. */
const PREDICT_FROM = 2
const PREDICT_TO = 4

/** Step 4's table of growth, also used in its NumPy code. */
const GROWTH = [1, 2, 3, 4]

const cornerSnap = diagonalSnap(0.5, 5)
const snapHalf = snapTo(0.5, 4)
/** The step 4 input lives on the x-axis. */
const onXAxis = (q: Vec2): Vec2 => [snapHalf(q)[0], 0]

/** Wraps negative numbers in brackets: (−3)². */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

/** A square with side and area labels, drawn from the origin. */
function LabelledSquare({ side, color = COLOR.v }: { side: number; color?: string }) {
  return (
    <>
      <Polygon points={squareFromOrigin(side)} color={color} fillOpacity={0.22} weight={2.5} />
      <Line.Segment point1={[0, 0]} point2={[side, 0]} color={COLOR.i} weight={4} />
      <Text x={side / 2} y={0} attach="n" attachDistance={30} size={15} color={COLOR.i}>
        {`side ${fmt(side)}`}
      </Text>
      {side >= 1.2 && (
        <Text x={side / 2} y={side / 2} size={15} color={color}>
          {`area ${fmt(square(side))}`}
        </Text>
      )}
    </>
  )
}

export function Lesson() {
  const [corner, setCorner] = useState<Vec2>([2.5, 2.5])
  const [areaMode, setAreaMode] = useState(false)
  const [area, setArea] = useState(7)
  const [x, setX] = useState<Vec2>([-3, 0])
  const [showPow2, setShowPow2] = useState(false)
  const reveal = useTween(1400)

  const rootOfArea = sqrtNonNeg(area) ?? 0
  const side = areaMode ? rootOfArea : corner[0]

  const predictSide = lerp(PREDICT_FROM, PREDICT_TO, reveal.t)

  const xv = x[0]
  const xx = square(xv)
  const root = sqrtNonNeg(xx) ?? 0

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="exponents-and-roots">
        Squaring a number and taking its square root are opposite moves, and both have a picture:
        a square&rsquo;s area and its side. By the end of this lesson you will know why squares
        grow so fast, why (−3)² = 9, and how these two ideas measure errors and distances in AI.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="x² is the area of a square with side x"
        visual={
          <>
            <GraphPlane x={[-0.5, 5.5]} y={[-0.5, 5.5]} label="A square with side 3 and area 9">
              <LabelledSquare side={SEE_SIDE} />
            </GraphPlane>
            <Readout>
              A <Tag color={COLOR.v}>square</Tag> with <Tag color={COLOR.i}>side {SEE_SIDE}</Tag>{' '}
              covers {square(SEE_SIDE)} grid cells: {SEE_SIDE} rows of {SEE_SIDE}.
            </Readout>
          </>
        }
      >
        <p>
          Count the grid cells inside the <Tag color={COLOR.v}>square</Tag>: three rows of three,
          nine in all. Its area is its side times itself.
        </p>
        <Tex block>{String.raw`3^2 = 3 \times 3 = 9`}</Tex>
        <p>
          That is why x² is read &ldquo;x <em>squared</em>&rdquo;. The small raised 2 is an{' '}
          <strong>exponent</strong>: it says how many copies of x to multiply together. So 3² = 3 ×
          3 and 2³ = 2 × 2 × 2 = 8.
        </p>
        <p>
          Going the other way is the <strong>square root</strong>. If a square has area 9, its side
          is √9 = 3. A square root answers &ldquo;what number, times itself, gives this?&rdquo;
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Grow the square, or start from the area"
        visual={
          <>
            <GraphPlane
              x={[-0.5, 5.5]}
              y={[-0.5, 5.5]}
              label={
                areaMode
                  ? 'A square whose area is set by the slider; its side is the square root'
                  : 'A square whose top-right corner can be dragged to change its side'
              }
            >
              <LabelledSquare side={side} />
              {areaMode ? (
                <CoordPoint at={[side, side]} color={COLOR.v} />
              ) : (
                <DraggablePoint value={corner} onChange={setCorner} color={COLOR.v} snap={cornerSnap} />
              )}
            </GraphPlane>
            <div className="mt-3">
              <Toggle checked={areaMode} onChange={setAreaMode}>
                Set the area instead, and find the side (square root)
              </Toggle>
            </div>
            {areaMode && (
              <div className="mt-3">
                <SliderField
                  symbol="A"
                  label="area"
                  value={area}
                  onChange={setArea}
                  min={0}
                  max={25}
                  step={0.25}
                  accent={COLOR.v}
                />
              </div>
            )}
            <Readout>
              {areaMode ? (
                <>
                  <Tag color={COLOR.v}>Area {fmt(area)}</Tag>, so the{' '}
                  <Tag color={COLOR.i}>side is √{fmt(area)} = {fmt(rootOfArea, 3)}</Tag>. Check:{' '}
                  {fmt(rootOfArea, 3)} × {fmt(rootOfArea, 3)} ≈ {fmt(area)}.
                </>
              ) : (
                <>
                  <Tag color={COLOR.i}>Side {fmt(side)}</Tag>, so the{' '}
                  <Tag color={COLOR.v}>area is {fmt(side)}² = {fmt(square(side))}</Tag>.
                </>
              )}
            </Readout>
          </>
        }
      >
        <p>
          Drag the top-right corner of the square (or click it and use the arrow keys). Watch the
          side and the area. Notice how the area races ahead: a side of 1 gives 1, a side of 2
          gives 4, a side of 5 gives 25.
        </p>
        <p>
          Now tick <strong>Set the area instead</strong>. You choose the area with the slider and
          the square takes whatever side it needs. That side is the square root of the area. For
          areas like 4, 9 or 16 the root is a whole number; for 7 it is 2.6457&hellip;, a decimal
          that never ends.
        </p>
        <p>Try to:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>find a side whose area is less than the side itself (hint: try below 1),</li>
          <li>set the area to 16 and read the side,</li>
          <li>set the area to 2. Is the side half of 2?</li>
        </ul>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: double the side"
        visual={
          <>
            <GraphPlane
              x={[-0.5, 5.5]}
              y={[-0.5, 5.5]}
              label="A square with side 2, growing to side 4 when the prediction is locked in"
            >
              <LabelledSquare side={predictSide} />
              {reveal.t === 1 &&
                [
                  [0, 0],
                  [2, 0],
                  [0, 2],
                  [2, 2],
                ].map(([a, b]) => (
                  <Polygon
                    key={`${a}${b}`}
                    points={squareAt([a, b], PREDICT_FROM)}
                    color={COLOR.ghost}
                    fillOpacity={0}
                    strokeStyle="dashed"
                    weight={2}
                  />
                ))}
            </GraphPlane>
            <Readout>
              {reveal.t === 0
                ? 'Showing a square with side 2 and area 4. Lock in a prediction to double the side.'
                : `Side ${fmt(predictSide)}, area ${fmt(square(predictSide))}.${reveal.t === 1 ? ' The dashed lines show four copies of the original 2 × 2 square fitting inside.' : ''}`}
            </Readout>
          </>
        }
      >
        <p>A square has side 2, so its area is 4. You double the side to 4.</p>
        <Predict
          question="What happens to the area?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'double',
              label: 'It doubles, from 4 to 8.',
              correct: false,
              explain: (
                <p className="m-0">
                  That would be true for a length, but area grows in two directions at once. The
                  square gets twice as wide <em>and</em> twice as tall, so the area is multiplied
                  by 2 twice: 4 × 2 × 2 = 16.
                </p>
              ),
            },
            {
              id: 'four',
              label: 'It becomes four times as big, from 4 to 16.',
              correct: true,
              explain: (
                <p className="m-0">
                  4² = 16. Twice as wide and twice as tall means 2 × 2 = 4 copies of the original
                  square fit inside. In general, multiplying x by k multiplies x² by k².
                </p>
              ),
            },
            {
              id: 'plus',
              label: 'It goes up by 2, from 4 to 6, because the side went up by 2.',
              correct: false,
              explain: (
                <p className="m-0">
                  Area does not move in step with the side. Squaring is not adding: going from side
                  2 to side 4 adds a whole L-shaped band of 12 cells around the original 4.
                </p>
              ),
            },
            {
              id: 'eight',
              label: 'It becomes eight times as big, from 4 to 32.',
              correct: false,
              explain: (
                <p className="m-0">
                  Eight times (2 × 2 × 2) is what happens to the <em>volume</em> of a cube, which
                  grows in three directions. A flat square grows in two, so the factor is 2 × 2 =
                  4.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="How fast squares grow, and what happens to negatives"
        visual={
          <>
            <GraphPlane
              x={[-4.5, 4.5]}
              y={[-1, 17]}
              yStep={2}
              stretch
              label="Graphs of y = x and y = x squared, with a draggable value of x"
            >
              <Plot.OfX y={(t) => t} color={COLOR.i} weight={2} />
              <Plot.OfX y={square} color={COLOR.v} weight={3} />
              {showPow2 && <Plot.OfX y={pow2} color={COLOR.j} weight={2.5} />}
              <Line.Segment point1={[-Math.abs(xv), xx]} point2={[Math.abs(xv), xx]} color={COLOR.ghost} style="dashed" weight={1.5} />
              <Line.Segment point1={x} point2={[xv, xx]} color={COLOR.ghost} style="dashed" weight={1.5} />
              <CoordPoint at={[-xv, xx]} color={COLOR.ghost} />
              <CoordPoint at={[xv, xv]} color={COLOR.i} />
              <CoordPoint at={[xv, xx]} color={COLOR.v} />
              {showPow2 && <CoordPoint at={[xv, pow2(xv)]} color={COLOR.j} />}
              <Text x={4} y={16} attach="w" attachDistance={12} size={15} color={COLOR.v}>
                y = x²
              </Text>
              <Text x={3} y={3} attach="n" attachDistance={30} size={15} color={COLOR.i}>
                y = x
              </Text>
              <DraggablePoint value={x} onChange={setX} color={COLOR.result} snap={onXAxis} />
            </GraphPlane>
            <div className="mt-3">
              <Toggle checked={showPow2} onChange={setShowPow2}>
                Also show y = 2ˣ
              </Toggle>
            </div>
            <Readout>
              <Tag color={COLOR.result}>x = {fmt(xv)}</Tag>. On <Tag color={COLOR.i}>y = x</Tag> the
              height is {fmt(xv)}; on <Tag color={COLOR.v}>y = x²</Tag> it is {fmt(xx)}
              {showPow2 && (
                <>
                  ; on <Tag color={COLOR.j}>y = 2ˣ</Tag> it is {fmt(pow2(xv), 3)}
                </>
              )}
              .{' '}
              {!isZero(xv) && (
                <>
                  The grey point at x = {fmt(-xv)} has the same square: {p(-xv)}² = {fmt(xx)}. The
                  square root √{fmt(xx)} is {fmt(root)}, the non-negative one of the two.
                </>
              )}
            </Readout>
            <div className="mt-4">
              <NumpySnippet
                code={[
                  'import numpy as np',
                  '',
                  `x = ${pyFloat(xv)}`,
                  'print(x ** 2)',
                  'print(np.sqrt(x ** 2))   # the non-negative root',
                  '',
                  `xs = np.array([${GROWTH.join(', ')}])`,
                  'print(xs ** 2)',
                  'print(2 ** xs)',
                ].join('\n')}
                output={[
                  pyFloat(xx),
                  pyFloat(root),
                  numpyPrint(GROWTH.map(square), true),
                  numpyPrint(GROWTH.map(pow2), true),
                ].join('\n')}
              />
            </div>
          </>
        }
      >
        <p>
          Drag the <Tag color={COLOR.result}>green point</Tag> along the x-axis (or use the arrow
          keys). The <Tag color={COLOR.i}>straight line y = x</Tag> climbs steadily, one step up
          for each step right. The <Tag color={COLOR.v}>curve y = x²</Tag> climbs faster and
          faster: 1, 4, 9, 16. The gaps between those are 3, 5, 7, growing every time.
        </p>
        <p>
          <strong>Negatives square to positives.</strong> Drag x below zero. A minus times a minus
          is a plus, so
        </p>
        <Tex block>{String.raw`(-3)^2 = (-3)\times(-3) = 9`}</Tex>
        <p>
          That is why the curve is a U shape, the same height at x and −x. Careful with brackets:
          in maths and in Python, <code>-3 ** 2</code> means −(3²) = −9. Write{' '}
          <code>(-3) ** 2</code> to square the negative number.
        </p>
        <p>
          <strong>So 9 has two square roots, 3 and −3.</strong> The symbol √ always means the
          non-negative one, so that √9 is a single number:
        </p>
        <Tex block>{String.raw`\sqrt{9} = 3 \qquad\text{not}\; -3`}</Tex>
        <p>
          And a negative number has no real square root at all, since no real number squares to
          something below zero. NumPy&rsquo;s <code>np.sqrt(-4)</code> gives <code>nan</code>{' '}
          (&ldquo;not a number&rdquo;) and a warning.
        </p>
        <p>
          In Python, <code>**</code> is the exponent operator. Tick <strong>Also show y = 2ˣ</strong>{' '}
          to see a different kind of growth, where the variable is the exponent. The two curves
          cross at x = 2 and again at x = 4; after that 2ˣ pulls away for good. By x = 10 it is
          1024 against 100.
        </p>
      </Step>

      <ApplyStep />
      <PracticeStep />
    </article>
  )
}
