import { Line, Text } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec, numpyPrint } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { add, matVec, scale, sub } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { PREDICT_M, PREDICT_POINTS, SEE_A, SEE_V } from './data'
import { DimensionStep } from './DimensionStep'
import { HouseExample } from './HouseExample'
import { PracticeStep } from './PracticeStep'
import { ShapePicker } from './ShapePicker'
import { collisions, numpyMat, pyShape, shapeOf, squash } from './shapes'
import type { PickerState } from './shapes'

export function Lesson() {
  const [picker, setPicker] = useState<PickerState>({ a: [2, 3], b: [3, 4], transposeB: false })
  const reveal = useTween(1400)

  const seeOut = matVec(SEE_A, SEE_V)
  const outputs = PREDICT_POINTS.map((q) => squash(PREDICT_M, q))
  const clashes = collisions(outputs)
  // Points that land on an already-used spot get their label lifted a little higher.
  const stackLevel = (k: number) => {
    const g = clashes.find((grp) => grp.includes(k))
    return g ? g.indexOf(k) : 0
  }

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="shapes-and-transpose">
        Every matrix has a shape, and the shape decides what it can be multiplied with and how many
        numbers come out. By the end you will be able to read the shape of <code>A @ B</code> before
        running it, transpose a matrix in your head, and see how a non-square matrix moves data
        between spaces of different size.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="Rows first, then columns"
        visual={
          <>
            <figure className="m-0 rounded-xl border border-line p-5" aria-label="A 2 by 3 matrix">
              <div className="flex items-center justify-center gap-3">
                <span className="font-display text-2xl italic" aria-hidden="true">
                  A =
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="grid grid-cols-3 gap-2 rounded-sm border-x-2 border-ink px-3 py-2 font-mono text-lg"
                    role="table"
                    aria-label="A, 2 rows by 3 columns"
                  >
                    {SEE_A.map((row, r) =>
                      row.map((x, c) => (
                        <span
                          key={`${r}${c}`}
                          role="cell"
                          className="min-w-[2.5rem] rounded-md px-2 py-1 text-center"
                        >
                          {x}
                        </span>
                      )),
                    )}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: COLOR.i }}>
                    ← 2 rows
                  </span>
                </div>
              </div>
              <p className="m-0 mt-2 text-center text-sm font-semibold" style={{ color: COLOR.j }}>
                ↑ 3 columns ↑
              </p>
            </figure>
            <Readout>
              A has <Tag color={COLOR.i}>2 rows</Tag> and <Tag color={COLOR.j}>3 columns</Tag>, so
              its shape is (2, 3). It takes a vector with 3 entries and gives back a vector with 2:
              A @ {fmtVec(SEE_V)} = {fmtVec(seeOut)}.
            </Readout>
            <div className="mt-4">
              <NumpySnippet
                code={`import numpy as np\n\n${numpyMat('A', SEE_A)}\nv = np.array([1, 1, 1])\n\nprint(A.shape)\nprint(A @ v)`}
                output={`${pyShape(shapeOf(SEE_A))}\n${numpyPrint(seeOut, true)}`}
              />
            </div>
          </>
        }
      >
        <p>
          So far every matrix has been 2×2. Real ones rarely are. A matrix can have any number of
          rows and any number of columns, and that pair of numbers is its <strong>shape</strong>.
        </p>
        <p>
          The rule that trips everyone up: <strong>rows come first</strong>. &ldquo;2×3&rdquo; means 2
          rows and 3 columns, and NumPy writes it as <code>(2, 3)</code>. Rows run across, columns
          run down.
        </p>
        <p>
          The shape also tells you what the matrix <em>does</em>. Remember that the columns say
          where each input direction lands. Three columns means three input directions, so A
          expects vectors with 3 numbers. Each column has 2 entries, so every result has 2 numbers.
        </p>
        <Tex block>{String.raw`\underbrace{A}_{(2,\,3)}\;\underbrace{\mathbf{v}}_{3\text{ numbers}} = \underbrace{A\mathbf{v}}_{2\text{ numbers}}`}</Tex>
        <p>
          In code, <code>A.shape</code> gives the shape as a tuple. Read the matrix&rsquo;s shape as
          &ldquo;outputs × inputs&rdquo;.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Will A @ B work? Check the inner sizes"
        visual={<ShapePicker state={picker} onChange={setPicker} />}
      >
        <p>
          Multiplying <code>A @ B</code> means applying A to every column of B. Each entry of the
          result pairs one row of A with one column of B and adds up the products, entry by entry.
          That only works if a row of A and a column of B have the same length.
        </p>
        <p>
          A row of A has as many entries as A has <strong>columns</strong>; a column of B has as
          many entries as B has <strong>rows</strong>. Write the two shapes side by side:
        </p>
        <Tex block>{String.raw`(m, \textcolor{${COLOR.v}}{n}) \;@\; (\textcolor{${COLOR.v}}{n}, p) \;\longrightarrow\; (m, p)`}</Tex>
        <p>
          The <Tag color={COLOR.v}>inner</Tag> numbers must match, and the{' '}
          <Tag color={COLOR.result}>outer</Tag> numbers give the shape of the result. Pick some
          shapes and try:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>make the product fail, and read NumPy&rsquo;s error message,</li>
          <li>make A 2×3 and B 2×3. It fails. Now switch on <code>B.T</code>,</li>
          <li>find shapes where the result is bigger than both A and B.</li>
        </ul>
        <p>
          NumPy&rsquo;s error is cryptic but says the same thing: in its signature{' '}
          <code>(n?,k),(k,m?)</code>, <code>k</code> is the inner size, and &ldquo;size 2 is different
          from 3&rdquo; means B brought 2 rows where A has 3 columns. The <code>try</code> /{' '}
          <code>except</code> in the snippet just prints the error instead of stopping.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="A matrix with one row"
        visual={
          <>
            <Plane label="Five labelled points; after the prediction they move onto the number line along the x-axis">
              <Line.Segment
                point1={[-8, 0]}
                point2={[8, 0]}
                color={COLOR.result}
                weight={reveal.t > 0 ? 4 : 1.5}
                opacity={0.3 + 0.6 * reveal.t}
              />
              {reveal.t > 0 && (
                <Text x={-5} y={0} attach="ne" attachDistance={28} size={13} color={COLOR.result}>
                  number line
                </Text>
              )}
              {PREDICT_POINTS.map((q, k) => {
                const at = add(q, scale(sub([outputs[k], 0], q), reveal.t))
                return (
                  <g key={k}>
                    <CoordPoint at={at} color={COLOR.v} />
                    <Text
                      x={at[0]}
                      y={at[1]}
                      attach="s"
                      attachDistance={18 + 16 * stackLevel(k) * reveal.t}
                      size={14}
                      color={COLOR.v}
                    >
                      {`p${k + 1}`}
                    </Text>
                  </g>
                )
              })}
            </Plane>
            <Readout>
              {reveal.t === 0 ? (
                'Five points in the plane, p1 to p5. Lock in a prediction to apply M to them.'
              ) : (
                <>
                  {PREDICT_POINTS.map((q, k) => (
                    <span key={k} className="block">
                      p{k + 1} = {fmtVec(q)} → {fmt(outputs[k])}
                    </span>
                  ))}
                  {clashes.map((g) => (
                    <span key={g.join()} className="mt-1 block font-semibold">
                      {g.map((k) => `p${k + 1}`).join(' and ')} land on the same number,{' '}
                      {fmt(outputs[g[0]])}.
                    </span>
                  ))}
                </>
              )}
            </Readout>
          </>
        }
      >
        <p>Here is a matrix with 1 row and 2 columns, shape (1, 2):</p>
        <Tex block>{String.raw`M = \begin{bmatrix} 1 & 1 \end{bmatrix}`}</Tex>
        <p>
          You multiply it with points of the plane, written as columns of 2 numbers. Use the shape
          rule from step 2 before you answer.
        </p>
        <Predict
          question="What does M do to the five points?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'error',
              label: 'Nothing: a 1×2 matrix cannot multiply a point with 2 numbers.',
              correct: false,
              explain: (
                <p className="m-0">
                  Check the inner sizes: (1, <strong>2</strong>) @ (<strong>2</strong>, 1). M has 2
                  columns and the point has 2 numbers, so they match. A matrix does not have to be
                  square to be applied; it only needs as many columns as the input has numbers.
                </p>
              ),
            },
            {
              id: 'drop',
              label: 'Each point drops straight down onto the x-axis and keeps its x.',
              correct: false,
              explain: (
                <p className="m-0">
                  That would be the matrix [1 0], which ignores y. Here the second entry is 1, so y
                  counts as well: (x, y) becomes 1·x + 1·y. Look at p4 = (0, 3): it does not land
                  at 0, it lands at 3.
                </p>
              ),
            },
            {
              id: 'line',
              label: 'Every point becomes a single number, x + y: the plane is squashed onto a line.',
              correct: true,
              explain: (
                <p className="m-0">
                  The result has shape (1, 1): one number per point. M takes 2 numbers in and gives
                  1 out, so the whole plane lands on a number line (drawn here along the x-axis).
                  Notice that p1 and p4 both land on 3: once squashed, you cannot tell them apart.
                </p>
              ),
            },
            {
              id: 'plane',
              label: 'The points stay in the plane but move, like with a 2×2 matrix.',
              correct: false,
              explain: (
                <p className="m-0">
                  The number of rows is the number of outputs. M has 1 row, so each point comes out
                  as just 1 number. To stay in the plane you need 2 outputs, which means 2 rows.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <DimensionStep seeA={SEE_A} />
      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/playground">playground</Link> has the square 2×2 case with presets. Next,
          the determinant measures exactly how much a square matrix squashes the plane, including
          the case you just saw, where it gets squashed flat.
        </p>
      </footer>
    </article>
  )
}
