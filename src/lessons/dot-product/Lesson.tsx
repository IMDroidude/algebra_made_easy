import { Circle } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, DraggableArrow, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { apply2, dot, norm, rotation2 } from '../../linalg'
import type { Vec2 } from '../../linalg'
import {
  angleBetweenDeg,
  cosineSimilarity,
  dotSign,
  normalize,
  projectOnto,
  scalarProjection,
} from '../../linalg/projection'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import { AngleArc, Shadow } from './Drawings'
import { PracticeStep } from './PracticeStep'
import {
  PREDICT_A,
  PREDICT_B,
  SEE_A,
  SEE_B,
  SIGN_TEXT,
  p,
  understandSnippet,
} from './content'
import { pyFixed } from './pyFormat'

export function Lesson() {
  const [a, setA] = useState<Vec2>([4, 1])
  const [b, setB] = useState<Vec2>([2, 3])
  const [showAngle, setShowAngle] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const sweep = useTween(1600)

  const d = dot(a, b)
  const sign = dotSign(a, b)
  const angle = angleBetweenDeg(a, b)
  const cos = cosineSimilarity(a, b)
  const shadowLen = scalarProjection(b, a)
  const proj = projectOnto(b, a)
  const aHat = normalize(a)
  const bHat = normalize(b)
  const understand = understandSnippet(a, b)

  // Step 3: once the prediction is locked in, b sweeps from a's direction to a quarter turn.
  const predictB = revealed ? apply2(rotation2(90 * sweep.t), PREDICT_A) : PREDICT_B
  const predictDot = dot(PREDICT_A, predictB)

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="dot-product">
        The dot product turns two arrows into one number that says how much they point the same
        way. By the end of this lesson you will be able to read its sign at a glance, and you
        will know how search engines and chatbots use it to find text with a similar meaning.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="One arrow casts a shadow on another"
        visual={
          <>
            <Plane label="Vector a along the x-axis, vector b, and the shadow of b on a">
              <Shadow a={SEE_A} b={SEE_B} />
              <Arrow tip={SEE_A} color={COLOR.j} label="a" />
              <Arrow tip={SEE_B} color={COLOR.v} label="b" />
            </Plane>
            <Readout>
              <Tag color={COLOR.j}>a</Tag> = {fmtVec(SEE_A)}, <Tag color={COLOR.v}>b</Tag> ={' '}
              {fmtVec(SEE_B)}. Shine a light straight down onto the line through a: b&rsquo;s{' '}
              <Tag color={COLOR.result}>shadow</Tag> runs from the origin to{' '}
              {fmtVec(projectOnto(SEE_B, SEE_A) ?? [0, 0])}, length{' '}
              {fmt(scalarProjection(SEE_B, SEE_A) ?? 0)}. The dot product a · b ={' '}
              {fmt(dot(SEE_A, SEE_B))} = {fmt(norm(SEE_A))} × {fmt(scalarProjection(SEE_B, SEE_A) ?? 0)}.
            </Readout>
          </>
        }
      >
        <p>
          Two vectors <Tag color={COLOR.j}>a</Tag> and <Tag color={COLOR.v}>b</Tag> start at the
          same place. How much does b go <em>in a&rsquo;s direction</em>? Shine a light at right
          angles onto the line through a, and look at the{' '}
          <Tag color={COLOR.result}>shadow</Tag> b casts on it.
        </p>
        <p>
          Here a = {fmtVec(SEE_A)} and b = {fmtVec(SEE_B)}. The shadow is{' '}
          {fmt(scalarProjection(SEE_B, SEE_A) ?? 0)} long. Multiply that by the length of a,{' '}
          {fmt(norm(SEE_A))}, and you get {fmt(dot(SEE_A, SEE_B))}. That number is the{' '}
          <strong>dot product</strong>, written a · b.
        </p>
        <p>
          There is a much quicker way to get it, with no shadows or lengths: multiply the matching
          entries and add them up.
        </p>
        <Tex block>
          {String.raw`\mathbf{a}\cdot\mathbf{b} = ${SEE_A[0]}\cdot ${SEE_B[0]} + ${SEE_A[1]}\cdot ${SEE_B[1]} = ${dot(SEE_A, SEE_B)}`}
        </Tex>
        <p>
          Both routes always give the same answer. The rest of this lesson shows why, and why AI
          systems compute millions of these every second.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Drag the arrows and watch the sign"
        visual={
          <>
            <Plane label="Two draggable vectors a and b, with the shadow of b on the line through a">
              <Shadow a={a} b={b} />
              {showAngle && <AngleArc a={a} b={b} label="θ" />}
              <DraggableArrow value={a} onChange={setA} color={COLOR.j} label="a" />
              <DraggableArrow value={b} onChange={setB} color={COLOR.v} label="b" />
            </Plane>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Toggle checked={showAngle} onChange={setShowAngle}>
                Show the angle θ
              </Toggle>
              <p className="m-0 text-sm">
                a · b = <strong className="font-mono text-base">{fmt(d)}</strong>{' '}
                <span
                  className={`rounded-md border px-2 py-0.5 font-semibold ${
                    sign === 'positive' ? 'border-ok text-ok' : sign === 'negative' ? 'border-bad text-bad' : 'border-line'
                  }`}
                >
                  {sign}
                </span>
              </p>
            </div>
            <Readout>
              <Tag color={COLOR.j}>a</Tag> = {fmtVec(a)} (length {fmt(norm(a))}),{' '}
              <Tag color={COLOR.v}>b</Tag> = {fmtVec(b)} (length {fmt(norm(b))}).{' '}
              {angle === null ? (
                <strong>
                  One of the arrows has length 0. A zero vector has no direction, so there is no
                  angle and no shadow. The dot product is 0.
                </strong>
              ) : (
                <>
                  Angle θ = {fmt(angle, 1)}°. a · b = {fmt(d)}, {SIGN_TEXT[sign]}
                  {shadowLen !== null && proj && (
                    <>
                      {' '}
                      (<Tag color={COLOR.result}>shadow</Tag> length {fmt(shadowLen)}, ending at{' '}
                      {fmtVec(proj)})
                    </>
                  )}
                  .
                </>
              )}
            </Readout>
          </>
        }
      >
        <p>
          Drag the tips of <Tag color={COLOR.j}>a</Tag> and <Tag color={COLOR.v}>b</Tag> (or click
          one and use the arrow keys). The <Tag color={COLOR.result}>shadow</Tag> of b on the line
          through a follows. Try to:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>make the dot product as big as you can,</li>
          <li>make it exactly 0 without either arrow being zero,</li>
          <li>make it negative. Which way does the shadow point now?</li>
        </ul>
        <p>The sign of the dot product tells you about the angle θ between the arrows:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            <strong>positive</strong>: θ is less than 90°, the arrows lean the same way;
          </li>
          <li>
            <strong>zero</strong>: θ is exactly 90°, they are <em>perpendicular</em> (also called{' '}
            <em>orthogonal</em>);
          </li>
          <li>
            <strong>negative</strong>: θ is more than 90°, they lean apart.
          </li>
        </ul>
        <p>
          Now make b longer without turning it. The sign stays, but the number grows: the dot
          product mixes up <em>direction</em> and <em>length</em>. Step 4 separates them.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: what is a · b here?"
        visual={
          <>
            <Plane label="Vector a = (3, 1) and vector b = (−1, 3)">
              {revealed && <Shadow a={PREDICT_A} b={predictB} />}
              {revealed && <AngleArc a={PREDICT_A} b={predictB} label="θ" />}
              <Arrow tip={PREDICT_A} color={COLOR.j} label="a" />
              <Arrow tip={predictB} color={COLOR.v} label="b" />
            </Plane>
            <Readout>
              {revealed
                ? `b is at ${fmtVec(predictB)}, ${fmt(angleBetweenDeg(PREDICT_A, predictB) ?? 0, 0)}° from a. a · b = ${fmt(predictDot)}.`
                : `a = ${fmtVec(PREDICT_A)} and b = ${fmtVec(PREDICT_B)}. The shadow and the dot product stay hidden until you lock in a prediction.`}
            </Readout>
          </>
        }
      >
        <p>Both arrows have the same length, √10 ≈ {fmt(norm(PREDICT_A))}:</p>
        <Tex block>
          {String.raw`\mathbf{a} = \begin{bmatrix} ${PREDICT_A[0]} \\ ${PREDICT_A[1]} \end{bmatrix}, \qquad \mathbf{b} = \begin{bmatrix} ${PREDICT_B[0]} \\ ${PREDICT_B[1]} \end{bmatrix}`}
        </Tex>
        <Predict
          question="What is a · b?"
          onReveal={() => {
            setRevealed(true)
            sweep.play()
          }}
          onRetry={() => {
            setRevealed(false)
            sweep.reset(0)
          }}
          options={[
            {
              id: 'vector',
              label: 'The vector (−3, 3)',
              correct: false,
              explain: (
                <p className="m-0">
                  You multiplied the matching entries, 3 · (−1) = −3 and 1 · 3 = 3, which is the
                  right start. The dot product then <strong>adds</strong> them: −3 + 3 = 0. It is
                  always a single number, never a vector.
                </p>
              ),
            },
            {
              id: 'ten',
              label: '10, the two lengths multiplied',
              correct: false,
              explain: (
                <p className="m-0">
                  |a| |b| = √10 · √10 = 10 is the dot product only when the arrows point exactly
                  the same way. In general a · b = |a| |b| cos θ, and here θ = 90°, where cos θ =
                  0. Watch b sweep away from a: the shadow shrinks to nothing.
                </p>
              ),
            },
            {
              id: 'neg',
              label: 'Negative, because b points to the left',
              correct: false,
              explain: (
                <p className="m-0">
                  The sign depends on the angle <em>between</em> the arrows, not on where b points
                  on its own. b leans left, but a leans up a little, and the two effects cancel
                  exactly: 3 · (−1) + 1 · 3 = 0.
                </p>
              ),
            },
            {
              id: 'zero',
              label: '0',
              correct: true,
              explain: (
                <p className="m-0">
                  3 · (−1) + 1 · 3 = 0. b is a quarter turn of a, so the angle is 90° and b casts
                  no shadow on a. Zero dot product is the test for &ldquo;at right angles&rdquo;,
                  however long the arrows are.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="Length, direction, and cosine similarity"
        visual={
          <>
            <Plane
              label="The unit circle with a-hat and b-hat, the length-1 versions of a and b"
              extent={1.6}
            >
              <Circle center={[0, 0]} radius={1} color={COLOR.ghost} fillOpacity={0} weight={1.5} />
              {aHat && bHat && <Shadow a={aHat} b={bHat} label="cos θ" reach={3} labelGap={0.18} />}
              {aHat && <Arrow tip={aHat} color={COLOR.j} label="â" />}
              {bHat && <Arrow tip={bHat} color={COLOR.v} label="b̂" />}
            </Plane>
            <Readout>
              {aHat && bHat && cos !== null ? (
                <>
                  <Tag color={COLOR.j}>â</Tag> = a / {fmt(norm(a))} = {fmtVec(aHat)},{' '}
                  <Tag color={COLOR.v}>b̂</Tag> = b / {fmt(norm(b))} = {fmtVec(bHat)}. Both have
                  length 1. The shadow of b̂ on â is {pyFixed(cos, 3)} long: that is cos θ, the
                  cosine similarity of a and b.
                </>
              ) : (
                <strong>
                  A vector of length 0 cannot be scaled to length 1 (that would mean dividing by
                  0), so it has no unit version and the cosine similarity is undefined. Drag both
                  arrows in step 2 away from the origin.
                </strong>
              )}
            </Readout>
            <div className="mt-4">
              <NumpySnippet code={understand.code} output={understand.output} />
              {understand.warns && (
                <p className="mt-2 text-sm text-muted">
                  NumPy also prints a warning on the error stream,{' '}
                  <code>RuntimeWarning: invalid value encountered in scalar divide</code>: it was
                  asked for 0 / 0, and <code>nan</code> means &ldquo;not a number&rdquo;.
                </p>
              )}
            </div>
          </>
        }
      >
        <p>
          These are your own <Tag color={COLOR.j}>a</Tag> = {fmtVec(a)} and{' '}
          <Tag color={COLOR.v}>b</Tag> = {fmtVec(b)} from step 2. The dot product multiplies
          matching entries and adds:
        </p>
        <Tex block>
          {String.raw`\mathbf{a}\cdot\mathbf{b} = a_1 b_1 + a_2 b_2 = ${p(a[0])}\cdot${p(b[0])} + ${p(a[1])}\cdot${p(b[1])} = ${fmt(d)}`}
        </Tex>
        <p>
          <strong>Length.</strong> Dot a vector with itself and you get its squared length
          (Pythagoras). The length is written |a|:
        </p>
        <Tex block>
          {String.raw`|\mathbf{a}| = \sqrt{\mathbf{a}\cdot\mathbf{a}} = \sqrt{${p(a[0])}^2 + ${p(a[1])}^2} = ${fmt(norm(a))}`}
        </Tex>
        <p>
          <strong>Direction.</strong> Divide a vector by its own length and you get a{' '}
          <em>unit vector</em> (length 1) pointing the same way, written â. This is called{' '}
          <em>normalising</em>. In the picture, â and b̂ both sit on the circle of radius 1.
        </p>
        <p>
          <strong>The geometric rule.</strong> The shadow picture and the multiply-and-add rule
          agree because of this identity, where θ is the angle between the arrows:
        </p>
        <Tex block>{String.raw`\mathbf{a}\cdot\mathbf{b} = |\mathbf{a}|\,|\mathbf{b}|\cos\theta`}</Tex>
        <p>
          Divide both lengths away and only the direction is left. That is{' '}
          <strong>cosine similarity</strong>: the dot product of the two unit vectors.
        </p>
        <Tex block>
          {cos === null
            ? String.raw`\cos\theta = \frac{\mathbf{a}\cdot\mathbf{b}}{|\mathbf{a}|\,|\mathbf{b}|} = \frac{${fmt(d)}}{${fmt(norm(a))} \cdot ${fmt(norm(b))}} \text{ : undefined}`
            : String.raw`\cos\theta = \hat{\mathbf{a}}\cdot\hat{\mathbf{b}} = \frac{\mathbf{a}\cdot\mathbf{b}}{|\mathbf{a}|\,|\mathbf{b}|} = \frac{${fmt(d)}}{${fmt(norm(a))} \cdot ${fmt(norm(b))}} = ${pyFixed(cos, 3)}`}
        </Tex>
        <p>
          It is always between −1 and 1: 1 for the same direction, 0 for a right angle, −1 for
          opposite directions. Make b twice as long and the dot product doubles, but the cosine
          similarity does not move.
        </p>
        <p>
          In NumPy, <code>@</code> between two 1D arrays is the dot product, and{' '}
          <code>np.linalg.norm</code> is the length. <code>f&quot;{'{cos:.3f}'}&quot;</code> is
          plain Python: it prints a number with 3 decimals.
        </p>
      </Step>

      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <footer className="border-t border-line pt-8">
        <h2 className="m-0 font-display text-2xl">Keep experimenting</h2>
        <p className="mt-2 max-w-[62ch]">
          The next lesson, <Link to="/lessons/matrices-as-transformations">matrices as
          transformations</Link>, uses the dot product without saying so: each entry of a
          matrix times a vector is the dot product of one row with that vector.
        </p>
      </footer>
    </article>
  )
}
