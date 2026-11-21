import { Line, Text } from 'mafs'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { Arrow, CoordPoint, Plane, TransformedGrid } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { IDENTITY2, apply2, columns2, inverse2, lerp2 } from '../../linalg'
import { nullSpace2, thereAndBack2 } from '../../linalg/systems'
import { ApplyStep } from './ApplyStep'
import { PREDICT_A, PREDICT_POINTS, SEE_A } from './data'
import { FShape } from './FShape'
import { PracticeStep } from './PracticeStep'
import { SqueezeStep } from './SqueezeStep'
import { SystemsStep } from './SystemsStep'
import { texMat2 } from './text'

function SeeStep() {
  const tween = useTween(3600)
  const phase = 2 * tween.t
  const shown = thereAndBack2(SEE_A, phase) ?? SEE_A
  const inv = inverse2(SEE_A)!
  const [iHat, jHat] = columns2(shown)

  const status =
    tween.t === 0
      ? 'The F at its starting position. Press play to apply A and then undo it.'
      : tween.t === 1
        ? 'Back exactly where it started: A⁻¹ undid A.'
        : phase < 1
          ? 'Applying A: the plane is stretched and tilted.'
          : 'Applying A⁻¹: every point is carried back.'

  return (
    <Step
      n={1}
      kind="See"
      title="Every reversible transformation has an undo"
      visual={
        <>
          <Plane extent={4} label="An F shape transformed by a matrix A and then by its inverse">
            <FShape matrix={shown} />
            <Arrow tip={iHat} color={COLOR.i} label="î" />
            <Arrow tip={jHat} color={COLOR.j} label="ĵ" />
          </Plane>
          <div className="mt-3">
            <Button onClick={tween.play}>{tween.t === 0 ? 'Play: apply A, then A⁻¹' : 'Play again'}</Button>
          </div>
          <Readout>
            {status} <Tag color={COLOR.i}>î</Tag> is at {fmtVec(iHat)}, <Tag color={COLOR.j}>ĵ</Tag> is at{' '}
            {fmtVec(jHat)}.
          </Readout>
        </>
      }
    >
      <p>
        In the last lessons a matrix moved the whole plane. A natural question for a programmer:
        is there an undo button?
      </p>
      <p>
        Often there is. This matrix stretches and tilts the <Tag color={COLOR.v}>F</Tag>, and a
        second matrix, called its <strong>inverse</strong> and written A⁻¹, puts every point back
        exactly where it was:
      </p>
      <Tex block>
        {String.raw`A = ${texMat2(SEE_A)} \qquad A^{-1} = ${texMat2(inv)}`}
      </Tex>
      <p>
        Press play and watch the <Tag color={COLOR.v}>F</Tag> leave its dashed outline and come
        back. Doing A and then A⁻¹ is the same as doing nothing: A⁻¹A = I, the identity.
      </p>
      <p>
        This lesson is about when the undo exists, what goes wrong when it does not, and what that
        tells you about solving equations and about the shape of a matrix&rsquo;s output.
      </p>
    </Step>
  )
}

function PredictStep() {
  const reveal = useTween(1600)
  const m = lerp2(IDENTITY2, PREDICT_A, reveal.t)
  const images = PREDICT_POINTS.map((q) => apply2(m, q))
  const revealed = reveal.t > 0
  const ns = nullSpace2(PREDICT_A)
  const dir = ns.dim === 1 ? ns.direction : ([1, 0] as const)
  const attach = ['e', 'n', 'w'] as const

  return (
    <Step
      n={3}
      kind="Predict"
      title="Before you look: can this one be undone?"
      visual={
        <>
          <Plane extent={4} label="Three points p1, p2, p3 moved by a matrix whose columns lie on one line">
            <TransformedGrid matrix={m} color={COLOR.grid} />
            {revealed && (
              <>
                <Line.ThroughPoints point1={[0, 0]} point2={[dir[0], dir[1]]} color={COLOR.result} style="dashed" />
                <Text x={-3} y={1.5} attach="n" attachDistance={10} size={14} color={COLOR.result}>
                  null space
                </Text>
                <Line.ThroughPoints
                  point1={PREDICT_POINTS[0]}
                  point2={PREDICT_POINTS[2]}
                  color={COLOR.ghost}
                  style="dashed"
                />
                {PREDICT_POINTS.map((q, k) => (
                  <CoordPoint key={`g${k}`} at={q} color={COLOR.ghost} opacity={0.6} />
                ))}
              </>
            )}
            {images.map((q, k) => (
              <g key={k}>
                <CoordPoint at={q} color={COLOR.v} />
                <Text x={q[0]} y={q[1]} attach={attach[k]} attachDistance={14} size={14} color={COLOR.v}>
                  {`p${k + 1}`}
                </Text>
              </g>
            ))}
          </Plane>
          <Readout>
            {reveal.t === 0
              ? `Showing the points before the matrix: p1 = ${fmtVec(PREDICT_POINTS[0])}, p2 = ${fmtVec(PREDICT_POINTS[1])}, p3 = ${fmtVec(PREDICT_POINTS[2])}. Lock in a prediction to apply A.`
              : `p1 is at ${fmtVec(images[0])}, p2 at ${fmtVec(images[1])}, p3 at ${fmtVec(images[2])}.`}
            {reveal.t === 1 &&
              ' All three landed on the same spot. The dashed green line through the origin is the null space: every point on it lands on (0, 0).'}
          </Readout>
        </>
      }
    >
      <p>
        Here both columns of the matrix point along the same line: ĵ lands at (2, 1), exactly twice
        where î lands.
      </p>
      <Tex block>{String.raw`A = ${texMat2(PREDICT_A)}`}</Tex>
      <p>
        Three different points go in: <Tag color={COLOR.v}>p1</Tag> = (2, 0),{' '}
        <Tag color={COLOR.v}>p2</Tag> = (0, 1) and <Tag color={COLOR.v}>p3</Tag> = (−2, 2).
      </p>
      <Predict
        question="What happens to them, and can a second matrix undo it?"
        onReveal={reveal.play}
        onRetry={() => reveal.reset(0)}
        options={[
          {
            id: 'undo',
            label: 'They land on three different points, and A⁻¹ brings them back.',
            correct: false,
            explain: (
              <p className="m-0">
                That is true for most matrices, but not this one. Its columns lie on one line, so
                every output lies on that line too, and here all three points land on the same
                spot, (2, 1). Not every matrix has an undo.
              </p>
            ),
          },
          {
            id: 'line',
            label: 'They land on three different points along one line, and can still be told apart.',
            correct: false,
            explain: (
              <p className="m-0">
                Right that the outputs lie on one line, but these particular inputs collide. p2 − p1
                = (−2, 1), and A sends (−2, 1) to (−2 + 2, −1 + 1) = (0, 0). Points that differ by
                such a crushed direction always land in the same place.
              </p>
            ),
          },
          {
            id: 'same',
            label: 'All three land on the same point, so no matrix can undo it.',
            correct: true,
            explain: (
              <p className="m-0">
                All three land on (2, 1). An undo would have to send (2, 1) back to p1, p2 and p3
                at once, which no function can do. The direction (−2, 1) that separates them is
                crushed to zero: it is the matrix&rsquo;s <strong>null space</strong>.
              </p>
            ),
          },
          {
            id: 'origin',
            label: 'All three are crushed to the origin.',
            correct: false,
            explain: (
              <p className="m-0">
                Only the inputs on one particular line, the null space, go to the origin. p1 =
                (2, 0) is not on it: A sends it to 2 × (1, 0.5) = (2, 1). The whole plane is
                flattened onto a line, not onto a point.
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
      <LessonHeader slug="inverse-rank-null-space">
        Some transformations can be undone and some cannot. By the end of this lesson you will be
        able to tell which, say what shape a matrix&rsquo;s output has (its rank), find the inputs it
        crushes to zero (its null space), and predict whether a system of equations has one
        solution, none, or infinitely many.
      </LessonHeader>

      <SeeStep />
      <SqueezeStep />
      <PredictStep />
      <SystemsStep />
      <ApplyStep />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/playground">playground</Link> has a &ldquo;Singular&rdquo; preset: start
          there, drag one basis vector off the line and watch the plane open up again.
        </p>
      </footer>
    </article>
  )
}
