import { Circle, Polygon } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { MatrixInput } from '../../components/MatrixInput'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { IDENTITY2, apply2, det2, lerp2, scale } from '../../linalg'
import { svd2 } from '../../linalg/svd'
import type { Mat2, Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import { columnsOf, describeStage, extentFor, factorsTex, stepSentences } from './describe'
import { PracticeStep } from './PracticeStep'
import { ELLIPSE, SIGMA1, SIGMA2 } from './colors'
import { svd2Code, svd2Output } from './snippets'
import { StagePlane } from './StagePlane'
import { useStage } from './useStage'

const START: Mat2 = [
  [2, 1],
  [0, 1],
]
const SHEAR: Mat2 = [
  [1, 1],
  [0, 1],
]

const CIRCLE: Vec2[] = Array.from({ length: 96 }, (_, k) => {
  const t = (2 * Math.PI * k) / 96
  return [Math.cos(t), Math.sin(t)]
})

const STEP_NAMES = ['Vᵀ: rotate', 'Σ: stretch', 'U: rotate']

export function Lesson() {
  const [m, setM] = useState<Mat2>(START)
  const [showGrid, setShowGrid] = useState(false)
  const st = useStage(0)
  const reveal = useTween(1600)

  const s = svd2(m)
  const extent = extentFor(s)
  const sentences = stepSentences(s)
  const current = Math.min(2, Math.floor(st.stage + 1e-6))

  const see = svd2(START)
  const [seeU1, seeU2] = columnsOf(see.U)
  const [seeV1, seeV2] = columnsOf(see.V)

  const shear = svd2(SHEAR)
  const predictM = lerp2(IDENTITY2, SHEAR, reveal.t)
  const [shearU1, shearU2] = columnsOf(shear.U)

  const [v1, v2] = columnsOf(s.V)
  const [u1, u2] = columnsOf(s.U)

  const changeMatrix = (next: Mat2) => {
    setM(next)
    st.set(3)
  }

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="svd">
        Every matrix, whatever it looks like, does the same three things in a row: turn, stretch
        along the axes, turn again. By the end of this lesson you will be able to see those three
        steps in any 2×2 matrix, read its singular values off a picture, and use them to compress
        an image.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="Every matrix turns a circle into an ellipse"
        visual={
          <>
            <StagePlane svd={see} stage={3} extent={3} label="The unit circle after the matrix: an ellipse with two marked semi-axes" />
            <Readout>
              The dashed unit circle becomes the blue ellipse. Its longest radius,{' '}
              <Tag color={SIGMA1}>σ₁u₁</Tag> = {fmtVec(scale(seeU1, see.sigma[0]))}, has length{' '}
              {fmt(see.sigma[0])}; its shortest, <Tag color={SIGMA2}>σ₂u₂</Tag> ={' '}
              {fmtVec(scale(seeU2, see.sigma[1]))}, has length {fmt(see.sigma[1])}. They are at right
              angles.
            </Readout>
          </>
        }
      >
        <p>
          Take the matrix <Tex>{String.raw`A = \begin{bmatrix} 2 & 1 \\ 0 & 1 \end{bmatrix}`}</Tex>{' '}
          and apply it to every point of the unit circle (the dashed circle of radius 1). The
          result is an ellipse.
        </p>
        <p>
          This is true for every 2×2 matrix: a circle always goes to an ellipse (which may be a
          circle again, or flattened all the way to a line segment). An ellipse has a longest
          radius and a shortest one, at right angles to each other. Their lengths are the
          matrix&rsquo;s <strong>singular values</strong>, written σ₁ (sigma one, the larger) and
          σ₂. Here σ₁ = {fmt(see.sigma[0])} and σ₂ = {fmt(see.sigma[1])}.
        </p>
        <p>
          The two arrows on the ellipse came from two arrows on the circle, v₁ ={' '}
          {fmtVec(seeV1)} and v₂ = {fmtVec(seeV2)}, also at right angles. Those are the directions
          the matrix stretches most and least. Hover over an arrow tip for its coordinates.
        </p>
        <p>
          Unlike eigenvectors, these arrows <em>do</em> turn: v₁ does not land on its own line.
          Singular values are about how much a matrix stretches, whichever way it points the
          result.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Play a matrix as three steps: rotate, stretch, rotate"
        visual={
          <>
            <StagePlane
              svd={s}
              stage={st.stage}
              extent={extent}
              showGrid={showGrid}
              label="The unit circle carried through the three steps of the SVD"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button onClick={() => st.animate(0, 3)} disabled={st.running}>
                Play all three steps
              </Button>
              <Button
                variant="secondary"
                disabled={st.running || st.stage >= 3 - 1e-6}
                onClick={() => st.animate(st.stage, Math.min(3, Math.floor(st.stage + 1e-6) + 1))}
              >
                Next step
              </Button>
              <Button variant="secondary" onClick={() => st.set(0)}>
                Back to the circle
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <label className="flex items-center gap-2 text-sm">
                Progress
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.05}
                  value={st.stage}
                  onChange={(ev) => st.set(Number(ev.target.value))}
                  aria-valuetext={`${fmt(st.stage, 2)} of 3 steps`}
                  className="w-40"
                />
              </label>
              <Toggle checked={showGrid} onChange={setShowGrid}>
                Show the grid moving too
              </Toggle>
            </div>
            <ol className="mt-3 grid list-none gap-1 p-0 text-sm" aria-label="The three steps">
              {sentences.map((text, k) => (
                <li
                  key={k}
                  className={`rounded-lg border px-3 py-1.5 ${k === current && st.stage > 0 ? 'border-accent bg-surface font-medium' : 'border-line'}`}
                >
                  <strong>{k + 1}. {STEP_NAMES[k]}.</strong> {text}
                </li>
              ))}
            </ol>
            <Readout>{describeStage(s, st.stage)}</Readout>
            <div className="mt-4">
              <MatrixInput value={m} onChange={changeMatrix} />
            </div>
          </>
        }
      >
        <p>
          The <strong>singular value decomposition</strong> (SVD) says every matrix A can be
          written as three simpler ones multiplied together:
        </p>
        <Tex block>{String.raw`A = U\,\Sigma\,V^{\mathsf T}`}</Tex>
        <p>
          Read it right to left, the order they act on a vector (as in <em>y = Ax</em>, the
          matrix nearest the vector goes first):
        </p>
        <ol className="mt-0 mb-4 list-decimal pl-6">
          <li>
            <strong>Vᵀ</strong> (V transposed) rotates the plane so that v₁ and v₂ line up with
            the axes.
          </li>
          <li>
            <strong>Σ</strong> (capital sigma) stretches along the axes: x by σ₁, y by σ₂. It is a
            diagonal matrix, the simplest kind there is.
          </li>
          <li>
            <strong>U</strong> rotates the result into its final position.
          </li>
        </ol>
        <p>
          Press <em>Play all three steps</em>, or step through with <em>Next step</em>. Then change
          the matrix and play it again. Try a matrix with a negative determinant, such as
          [[0, 1], [1, 0]]: one of the rotations then has to include a mirror flip (this picture
          always puts the flip in U).
        </p>
        <p>
          Whatever you type, the middle step is a pure stretch along the axes. All the
          &ldquo;mixing&rdquo; a matrix does is rotation, before and after.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: what does a shear do to the circle?"
        visual={
          <>
            <Plane label="The unit circle before and after a shear" extent={2}>
              <Circle center={[0, 0]} radius={1} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
              <Polygon points={CIRCLE.map((q) => apply2(predictM, q))} color={ELLIPSE} fillOpacity={0.12} weight={2} />
              {reveal.t === 1 && (
                <>
                  <Arrow tip={scale(shearU2, shear.sigma[1])} color={SIGMA2} label="σ₂u₂" />
                  <Arrow tip={scale(shearU1, shear.sigma[0])} color={SIGMA1} label="σ₁u₁" />
                </>
              )}
            </Plane>
            <Readout>
              {reveal.t === 0
                ? 'Showing the unit circle before the matrix. Lock in a prediction to apply it.'
                : reveal.t < 1
                  ? 'Applying the shear…'
                  : `An ellipse with semi-axes ${fmt(shear.sigma[0])} and ${fmt(shear.sigma[1])}, tilted ${fmt(shear.thetaU, 1)}° from the x-axis. Both eigenvalues are 1, yet the shape stretches.`}
            </Readout>
          </>
        }
      >
        <p>
          A shear slides the top of the plane sideways. Its eigenvalues are both 1 (you met it in
          the eigenvectors lesson):
        </p>
        <Tex block>{String.raw`S = \begin{bmatrix} 1 & 1 \\ 0 & 1 \end{bmatrix}`}</Tex>
        <Predict
          question="What happens to the unit circle?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'circle',
              label: 'It stays a circle of radius 1, because both eigenvalues are 1.',
              correct: false,
              explain: (
                <p className="m-0">
                  Eigenvalues only describe the directions a matrix does not turn; for a shear that
                  is only the x-axis. The other directions are pushed sideways and stretched.
                  How much a matrix stretches is told by its singular values, which here are not
                  1.
                </p>
              ),
            },
            {
              id: 'ellipse',
              label: 'It becomes a tilted ellipse, longer than 1 one way and shorter than 1 the other.',
              correct: true,
              explain: (
                <p className="m-0">
                  σ₁ ≈ {fmt(shear.sigma[0])} and σ₂ ≈ {fmt(shear.sigma[1])} (the golden ratio and
                  its inverse). Their product is 1, which is the determinant: the area is
                  unchanged, but the circle is squeezed into an ellipse.
                </p>
              ),
            },
            {
              id: 'line',
              label: 'It collapses onto a line.',
              correct: false,
              explain: (
                <p className="m-0">
                  That only happens when a singular value is 0, which means the determinant is 0.
                  This shear has determinant 1 · 1 − 1 · 0 = 1, so nothing is flattened.
                </p>
              ),
            },
            {
              id: 'bigger',
              label: 'It becomes a bigger circle.',
              correct: false,
              explain: (
                <p className="m-0">
                  A circle stays a circle only when the matrix stretches every direction equally
                  (σ₁ = σ₂), like a rotation or a uniform scale. A shear treats directions
                  differently, and its determinant is 1, so the area cannot grow either.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="The three matrices, with numbers"
        visual={
          <>
            <Plane label="The unit circle, the right singular vectors, and where A sends them" extent={extent}>
              <Circle center={[0, 0]} radius={1} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
              <Polygon points={CIRCLE.map((q) => apply2(m, q))} color={ELLIPSE} fillOpacity={0.12} weight={2} />
              {/* v labels sit mid-arrow so they never collide with the Av labels at the tips. */}
              <Arrow tip={v1} color={SIGMA1} label="v₁" labelAt="middle" dashed showCoords />
              <Arrow tip={v2} color={SIGMA2} label="v₂" labelAt="middle" dashed showCoords />
              {s.sigma[1] > 1e-9 && <Arrow tip={scale(u2, s.sigma[1])} color={SIGMA2} label="Av₂" />}
              {s.sigma[0] > 1e-9 && <Arrow tip={scale(u1, s.sigma[0])} color={SIGMA1} label="Av₁" />}
            </Plane>
            <Readout>
              A sends <Tag color={SIGMA1}>v₁</Tag> = {fmtVec(v1)} to {fmtVec(scale(u1, s.sigma[0]))}{' '}
              (length σ₁ = {fmt(s.sigma[0])}) and <Tag color={SIGMA2}>v₂</Tag> = {fmtVec(v2)} to{' '}
              {fmtVec(scale(u2, s.sigma[1]))} (length σ₂ = {fmt(s.sigma[1])}). σ₁ × σ₂ ={' '}
              {fmt(s.sigma[0] * s.sigma[1])} = |det A| = {fmt(Math.abs(det2(m)))}.
            </Readout>
            <div className="mt-4">
              <NumpySnippet code={svd2Code(m)} output={svd2Output(m)} />
            </div>
          </>
        }
      >
        <p>Your matrix from step 2, split into its three factors (rounded to 2 decimals):</p>
        <Tex block>{factorsTex(m, s)}</Tex>
        <p>
          <strong>V</strong> has v₁ and v₂ as its columns. Transposing it turns them into rows,
          which is why Vᵀ sends v₁ to the x-axis: its first row dotted with v₁ gives 1, its second
          row gives 0.
        </p>
        <p>
          <strong>Σ</strong> holds the singular values on its diagonal, largest first. They are
          never negative; any flip is left to U or V.
        </p>
        <p>
          <strong>U</strong> has the unit directions u₁ and u₂ of the ellipse&rsquo;s axes as its
          columns. Putting it together, <Tex>{String.raw`A\mathbf{v}_1 = \sigma_1\mathbf{u}_1`}</Tex>{' '}
          and <Tex>{String.raw`A\mathbf{v}_2 = \sigma_2\mathbf{u}_2`}</Tex>.
        </p>
        <p>
          Where do the numbers come from? The matrix <Tex>{String.raw`A^{\mathsf T}A`}</Tex> is
          symmetric, so it always has real eigenvalues and perpendicular eigenvectors (the eigen
          lesson). Its eigenvectors are v₁ and v₂, and its eigenvalues are σ₁² and σ₂². That is
          how libraries start; in NumPy it is one call, <code>np.linalg.svd(A)</code>, which
          returns U, the σ&rsquo;s as a 1-D array <code>s</code>, and Vᵀ. Its U and V may have
          some columns multiplied by −1 compared with the picture; flipping a matching pair
          gives the same A.
        </p>
        <p>
          <strong>Not just square matrices.</strong> A matrix with m rows and n columns takes
          vectors with n entries to vectors with m entries: it maps between spaces of different
          sizes. It still has an SVD: V is n×n, U is m×m, and Σ is m×n with the singular values
          on its diagonal and zeros elsewhere. A 3×2 matrix, for example, turns the plane, stretches
          it, and sets it at an angle inside 3D space. The 2D picture here is the square case.
        </p>
      </Step>

      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/playground">playground</Link> lets you edit a matrix freely. Try to
          predict the ellipse before you look: the longest stretch is σ₁, the shortest σ₂, and
          their product is the absolute value of the determinant.
        </p>
      </footer>
    </article>
  )
}
