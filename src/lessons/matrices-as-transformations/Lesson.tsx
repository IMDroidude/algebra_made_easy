import { Polygon } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { MatrixInput } from '../../components/MatrixInput'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, DraggableArrow, DraggablePoint, Plane, TransformedGrid } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { asTyped2, fmt, fmtDet, fmtVec, isInteger, numpyMat2, numpyPrint, numpyVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import { useTween } from '../../lib/useTween'
import {
  IDENTITY2,
  angleDeg,
  apply2,
  columns2,
  det2,
  fromColumns2,
  isSingular2,
  lerp2,
  norm,
  scale,
} from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'
import { UNIT_SQUARE } from './galleryMath'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import { Gallery } from './Gallery'
import { understandExtentFor, P_LIMIT } from './pointMap'
import { PracticeStep } from './PracticeStep'


const PREDICT_TARGET: Mat2 = [
  [2, 0],
  [0, 1],
]

const pointSnap = snapTo(0.5, P_LIMIT)

/** Wraps negative numbers in brackets so products read correctly: 2 · (−1). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

export function Lesson() {
  const [v, setV] = useState<Vec2>([2, 1])
  const [m, setM] = useState<Mat2>(IDENTITY2)
  const [showV, setShowV] = useState(true)
  const [showSquare, setShowSquare] = useState(false)
  const [row, setRow] = useState<0 | 1>(0)
  const reveal = useTween(1400)

  const [iHat, jHat] = columns2(m)
  const Av = apply2(m, v)
  const det = det2(m)
  const singular = isSingular2(m)
  const predictMatrix = lerp2(IDENTITY2, PREDICT_TARGET, reveal.t)

  // Fixed while P is dragged inside ±P_LIMIT, so the plane does not rescale under the pointer.
  const understandExtent = understandExtentFor(m, v)

  const [[a, b], [c, d]] = m
  const [x, y] = v
  const tryInStep2 = (next: Mat2) => {
    setM(next)
    document.getElementById('step-2')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }
  const hi = (r: 0 | 1, tex: string) =>
    r === row ? `\\textcolor{${COLOR.result}}{\\boldsymbol{${tex}}}` : tex

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="matrices-as-transformations">
        A matrix is not just a grid of numbers. It is an instruction for moving every point in
        space. By the end of this lesson you will be able to look at a 2×2 matrix and say what it
        does before you run it.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="Start with one vector"
        visual={
          <>
            <Plane label="A plane with one draggable vector v">
              <DraggableArrow value={v} onChange={setV} color={COLOR.v} label="v" />
            </Plane>
            <Readout>
              <Tag color={COLOR.v}>v</Tag> = {fmtVec(v)} · length {fmt(norm(v))}
              {norm(v) > 0 && <> · points {fmt(angleDeg(v), 0)}° from the x-axis</>}
            </Readout>
          </>
        }
      >
        <p>
          A vector is a list of numbers. With two numbers you can draw it: go <em>x</em> steps
          right, <em>y</em> steps up, and draw an arrow from the origin to where you end up.
        </p>
        <p>
          Drag the tip of <Tag color={COLOR.v}>v</Tag> (or click it and use the arrow keys). Watch
          its two numbers change. Those two numbers are all a vector is.
        </p>
        <p>
          In code this is <code>np.array([{fmt(x)}, {fmt(y)}])</code>. In ML, a row of your dataset
          with two features is exactly this kind of arrow.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="A matrix says where the two basis arrows land"
        visual={
          <>
            <Plane label="A plane with draggable basis vectors; the grid follows them">
              <TransformedGrid matrix={m} color={COLOR.grid} />
              {showSquare && (
                <Polygon
                  points={UNIT_SQUARE.map((q) => apply2(m, q))}
                  color={COLOR.result}
                  fillOpacity={0.25}
                />
              )}
              {showV && (
                <>
                  <Arrow tip={v} color={COLOR.v} label="v" dashed opacity={0.55} weight={2} />
                  <Arrow tip={Av} color={COLOR.v} label="Av" />
                </>
              )}
              <DraggableArrow
                value={iHat}
                onChange={(next) => setM(fromColumns2(next, jHat))}
                color={COLOR.i}
                label="î"
              />
              <DraggableArrow
                value={jHat}
                onChange={(next) => setM(fromColumns2(iHat, next))}
                color={COLOR.j}
                label="ĵ"
              />
            </Plane>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Toggle checked={showV} onChange={setShowV}>
                Show v and Av
              </Toggle>
              <Toggle checked={showSquare} onChange={setShowSquare}>
                Show unit square and its area
              </Toggle>
              <Button variant="secondary" onClick={() => setM(IDENTITY2)}>
                Reset to identity
              </Button>
            </div>
            <div className="mt-4">
              <MatrixInput value={m} onChange={setM} />
            </div>
            <Readout>
              <Tag color={COLOR.i}>î</Tag> lands at {fmtVec(iHat)}, <Tag color={COLOR.j}>ĵ</Tag>{' '}
              lands at {fmtVec(jHat)}.
              {showV && (
                <>
                  {' '}
                  <Tag color={COLOR.v}>v</Tag> = {fmtVec(v)} is carried to{' '}
                  <Tag color={COLOR.v}>Av</Tag> = {fmtVec(Av)}.
                </>
              )}
              {showSquare && (
                <>
                  {' '}
                  The unit square now has area {fmt(Math.abs(det))}
                  {det < 0 && !singular && ' and has been flipped over'} (determinant{' '}
                  {fmtDet(det)}).
                </>
              )}
              {singular && (
                <>
                  {' '}
                  <strong>
                    Determinant {fmtDet(det)}: treated as singular. Both arrows lie on one line, so
                    the whole plane has been squashed flat and cannot be un-squashed.
                  </strong>
                </>
              )}
            </Readout>
          </>
        }
      >
        <p>
          Two special arrows describe the whole plane: <Tag color={COLOR.i}>î</Tag> = (1, 0), one
          step right, and <Tag color={COLOR.j}>ĵ</Tag> = (0, 1), one step up. Every other vector is
          some amount of î plus some amount of ĵ. Your <Tag color={COLOR.v}>v</Tag> = {fmtVec(v)} is{' '}
          {fmt(x)} of î plus {fmt(y)} of ĵ.
        </p>
        <p>
          A 2×2 matrix is a record of where those two arrows land.{' '}
          <strong>
            The first column is where î lands. The second column is where ĵ lands.
          </strong>{' '}
          Everything else follows, because the grid stays a grid: lines stay straight, evenly
          spaced, and the origin stays put.
        </p>
        <p>
          The matrix starts as the <em>identity</em>: î and ĵ land where they started, so nothing
          moves. Now drag the tips of î and ĵ, or type into the matrix. Try to:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>make everything twice as tall,</li>
          <li>turn the grid upside down,</li>
          <li>lay î and ĵ along the same line. What happens to the grid?</li>
        </ul>
        <p>
          Notice that <Tag color={COLOR.v}>Av</Tag> always sits at the same grid address as v did:{' '}
          {fmt(x)} of the new î plus {fmt(y)} of the new ĵ.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: what will this matrix do?"
        visual={
          <>
            <Plane label="The grid before and after the matrix in the question">
              <TransformedGrid matrix={predictMatrix} color={COLOR.grid} />
              <Polygon
                points={UNIT_SQUARE.map((q) => apply2(predictMatrix, q))}
                color={COLOR.result}
                fillOpacity={0.25}
              />
              <Arrow tip={columns2(predictMatrix)[0]} color={COLOR.i} label="î" />
              <Arrow tip={columns2(predictMatrix)[1]} color={COLOR.j} label="ĵ" />
            </Plane>
            <Readout>
              {reveal.t === 0
                ? 'Showing the identity: nothing has moved yet. Lock in a prediction to apply the matrix.'
                : `î is at ${fmtVec(columns2(predictMatrix)[0])}, ĵ is at ${fmtVec(columns2(predictMatrix)[1])}.`}
            </Readout>
          </>
        }
      >
        <p>Start from the identity and change only the first column:</p>
        <Tex block>
          {String.raw`\begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix} \;\longrightarrow\; \begin{bmatrix} 2 & 0 \\ 0 & 1 \end{bmatrix}`}
        </Tex>
        <Predict
          question="What happens to the plane?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'rot',
              label: 'The plane rotates.',
              correct: false,
              explain: (
                <p className="m-0">
                  A rotation has to turn î away from the x-axis. Here î lands at (2, 0), still
                  pointing straight along the x-axis. It only got longer.
                </p>
              ),
            },
            {
              id: 'x',
              label: 'Everything is stretched to twice its width. Heights do not change.',
              correct: true,
              explain: (
                <p className="m-0">
                  The first column says î now lands at (2, 0): twice as far right. ĵ has not moved,
                  so nothing changes vertically. Every point (x, y) goes to (2x, y).
                </p>
              ),
            },
            {
              id: 'y',
              label: 'Everything is stretched to twice its height. Widths do not change.',
              correct: false,
              explain: (
                <p className="m-0">
                  You read the matrix by rows. Read it by <strong>columns</strong>: the first
                  column (2, 0) is where î lands, and î is the horizontal arrow. The 2 is in the
                  x-position of î, so the stretch is horizontal.
                </p>
              ),
            },
            {
              id: 'both',
              label: 'Everything doubles in size, in every direction.',
              correct: false,
              explain: (
                <p className="m-0">
                  That would need ĵ to double as well, giving the matrix with 2 in both diagonal
                  places. Here only the first column changed, so only î moved. One entry of a
                  matrix does not scale the whole plane.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="The arithmetic behind the picture"
        visual={
          <>
            <Plane label="Av built from x copies of î and y copies of ĵ" extent={understandExtent}>
              <TransformedGrid matrix={m} color={COLOR.grid} extent={understandExtent * 2} />
              <Arrow tip={scale(iHat, x)} color={COLOR.i} label={`${fmt(x)} × î`} labelAt="middle" />
              <Arrow
                tail={scale(iHat, x)}
                tip={Av}
                color={COLOR.j}
                label={`${fmt(y)} × ĵ`}
                labelAt="middle"
              />
              <Arrow tip={Av} color={COLOR.v} label="Av = P′" />
              <DraggablePoint value={v} onChange={setV} color={COLOR.ghost} snap={pointSnap} />
              <PlaneLabel x={x} y={y} attach="n" distance={14} color={COLOR.ghost}>
                P
              </PlaneLabel>
            </Plane>
            <Readout>
              P = {fmtVec(v)} is sent to P′ = {fmtVec(Av)}. Walk {fmt(x)} × î = {fmtVec(scale(iHat, x))}, then {fmt(y)} × ĵ ={' '}
              {fmtVec(scale(jHat, y))}. You arrive at <Tag color={COLOR.v}>Av</Tag> = {fmtVec(Av)}.
            </Readout>
            <div className="mt-4">
              <NumpySnippet
                code={`import numpy as np\n\n${numpyMat2('A', m)}\n${numpyVec('v', v)}\n\nprint(A @ v)`}
                output={numpyPrint(apply2(asTyped2(m), v), isInteger(a, b, c, d, x, y))}
              />
            </div>
          </>
        }
      >
        <p>
          These are your own matrix and vector from steps 1 and 2. Think of v as a point{' '}
          <strong>P</strong> = {fmtVec(v)}; drag the grey point P and its image P′ = Av follows. Since v is {fmt(x)} of î plus{' '}
          {fmt(y)} of ĵ, the result is {fmt(x)} of wherever î landed plus {fmt(y)} of wherever ĵ
          landed:
        </p>
        <Tex block>
          {String.raw`A\mathbf{v} = ${p(x)}\,\textcolor{${COLOR.i}}{\begin{bmatrix} ${fmt(a)} \\ ${fmt(c)} \end{bmatrix}} + ${p(y)}\,\textcolor{${COLOR.j}}{\begin{bmatrix} ${fmt(b)} \\ ${fmt(d)} \end{bmatrix}} = \begin{bmatrix} ${fmt(Av[0])} \\ ${fmt(Av[1])} \end{bmatrix}`}
        </Tex>
        <p>
          The usual &ldquo;row times column&rdquo; rule is the same sum, just collected one output
          number at a time. For any matrix with entries a, b, c, d:
        </p>
        <Tex block>
          {String.raw`x' = \textcolor{${COLOR.i}}{a}\,x + \textcolor{${COLOR.j}}{b}\,y, \qquad y' = \textcolor{${COLOR.i}}{c}\,x + \textcolor{${COLOR.j}}{d}\,y`}
        </Tex>
        <p>With your numbers:</p>
        <Tex block>
          {String.raw`\begin{bmatrix} ${hi(0, fmt(a))} & ${hi(0, fmt(b))} \\ ${hi(1, fmt(c))} & ${hi(1, fmt(d))} \end{bmatrix} \begin{bmatrix} ${fmt(x)} \\ ${fmt(y)} \end{bmatrix} = \begin{bmatrix} ${hi(0, `${p(a)}\\cdot${p(x)} + ${p(b)}\\cdot${p(y)}`)} \\ ${hi(1, `${p(c)}\\cdot${p(x)} + ${p(d)}\\cdot${p(y)}`)} \end{bmatrix} = \begin{bmatrix} ${hi(0, fmt(Av[0]))} \\ ${hi(1, fmt(Av[1]))} \end{bmatrix}`}
        </Tex>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Highlight:</span>
          <Button variant={row === 0 ? 'primary' : 'secondary'} onClick={() => setRow(0)}>
            Top row → x of the result
          </Button>
          <Button variant={row === 1 ? 'primary' : 'secondary'} onClick={() => setRow(1)}>
            Bottom row → y of the result
          </Button>
        </div>
        <p>
          In NumPy, <code>@</code> is matrix multiplication. Go back and change the matrix or the
          vector: the equations, the picture and the code all follow.
        </p>
      </Step>

      <Gallery onTry={tryInStep2} />

      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/playground">playground</Link> has the same plane with presets for
          rotation, shear, reflection and projection, plus a vector lab for adding and scaling
          vectors.
        </p>
      </footer>
    </article>
  )
}
