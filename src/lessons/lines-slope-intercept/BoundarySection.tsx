import { Circle, Line, Polygon } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, Plane } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Tex } from '../../components/Tex'
import { Button, Readout, Tag, Toggle } from '../../components/ui'
import { fmt } from '../../lib/format'
import { CLASS_COLOR, FRUIT, FRUIT_RANGE, FRUIT_START, fruitCode, fruitOutput } from './boundaryData'
import { halfPlaneInBox, lineEquation, lineY, misclassified, neuronForm } from './lineMath'
import type { Labelled } from './lineMath'
import { SliderField } from './SliderField'

/** Wraps negative numbers in brackets inside an equation: + (−0.5). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

/**
 * The labelled points of a two-class data set on a plane, split by the line
 * y = mx + b: class A as plain dots, class B as dots in a square, each with
 * its name. Points on the wrong side get a dashed ring.
 */
export function ClassPoints({
  points,
  m,
  b,
  marker = 0.16,
}: {
  points: readonly Labelled[]
  m: number
  b: number
  /** Half the width of the square around class-B points, in plane units. */
  marker?: number
}) {
  const wrong = new Set(misclassified(m, b, points).map((q) => q.name))
  return (
    <>
      {points.map((q) => {
        const [x, y] = q.at
        const color = q.a ? CLASS_COLOR.a : CLASS_COLOR.b
        return (
          <g key={q.name} data-point={q.name} data-wrong={wrong.has(q.name) ? '' : undefined}>
            {wrong.has(q.name) && (
              <Circle center={q.at} radius={marker * 2} color="var(--ink)" fillOpacity={0} weight={2} strokeStyle="dashed" />
            )}
            {!q.a && (
              <Polygon
                points={[
                  [x - marker, y - marker],
                  [x + marker, y - marker],
                  [x + marker, y + marker],
                  [x - marker, y + marker],
                ]}
                color={color}
                fillOpacity={0}
                weight={2}
              />
            )}
            <CoordPoint at={q.at} color={color} />
            <PlaneLabel x={x} y={y} attach="ne" distance={11} size={12} color={color}>
              {q.name}
            </PlaneLabel>
          </g>
        )
      })}
    </>
  )
}

/** Light shading of the two sides of the line inside the visible box. */
export function SideShading({
  m,
  b,
  x,
  y,
}: {
  m: number
  b: number
  x: [number, number]
  y: [number, number]
}) {
  const above = halfPlaneInBox(m, b, x, y, true)
  const below = halfPlaneInBox(m, b, x, y, false)
  return (
    <>
      {above.length > 0 && <Polygon points={above} color={CLASS_COLOR.a} fillOpacity={0.07} weight={0} />}
      {below.length > 0 && <Polygon points={below} color={CLASS_COLOR.b} fillOpacity={0.07} weight={0} />}
    </>
  )
}

/**
 * Apply, continued: the same line used as a decision boundary. Points above it
 * are called apples, points below it lemons; the learner tilts and slides the
 * line until no fruit is on the wrong side.
 */
export function BoundarySection() {
  const [m, setM] = useState(FRUIT_START.m)
  const [b, setB] = useState(FRUIT_START.b)
  const [showNeuron, setShowNeuron] = useState(false)

  const wrong = misclassified(m, b, FRUIT)
  const { w, bias } = neuronForm(m, b)

  return (
    <section aria-labelledby="boundary-heading" className="border-t border-line py-10">
      <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">
        Step 5 · Apply, continued
      </p>
      <h2 id="boundary-heading" className="mt-1 mb-5 font-display text-3xl leading-tight">
        A line that splits the plane
      </h2>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="prose-lesson max-w-[62ch]">
          <p>
            A line can do a second job. Instead of turning x into y, it can cut the plane into two
            halves: every point is either <strong>above</strong> the line or <strong>below</strong>{' '}
            it.
          </p>
          <p>
            Here are ten fruits, each measured two ways: size (x) and sweetness (y), both scored 0
            to 8. The <Tag color={CLASS_COLOR.a}>apples (A, plain dots)</Tag> are sweeter for their
            size than the <Tag color={CLASS_COLOR.b}>lemons (L, dots in squares)</Tag>. The rule is
            simple:
          </p>
          <p className="rounded-lg border border-line bg-surface px-4 py-3">
            Above the line means <strong>apple</strong>. Below it (or exactly on it) means{' '}
            <strong>lemon</strong>.
          </p>
          <p>
            Move the sliders until no fruit is on the wrong side. A flat line will not do it: the big
            lemon L5 is as sweet as the apple A3. You need to tilt it.
          </p>
          <p>
            How does a computer tell above from below? It measures how far each point is above the
            line, its <strong>score</strong>:
          </p>
          <Tex block>{String.raw`\text{score} = y - (m\,x + b)`}</Tex>
          <p>
            A positive score means above, so &ldquo;apple&rdquo;; negative means below. The line
            itself is where the score is exactly 0. That line is called a{' '}
            <strong>decision boundary</strong>: the place where the answer flips from one class to
            the other.
          </p>
          <p>
            This is the simplest decision boundary there is, and it is exactly what a single neuron
            (a <em>linear classifier</em>) draws. With two inputs x₁ and x₂, a neuron computes{' '}
            <Tex>{String.raw`w_1 x_1 + w_2 x_2 + b`}</Tex>, written short as{' '}
            <Tex>{String.raw`\mathbf{w}\cdot\mathbf{x} + b`}</Tex>, and its rule is:
          </p>
          <Tex block>{String.raw`\mathbf{w}\cdot\mathbf{x} + b > 0 \;\Longrightarrow\; \text{class A}`}</Tex>
          <p>
            Training a classifier means finding the w and b that put the fewest points on the wrong
            side: what you are doing by hand with the sliders.
          </p>
          <p>
            In the code, <code>X[:, 1]</code> means &ldquo;column 1 of every row&rdquo; (the
            sweetness) and <code>X[:, 0]</code> column 0 (the size). <code>score &gt; 0</code>{' '}
            compares every entry at once and gives an array of True and False.{' '}
            <code>pred != is_apple</code> is True wherever the guess disagrees with the label (NumPy
            treats True as 1 and False as 0), and <code>np.sum</code> counts those.
          </p>
          <p>
            <strong>In 3D</strong>, with three features per fruit, the boundary is no longer a line
            but a flat <strong>plane</strong> through the room, with one class on each side. With
            more features it becomes a flat &ldquo;hyperplane&rdquo; you cannot draw, but the rule
            is still w·x + b &gt; 0.
          </p>
          <p className="text-sm text-muted">
            What this picture leaves out: a real classifier also passes the score through a squashing
            function that turns it into a probability, such as &ldquo;90% apple&rdquo;. The boundary
            is still the line where the score is 0. And real data rarely splits perfectly; a model
            settles for as few mistakes as possible.
          </p>
        </div>
        <div>
          <Plane
            label="Ten fruits by size and sweetness, and a line that splits them into apples above and lemons below"
            x={FRUIT_RANGE}
            // A little room below 0 so the x-axis numbers are not cut off.
            y={[FRUIT_RANGE[0] - 0.6, FRUIT_RANGE[1]]}
          >
            <SideShading m={m} b={b} x={FRUIT_RANGE} y={FRUIT_RANGE} />
            <Line.ThroughPoints point1={[0, b]} point2={[1, lineY(m, b, 1)]} color="var(--ink)" />
            <ClassPoints points={FRUIT} m={m} b={b} />
            <PlaneLabel x={FRUIT_RANGE[1]} y={0} attach="nw" distance={8} size={13} color="var(--muted)">
              size →
            </PlaneLabel>
            <PlaneLabel x={0} y={FRUIT_RANGE[1]} attach="se" distance={8} size={13} color="var(--muted)">
              ↑ sweetness
            </PlaneLabel>
          </Plane>
          <div className="mt-4 grid gap-3">
            <SliderField
              symbol="m"
              label="boundary slope m"
              value={m}
              onChange={setM}
              min={-2}
              max={2}
              step={0.25}
              accent={CLASS_COLOR.a}
            />
            <SliderField
              symbol="b"
              label="boundary intercept b"
              value={b}
              onChange={setB}
              min={-2}
              max={8}
              step={0.25}
              accent={CLASS_COLOR.b}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Toggle checked={showNeuron} onChange={setShowNeuron}>
              Show the rule as a neuron
            </Toggle>
            <Button
              variant="secondary"
              onClick={() => {
                setM(FRUIT_START.m)
                setB(FRUIT_START.b)
              }}
            >
              Reset line
            </Button>
          </div>
          <Readout>
            Boundary: {lineEquation(m, b)}.{' '}
            {wrong.length === 0 ? (
              <strong>No fruit on the wrong side: every apple is above the line, every lemon below.</strong>
            ) : (
              <>
                <strong>
                  {wrong.length} on the wrong side
                </strong>
                : {wrong.map((q) => `${q.name} (${q.a ? 'an apple below the line' : 'a lemon above the line'})`).join(', ')}.
              </>
            )}
          </Readout>
          {showNeuron && (
            <div className="mt-3" data-testid="neuron-form">
              <p className="m-0 text-sm">
                Score as a neuron: move everything to one side and read off the weights. Here x₁ is
                the size and x₂ the sweetness.
              </p>
              <Tex block>
                {String.raw`x_2 - (${fmt(m)}\,x_1 + ${p(b)}) = ${p(w[0])}\,x_1 + 1\,x_2 + ${p(bias)}`}
              </Tex>
              <p className="m-0 text-sm">
                So <Tex>{String.raw`\mathbf{w} = (${fmt(w[0])},\ ${fmt(w[1])})`}</Tex> and the
                neuron&rsquo;s bias is {fmt(bias)}: the line&rsquo;s b with its sign flipped.
              </p>
            </div>
          )}
          <div className="mt-4">
            <NumpySnippet code={fruitCode(m, b)} output={fruitOutput(m, b)} />
          </div>
        </div>
      </div>
    </section>
  )
}
