import { Line, Polygon, Text } from 'mafs'
import type { CardinalDirection } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { MatrixInput } from '../../components/MatrixInput'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, Plane, TransformedGrid } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { apply2, approxEqual, approxEqualVec, columns2, isZero, mul2 } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import {
  PREDICT_A,
  PREDICT_B,
  SEE_A,
  SEE_B,
  SHAPE,
  START_A,
  START_B,
  p,
  productSnippet,
  staged,
  texMat,
} from './content'
import { PracticeStep } from './PracticeStep'

type Order = 'AB' | 'BA'
type Cell = [row: 0 | 1, col: 0 | 1]

const shapeUnder = (m: Mat2) => SHAPE.map((q) => apply2(m, q))

/** A label next to one corner of the F (given in the F's own coordinates) after a matrix. */
function ShapeLabel({
  m,
  children,
  color,
  corner = [1.5, 2],
  attach = 'n',
}: {
  m: Mat2
  children: string
  color: string
  corner?: Vec2
  attach?: CardinalDirection
}) {
  const at = apply2(m, corner)
  return (
    <Text x={at[0]} y={at[1]} attach={attach} attachDistance={10} size={14} color={color}>
      {children}
    </Text>
  )
}

const pct = (t: number) => Math.round(t * 100)

export function Lesson() {
  const [A, setA] = useState<Mat2>(START_A)
  const [B, setB] = useState<Mat2>(START_B)
  const [order, setOrder] = useState<Order>('AB')
  const [cell, setCell] = useState<Cell>([0, 1])
  const play = useTween(2400, 1)
  const reveal = useTween(1600)

  const first = order === 'AB' ? B : A
  const second = order === 'AB' ? A : B
  const [firstName, secondName] = order === 'AB' ? ['B', 'A'] : ['A', 'B']
  const now = staged(first, second, play.t)
  const product = mul2(second, first)
  const AB = mul2(A, B)
  const BA = mul2(B, A)
  const commute = approxEqualVec(AB.flat(), BA.flat())

  const stage =
    isZero(play.t)
      ? 'Nothing has been applied yet.'
      : approxEqual(play.t, 0.5)
        ? `${firstName} is done; ${secondName} comes next.`
        : play.t < 0.5
          ? `Applying ${firstName} (first)…`
          : approxEqual(play.t, 1)
            ? `Done: ${firstName} first, then ${secondName}.`
            : `${firstName} is done; now applying ${secondName}…`

  const predAB = staged(PREDICT_B, PREDICT_A, reveal.t)
  const predBA = staged(PREDICT_A, PREDICT_B, reveal.t)

  // Step 4: one cell of AB is row r of A times column c of B.
  const [r, c] = cell
  const bCol = columns2(B)[c]
  const abCol = apply2(A, bCol)
  const hl = `\\textcolor{${COLOR.result}}`
  const rowHi = (i: number, _j: number, s: string) => (i === r ? `${hl}{\\boldsymbol{${s}}}` : s)
  const colHi = (_i: number, j: number, s: string) => (j === c ? `${hl}{\\boldsymbol{${s}}}` : s)
  const cellHi = (i: number, j: number, s: string) =>
    i === r && j === c ? `${hl}{\\boldsymbol{${s}}}` : s
  const colColor = c === 0 ? COLOR.i : COLOR.j
  const basis = c === 0 ? 'î' : 'ĵ'
  const snippet = productSnippet(A, B)
  const understandExtent = Math.min(
    10,
    Math.max(5, Math.ceil(Math.max(...bCol.map(Math.abs), ...abCol.map(Math.abs))) + 1),
  )

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="matrix-multiplication">
        Multiplying two matrices means doing one transformation and then another. By the end of
        this lesson you will know which one happens first in AB, why AB and BA usually differ, and
        why a neural network needs something non-linear between its layers.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="Two moves in a row are one move"
        visual={
          <>
            <Plane label="An F shape, the F after B (stretched), and the F after B then A (stretched, then turned)">
              <Polygon points={SHAPE} color={COLOR.ghost} fillOpacity={0.15} />
              <Polygon points={shapeUnder(SEE_B)} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
              <ShapeLabel m={SEE_B} color={COLOR.ghost} attach="ne">
                after B
              </ShapeLabel>
              <Polygon points={shapeUnder(mul2(SEE_A, SEE_B))} color={COLOR.v} fillOpacity={0.3} />
              <ShapeLabel m={mul2(SEE_A, SEE_B)} color={COLOR.v} attach="w">
                after AB
              </ShapeLabel>
            </Plane>
            <Readout>
              The grey F is the original. B stretches it to twice its width (dashed outline,{' '}
              <em>after B</em>). A then turns that a quarter turn counter-clockwise (
              <Tag color={COLOR.v}>after AB</Tag>). The single matrix AB, with rows{' '}
              {fmtVec(mul2(SEE_A, SEE_B)[0])} and {fmtVec(mul2(SEE_A, SEE_B)[1])}, does both at
              once.
            </Readout>
          </>
        }
      >
        <p>
          In the last lesson a matrix was an instruction for moving every point of the plane. What
          if you follow one instruction and then another? Here B stretches everything to twice its
          width, and then A turns the result a quarter turn:
        </p>
        <Tex block>
          {String.raw`B = ${texMat(SEE_B)}, \qquad A = ${texMat(SEE_A)}`}
        </Tex>
        <p>
          The combined move is again a single matrix, the <strong>product</strong> AB:
        </p>
        <Tex block>{String.raw`AB = ${texMat(SEE_A)}${texMat(SEE_B)} = ${texMat(mul2(SEE_A, SEE_B))}`}</Tex>
        <p>
          Notice the order. <strong>AB means &ldquo;B first, then A&rdquo;</strong>, read right to
          left, just like <code>f(g(x))</code> in code runs <code>g</code> first. The matrix
          nearest the vector acts on it first: <Tex>{String.raw`AB\mathbf{x} = A(B\mathbf{x})`}</Tex>.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Play the two moves, then swap them"
        visual={
          <>
            <Plane label={`The plane and an F shape being moved by ${firstName} first, then ${secondName}`}>
              <TransformedGrid matrix={now} color={COLOR.grid} />
              <Polygon points={SHAPE} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
              <Polygon points={shapeUnder(now)} color={COLOR.v} fillOpacity={0.3} />
              <Arrow tip={columns2(now)[0]} color={COLOR.i} label="î" />
              <Arrow tip={columns2(now)[1]} color={COLOR.j} label="ĵ" />
            </Plane>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">Order:</span>
              <Button
                variant={order === 'AB' ? 'primary' : 'secondary'}
                aria-pressed={order === 'AB'}
                onClick={() => {
                  setOrder('AB')
                  play.play()
                }}
              >
                AB: B first, then A
              </Button>
              <Button
                variant={order === 'BA' ? 'primary' : 'secondary'}
                aria-pressed={order === 'BA'}
                onClick={() => {
                  setOrder('BA')
                  play.play()
                }}
              >
                BA: A first, then B
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={play.play}>
                ▶ Play again
              </Button>
              <label className="flex flex-1 items-center gap-2 text-sm">
                <span className="whitespace-nowrap">Progress</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={pct(play.t)}
                  onChange={(e) => play.reset(Number(e.target.value) / 100)}
                  className="min-w-0 flex-1"
                  aria-valuetext={`${pct(play.t)}%: ${stage}`}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
              <MatrixInput value={A} onChange={setA} name="A" />
              <MatrixInput value={B} onChange={setB} name="B" />
            </div>
            <Readout>
              {stage} Together they are the single matrix {order}, with rows{' '}
              {fmtVec(product[0])} and {fmtVec(product[1])}: î ends at{' '}
              {fmtVec(columns2(product)[0])} and ĵ at {fmtVec(columns2(product)[1])}.{' '}
              {commute ? (
                <strong>For these two matrices AB and BA happen to be equal, so the order does not matter.</strong>
              ) : (
                <>
                  The other order gives {order === 'AB' ? 'BA' : 'AB'} with rows{' '}
                  {fmtVec((order === 'AB' ? BA : AB)[0])} and {fmtVec((order === 'AB' ? BA : AB)[1])}: a
                  different matrix.
                </>
              )}
            </Readout>
          </>
        }
      >
        <p>
          A starts as a quarter turn and B as a shear (it pushes the top of the F sideways). The
          plane shows them applied one after the other: <strong>{firstName} first</strong>, then{' '}
          {secondName}. Press <strong>Play again</strong> or drag the progress slider to watch the
          two stages.
        </p>
        <p>
          Now press <strong>BA: A first, then B</strong>. Same two matrices, opposite order, and the
          F lands somewhere else. With ordinary numbers 2 × 3 = 3 × 2, but with matrices the order
          usually matters: <Tex>{String.raw`AB \neq BA`}</Tex>. Turning and then shearing is not the
          same as shearing and then turning.
        </p>
        <p>Edit the matrices and try to find:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>an A and B where the two orders give the same result,</li>
          <li>a B that makes the order irrelevant whatever A is. (Hint: a matrix that does nothing.)</li>
        </ul>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: does the order matter here?"
        visual={
          <>
            <Plane label="The F under AB (solid) and under BA (dashed), with the lines y = x and y = −x">
              {!isZero(reveal.t) && (
                <>
                  <Line.Segment point1={[-6, -6]} point2={[6, 6]} color={COLOR.ghost} style="dashed" weight={1.5} />
                  <Line.Segment point1={[-6, 6]} point2={[6, -6]} color={COLOR.ghost} style="dashed" weight={1.5} />
                  <Text x={4} y={4} attach="se" size={13} color={COLOR.ghost}>
                    y = x
                  </Text>
                  <Text x={-4} y={4} attach="sw" size={13} color={COLOR.ghost}>
                    y = −x
                  </Text>
                </>
              )}
              <Polygon points={shapeUnder(predBA)} color={COLOR.i} fillOpacity={0.15} strokeStyle="dashed" />
              <Polygon points={shapeUnder(predAB)} color={COLOR.v} fillOpacity={0.3} />
              {!isZero(reveal.t) && (
                <>
                  <ShapeLabel m={predAB} color={COLOR.v} attach="e">
                    AB
                  </ShapeLabel>
                  <ShapeLabel m={predBA} color={COLOR.i} attach="w">
                    BA
                  </ShapeLabel>
                </>
              )}
            </Plane>
            <Readout>
              {isZero(reveal.t) ? (
                'Both copies of the F sit on top of each other, unmoved. Lock in a prediction to apply AB to one and BA to the other.'
              ) : (
                <>
                  <Tag color={COLOR.v}>AB</Tag> (solid) has rows {fmtVec(predAB[0])},{' '}
                  {fmtVec(predAB[1])}. <Tag color={COLOR.i}>BA</Tag> (dashed) has rows{' '}
                  {fmtVec(predBA[0])}, {fmtVec(predBA[1])}.
                </>
              )}
            </Readout>
          </>
        }
      >
        <p>
          A is a quarter turn counter-clockwise. B is a mirror that flips the plane top to bottom
          (y becomes −y):
        </p>
        <Tex block>{String.raw`A = ${texMat(PREDICT_A)}, \qquad B = ${texMat(PREDICT_B)}`}</Tex>
        <Predict
          question="Where do the two copies of the F end up, under AB and under BA?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'same',
              label: 'In the same place: a turn and a flip, whichever order.',
              correct: false,
              explain: (
                <p className="m-0">
                  That is how ordinary numbers behave (2 × 3 = 3 × 2), but transformations do
                  not. Flip-then-turn and turn-then-flip are both mirror images, but across
                  different lines: AB mirrors across the line y = x, BA across y = −x.
                </p>
              ),
            },
            {
              id: 'one',
              label: 'In different places: one of them is mirrored, the other is not.',
              correct: false,
              explain: (
                <p className="m-0">
                  Each order contains exactly one flip (B) and one turn (A), so both results are
                  mirrored: both Fs read backwards. The order changes <em>which</em> mirror you
                  get, not whether there is one.
                </p>
              ),
            },
            {
              id: 'diff',
              label: 'In different places: both are mirrored, but across different lines.',
              correct: true,
              explain: (
                <p className="m-0">
                  AB (flip, then turn) mirrors across y = x; BA (turn, then flip) mirrors across
                  y = −x. Same ingredients, different order, different result.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="Row times column, one cell at a time"
        visual={
          <>
            <Plane
              label={`Column ${c + 1} of AB: where B sends ${basis}, then where A sends that`}
              extent={understandExtent}
            >
              <TransformedGrid matrix={AB} color={COLOR.grid} extent={understandExtent * 2} />
              <Arrow tip={bCol} color={COLOR.ghost} label={`B${basis}`} dashed />
              <Arrow tip={abCol} color={colColor} label={`AB${basis}`} />
            </Plane>
            <Readout>
              B sends {basis} to {fmtVec(bCol)} (dashed). A then sends that to{' '}
              <Tag color={colColor}>AB{basis}</Tag> = {fmtVec(abCol)}, which is column {c + 1} of AB.
              The highlighted cell, row {r + 1} of that column, is {fmt(AB[r][c])}.
            </Readout>
            <div className="mt-4">
              <NumpySnippet code={snippet.code} output={snippet.output} />
            </div>
          </>
        }
      >
        <p>
          These are your A and B from step 2. Each cell of AB is one row of A times one column of
          B: multiply matching entries and add (a dot product). Pick a cell:
        </p>
        <div className="mb-4 grid max-w-xs grid-cols-2 gap-2" role="group" aria-label="Cell of AB to explain">
          {([0, 1] as const).map((i) =>
            ([0, 1] as const).map((j) => (
              <Button
                key={`${i}${j}`}
                variant={i === r && j === c ? 'primary' : 'secondary'}
                aria-pressed={i === r && j === c}
                onClick={() => setCell([i, j])}
              >
                Row {i + 1}, column {j + 1}
              </Button>
            )),
          )}
        </div>
        <Tex block>{String.raw`${texMat(A, rowHi)}\,${texMat(B, colHi)} = ${texMat(AB, cellHi)}`}</Tex>
        <Tex block>
          {String.raw`(AB)_{${r + 1}${c + 1}} = ${p(A[r][0])}\cdot${p(B[0][c])} + ${p(A[r][1])}\cdot${p(B[1][c])} = ${fmt(AB[r][c])}`}
        </Tex>
        <p>
          Why rows of A and columns of B? Read it column by column. Column {c + 1} of B is where B
          sends {basis}. A then moves that arrow, and the result is where AB sends {basis}: column{' '}
          {c + 1} of AB. So each column of AB is A times a column of B, and each of those is
          worked out row by row, exactly as in the last lesson.
        </p>
        <Tex block>
          {String.raw`A\begin{bmatrix} ${fmt(bCol[0])} \\ ${fmt(bCol[1])} \end{bmatrix} = \begin{bmatrix} ${fmt(abCol[0])} \\ ${fmt(abCol[1])} \end{bmatrix}`}
        </Tex>
        <p>
          In NumPy, <code>A @ B</code> is AB, so it means &ldquo;B first, then A&rdquo;. Swap
          the order in the code and you get BA, usually a different matrix.
        </p>
      </Step>

      <ApplyStep />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/playground">playground</Link> has the same plane with presets for
          rotation, shear and reflection: try chaining them in your head, then check.
        </p>
      </footer>
    </article>
  )
}

