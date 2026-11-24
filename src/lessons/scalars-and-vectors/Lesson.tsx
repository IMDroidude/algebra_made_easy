import { Line, Text } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, DraggableArrow, DraggablePoint, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec, isInteger, numpyVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { add, angleDeg, norm, scale, sub } from '../../linalg'
import { cleanZero2, isZeroVec } from '../../linalg/span'
import type { Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import { KindsSection } from './KindsSection'
import { PracticeStep } from './PracticeStep'
import { ProductsSection } from './ProductsSection'
import { TransformSection } from './TransformSection'
import { VectorOps } from './VectorOps'
import { hasNegativeZero, numpyPrint1d } from './numpyOut'
import type { Op } from './ops'

/** Fixed vectors for the prediction in step 3. */
const PU: Vec2 = [3, 1]
const PV: Vec2 = [1, 3]
/** Middle of the u − v arrow, where its label goes. */
const PMID = scale(add(PU, PV), 0.5)

/** Wraps negative numbers in brackets so sums read correctly: 2 + (−1). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))
const col = (w: Vec2) => String.raw`\begin{bmatrix} ${fmt(w[0])} \\ ${fmt(w[1])} \end{bmatrix}`

/** A point along the straight path from a to b, used to grow an arrow during a reveal. */
const along = (a: Vec2, b: Vec2, t: number): Vec2 => add(a, scale(sub(b, a), t))

export function Lesson() {
  // Step 1
  const [w, setW] = useState<Vec2>([3, 2])
  const [moved, setMoved] = useState(false)
  const [start, setStart] = useState<Vec2>([-4, 1])
  // Steps 2 and 4 share these
  const [op, setOp] = useState<Op>('add')
  const [u, setU] = useState<Vec2>([2, 1])
  const [v, setV] = useState<Vec2>([-1, 2])
  const [k, setK] = useState(2)
  // Step 3
  const reveal = useTween(1200)

  const end = add(start, w)
  const sum = add(u, v)
  const diff = sub(u, v)
  const ku = scale(u, k)
  const r = op === 'add' ? sum : op === 'subtract' ? diff : ku
  const parts: [string, string] =
    op === 'add'
      ? [`${fmt(u[0])} + ${p(v[0])}`, `${fmt(u[1])} + ${p(v[1])}`]
      : op === 'subtract'
        ? [`${fmt(u[0])} − ${p(v[0])}`, `${fmt(u[1])} − ${p(v[1])}`]
        : [`${p(k)} · ${p(u[0])}`, `${p(k)} · ${p(u[1])}`]

  const intSum = isInteger(...u, ...v)
  const intScale = isInteger(k, ...u)
  const outputs = [numpyPrint1d(sum, intSum), numpyPrint1d(diff, intSum), numpyPrint1d(ku, intScale)]
  const negZero = !intScale && hasNegativeZero(ku)

  const predictTip = along(PV, PU, reveal.t)

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="scalars-and-vectors">
        Every piece of data an AI model sees is turned into a list of numbers: a vector. In this
        lesson you will draw vectors as arrows, and add, subtract and scale them by hand, until you
        can predict the answer before you compute it.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="A scalar is a number; a vector is a list of numbers"
        visual={
          <>
            <Plane label="A plane with one draggable vector w, and optionally the same vector drawn from another starting point">
              {moved && (
                <>
                  <Line.Segment point1={[0, 0]} point2={start} color={COLOR.ghost} style="dashed" weight={1.5} />
                  <Arrow tail={start} tip={end} color={COLOR.v} label="w" opacity={0.7} />
                  <Text x={start[0]} y={start[1]} attach="w" attachDistance={18} size={14} color={COLOR.ghost}>
                    start
                  </Text>
                  <DraggablePoint value={start} onChange={(q) => setStart(cleanZero2(q))} color={COLOR.ghost} />
                </>
              )}
              <DraggableArrow value={w} onChange={(q) => setW(cleanZero2(q))} color={COLOR.v} label="w" />
            </Plane>
            <div className="mt-3">
              <Toggle checked={moved} onChange={setMoved}>
                Draw the same w from a different starting point
              </Toggle>
            </div>
            <Readout>
              <Tag color={COLOR.v}>w</Tag> = {fmtVec(w)}: {fmt(Math.abs(w[0]))} step
              {Math.abs(w[0]) === 1 ? '' : 's'} {w[0] < 0 ? 'left' : 'right'} and{' '}
              {fmt(Math.abs(w[1]))} step{Math.abs(w[1]) === 1 ? '' : 's'} {w[1] < 0 ? 'down' : 'up'}.
              Length {fmt(norm(w))}
              {!isZeroVec(w) && <>, pointing {fmt(angleDeg(w), 0)}° from the x-axis</>}.
              {moved && (
                <>
                  {' '}
                  Drawn from the start point {fmtVec(start)}, the same w ends at {fmtVec(end)}.
                </>
              )}
            </Readout>
          </>
        }
      >
        <p>
          You met points and vectors in{' '}
          <Link to="/lessons/points-and-vectors">lesson 1.4</Link>; here is a quick recap before you
          start doing arithmetic with them.
        </p>
        <p>
          A <strong>scalar</strong> is a single number: 3, −0.5, a temperature, a price. It has a
          size and a sign, nothing more.
        </p>
        <p>
          A <strong>vector</strong> is an ordered list of numbers. With two numbers you can draw
          it: the first says how far to go right (negative means left), the second how far up
          (negative means down). Drag the tip of <Tag color={COLOR.v}>w</Tag> and watch its two
          numbers change. In NumPy it is <code>np.array([{fmt(w[0])}, {fmt(w[1])}])</code>.
        </p>
        <p>
          Order matters. ({fmt(w[0])}, {fmt(w[1])}) and ({fmt(w[1])}, {fmt(w[0])}) are different
          vectors
          {w[0] === w[1] ? ' in general (yours happen to have equal entries)' : ''}, the same way a
          row in a dataset means nothing if its columns are shuffled.
        </p>
        <p>
          As in lesson 1.4, a vector can be read two ways. As a <strong>position</strong>: the
          point where the arrow ends when it starts at the origin. Or as a{' '}
          <strong>displacement</strong>: a move of so much right and so much up, which you can start
          from anywhere. Switch on the second arrow
          and drag its start point: it is the same w wherever you put it, because a vector records
          only the move, not where it began.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Add, subtract and scale by dragging"
        visual={
          <VectorOps op={op} setOp={setOp} u={u} setU={setU} v={v} setV={setV} k={k} setK={setK} />
        }
      >
        <p>
          Three operations are all you need for the rest of the course. Pick one above the plane,
          then drag the tips of <Tag color={COLOR.i}>u</Tag> and <Tag color={COLOR.j}>v</Tag>.
        </p>
        <p>
          <strong>Add.</strong> Put the tail of v on the tip of u. The sum is the arrow from the
          origin to where you end up. Switch on the parallelogram: going v first and then u lands
          on the same corner, so u + v = v + u.
        </p>
        <p>
          <strong>Subtract.</strong> u − v is the arrow that takes you <em>from the tip of v to the
          tip of u</em>. Check: start at v, add u − v, and you are at u.
        </p>
        <p>
          <strong>Scale.</strong> Multiplying by a scalar k stretches or shrinks the arrow along
          its own line. Try:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>k = 0.5 (half as long),</li>
          <li>k = −1 (same length, opposite direction),</li>
          <li>k = 0 (the arrow vanishes into the origin).</li>
        </ul>
        <p>
          The word &ldquo;scalar&rdquo; comes from exactly this: a number that <em>scales</em> a
          vector.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Which way does u − v point?"
        visual={
          <>
            <Plane label="Two fixed vectors u and v; after you lock in, the arrow for u minus v is drawn between their tips">
              <Arrow tip={PU} color={COLOR.i} label="u" />
              <Arrow tip={PV} color={COLOR.j} label="v" />
              {reveal.t > 0 && (
                <Arrow tail={PV} tip={predictTip} color={COLOR.result} />
              )}
              {reveal.t === 1 && (
                <Text x={PMID[0]} y={PMID[1]} attach="e" attachDistance={12} size={18} color={COLOR.result}>
                  u − v
                </Text>
              )}
            </Plane>
            <Readout>
              {reveal.t === 0
                ? 'Showing u = (3, 1) and v = (1, 3). Lock in a prediction to draw u − v.'
                : `u − v = ${fmtVec(sub(PU, PV))}: from the tip of v at (1, 3), go 2 right and 2 down, and you reach the tip of u at (3, 1).`}
            </Readout>
          </>
        }
      >
        <p>
          Here <Tag color={COLOR.i}>u</Tag> = (3, 1) and <Tag color={COLOR.j}>v</Tag> = (1, 3).
          Imagine drawing u − v as an arrow that joins the tips of the two vectors.
        </p>
        <Predict
          question="Which way does the arrow for u − v point?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'u-to-v',
              label: 'From the tip of u to the tip of v.',
              correct: false,
              explain: (
                <p className="m-0">
                  That arrow is v − u = (−2, 2): it is what you add to u to get to v. Subtraction
                  answers &ldquo;what do I add to v to get u?&rdquo;, so u − v starts at v and
                  ends at u.
                </p>
              ),
            },
            {
              id: 'v-to-u',
              label: 'From the tip of v to the tip of u.',
              correct: true,
              explain: (
                <p className="m-0">
                  u − v = (3 − 1, 1 − 3) = (2, −2). Start at the tip of v, (1, 3), move 2 right and
                  2 down, and you are at (3, 1), the tip of u. In symbols: v + (u − v) = u.
                </p>
              ),
            },
            {
              id: 'diagonal',
              label: 'Out from the origin, along the diagonal between u and v.',
              correct: false,
              explain: (
                <p className="m-0">
                  That diagonal is u + v = (4, 4), the far corner of the parallelogram. The
                  difference is the <em>other</em> diagonal, the one that joins the two tips.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="Each operation works one entry at a time"
        visual={
          <>
            <Plane label="The result of the chosen operation, split into its x step and its y step">
              <Line.Segment point1={[0, 0]} point2={[r[0], 0]} color={COLOR.ghost} style="dashed" weight={2} />
              <Line.Segment point1={[r[0], 0]} point2={r} color={COLOR.ghost} style="dashed" weight={2} />
              <Arrow
                tip={r}
                color={COLOR.result}
                label={op === 'add' ? 'u + v' : op === 'subtract' ? 'u − v' : `${fmt(k)}u`}
              />
            </Plane>
            <Readout>
              {op === 'add' ? 'u + v' : op === 'subtract' ? 'u − v' : `${fmt(k)}u`} ={' '}
              <Tag color={COLOR.result}>{fmtVec(r)}</Tag>. x entry: {parts[0]} = {fmt(r[0])}. y entry:{' '}
              {parts[1]} = {fmt(r[1])}.
            </Readout>
            <div className="mt-4">
              <NumpySnippet
                code={`import numpy as np\n\n${numpyVec('u', u)}\n${numpyVec('v', v)}\nk = ${fmt(k)}\n\nprint(u + v)\nprint(u - v)\nprint(k * u)`}
                output={outputs.join('\n')}
              />
              {negZero && (
                <p className="mt-2 text-sm text-muted">
                  NumPy prints <code>-0.</code> when a negative number times 0 gives zero. It is
                  equal to 0; the minus is only a leftover sign bit.
                </p>
              )}
            </div>
          </>
        }
      >
        <p>
          These are your u, v and k from step 2 (the plane shows the operation you picked there).
          The rules are short: line the entries up and work on each row separately.
        </p>
        <Tex block>
          {String.raw`\mathbf{u} + \mathbf{v} = ${col(u)} + ${col(v)} = ${col(sum)}`}
        </Tex>
        <Tex block>
          {String.raw`\mathbf{u} - \mathbf{v} = ${col(u)} - ${col(v)} = ${col(diff)}`}
        </Tex>
        <Tex block>{String.raw`k\,\mathbf{u} = ${p(k)} \cdot ${col(u)} = ${col(ku)}`}</Tex>
        <p>
          That is why the pictures work. Adding the x entries is walking the two x steps one after
          the other; the same for y. Scaling multiplies both steps by k, so the arrow keeps its
          slope and stays on its line through the origin. A negative k reverses both steps, so the
          arrow flips.
        </p>
        <p>
          In NumPy, <code>+</code> and <code>-</code> between two arrays work entry by entry, and{' '}
          <code>k * u</code> multiplies every entry of <code>u</code> by the number{' '}
          <code>k</code>. Integers stay integers; as soon as one number has a decimal point the
          result prints with a trailing dot, such as <code>3.</code>.
        </p>
        <p className="text-sm text-muted">
          Nothing here depends on there being two entries. A vector with 768 entries is added,
          subtracted and scaled by the same rules, one entry at a time. Two entries is just the
          largest size we can draw.
        </p>
      </Step>

      <ApplyStep />
      <HouseExample />
      <PracticeStep />
      <KindsSection />
      <TransformSection />
      <ProductsSection />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/playground">playground</Link> has a vector lab for adding and scaling
          vectors with no goals attached.
        </p>
      </footer>
    </article>
  )
}
