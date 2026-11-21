import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { approxEqual, isZero } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { Chooser } from './Chooser'
import { DimensionPicture } from './DimensionPicture'
import { HouseExample } from './HouseExample'
import { LinePlane } from './LinePlane'
import {
  PREDICT_ORIGIN_FROM,
  PREDICT_ORIGIN_TO,
  PREDICT_PLACE,
  SEE_POINT,
  SEE_SCENES,
  beadCode,
  bracket,
  describeNumber,
  numberOf,
  pointText,
  ruleText,
  seeSentence,
  signed,
} from './model'
import type { Dims } from './model'
import { PracticeStep } from './PracticeStep'

const DIM_OPTIONS = [
  [1, '1D · wire'],
  [2, '2D · floor'],
  [3, '3D · room'],
] as const

export function Lesson() {
  const [dims, setDims] = useState<Dims>(1)
  const [place, setPlace] = useState(3)
  const [origin, setOrigin] = useState(0)
  const [moveOrigin, setMoveOrigin] = useState(false)
  const reveal = useTween(1600)

  const n = numberOf(place, origin)
  const moved = !isZero(origin)
  const scene = SEE_SCENES[dims]
  const predictOrigin = PREDICT_ORIGIN_FROM + (PREDICT_ORIGIN_TO - PREDICT_ORIGIN_FROM) * reveal.t
  const predictNumber = numberOf(PREDICT_PLACE, PREDICT_ORIGIN_TO)
  const bead = beadCode(place, origin)
  const ruleTex = String.raw`\textcolor{${COLOR.v}}{${signed(n)}} = ${signed(place)} - \textcolor{${COLOR.result}}{${bracket(origin)}}`

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="dimensions-and-origin">
        Before any maths: how do you say <em>where</em> something is? By the end of this lesson you
        will be able to explain what a dimension is, what an origin is, and why a list of numbers
        can describe a place.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="How many numbers does it take?"
        layout="wide"
        visual={
          <>
            <Chooser label="How many directions" options={DIM_OPTIONS} value={dims} onChange={setDims} />
            <p className="mt-4 mb-2 text-sm font-semibold text-muted">
              {scene.title}: {dims} {dims === 1 ? 'number' : 'numbers'}
            </p>
            <div className="rounded-xl border border-line bg-surface p-3">
              <DimensionPicture
                dims={dims}
                values={SEE_POINT}
                axes={scene.axes}
                pointLabel={`${scene.thing} ${pointText(SEE_POINT, dims)}`}
                label={`${scene.title}, with ${dims} ${dims === 1 ? 'direction' : 'directions'} to move in`}
              />
            </div>
            <Readout>{seeSentence(dims)}</Readout>
          </>
        }
      >
        <p>
          Picture a bead threaded on a straight wire, or a car on a long straight road. It can only
          go forwards or backwards. To say where it is, you need just <strong>one number</strong>:
          how far along it is.
        </p>
        <p>
          An ant on a floor can also go sideways, so it needs <strong>two numbers</strong>. A drone
          in a room can also go up, so it needs <strong>three</strong>. Use the buttons to step
          from one to three.
        </p>
        <p>
          Each new way to move that is not a mix of the old ones is called a{' '}
          <strong>dimension</strong>. So a dimension is one independent direction, and the number of
          dimensions is how many numbers you need to say where something is.
        </p>
        <p>
          Every picture also has a green dot marked <Tag color={COLOR.result}>origin</Tag>. That is
          the spot all the numbers are counted from. The next steps are about that dot.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Slide the bead, then move the origin"
        layout="wide"
        visual={
          <>
            <LinePlane
              label="A number line with a draggable bead and an origin"
              place={place}
              origin={origin}
              onPlace={setPlace}
              onOrigin={moveOrigin ? setOrigin : undefined}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Toggle checked={moveOrigin} onChange={setMoveOrigin}>
                Let me move the origin too
              </Toggle>
              {moved && (
                <Button variant="secondary" onClick={() => setOrigin(0)}>
                  Put the origin back
                </Button>
              )}
            </div>
            <Readout>
              The <Tag color={COLOR.v}>bead</Tag>&rsquo;s number is {signed(n)}: it is {describeNumber(n)}.
              {moved &&
                ` Counted from the first origin it would be ${signed(place)}. The bead has not moved; only the starting point has.`}
            </Readout>
          </>
        }
      >
        <p>
          Drag the <Tag color={COLOR.v}>bead</Tag>, or click it and use the left and right arrow
          keys. Watch its number.
        </p>
        <p>
          Right of the <Tag color={COLOR.result}>origin</Tag> the numbers are positive. Left of it
          they are <strong>negative</strong>: &minus;3 means &ldquo;3 steps, the other way&rdquo;.
          It is just as far away as 3, and just as real.
        </p>
        <p>
          Now tick &ldquo;Let me move the origin too&rdquo; and drag the green pin under the wire.
          The bead stays put, but every number on the line changes, including the bead&rsquo;s.
        </p>
        <p>Try to:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>give the bead a negative number,</li>
          <li>put the bead exactly on the origin. What is its number?</li>
          <li>without touching the bead, move the origin until the bead reads 1.</li>
        </ul>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: move the origin"
        visual={
          <>
            <LinePlane
              label="A bead at 3 while the origin moves 4 steps to the right"
              place={PREDICT_PLACE}
              origin={predictOrigin}
              ghostOrigin={reveal.t > 0 ? PREDICT_ORIGIN_FROM : undefined}
            />
            <Readout>
              {reveal.t === 0
                ? `The bead is at ${signed(PREDICT_PLACE)}. Lock in a prediction to move the origin ${PREDICT_ORIGIN_TO} steps to the right.`
                : reveal.t === 1
                  ? `The origin is now ${PREDICT_ORIGIN_TO} steps to the right. The bead has not moved, and its number is ${signed(predictNumber)}: ${describeNumber(predictNumber)}.`
                  : 'The origin is moving to the right…'}
            </Readout>
          </>
        }
      >
        <p>
          The bead sits at {signed(PREDICT_PLACE)}. Nobody touches it. You pick up the origin and
          put it down {PREDICT_ORIGIN_TO} steps to the right.
        </p>
        <Predict
          question="What happens?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'moves',
              label: `The bead slides ${PREDICT_ORIGIN_TO} steps right along with the origin, and still reads ${signed(PREDICT_PLACE)}.`,
              correct: false,
              explain: (
                <p className="m-0">
                  The origin is a choice of where to start counting, not a handle on the bead. Moving
                  it changes the numbers, never the place. The bead is exactly where it was; only its
                  label changes.
                </p>
              ),
            },
            {
              id: 'same',
              label: `Nothing changes: the bead still reads ${signed(PREDICT_PLACE)}, because it did not move.`,
              correct: false,
              explain: (
                <p className="m-0">
                  A number on the line means &ldquo;how far from the origin, and which way&rdquo;.
                  The bead did not move, but the origin did, so the distance between them changed.
                  The number belongs to the pair (bead, origin), not to the bead alone.
                </p>
              ),
            },
            {
              id: 'add',
              label: `The bead stays put and now reads ${signed(PREDICT_PLACE + PREDICT_ORIGIN_TO)}.`,
              correct: false,
              explain: (
                <p className="m-0">
                  That adds the shift. But the origin moved <em>towards</em> the bead and past it, so
                  the bead got closer, not further. Count from the new origin: the bead is now 1 step
                  to its <strong>left</strong>.
                </p>
              ),
            },
            {
              id: 'right',
              label: `The bead stays put and now reads ${signed(predictNumber)}.`,
              correct: true,
              explain: (
                <p className="m-0">
                  The new origin is at the old 4. The bead, at the old 3, is 1 step to its left, so
                  its number is &minus;1. A negative number is not smaller or less real: it is a
                  direction, &ldquo;left of the origin&rdquo;.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="A number means: how far, and which way"
        visual={
          <>
            <LinePlane
              label="The bead and the origin, with an arrow from the origin to the bead"
              place={place}
              origin={origin}
              onPlace={setPlace}
              onOrigin={setOrigin}
              ghostOrigin={moved ? 0 : undefined}
              showDistance
              beadLabel={false}
            />
            <Readout>
              The arrow from the <Tag color={COLOR.result}>origin</Tag> to the{' '}
              <Tag color={COLOR.v}>bead</Tag> is {signed(Math.abs(n))} {approxEqual(Math.abs(n), 1) ? 'step' : 'steps'}{' '}
              long and points {isZero(n) ? 'nowhere (they are in the same place)' : n > 0 ? 'right' : 'left'}, so the
              bead&rsquo;s number is {signed(n)}. In numbers: {ruleText(place, origin)}.
            </Readout>
            <div className="mt-4">
              <NumpySnippet code={bead.code} output={bead.output} />
            </div>
          </>
        }
      >
        <p>
          This is the same bead and origin as in step 2. Here you can drag both. A position on a
          line is a <strong>coordinate</strong>: one number that says where the bead is, measured
          from the origin.
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            The <strong>size</strong> of the number is how far: the length of the arrow.
          </li>
          <li>
            The <strong>sign</strong> is which way: + for right, &minus; for left.
          </li>
          <li>
            The <strong>origin</strong> is the agreed starting point. Its own number is always 0.
          </li>
        </ul>
        <p>
          If you write the bead&rsquo;s place and the origin&rsquo;s place in the same old numbering
          (from the first origin), the bead&rsquo;s new number is a subtraction:
        </p>
        <Tex block>
          {String.raw`\textcolor{${COLOR.v}}{\text{bead's number}} = \text{bead's place} - \textcolor{${COLOR.result}}{\text{origin's place}}`}
        </Tex>
        <Tex block>{ruleTex}</Tex>
        <p>
          In code, a position is a list of numbers, one per dimension. NumPy keeps such a list in an
          array: <code>np.array([3])</code> is a list with one number. Subtracting two arrays
          subtracts number by number, and <code>.shape</code> tells you how many numbers there are:{' '}
          <code>(1,)</code> means &ldquo;one number&rdquo;, so one dimension. (The comma is just how
          Python writes a list of length one.)
        </p>
      </Step>

      <ApplyStep />
      <HouseExample />
      <PracticeStep />

      <section aria-labelledby="whats-next" className="border-t border-line py-10">
        <h2 id="whats-next" className="mt-0 mb-3 font-display text-2xl">
          Next: two numbers, on a flat plane
        </h2>
        <div className="prose-lesson max-w-[62ch]">
          <p>
            You have seen one number on a line, counted from an origin. The next lesson,{' '}
            <Link to="/lessons/coordinate-plane">1.2: The coordinate plane</Link>, lays a second
            number line across the first, through the same origin, and shows how to read and place
            any point with two numbers (x, y).
          </p>
        </div>
      </section>
    </article>
  )
}
