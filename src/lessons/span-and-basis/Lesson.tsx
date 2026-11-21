import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, Plane, TransformedGrid } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec, isInteger, numpyVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { fromColumns2, scale } from '../../linalg'
import { combine2, rank2 } from '../../linalg/span'
import type { Vec2 } from '../../linalg'
import { numpyPrint as numpyPrint1d } from '../../lib/format'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import { PracticeStep } from './PracticeStep'
import { SpanLayer } from './SpanLayer'
import { numpyCombine } from './numpyMath'
import { SpanPlane } from './SpanPlane'
import { rankMeaning } from './spanText'

/** Step 1: a fixed example of a linear combination. */
const SEE_U: Vec2 = [2, 1]
const SEE_V: Vec2 = [-1, 1]
const SEE_W = combine2(1, SEE_U, 2, SEE_V)

/** Step 3: two vectors on the same line, pointing opposite ways. */
const PRED_U: Vec2 = [1, 2]
const PRED_V: Vec2 = [-1.5, -3]

const col = (w: Vec2) => String.raw`\begin{bmatrix} ${fmt(w[0])} \\ ${fmt(w[1])} \end{bmatrix}`
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

export function Lesson() {
  const [u, setU] = useState<Vec2>([2, 1])
  const [v, setV] = useState<Vec2>([-1, 1])
  const [a, setA] = useState(1)
  const [b, setB] = useState(2)
  const [useV, setUseV] = useState(true)
  const reveal = useTween(1400)

  const au = scale(u, a)
  const w = combine2(a, u, b, v)
  const M = fromColumns2(u, v)
  const rank = rank2([u, v])
  const integer = isInteger(...u, ...v, a, b)

  const code = [
    'import numpy as np',
    '',
    numpyVec('u', u),
    numpyVec('v', v),
    `a = ${fmt(a)}`,
    `b = ${fmt(b)}`,
    '',
    'w = a * u + b * v',
    'print(w)',
    '',
    'M = np.column_stack([u, v])   # u and v as the two columns',
    'print(np.linalg.matrix_rank(M))',
  ].join('\n')

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="span-and-basis">
        Scale two vectors and add them, and you get a new vector. Do it with every possible pair
        of numbers, and you get the set of all points those two vectors can reach. By the end of
        this lesson you will be able to tell, just by looking at two arrows, whether they reach the
        whole plane or only a line.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="A recipe: so much of u, plus so much of v"
        visual={
          <>
            <Plane label="Vectors u and v, and the point u plus 2v reached by walking u then two copies of v">
              <Arrow tip={SEE_V} color={COLOR.j} label="v" />
              <Arrow tip={SEE_U} color={COLOR.i} label="u" />
              <Arrow tail={SEE_U} tip={SEE_W} color={COLOR.j} dashed opacity={0.8} weight={2} label="2v" labelAt="middle" />
              <Arrow tip={SEE_W} color={COLOR.v} label="u + 2v" />
            </Plane>
            <Readout>
              <Tag color={COLOR.i}>u</Tag> = (2, 1), <Tag color={COLOR.j}>v</Tag> = (−1, 1). Walk
              one u to (2, 1), then two v to arrive at <Tag color={COLOR.v}>u + 2v</Tag> ={' '}
              {fmtVec(SEE_W)}.
            </Readout>
          </>
        }
      >
        <p>
          In the last lesson you scaled vectors and added them. Put the two moves together and you
          have a <strong>linear combination</strong>:
        </p>
        <Tex block>{String.raw`\mathbf{w} = a\,\mathbf{u} + b\,\mathbf{v}`}</Tex>
        <p>
          Read it as a recipe: take <em>a</em> copies of <Tag color={COLOR.i}>u</Tag> and{' '}
          <em>b</em> copies of <Tag color={COLOR.j}>v</Tag>, and walk them one after the other.
          The numbers a and b are scalars and can be anything, including negative numbers and
          fractions.
        </p>
        <p>
          In the picture, a = 1 and b = 2: one u, then two v, lands on (0, 3). Different numbers
          land somewhere else. This lesson asks one question:{' '}
          <strong>which points can you land on?</strong> That set of points is called the{' '}
          <strong>span</strong> of u and v.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Mix u and v with two sliders"
        visual={
          <SpanPlane
            u={u}
            setU={setU}
            v={v}
            setV={setV}
            a={a}
            setA={setA}
            b={b}
            setB={setB}
            useV={useV}
            setUseV={setUseV}
          />
        }
      >
        <p>
          Move the sliders for <em>a</em> and <em>b</em> (or focus one and use the arrow keys). The
          wide orange stroke is a·u, the wide teal one is b·v starting from its tip, and{' '}
          <Tag color={COLOR.v}>w</Tag> is where you end up.
        </p>
        <p>
          Now switch on <strong>Show every reachable point</strong>. The dots are the points you
          get with whole-number a and b; the shading says that every point in between is
          reachable too, with fractional a and b. Then try three things:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            Drag v until it lies on the same line as u, for example to (4, 2) or (−2, −1). What
            happens to the shading?
          </li>
          <li>Pull them apart again.</li>
          <li>Switch on &ldquo;Use u alone&rdquo;. How much of the plane can one vector reach?</li>
        </ul>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Two arrows, opposite ways: what can they reach?"
        visual={
          <>
            <Plane label="Fixed vectors u and v; after you lock in, the points they can reach fade in">
              {reveal.t > 0 && <SpanLayer u={PRED_U} v={PRED_V} opacity={reveal.t} />}
              <Arrow tip={PRED_U} color={COLOR.i} label="u" />
              <Arrow tip={PRED_V} color={COLOR.j} label="v" />
            </Plane>
            <Readout>
              {reveal.t === 0
                ? 'Showing u = (1, 2) and v = (−1.5, −3). Lock in a prediction to see every point a·u + b·v can reach.'
                : 'Every combination lands on the line through the origin that contains u and v (the line y = 2x). Points off that line, such as (1, 0), cannot be reached.'}
            </Readout>
          </>
        }
      >
        <p>
          Here <Tag color={COLOR.i}>u</Tag> = (1, 2) and <Tag color={COLOR.j}>v</Tag> = (−1.5,
          −3). They point in opposite directions. You may pick any numbers a and b.
        </p>
        <Predict
          question="Which points can a·u + b·v reach?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'plane',
              label: 'Every point of the plane: two different arrows give two directions.',
              correct: false,
              explain: (
                <p className="m-0">
                  Pointing opposite ways is not a second direction. v = −1.5·u, so v lies on u’s
                  own line, and any mix of the two is still a multiple of u. Two vectors only
                  reach the whole plane when they lie on <em>different</em> lines.
                </p>
              ),
            },
            {
              id: 'line',
              label: 'Only the points on one line through the origin.',
              correct: true,
              explain: (
                <p className="m-0">
                  v = −1.5·u, so a·u + b·v = (a − 1.5b)·u: always some multiple of u. Multiples of
                  u fill exactly one line through the origin. v adds nothing new; the pair is
                  called <strong>dependent</strong>.
                </p>
              ),
            },
            {
              id: 'origin',
              label: 'Only the origin: the two arrows cancel each other out.',
              correct: false,
              explain: (
                <p className="m-0">
                  They cancel only for some choices, such as a = 1.5 and b = 1. With a = 1 and b =
                  0 you get u itself, which is not the origin. The span is everything you can
                  reach with <em>some</em> choice of a and b.
                </p>
              ),
            },
            {
              id: 'segment',
              label: 'Only the points on the segment between the two tips.',
              correct: false,
              explain: (
                <p className="m-0">
                  That would be true if a and b had to be between 0 and 1 and add up to 1. Here
                  they can be any numbers, as large or as negative as you like, so the points run
                  off along the whole line in both directions.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="A combination is a matrix times a vector"
        visual={
          <>
            <Plane label="The grid built from u and v; the point w sits at grid address (a, b)">
              <TransformedGrid matrix={M} color={COLOR.grid} />
              <Arrow tip={au} color={COLOR.i} label={`${fmt(a)}u`} labelAt="middle" />
              <Arrow tail={au} tip={w} color={COLOR.j} label={`${fmt(b)}v`} labelAt="middle" />
              <Arrow tip={w} color={COLOR.v} label="w" />
            </Plane>
            <Readout>
              The blue grid is made of whole steps of <Tag color={COLOR.i}>u</Tag> and{' '}
              <Tag color={COLOR.j}>v</Tag>. <Tag color={COLOR.v}>w</Tag> = {fmtVec(w)} sits at
              grid address ({fmt(a)}, {fmt(b)}). The matrix [u v] has rank {rank}: the span is{' '}
              {rankMeaning(rank)}.
            </Readout>
            <div className="mt-4">
              <NumpySnippet
                code={code}
                output={`${numpyPrint1d(numpyCombine(a, u, b, v), integer)}\n${rank}`}
              />
            </div>
          </>
        }
      >
        <p>
          These are your u, v, a and b from step 2
          {useV ? '' : ' (with v switched back on)'}. Written out entry by entry:
        </p>
        <Tex block>
          {String.raw`${p(a)}\,\textcolor{${COLOR.i}}{${col(u)}} + ${p(b)}\,\textcolor{${COLOR.j}}{${col(v)}} = ${col(w)}`}
        </Tex>
        <p>
          Stand u and v side by side as the columns of a matrix, and the same sum is that matrix
          times the vector (a, b). Keep this in mind for lesson 4.1,{' '}
          <Link to="/lessons/matrices-as-transformations">Matrices as transformations</Link>: there
          the columns say where the two basis arrows land, and (a, b) is the grid address.
        </p>
        <Tex block>
          {String.raw`\begin{bmatrix} \textcolor{${COLOR.i}}{${fmt(u[0])}} & \textcolor{${COLOR.j}}{${fmt(v[0])}} \\ \textcolor{${COLOR.i}}{${fmt(u[1])}} & \textcolor{${COLOR.j}}{${fmt(v[1])}} \end{bmatrix} \begin{bmatrix} ${fmt(a)} \\ ${fmt(b)} \end{bmatrix} = ${col(w)}`}
        </Tex>
        <p>So the span is simply every place this grid can reach:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            <strong>u and v on different lines</strong> (<em>independent</em>): the grid covers the
            plane. Every point has an address, so the span is the whole plane. Two such vectors
            form a <strong>basis</strong>: a set of directions that can describe any point, each
            in exactly one way.
          </li>
          <li>
            <strong>u and v on the same line</strong> (<em>dependent</em>): the grid is squashed
            onto that line, and so is the span.
          </li>
          <li>
            <strong>One vector</strong> on its own reaches only its line; the zero vector reaches
            only the origin.
          </li>
        </ul>
        <p>
          NumPy’s <code>np.column_stack</code> puts arrays side by side as columns, and{' '}
          <code>np.linalg.matrix_rank</code> counts how many independent directions they give: 2
          means the plane, 1 a line, 0 just the origin.
        </p>
        <p className="text-sm text-muted">
          In higher dimensions the same idea holds: 768 numbers per vector need 768 independent
          directions to reach everything, and the rank tells you how many you actually have.
        </p>
      </Step>

      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The <Link to="/playground">playground</Link> lets you drag basis vectors freely and watch
          the grid they build.
        </p>
      </footer>
    </article>
  )
}
