import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { MatrixInput } from '../../components/MatrixInput'
import { Arrow, DraggableArrow, Plane, TransformedGrid } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import { useTween } from '../../lib/useTween'
import { IDENTITY2, columns2, det2, fromColumns2, isSingular2, lerp2 } from '../../linalg'
import type { Mat2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import { PracticeStep } from './PracticeStep'
import { SquareImage } from './SquareImage'
import { UnderstandStep } from './UnderstandStep'
import { PREDICT_B, PREDICT_SWAPPED, SEE_M } from './data'
import { describeDet, detText } from './determinant'

/** The planes here show −3 to 3, so dragging stays inside that range. */
const SNAP = snapTo(0.5, 3)

export function Lesson() {
  const [m, setM] = useState<Mat2>(IDENTITY2)
  const [showGrid, setShowGrid] = useState(false)
  const reveal = useTween(1800)

  const [iHat, jHat] = columns2(m)
  const det = det2(m)
  const predictM = lerp2(PREDICT_B, PREDICT_SWAPPED, reveal.t)
  const predictDet = det2(predictM)
  const [seeI, seeJ] = columns2(SEE_M)

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="determinant">
        One number tells you how much a 2×2 matrix stretches or shrinks area, whether it flips the
        plane over, and whether it squashes it flat. By the end you will be able to read that number
        off a matrix and say what it means for the data passing through it.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="Watch what happens to one square"
        visual={
          <>
            <Plane label="The unit square with an F inside, before (dashed, grey) and after the matrix" extent={3}>
              <SquareImage m={SEE_M} ghost />
              <Arrow tip={seeI} color={COLOR.i} label="î" />
              <Arrow tip={seeJ} color={COLOR.j} label="ĵ" />
            </Plane>
            <Readout>
              The grey dashed unit square (area 1) is carried to the{' '}
              <Tag color={COLOR.result}>green parallelogram</Tag> with sides{' '}
              <Tag color={COLOR.i}>î</Tag> = {fmtVec(seeI)} and <Tag color={COLOR.j}>ĵ</Tag> ={' '}
              {fmtVec(seeJ)}. Its area is 3, so the determinant is 3. The{' '}
              <Tag color={COLOR.v}>F</Tag> is stretched and slanted but still reads the right way
              round.
            </Readout>
          </>
        }
      >
        <p>
          A 2×2 matrix moves every point of the plane. Rather than follow every point, follow one
          small shape: the <strong>unit square</strong>, with corners (0, 0), (1, 0), (1, 1) and
          (0, 1). Its two sides are exactly î and ĵ, so after the matrix its sides are the two
          columns.
        </p>
        <Tex block>{String.raw`\begin{bmatrix} 2 & 1 \\ 0 & 1.5 \end{bmatrix}`}</Tex>
        <p>
          This matrix turns the square into a parallelogram of area 3. Because the grid stays a
          grid, <em>every</em> square of the grid, and so every shape, has its area multiplied by
          that same 3.
        </p>
        <p>
          That factor is the <strong>determinant</strong>, written det(A). We put an F inside the
          square because an F has no mirror symmetry: if the plane is flipped over, the F reads
          backwards.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Stretch it, flip it, flatten it"
        visual={
          <>
            <Plane label="The unit square and an F under a matrix whose basis vectors you can drag" extent={3}>
              {showGrid && <TransformedGrid matrix={m} color={COLOR.grid} />}
              <SquareImage m={m} />
              <DraggableArrow
                value={iHat}
                onChange={(next) => setM(fromColumns2(next, jHat))}
                color={COLOR.i}
                label="î"
                snap={SNAP}
              />
              <DraggableArrow
                value={jHat}
                onChange={(next) => setM(fromColumns2(iHat, next))}
                color={COLOR.j}
                label="ĵ"
                snap={SNAP}
              />
            </Plane>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Toggle checked={showGrid} onChange={setShowGrid}>
                Show the whole grid
              </Toggle>
              <Button variant="secondary" onClick={() => setM(IDENTITY2)}>
                Reset to identity
              </Button>
            </div>
            <div className="mt-4">
              <MatrixInput value={m} onChange={setM} />
            </div>
            <Readout>
              <span className="block">
                <Tag color={COLOR.i}>î</Tag> lands at {fmtVec(iHat)},{' '}
                <Tag color={COLOR.j}>ĵ</Tag> lands at {fmtVec(jHat)}.{' '}
                <strong>
                  Determinant {detText(det)}
                  {isSingular2(m) && ', treated as singular'}
                </strong>
                ; area of the square {detText(Math.abs(det))}.
              </span>
              <span className="mt-1 block">{describeDet(m)}</span>
            </Readout>
          </>
        }
      >
        <p>
          Drag the tips of î and ĵ (or click one and use the arrow keys), or type into the matrix.
          Keep an eye on the determinant in the readout. Try to:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>make the square exactly twice as big, in two different ways,</li>
          <li>make the F read backwards. What happens to the sign?</li>
          <li>squash the square flat, so it has no area at all,</li>
          <li>
            type 1, 1, 1 and 1.0000001 into the matrix. The determinant is 0.0000001: shown
            as <strong>≈ 0</strong> and treated as singular.
          </li>
        </ul>
        <p>Three things to notice:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            The <strong>size</strong> of the determinant is the area of the square (and the factor
            for every other area).
          </li>
          <li>
            The <strong>sign</strong> says whether the plane was flipped over. Negative means the F
            reads backwards: you could not get there by sliding and turning the plane, only by
            lifting it out and turning it over.
          </li>
          <li>
            <strong>Zero</strong> means everything has been flattened onto a line (or a single
            point). The app treats any determinant within 0.000001 of zero as zero, because
            computers store numbers with tiny rounding errors.
          </li>
        </ul>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Swap the two columns"
        visual={
          <>
            <Plane label="The unit square and F under B, moving to B with its columns swapped after the prediction" extent={3}>
              <SquareImage m={predictM} />
              <Arrow tip={columns2(predictM)[0]} color={COLOR.i} label="î" />
              <Arrow tip={columns2(predictM)[1]} color={COLOR.j} label="ĵ" />
            </Plane>
            <Readout>
              {reveal.t === 0
                ? 'Showing B: determinant 2. Lock in a prediction to swap the columns.'
                : `Determinant ${detText(predictDet)}${reveal.t < 1 ? ' (moving)' : ''}. ${describeDet(predictM)}`}
            </Readout>
          </>
        }
      >
        <p>This matrix doubles area, so its determinant is 2:</p>
        <Tex block>{String.raw`B = \begin{bmatrix} 2 & 1 \\ 0 & 1 \end{bmatrix}, \qquad \det(B) = 2`}</Tex>
        <p>Now swap its two columns, so î goes where ĵ went and ĵ goes where î went:</p>
        <Tex block>{String.raw`B' = \begin{bmatrix} 1 & 2 \\ 1 & 0 \end{bmatrix}`}</Tex>
        <Predict
          question="What is the determinant of B′?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'same',
              label: '2: same two arrows, same parallelogram, same area.',
              correct: false,
              explain: (
                <p className="m-0">
                  The area is indeed still 2, but the determinant also has a sign. With the columns
                  swapped, going from î to ĵ turns clockwise instead of counter-clockwise, and the F
                  comes out mirrored. That flip makes the determinant −2.
                </p>
              ),
            },
            {
              id: 'neg',
              label: '−2: same area, but the plane is flipped over.',
              correct: true,
              explain: (
                <p className="m-0">
                  Same parallelogram, so the size is still 2, but the F now reads backwards. Swapping
                  two columns always flips the sign of the determinant. Watch the animation: on the
                  way from B to B′ the square is flattened (determinant 0) before it comes out the
                  other side, turned over.
                </p>
              ),
            },
            {
              id: 'zero',
              label: '0: swapping lines the columns up on top of each other.',
              correct: false,
              explain: (
                <p className="m-0">
                  The columns are still the same two arrows, (2, 0) and (1, 1), just with their
                  names swapped. They point in different directions, so they still span a
                  parallelogram of area 2. (The animation does pass through 0 on the way, but B′
                  itself is not flat.)
                </p>
              ),
            },
            {
              id: 'half',
              label: '½: swapping the columns undoes B.',
              correct: false,
              explain: (
                <p className="m-0">
                  Undoing B is its <em>inverse</em>, which would shrink area by half. Swapping
                  columns does not undo anything: it builds a different matrix whose parallelogram
                  has the same area, 2, but is turned over.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <UnderstandStep />
      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/playground">playground</Link> shows the determinant live for any matrix.
          Next: when the determinant is not zero, the transformation can be undone. That is the
          inverse.
        </p>
      </footer>
    </article>
  )
}
