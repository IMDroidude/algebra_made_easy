import { Line, Text } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { fitLine, predict } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'
import { TRAIN, X_NEW, regressionSnippet, tidy } from './data'
import { FitDrawing } from './FitDrawing'

/** The query input slides along the x-axis only, in half steps. */
const onXAxis = ([x]: Vec2): Vec2 => [Math.max(-5, Math.min(5, Math.round(x * 2) / 2)) + 0, 0]

export function ApplyStep() {
  const [points, setPoints] = useState<Vec2[]>(TRAIN)
  const [query, setQuery] = useState<Vec2>([X_NEW, 0])

  const fit = fitLine(points)
  const yHat = fit ? predict(fit, query[0]) : null
  const snippet = regressionSnippet(points, query[0])
  const move = (k: number) => (q: Vec2) => setPoints(points.map((p, i) => (i === k ? tidy(q) : p)))

  return (
    <Step
      n={5}
      kind="Apply"
      title="This is linear regression, the simplest trainable model"
      visual={
        <>
          <Plane label="Training points, the trained line, and a prediction for a new input">
            {fit && <FitDrawing points={points} line={fit} color={COLOR.result} />}
            {points.map((p, k) => (
              <DraggablePoint key={k} value={p} onChange={move(k)} color={COLOR.v} />
            ))}
            {yHat !== null && (
              <>
                <Line.Segment point1={query} point2={[query[0], yHat]} color={COLOR.i} style="dashed" />
                <CoordPoint at={[query[0], yHat]} color={COLOR.i} />
                <Text x={query[0]} y={yHat} attach="e" attachDistance={14} size={14} color={COLOR.i}>
                  ŷ
                </Text>
              </>
            )}
            <DraggablePoint value={query} onChange={setQuery} color={COLOR.i} snap={onXAxis} />
          </Plane>
          <Readout>
            {fit && yHat !== null ? (
              <>
                Trained on {points.length} <Tag color={COLOR.v}>examples</Tag>: weight w = {fmt(fit.slope)},
                bias b = {fmt(fit.intercept)}. For the new input x = {fmt(query[0])} the model predicts{' '}
                <Tag color={COLOR.i}>ŷ</Tag> = {fmt(yHat)}.
              </>
            ) : (
              'Every training example has the same x, so there is nothing to learn a slope from.'
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        What you have been doing has a name in machine learning: <strong>linear regression</strong>.
        The model is a single neuron with one input:
      </p>
      <Tex block>{String.raw`\hat{y} = w\,x + b`}</Tex>
      <p>
        The <Tag color={COLOR.v}>purple points</Tag> are training examples (an input x and the
        right answer y). <strong>Training</strong> means choosing the weight w and the bias b that
        make the predictions as close as possible to the answers, measured by the sum of squared
        errors. That is the least-squares line.
      </p>
      <p>
        Once trained, the model is used on inputs it has never seen. Drag the{' '}
        <Tag color={COLOR.i}>orange point</Tag> along the x-axis to choose a new input and read off
        the prediction <Tag color={COLOR.i}>ŷ</Tag>. Move the training points and the model
        retrains instantly.
      </p>
      <p>
        In NumPy, <code>np.linalg.lstsq(X, y)</code> does the training: it solves the least-squares
        problem directly, more robustly than forming XᵀX. It returns several things; the{' '}
        <code>(w, b), *_ =</code> line keeps the first (the weights) and ignores the rest.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real regression usually has many inputs (say, a house&rsquo;s
        size, age and location), so X has many columns and the line becomes a flat hyperplane you
        cannot draw. The normal equations are exactly the same. Big neural networks are trained by
        gradient descent instead of solving them directly, but they minimise the same kind of
        squared error, one small step at a time.
      </p>
    </Step>
  )
}
