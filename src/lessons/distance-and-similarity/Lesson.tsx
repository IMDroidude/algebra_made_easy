import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Predict } from '../../components/Predict'
import { Slider } from '../../components/Slider'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import type { Vec2 } from '../../linalg'
import { chebyshev, euclidean, manhattan, minkowski } from '../../linalg/distance'
import { ApplyStep } from './ApplyStep'
import { BasketSection, RatingsSection } from './BasketSection'
import { DRAG_A, DRAG_B, MEASURE_COLOR, MEASURE_NAMES, P, Q, R, SEE_A, SEE_B, THREE, normSnippet } from './content'
import { Ball, GapLines } from './Drawings'
import { HouseExample } from './HouseExample'
import { PracticeStep } from './PracticeStep'

const snap = snapTo(1)
const RANGE: [number, number] = [-1, 8]

/** Brackets a negative number so a subtraction reads correctly: 2 − (−1). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

function PointLabels({ a, b }: { a: Vec2; b: Vec2 }) {
  const aLeft = a[0] <= b[0]
  return (
    <>
      <PlaneLabel x={a[0]} y={a[1]} attach={aLeft ? 'w' : 'e'} distance={16} size={18} color={COLOR.grid}>
        A
      </PlaneLabel>
      <PlaneLabel x={b[0]} y={b[1]} attach={aLeft ? 'e' : 'w'} distance={16} size={18} color={COLOR.grid}>
        B
      </PlaneLabel>
    </>
  )
}

function Stat({ name, value, color, note }: { name: string; value: string; color: string; note: string }) {
  return (
    <div className="rounded-lg border-2 bg-surface px-3 py-2 text-center" style={{ borderColor: color }}>
      <p className="m-0 text-xs font-semibold tracking-widest uppercase" style={{ color }}>
        {name}
      </p>
      <p className="m-0 font-mono text-2xl font-bold">{value}</p>
      <p className="m-0 text-xs text-muted">{note}</p>
    </div>
  )
}

function Stats({ a, b }: { a: Vec2; b: Vec2 }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      <Stat name="Euclidean" value={fmt(euclidean(a, b))} color={MEASURE_COLOR.euclidean} note="straight line" />
      <Stat name="Manhattan" value={fmt(manhattan(a, b))} color={MEASURE_COLOR.manhattan} note="along the grid" />
      <Stat name="Chebyshev" value={fmt(chebyshev(a, b))} color={MEASURE_COLOR.chebyshev} note="longer leg" />
    </div>
  )
}

export function Lesson() {
  const [a, setA] = useState<Vec2>(DRAG_A)
  const [b, setB] = useState<Vec2>(DRAG_B)
  const [showBalls, setShowBalls] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [power, setPower] = useState(2)
  const [infinite, setInfinite] = useState(false)

  const dE = euclidean(a, b)
  const dM = manhattan(a, b)
  const dC = chebyshev(a, b)
  const dx = Math.abs(a[0] - b[0])
  const dy = Math.abs(a[1] - b[1])
  const pNow = infinite ? Infinity : power
  const pText = infinite ? '∞' : fmt(power)
  const snippet = normSnippet(a, b)

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="distance-and-similarity">
        &ldquo;How alike are these two?&rdquo; has more than one answer, and they can disagree. By the
        end of this lesson you will know what Euclidean, Manhattan, Chebyshev, cosine, Hamming,
        Jaccard and Pearson each measure, and which one fits which kind of data.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="One gap, three distances"
        visual={
          <>
            <Plane x={RANGE} y={RANGE} label="Points A and B with the straight line between them and the grid route around the corner">
              <GapLines a={SEE_A} b={SEE_B} />
              <CoordPoint at={SEE_A} color={COLOR.grid} />
              <CoordPoint at={SEE_B} color={COLOR.grid} />
              <PointLabels a={SEE_A} b={SEE_B} />
            </Plane>
            <Stats a={SEE_A} b={SEE_B} />
            <Readout>
              A = {fmtVec(SEE_A)}, B = {fmtVec(SEE_B)}. B is {fmt(SEE_B[0] - SEE_A[0])} to the right
              of A and {fmt(SEE_B[1] - SEE_A[1])} up. <Tag color={MEASURE_COLOR.euclidean}>Euclidean</Tag>{' '}
              distance {fmt(euclidean(SEE_A, SEE_B))} (the solid line),{' '}
              <Tag color={MEASURE_COLOR.manhattan}>Manhattan</Tag> distance {fmt(manhattan(SEE_A, SEE_B))}{' '}
              (the two dashed legs added), <Tag color={MEASURE_COLOR.chebyshev}>Chebyshev</Tag>{' '}
              distance {fmt(chebyshev(SEE_A, SEE_B))} (the longer leg, marked with a thick band).
            </Readout>
          </>
        }
      >
        <p>
          Two points on a map, A = {fmtVec(SEE_A)} and B = {fmtVec(SEE_B)}, in kilometres. How far
          apart are they? It depends on who is asking.
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            A <strong>drone</strong> flies straight: {fmt(euclidean(SEE_A, SEE_B))} km. This is the{' '}
            <Tag color={MEASURE_COLOR.euclidean}>Euclidean</Tag> distance, the one a ruler gives.
          </li>
          <li>
            A <strong>taxi</strong> in a city of square blocks cannot cut through buildings:{' '}
            {fmt(SEE_B[0] - SEE_A[0])} km east, then {fmt(SEE_B[1] - SEE_A[1])} km north,{' '}
            {fmt(manhattan(SEE_A, SEE_B))} km in all. This is the{' '}
            <Tag color={MEASURE_COLOR.manhattan}>Manhattan</Tag> distance.
          </li>
          <li>
            A <strong>crane</strong> that drives east and north at the same time is done when the
            longer of the two is done: {fmt(chebyshev(SEE_A, SEE_B))} km. This is the{' '}
            <Tag color={MEASURE_COLOR.chebyshev}>Chebyshev</Tag> distance. It is also how many moves
            a chess king needs.
          </li>
        </ul>
        <p>
          Same two points, three different numbers. None is wrong. Each is the right answer to a
          different question, and choosing a measure means choosing the question.
        </p>
        <p>
          In lesson 3.3 the vectors were arrows from the origin, and cosine similarity compared
          their directions. Here the same lists of numbers are treated as <em>places</em>, and a
          distance says how far one place is from another.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Drag the points and watch the three numbers"
        visual={
          <>
            <Plane x={RANGE} y={RANGE} label="Two draggable points A and B with the three ways to measure the gap between them">
              {showBalls && (
                <>
                  <Ball centre={a} radius={dE} p={2} color={MEASURE_COLOR.euclidean} opacity={0.7} />
                  <Ball centre={a} radius={dM} p={1} color={MEASURE_COLOR.manhattan} opacity={0.7} />
                  <Ball centre={a} radius={dC} p={Infinity} color={MEASURE_COLOR.chebyshev} opacity={0.7} />
                </>
              )}
              <GapLines a={a} b={b} />
              <PointLabels a={a} b={b} />
              <DraggablePoint value={a} onChange={setA} color={COLOR.grid} snap={snap} />
              <DraggablePoint value={b} onChange={setB} color={COLOR.grid} snap={snap} />
            </Plane>
            <Stats a={a} b={b} />
            <div className="mt-3">
              <Toggle checked={showBalls} onChange={setShowBalls}>
                Show every point that is as far from A as B is
              </Toggle>
            </div>
            <Readout>
              A = {fmtVec(a)}, B = {fmtVec(b)}: {fmt(dx)} across and {fmt(dy)} up or down.{' '}
              <Tag color={MEASURE_COLOR.euclidean}>Euclidean</Tag> {fmt(dE)},{' '}
              <Tag color={MEASURE_COLOR.manhattan}>Manhattan</Tag> {fmt(dM)},{' '}
              <Tag color={MEASURE_COLOR.chebyshev}>Chebyshev</Tag> {fmt(dC)}.
              {showBalls && (
                <>
                  {' '}
                  Around A: a circle of radius {fmt(dE)}, a diamond reaching {fmt(dM)} along each
                  axis, and a square reaching {fmt(dC)}. All three pass through B.
                </>
              )}
            </Readout>
          </>
        }
      >
        <p>
          Drag A and B (or click one and use the arrow keys). The solid line, the dashed grid route
          and the thick band on the longer leg follow. Try to:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>make all three numbers equal. Where does B have to be?</li>
          <li>make Manhattan as large as you can compared with Euclidean,</li>
          <li>make Chebyshev larger than Euclidean. (You cannot. Why?)</li>
        </ul>
        <p>
          Whatever you do, the order never changes:{' '}
          <strong>Chebyshev ≤ Euclidean ≤ Manhattan</strong>. The longer leg is never longer than
          the straight line, and the straight line is never longer than going round the corner.
          They are equal only when B is directly beside, above or below A, so there is no corner.
        </p>
        <p>
          Now switch on <strong>every point that is as far from A as B is</strong>. For Euclidean
          distance that is a <Tag color={MEASURE_COLOR.euclidean}>circle</Tag>. For Manhattan it is
          a <Tag color={MEASURE_COLOR.manhattan}>diamond</Tag>: a taxi with a fixed fare gets
          furthest by driving along one street. For Chebyshev it is a{' '}
          <Tag color={MEASURE_COLOR.chebyshev}>square</Tag>. Each measure has its own idea of
          &ldquo;equally far&rdquo;, which is why they can rank neighbours differently.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: which one is closer?"
        visual={
          <>
            <div className="overflow-x-auto rounded-xl border border-line bg-surface px-4 py-3">
              <table className="w-full border-collapse text-sm">
                <caption className="mb-2 text-left text-xs font-semibold tracking-widest text-muted uppercase">
                  Three things, four features each
                </caption>
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="py-1 pr-3 font-semibold">Vector</th>
                    <th className="py-1 pr-3 font-semibold">Values</th>
                    <th className="py-1 pr-3 font-semibold">Difference from P</th>
                    {revealed &&
                      MEASURE_NAMES.map((m) => (
                        <th key={m} className="py-1 pl-2 text-right font-semibold">
                          {m}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['P', P],
                      ['Q', Q],
                      ['R', R],
                    ] as const
                  ).map(([name, v]) => (
                    <tr key={name} className="border-b border-line">
                      <th scope="row" className="py-1 pr-3 text-left font-semibold">
                        {name}
                      </th>
                      <td className="py-1 pr-3 font-mono whitespace-nowrap">{fmtVec(v)}</td>
                      <td className="py-1 pr-3 font-mono whitespace-nowrap">
                        {name === 'P' ? 'none' : fmtVec(v.map((x, k) => x - P[k]))}
                      </td>
                      {revealed &&
                        THREE.map((d, k) => (
                          <td key={MEASURE_NAMES[k]} className="py-1 pl-2 text-right font-mono">
                            {name === 'P' ? '0' : fmt(d(P, v))}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Readout>
              {revealed
                ? `From P: Q is ${fmt(euclidean(P, Q))} away by Euclidean, ${fmt(manhattan(P, Q))} by Manhattan and ${fmt(chebyshev(P, Q))} by Chebyshev. R is ${fmt(euclidean(P, R))}, ${fmt(manhattan(P, R))} and ${fmt(chebyshev(P, R))}. Euclidean and Chebyshev say Q is closer; Manhattan says R is.`
                : `Q differs from P by 1 in every feature. R matches P in three features and differs by ${fmt(R[3] - P[3])} in the last. The distances stay hidden until you lock in a prediction.`}
            </Readout>
          </>
        }
      >
        <p>
          Real data has more than two features, so there is no picture, only the numbers. Take a
          reference P = {fmtVec(P)} and two others:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>Q = {fmtVec(Q)}: a little different from P in every feature;</li>
          <li>R = {fmtVec(R)}: identical to P, except for one feature that is far off.</li>
        </ul>
        <Predict
          question="By Euclidean distance, which is closer to P?"
          onReveal={() => setRevealed(true)}
          onRetry={() => setRevealed(false)}
          options={[
            {
              id: 'r',
              label: 'R: it matches P exactly in three features out of four',
              correct: false,
              explain: (
                <p className="m-0">
                  Euclidean distance does not count matching features. It squares each difference
                  before adding, so one difference of 3 costs 3² = 9, more than four differences
                  of 1, which cost 1 + 1 + 1 + 1 = 4. R is √9 = {fmt(euclidean(P, R))} away; Q is
                  √4 = {fmt(euclidean(P, Q))} away.
                </p>
              ),
            },
            {
              id: 'same',
              label: 'Neither: the differences add up to about the same',
              correct: false,
              explain: (
                <p className="m-0">
                  Adding up the differences gives {fmt(manhattan(P, Q))} for Q and{' '}
                  {fmt(manhattan(P, R))} for R. That sum is the Manhattan distance, and by it R is
                  slightly closer. Euclidean squares first: 4 for Q against 9 for R, so Q is
                  closer, {fmt(euclidean(P, Q))} against {fmt(euclidean(P, R))}.
                </p>
              ),
            },
            {
              id: 'q',
              label: 'Q: small differences everywhere beat one large difference',
              correct: true,
              explain: (
                <p className="m-0">
                  Q is √(1 + 1 + 1 + 1) = {fmt(euclidean(P, Q))} away and R is √(0 + 0 + 0 + 9) ={' '}
                  {fmt(euclidean(P, R))} away. Squaring makes one big difference expensive. Look
                  at the table: Manhattan disagrees and puts R closer, {fmt(manhattan(P, R))}{' '}
                  against {fmt(manhattan(P, Q))}, because it only counts the total.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="Three formulas, one family"
        visual={
          <>
            <Plane extent={1.5} height={340} label="Every point at distance 1 from the origin, for the chosen value of p">
              <Ball centre={[0, 0]} radius={1} p={1} color={COLOR.ghost} weight={1.5} opacity={0.6} />
              <Ball centre={[0, 0]} radius={1} p={2} color={COLOR.ghost} weight={1.5} opacity={0.6} />
              <Ball centre={[0, 0]} radius={1} p={Infinity} color={COLOR.ghost} weight={1.5} opacity={0.6} />
              <Ball centre={[0, 0]} radius={1} p={pNow} color={COLOR.v} weight={4} />
            </Plane>
            <div className="mt-3 grid gap-3">
              <Slider name="p" value={power} onChange={setPower} min={1} max={10} step={0.5} disabled={infinite} />
              <Toggle checked={infinite} onChange={setInfinite}>
                Let p grow without limit (p = ∞)
              </Toggle>
            </div>
            <Readout>
              p = {pText}. The thick outline is every point at distance 1 from the origin. With this
              p, your A = {fmtVec(a)} and B = {fmtVec(b)} from step 2 are{' '}
              <strong>{fmt(minkowski(a, b, pNow), 3)}</strong> apart.{' '}
              {infinite
                ? 'This is Chebyshev distance: the square.'
                : power === 1
                  ? 'This is Manhattan distance: the diamond.'
                  : power === 2
                    ? 'This is Euclidean distance: the circle.'
                    : power < 2
                      ? 'Between the diamond and the circle.'
                      : 'Between the circle and the square.'}
            </Readout>
            <div className="mt-4">
              <NumpySnippet code={snippet.code} output={snippet.output} />
            </div>
          </>
        }
      >
        <p>
          These are your own A = {fmtVec(a)} and B = {fmtVec(b)} from step 2. Every distance starts
          from the same thing, the differences between matching entries:
        </p>
        <Tex block>
          {String.raw`\mathbf{a}-\mathbf{b} = (${fmt(a[0])} - ${p(b[0])},\; ${fmt(a[1])} - ${p(b[1])}) = (${fmt(a[0] - b[0])},\; ${fmt(a[1] - b[1])})`}
        </Tex>
        <p>
          <Tag color={MEASURE_COLOR.manhattan}>Manhattan</Tag> adds their sizes. The bars mean
          &ldquo;drop the minus sign&rdquo;:
        </p>
        <Tex block>{String.raw`\lvert{${fmt(a[0] - b[0])}}\rvert + \lvert{${fmt(a[1] - b[1])}}\rvert = ${fmt(dx)} + ${fmt(dy)} = ${fmt(dM)}`}</Tex>
        <p>
          <Tag color={MEASURE_COLOR.euclidean}>Euclidean</Tag> squares them, adds, and takes the
          square root. This is Pythagoras, and it is the length of a − b from lesson 3.3:
        </p>
        <Tex block>{String.raw`\sqrt{${fmt(dx)}^2 + ${fmt(dy)}^2} = \sqrt{${fmt(dx * dx + dy * dy)}} = ${fmt(dE, 3)}`}</Tex>
        <p>
          <Tag color={MEASURE_COLOR.chebyshev}>Chebyshev</Tag> keeps only the largest:
        </p>
        <Tex block>{String.raw`\max(${fmt(dx)},\; ${fmt(dy)}) = ${fmt(dC)}`}</Tex>
        <p>
          All three are one formula with a dial, p. Raise each difference to the power p, add, and
          take the p-th root:
        </p>
        <Tex block>{String.raw`d_p(\mathbf{a},\mathbf{b}) = \Bigl(\,|a_1-b_1|^p + |a_2-b_2|^p + \dots\Bigr)^{1/p}`}</Tex>
        <p>
          p = 1 is Manhattan and p = 2 is Euclidean. The larger p gets, the more the biggest
          difference drowns out the others, until at p = ∞ only it is left: Chebyshev. Move the
          slider and watch the shape of &ldquo;distance 1&rdquo; swell from the diamond through the
          circle towards the square. The family is called <em>Minkowski distance</em>, and the
          three special cases are also written L1, L2 and L∞.
        </p>
        <p>
          In NumPy, <code>np.linalg.norm</code> measures the length of a vector, and{' '}
          <code>ord</code> is that same p. <code>np.inf</code> is NumPy&rsquo;s infinity.
        </p>
      </Step>

      <ApplyStep />
      <BasketSection />
      <RatingsSection />
      <HouseExample />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/reference">Reference page</Link> lists the types of vector these measures
          are used on. The next lesson,{' '}
          <Link to="/lessons/matrices-as-transformations">matrices as transformations</Link>, moves
          every point of the plane at once, which changes all of these distances together.
        </p>
      </footer>
    </article>
  )
}
