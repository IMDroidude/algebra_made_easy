import { Line, Polygon, Text } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import type { Vec2 } from '../../linalg'
import {
  ERROR_LINE,
  ERROR_TARGETS,
  ERROR_XS,
  EMBED_A,
  EMBED_B,
  errorsFor,
  predictionAt,
} from './applyData'
import {
  distance,
  gapSquare,
  largestShare,
  legSquares,
  meanAbsoluteError,
  meanSquaredError,
  pyFloat,
  square,
} from './powers'

type Mode = 'error' | 'distance'

const snapHalf = snapTo(0.5)
const LAST_X = ERROR_XS[ERROR_XS.length - 1]
/** The draggable target only moves up and down. */
const onLastColumn = (q: Vec2): Vec2 => [LAST_X, snapHalf(q)[1]]

export function ApplyStep() {
  const [mode, setMode] = useState<Mode>('error')
  const [lastTarget, setLastTarget] = useState<Vec2>([LAST_X, 3])
  const [a, setA] = useState<Vec2>(EMBED_A)
  const [b, setB] = useState<Vec2>(EMBED_B)

  return (
    <Step
      n={5}
      kind="Apply"
      title="Squares measure mistakes, roots measure distances"
      visual={
        <>
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Which example to show">
            <Button
              variant={mode === 'error' ? 'primary' : 'secondary'}
              aria-pressed={mode === 'error'}
              onClick={() => setMode('error')}
            >
              Squared error
            </Button>
            <Button
              variant={mode === 'distance' ? 'primary' : 'secondary'}
              aria-pressed={mode === 'distance'}
              onClick={() => setMode('distance')}
            >
              Distance between embeddings
            </Button>
          </div>
          {mode === 'error' ? (
            <ErrorDemo lastTarget={lastTarget} setLastTarget={setLastTarget} />
          ) : (
            <DistanceDemo a={a} b={b} setA={setA} setB={setB} />
          )}
        </>
      }
    >
      <p>
        Squares and square roots are everywhere in machine learning. Here are the two places you
        will meet first. Switch between them with the buttons.
      </p>
      <p>
        <strong>Squared error.</strong> A model makes predictions (the{' '}
        <Tag color={COLOR.ghost}>line</Tag>) and each true value misses it by some error. To score
        the model, square each error and average them: the <em>mean squared error</em>, the most
        common loss in regression.
      </p>
      <Tex block>{String.raw`\text{MSE} = \frac{e_1^2 + e_2^2 + \dots + e_n^2}{n}`}</Tex>
      <p>
        Drag the <Tag color={COLOR.i}>last point</Tag> away from the line. An error of 1 costs 1,
        an error of 2 costs 4, an error of 4 costs 16. One big miss soon outweighs all the small
        ones together, so a model trained on squared error works hardest to avoid big mistakes.
        The plain average of the errors&rsquo; sizes (<em>mean absolute error</em>) grows only in
        step with the miss.
      </p>
      <p>
        <strong>Distance.</strong> Two points are Δx apart across and Δy apart up. Put a square on
        each of those sides; the two areas add up to the square on the straight line between the
        points (Pythagoras). The square root turns that area back into a length:
      </p>
      <Tex block>{String.raw`d = \sqrt{\Delta x^2 + \Delta y^2}`}</Tex>
      <p>
        An <em>embedding</em> is a list of numbers that stands for a word or an image. Similar
        things get embeddings that are close together, and this formula is how &ldquo;close&rdquo;
        is measured. In the code, <code>np.linalg.norm</code> is NumPy&rsquo;s built-in name for
        the same square root of summed squares.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real embeddings have hundreds of numbers, not two. You
        cannot draw that, but the formula is the same: square every difference, add them all,
        take the square root.
      </p>
    </Step>
  )
}

function ErrorDemo({
  lastTarget,
  setLastTarget,
}: {
  lastTarget: Vec2
  setLastTarget: (q: Vec2) => void
}) {
  const targets = [...ERROR_TARGETS, lastTarget[1]]
  const errors = errorsFor(targets)
  const squares = errors.map(square)
  const mae = meanAbsoluteError(errors)
  const mse = meanSquaredError(errors)
  const share = largestShare(squares)

  const code = [
    'import numpy as np',
    '',
    `errors = np.array([${errors.map((e) => fmt(e)).join(', ')}])   # true value - prediction`,
    'print(np.mean(np.abs(errors)))   # mean absolute error',
    'print(np.mean(errors ** 2))      # mean squared error',
  ].join('\n')

  return (
    <>
      <Plane label="Four true values, the model's line of predictions, and a square on each error">
        <Line.ThroughPoints
          point1={[0, ERROR_LINE.b]}
          point2={[1, ERROR_LINE.m + ERROR_LINE.b]}
          color={COLOR.ghost}
        />
        {ERROR_XS.map((x, k) => (
          <Polygon
            key={`sq${x}`}
            points={gapSquare(x, predictionAt(x), targets[k])}
            color={COLOR.v}
            fillOpacity={0.2}
            weight={1.5}
          />
        ))}
        {ERROR_XS.slice(0, -1).map((x, k) => (
          <CoordPoint key={`t${x}`} at={[x, targets[k]]} color={COLOR.i} />
        ))}
        <DraggablePoint value={lastTarget} onChange={setLastTarget} color={COLOR.i} snap={onLastColumn} />
      </Plane>
      <Readout>
        Errors: {errors.map((e) => fmt(e)).join(', ')}. Squared: {squares.map((s) => fmt(s)).join(', ')}.{' '}
        <strong>
          Mean absolute error {fmt(mae, 4)}, mean squared error {fmt(mse, 4)}.
        </strong>{' '}
        The biggest <Tag color={COLOR.v}>square</Tag> is {fmt(share * 100, 0)}% of the total.
      </Readout>
      <div className="mt-4">
        <NumpySnippet code={code} output={`${pyFloat(mae)}\n${pyFloat(mse)}`} />
      </div>
    </>
  )
}

function DistanceDemo({
  a,
  b,
  setA,
  setB,
}: {
  a: Vec2
  b: Vec2
  setA: (q: Vec2) => void
  setB: (q: Vec2) => void
}) {
  const legs = legSquares(b, a)
  const d = distance(a, b)
  const sum = square(legs.dx) + square(legs.dy)

  const code = [
    'import numpy as np',
    '',
    `a = np.array([${fmt(a[0])}, ${fmt(a[1])}])   # embedding of "cat"`,
    `b = np.array([${fmt(b[0])}, ${fmt(b[1])}])   # embedding of "dog"`,
    '',
    'print(np.sqrt(np.sum((a - b) ** 2)))',
    'print(np.linalg.norm(a - b))   # the same, built in',
  ].join('\n')

  return (
    <>
      <Plane label="Two draggable embeddings, the right triangle between them and squares on its legs">
        <Polygon points={legs.across} color={COLOR.i} fillOpacity={0.15} weight={1.5} />
        <Polygon points={legs.upDown} color={COLOR.j} fillOpacity={0.15} weight={1.5} />
        <Line.Segment point1={b} point2={legs.corner} color={COLOR.i} weight={3} />
        <Line.Segment point1={legs.corner} point2={a} color={COLOR.j} weight={3} />
        <Line.Segment point1={a} point2={b} color={COLOR.result} weight={3} />
        <DraggablePoint value={a} onChange={setA} color={COLOR.v} />
        <DraggablePoint value={b} onChange={setB} color={COLOR.v} />
        <Text x={a[0]} y={a[1]} attach="w" attachDistance={18} size={16} color={COLOR.v}>
          cat
        </Text>
        <Text x={b[0]} y={b[1]} attach="w" attachDistance={18} size={16} color={COLOR.v}>
          dog
        </Text>
      </Plane>
      <Readout>
        <Tag color={COLOR.i}>Across Δx = {fmt(legs.dx)}</Tag>, square {fmt(square(legs.dx))};{' '}
        <Tag color={COLOR.j}>up Δy = {fmt(legs.dy)}</Tag>, square {fmt(square(legs.dy))}. Together{' '}
        {fmt(sum)}, so the <Tag color={COLOR.result}>distance</Tag> is √{fmt(sum)} = {fmt(d, 3)}.
      </Readout>
      <div className="mt-4">
        <NumpySnippet code={code} output={`${pyFloat(d)}\n${pyFloat(d)}`} />
      </div>
    </>
  )
}
