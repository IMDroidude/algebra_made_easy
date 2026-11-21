import { Circle, Line, Plot } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { MatrixInput } from '../../components/MatrixInput'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { apply2, approxEqualVec, scale } from '../../linalg'
import { characteristic2, eigen2, eigenPairs, lineTest, unitAt } from '../../linalg/eigen'
import type { Mat2, Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import { PracticeStep } from './PracticeStep'
import { PRESETS, ROTATION_90 } from './presets'
import { eigenCode, eigenOutput } from './snippets'
import { extentFor } from './describe'
import { SweepPlane } from './SweepPlane'

const SEE: Mat2 = [
  [2, 1],
  [1, 2],
]
const SEE_V: Vec2 = [1, 0]
const SEE_U: Vec2 = unitAt(45)

/** "− 4λ" / "+ 3": a signed term for a polynomial, or nothing when it is zero. */
function term(k: number, symbol: string): string {
  if (Math.abs(k) < 1e-9) return ''
  const sign = k < 0 ? '-' : '+'
  const size = Math.abs(k)
  const coeff = symbol && Math.abs(size - 1) < 1e-9 ? '' : fmt(size)
  return ` ${sign} ${coeff}${symbol}`
}

/** Wraps negative numbers in brackets: (−1). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

export function Lesson() {
  const [m, setM] = useState<Mat2>(SEE)
  const [angle, setAngle] = useState(0)
  const [showEigen, setShowEigen] = useState(false)
  const [showTrace, setShowTrace] = useState(false)
  const reveal = useTween(4000)

  const e = eigen2(m)
  const { trace, det, disc } = characteristic2(m)
  const [[a, b], [c, d]] = m
  const presetId = PRESETS.find((q) => approxEqualVec(q.m.flat(), m.flat()))?.id

  // Predict: v sweeps once round under a quarter-turn rotation.
  const predictAngle = reveal.t * 360
  const pv = unitAt(predictAngle)
  const pAv = apply2(ROTATION_90, pv)

  const seeAv = apply2(SEE, SEE_V)
  const seeAu = apply2(SEE, SEE_U)

  const understandExtent = extentFor(m)

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="eigenvectors">
        Most vectors get knocked off their line by a matrix. A few special directions do not: the
        matrix only stretches, shrinks or flips them. By the end of this lesson you will be able
        to find those directions, read off how much they stretch, and see why PCA is built on
        them.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="Two vectors, one matrix"
        visual={
          <>
            <Plane label="Two vectors and where the matrix sends them" extent={2.6}>
              <Line.ThroughPoints point1={[0, 0]} point2={SEE_V} color={COLOR.ghost} opacity={0.5} />
              <Line.ThroughPoints point1={[0, 0]} point2={SEE_U} color={COLOR.ghost} opacity={0.5} />
              <Arrow tip={SEE_V} color={COLOR.v} label="v" />
              <Arrow tip={seeAv} color={COLOR.v} label="Av" dashed showCoords />
              <Arrow tip={SEE_U} color={COLOR.result} label="u" labelDistance={10} />
              <Arrow tip={seeAu} color={COLOR.result} label="Au" dashed showCoords />
            </Plane>
            <Readout>
              <span className="block">
                <Tag color={COLOR.v}>v</Tag> = {fmtVec(SEE_V)} goes to{' '}
                <Tag color={COLOR.v}>Av</Tag> = {fmtVec(seeAv)}: knocked{' '}
                {fmt(lineTest(SEE, SEE_V).offLineDeg, 0)}° off the grey line through v.
              </span>
              <span className="block">
                <Tag color={COLOR.result}>u</Tag> = {fmtVec(SEE_U)} goes to{' '}
                <Tag color={COLOR.result}>Au</Tag> = {fmtVec(seeAu)} = 3 × u: still on its own
                line, just three times longer.
              </span>
            </Readout>
          </>
        }
      >
        <p>
          The matrix here is <Tex>{String.raw`A = \begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}`}</Tex>.
          You saw in the matrices lesson that A moves every point of the plane. Look at what it does
          to two particular arrows.
        </p>
        <p>
          <Tag color={COLOR.v}>v</Tag> points right. After A, it points somewhere else: the arrow{' '}
          <Tag color={COLOR.v}>Av</Tag> has left the grey line that v sat on.
        </p>
        <p>
          <Tag color={COLOR.result}>u</Tag> points along the diagonal. After A it is still on the
          same diagonal line, just three times longer. A did not turn it at all.
        </p>
        <p>
          A direction that a matrix does not turn is called an <strong>eigenvector</strong> of that
          matrix (German <em>eigen</em>: &ldquo;own&rdquo;, the matrix&rsquo;s own directions). The
          number it gets multiplied by, here 3, is its <strong>eigenvalue</strong>. In symbols:
        </p>
        <Tex block>{String.raw`A\mathbf{u} = \lambda\,\mathbf{u}`}</Tex>
        <p>
          The Greek letter λ (lambda) is the usual name for an eigenvalue. Hover over an arrow tip
          to see its coordinates.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Sweep a vector round and hunt for directions that stay put"
        visual={
          <>
            <SweepPlane
              matrix={m}
              angle={angle}
              onAngle={setAngle}
              label="A unit vector v that can be swept round the circle, and Av"
              showEigen={showEigen}
              onShowEigen={setShowEigen}
              showTrace={showTrace}
              onShowTrace={setShowTrace}
            />
            <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
              <MatrixInput value={m} onChange={setM} />
              <div className="flex flex-wrap gap-2" role="group" aria-label="Example matrices">
                {PRESETS.map((q) => (
                  <Button
                    key={q.id}
                    variant={presetId === q.id ? 'primary' : 'secondary'}
                    aria-pressed={presetId === q.id}
                    onClick={() => setM(q.m)}
                  >
                    {q.label}
                  </Button>
                ))}
              </div>
            </div>
          </>
        }
      >
        <p>
          <Tag color={COLOR.v}>v</Tag> is now a unit arrow (length 1) that you can turn all the
          way round the dashed circle: drag its tip, use the angle slider, or press{' '}
          <em>Sweep v around</em>. <Tag color={COLOR.result}>Av</Tag> follows. The grey line is
          v&rsquo;s own line, and it turns green whenever Av lands on it.
        </p>
        <p>
          You only need to check half the circle: if v is an eigenvector, so is −v, and so is any
          other multiple of v. An eigenvector is really a whole <em>line</em> of vectors.
        </p>
        <p>Try the example matrices and look for:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            <strong>Stretch and flip</strong>: one direction where Av points the opposite way
            from v. Its eigenvalue is negative: v is flipped, but still on its line.
          </li>
          <li>
            <strong>Lopsided</strong>: two eigen lines that are not at right angles.
          </li>
          <li>
            <strong>Shear</strong>: only one eigen line. Every other v gets pushed sideways.
          </li>
          <li>
            <strong>Scale</strong>: every direction stays put. The eigenvalue 2 is repeated, and
            every vector is an eigenvector.
          </li>
        </ul>
        <p>
          When you have found them, switch on <em>Show eigen directions</em> to check. The trace
          shows something else worth noticing: the circle becomes an ellipse, a hint of the next
          lesson.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you sweep: does a rotation keep any direction?"
        visual={
          <>
            <Plane label="A vector swept once round under a quarter-turn rotation" extent={1.7}>
              <Circle center={[0, 0]} radius={1} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
              <Line.ThroughPoints point1={[0, 0]} point2={pv} color={COLOR.ghost} opacity={0.5} />
              {reveal.t > 0 && <Arrow tip={pAv} color={COLOR.result} label="Av" />}
              <Arrow tip={pv} color={COLOR.v} label="v" />
            </Plane>
            <Readout>
              {reveal.t === 0
                ? 'Showing v only. Lock in a prediction to sweep v once round under this matrix.'
                : `v at ${fmt(predictAngle, 0)}°, Av at ${fmt((predictAngle + 90) % 360, 0)}°: ${fmt(lineTest(ROTATION_90, pv).offLineDeg, 0)}° off v's line.${reveal.t === 1 ? ' All the way round, no direction stayed on its line.' : ''}`}
            </Readout>
          </>
        }
      >
        <p>This matrix turns the plane a quarter turn (90°) counter-clockwise:</p>
        <Tex block>{String.raw`R = \begin{bmatrix} 0 & -1 \\ 1 & 0 \end{bmatrix}`}</Tex>
        <Predict
          question="As v sweeps once round the circle, how many directions stay on their own line?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'axes',
              label: 'Two: the x-axis and the y-axis.',
              correct: false,
              explain: (
                <p className="m-0">
                  The axes are where the basis arrows start, not where they stay. The first column
                  says î lands at (0, 1): it leaves the x-axis completely. Axes are special for
                  reading a matrix, not for its eigenvectors.
                </p>
              ),
            },
            {
              id: 'none',
              label: 'None. Every vector is turned off its line.',
              correct: true,
              explain: (
                <p className="m-0">
                  A rotation turns <em>every</em> arrow by the same 90°, so no arrow can land back
                  on its own line. This matrix has no real eigenvectors. The algebra still gives an
                  answer, but it is a pair of complex numbers, which is its way of saying
                  &ldquo;this matrix turns everything&rdquo;.
                </p>
              ),
            },
            {
              id: 'all',
              label: 'Every direction, because a rotation does not change lengths.',
              correct: false,
              explain: (
                <p className="m-0">
                  Keeping lengths is not keeping direction. An eigenvector needs Av to lie on v&rsquo;s
                  line; its length may change freely. A rotation does the opposite: lengths stay,
                  directions all turn.
                </p>
              ),
            },
            {
              id: 'diag',
              label: 'One: the diagonal.',
              correct: false,
              explain: (
                <p className="m-0">
                  The diagonal (1, 1) lands at (−1, 1), a right angle away. The diagonal was an
                  eigenvector of the matrix in step 1, where both rows add up to the same number.
                  Eigenvectors belong to one particular matrix, and this one has none.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="Where eigenvalues come from"
        visual={
          <>
            <Plane label="The eigenvectors of your matrix and what the matrix does to them" extent={understandExtent}>
              <Circle center={[0, 0]} radius={1} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
              {(e.kind === 'complex' || e.kind === 'scalar') && (
                <Plot.Parametric
                  xy={(s) => apply2(m, [Math.cos(s), Math.sin(s)])}
                  domain={[0, 2 * Math.PI]}
                  color={COLOR.result}
                  opacity={0.6}
                />
              )}
              {eigenPairs(e).map((q, k) => {
                const sub = k === 0 ? '₁' : '₂'
                // When λ is near 1 the two arrows overlap: label them once.
                const overlap = Math.abs(q.value - 1) < 0.35
                return (
                  <g key={k}>
                    <Line.ThroughPoints point1={[0, 0]} point2={q.vector} color={COLOR.grid} opacity={0.6} style="dashed" />
                    <Arrow tip={q.vector} color={COLOR.v} label={overlap ? undefined : `v${sub}`} labelDistance={8} weight={2} />
                    {Math.abs(q.value) > 1e-9 && (
                      <Arrow
                        tip={scale(q.vector, q.value)}
                        color={COLOR.result}
                        label={overlap ? `Av${sub} = ${fmt(q.value)}v${sub}` : `${fmt(q.value)}v${sub}`}
                      />
                    )}
                  </g>
                )
              })}
            </Plane>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Load an example matrix">
              <span className="self-center text-sm text-muted">Load:</span>
              {[...PRESETS, { id: 'rot', label: 'Rotation', m: ROTATION_90 }].map((q) => (
                <Button key={q.id} variant="secondary" onClick={() => setM(q.m)}>
                  {q.label}
                </Button>
              ))}
            </div>
            <Readout>{understandReadout(m)}</Readout>
            <div className="mt-4">
              <NumpySnippet code={eigenCode(m)} output={eigenOutput(m)} />
            </div>
          </>
        }
      >
        <p>
          This is your matrix from step 2,{' '}
          <Tex>{String.raw`A = \begin{bmatrix} ${fmt(a)} & ${fmt(b)} \\ ${fmt(c)} & ${fmt(d)} \end{bmatrix}`}</Tex>
          . We want every λ with a non-zero v such that <Tex>{String.raw`A\mathbf{v} = \lambda\mathbf{v}`}</Tex>.
          Move everything to one side (I is the identity matrix, so λI just multiplies by λ):
        </p>
        <Tex block>{String.raw`(A - \lambda I)\,\mathbf{v} = \mathbf{0}`}</Tex>
        <p>
          The matrix <Tex>{String.raw`A - \lambda I`}</Tex> sends a non-zero v to zero, so it must
          squash the plane flat. From the determinant lesson, that happens exactly when its
          determinant is 0:
        </p>
        <Tex block>
          {String.raw`\det(A - \lambda I) = (${fmt(a)} - \lambda)(${fmt(d)} - \lambda) - ${p(b)}\cdot${p(c)} = \lambda^2${term(-trace, '\\lambda')}${term(det, '')} = 0`}
        </Tex>
        <p>
          For any 2×2 matrix this is λ² − (trace)λ + (determinant) = 0, where the trace is the
          sum of the diagonal, here {fmt(trace)}, and the determinant is {fmt(det)}. The
          quadratic formula solves it. Everything hangs on the number under the square root,{' '}
          <Tex>{String.raw`\text{trace}^2 - 4\det = ${fmt(disc)}`}</Tex>:
        </p>
        {understandCase(m)}
        <p>
          The NumPy code does the same sum. In real work you call <code>np.linalg.eig(A)</code>,
          which returns the eigenvalues and unit eigenvectors (as columns) for matrices of any size.
          The signs of its eigenvectors may differ from the picture: v and −v are the same line.
        </p>
        <p className="text-sm text-muted">
          Beyond 2D: an n×n matrix has at most n eigen lines, and the formula becomes a polynomial
          of degree n. Nobody solves that by hand; libraries use iterative methods. The idea, a
          direction the matrix only stretches, stays the same.
        </p>
      </Step>

      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Next</h2>
        <p className="mt-2 max-w-[62ch]">
          Eigenvectors only exist for square matrices, and rotations have none. The next lesson,
          singular value decomposition, works for every matrix: it finds the directions a matrix
          stretches most, even when it also turns them. The{' '}
          <Link to="/playground">playground</Link> has the same plane for free experiments.
        </p>
      </footer>
    </article>
  )
}

function understandCase(m: Mat2) {
  const e = eigen2(m)
  const { trace, disc } = characteristic2(m)
  switch (e.kind) {
    case 'distinct': {
      const [p1, p2] = e.pairs
      return (
        <>
          <p>It is positive, so there are two different real eigenvalues:</p>
          <Tex block>
            {String.raw`\lambda = \frac{${fmt(trace)} \pm \sqrt{${fmt(disc)}}}{2} \quad\Rightarrow\quad \lambda_1 = ${fmt(p1.value)},\;\; \lambda_2 = ${fmt(p2.value)}`}
          </Tex>
          <p>
            For each λ, solving <Tex>{String.raw`(A - \lambda I)\mathbf{v} = \mathbf{0}`}</Tex>{' '}
            gives its line. As unit vectors: <Tex>{String.raw`\mathbf{v}_1 \approx ${vecTex(p1.vector)}`}</Tex>{' '}
            and <Tex>{String.raw`\mathbf{v}_2 \approx ${vecTex(p2.vector)}`}</Tex>.
            {(p1.value < 0 || p2.value < 0) &&
              ' A negative eigenvalue means that line is flipped end to end, then stretched.'}
            {(Math.abs(p1.value) < 1e-9 || Math.abs(p2.value) < 1e-9) &&
              ' An eigenvalue of 0 means that whole line is squashed onto the origin: the matrix is singular.'}
          </p>
        </>
      )
    }
    case 'scalar':
      return (
        <p>
          It is 0, so the two roots meet: λ = {fmt(e.value)}, twice. And since this matrix is just{' '}
          {fmt(e.value)} times the identity, <Tex>{String.raw`A - \lambda I`}</Tex> is the zero
          matrix: every vector is an eigenvector.
        </p>
      )
    case 'defective':
      return (
        <p>
          It is 0, so the two roots meet: λ = {fmt(e.value)}, twice. This time{' '}
          <Tex>{String.raw`A - \lambda I`}</Tex> squashes the plane onto a line but not to a point,
          so only one line of eigenvectors exists, along{' '}
          <Tex>{vecTex(e.vector)}</Tex>. A repeated eigenvalue does not promise two eigen lines.
        </p>
      )
    case 'complex':
      return (
        <>
          <p>
            It is negative. No real number squares to a negative, so there is{' '}
            <strong>no real eigenvalue and no real eigenvector</strong>. The formula still runs if
            you allow complex numbers (i is √−1):
          </p>
          <Tex block>
            {String.raw`\lambda = \frac{${fmt(trace)} \pm \sqrt{${fmt(disc)}}}{2} = ${fmt(e.re)} \pm ${fmt(e.im)}\,i`}
          </Tex>
          <p>
            A complex eigenvalue has no direction you could draw on this plane. Its message is
            that the matrix turns every vector, as the rotation in step 3 did.
          </p>
        </>
      )
  }
}

function vecTex(v: Vec2): string {
  return String.raw`\begin{bmatrix} ${fmt(v[0])} \\ ${fmt(v[1])} \end{bmatrix}`
}

function understandReadout(m: Mat2) {
  const e = eigen2(m)
  if (e.kind === 'complex') {
    return `No real eigenvectors: every arrow is turned. The green curve is where the dashed unit circle goes. Eigenvalues ${fmt(e.re)} ± ${fmt(e.im)}i.`
  }
  if (e.kind === 'scalar') {
    return `Every direction is an eigenvector with eigenvalue ${fmt(e.value)}: the unit circle (dashed) becomes a circle of radius ${fmt(Math.abs(e.value))}.`
  }
  return eigenPairs(e)
    .map((q, k) => {
      const Av = apply2(m, q.vector)
      return `v${k + 1} = ${fmtVec(q.vector)} goes to Av${k + 1} = ${fmtVec(Av)} = ${fmt(q.value)} × v${k + 1}.`
    })
    .join(' ')
}
