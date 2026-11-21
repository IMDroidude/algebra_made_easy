import { useState } from 'react'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { approxEqualVec, isZero, scale } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import {
  A3,
  B3,
  CAFE,
  HOME,
  MANIP_POINT,
  MANIP_TAIL,
  MANIP_V,
  SEE_WALK,
  SEE_WALK_FROM,
  SHOP,
  START_A,
  START_B,
  V3,
  clean,
  directions,
  howFar,
  isWholeLength,
  moveBy,
  understandCode,
  understandOutput,
  vectorFrom,
} from './model'
import { StartHandle, TripArrow } from './parts'
import { PracticeStep } from './PracticeStep'

const BIG = 420

/** Wraps negative numbers in brackets so sums read correctly: 1 − (−2). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

/** Fixed starting places for the "same vector, other places" copies in step 2. */
const COPY_TAILS: Vec2[] = [
  [-4, 1.5],
  [0.5, -4],
  [1, 0.5],
]

export function Lesson() {
  // Step 2
  const [tail, setTail] = useState<Vec2>(MANIP_TAIL)
  const [v, setV] = useState<Vec2>(MANIP_V)
  const [pt, setPt] = useState<Vec2>(MANIP_POINT)
  const [showCopies, setShowCopies] = useState(false)
  // Step 3
  const reveal = useTween(1400)
  // Step 4
  const [a, setA] = useState<Vec2>(START_A)
  const [b, setB] = useState<Vec2>(START_B)
  const [showPosition, setShowPosition] = useState(false)
  const [showWalk, setShowWalk] = useState(false)

  const tip = moveBy(tail, v)
  const tailMoved = !approxEqualVec(tail, MANIP_TAIL)
  const vChanged = !approxEqualVec(v, MANIP_V)
  const pointMoved = !approxEqualVec(pt, MANIP_POINT)

  const sum = moveBy(HOME, SHOP)
  const trip = vectorFrom(HOME, SHOP)
  const growing = moveBy(HOME, scale(trip, reveal.t))

  const ab = vectorFrom(a, b)
  const corner: Vec2 = [b[0], a[1]]
  const len = howFar(ab)
  const whole = isWholeLength(ab)

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="points-and-vectors">
        A pair of numbers like (3, 2) can mean two different things: a <em>place</em> or a{' '}
        <em>movement</em>. By the end of this lesson you will be able to tell them apart, find the
        movement between two places, and say what you get when you add them.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="A place and a movement, written with the same numbers"
        layout="wide"
        visual={
          <>
            <Plane
              height={BIG}
              label="The café, a point at (3, 2), and an arrow for the movement 3 east, 2 north, drawn starting from (−4, −3)"
            >
              <PlaneLabel x={0} y={0} attach="nw" distance={8} size={13} color={COLOR.ghost}>
                origin
              </PlaneLabel>
              <TripArrow
                from={SEE_WALK_FROM}
                to={moveBy(SEE_WALK_FROM, SEE_WALK)}
                color={COLOR.v}
                label="walk (3, 2)"
              />
              <CoordPoint at={CAFE} color={COLOR.i} />
              <PlaneLabel x={CAFE[0]} y={CAFE[1]} attach="n" distance={10} size={16} color={COLOR.i}>
                café (3, 2)
              </PlaneLabel>
            </Plane>
            <Readout>
              <Tag color={COLOR.i}>The café</Tag> is the <strong>place</strong> (3, 2): 3 right of
              the origin and 2 up. <Tag color={COLOR.v}>The arrow</Tag> is the{' '}
              <strong>movement</strong> (3, 2): {directions(SEE_WALK)}. It is drawn here starting at{' '}
              {fmtVec(SEE_WALK_FROM)}, far from the café, and ends at{' '}
              {fmtVec(moveBy(SEE_WALK_FROM, SEE_WALK))}.
            </Readout>
          </>
        }
      >
        <p>
          Ask someone where the café is and they might say: &ldquo;the café is at (3, 2)&rdquo;.
          That is an <strong>address</strong>. It names one spot on the map. In maths this is
          called a <strong>point</strong>.
        </p>
        <p>
          Ask for directions instead and you get: &ldquo;walk 3 east, then 2 north&rdquo;. That is
          not a place. It is a <strong>movement</strong>, and it works from wherever you are
          standing. In maths this is called a <strong>vector</strong>, and we draw it as an arrow.
        </p>
        <p>
          Both are written with the same two numbers, (3, 2). That is exactly why people mix them
          up. The numbers are the same; the meaning is not.
        </p>
        <p>
          A simple test: if it answers &ldquo;<em>where?</em>&rdquo; it is a point. If it answers
          &ldquo;<em>which way, and how far?</em>&rdquo; it is a vector.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Move the arrow anywhere: it stays the same vector"
        layout="wide"
        visual={
          <>
            <Plane
              height={BIG}
              label="A vector v whose start and end can both be dragged, and a draggable point P"
            >
              {showCopies &&
                COPY_TAILS.map((t) => (
                  <TripArrow key={t.join()} from={t} to={moveBy(t, v)} color={COLOR.v} dashed opacity={0.45} />
                ))}
              <TripArrow from={tail} to={tip} color={COLOR.v} label="v" />
              <PlaneLabel x={tail[0]} y={tail[1]} attach="s" distance={12} size={13} color={COLOR.ghost}>
                start
              </PlaneLabel>
              <StartHandle value={tail} onChange={setTail} offsets={[v]} color={COLOR.ghost} />
              <DraggablePoint value={tip} onChange={(q) => setV(vectorFrom(tail, q))} color={COLOR.v} />
              <DraggablePoint value={pt} onChange={(q) => setPt(clean(q))} color={COLOR.i} />
              <PlaneLabel x={pt[0]} y={pt[1]} attach="ne" distance={12} size={16} color={COLOR.i}>
                {`P ${fmtVec(pt)}`}
              </PlaneLabel>
            </Plane>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Toggle checked={showCopies} onChange={setShowCopies}>
                Show the same v from other starting places
              </Toggle>
              <Button
                variant="secondary"
                onClick={() => {
                  setTail(MANIP_TAIL)
                  setV(MANIP_V)
                  setPt(MANIP_POINT)
                }}
              >
                Reset
              </Button>
            </div>
            <Readout>
              <Tag color={COLOR.v}>v</Tag> = {fmtVec(v)}: {directions(v)}. It starts at{' '}
              {fmtVec(tail)} and ends at {fmtVec(tip)}.
              {tailMoved && !vChanged && (
                <> You moved its start, but v is still {fmtVec(v)}: the same movement.</>
              )}{' '}
              <Tag color={COLOR.i}>P</Tag> is the place {fmtVec(pt)}
              {pointMoved ? <>, a different place from {fmtVec(MANIP_POINT)}.</> : '.'}
            </Readout>
          </>
        }
      >
        <p>
          A vector has a <strong>direction</strong> and a <strong>length</strong>, but no fixed
          starting place. &ldquo;Walk 3 east, 2 north&rdquo; means the same thing in Paris and in
          Tokyo.
        </p>
        <p>
          Drag the grey <strong>start</strong> of <Tag color={COLOR.v}>v</Tag> around the plane.
          The arrow slides with it, and its numbers do not change: it is still the same vector.
          Switch on the copies to see v drawn from three other places at once. All of them are v.
        </p>
        <p>
          Now drag the <strong>tip</strong> of v. That changes the movement itself, so the numbers
          change.
        </p>
        <p>
          Finally drag the point <Tag color={COLOR.i}>P</Tag>. A point is nothing <em>but</em> its
          place, so as soon as it moves its numbers change: it has become a different point.
        </p>
        <p className="text-sm text-muted">
          Keyboard: press Tab to reach a handle, then use the arrow keys.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: what is a place plus a place?"
        visual={
          <>
            <Plane height={380} label="Home at (3, 1) and the shop at (1, 3)">
              {reveal.t > 0 && (
                <>
                  <CoordPoint at={sum} color={COLOR.ghost} opacity={reveal.t} />
                  <PlaneLabel x={sum[0]} y={sum[1]} attach="ne" distance={10} size={15} color={COLOR.ghost}>
                    A + B = (4, 4) ?
                  </PlaneLabel>
                  <TripArrow
                    from={HOME}
                    to={growing}
                    color={COLOR.v}
                    label={reveal.t === 1 ? 'B − A' : undefined}
                  />
                </>
              )}
              <CoordPoint at={HOME} color={COLOR.j} />
              <PlaneLabel x={HOME[0]} y={HOME[1]} attach="se" distance={12} size={15} color={COLOR.j}>
                home A (3, 1)
              </PlaneLabel>
              <CoordPoint at={SHOP} color={COLOR.i} />
              <PlaneLabel x={SHOP[0]} y={SHOP[1]} attach="ne" distance={12} size={15} color={COLOR.i}>
                shop B (1, 3)
              </PlaneLabel>
            </Plane>
            <Readout>
              {reveal.t === 0
                ? 'Showing home A at (3, 1) and the shop B at (1, 3). Lock in a prediction to see more.'
                : `A + B lands on ${fmtVec(sum)}, a spot unrelated to either place. The movement from home to the shop is B − A = ${fmtVec(trip)}: ${directions(trip)}.`}
            </Readout>
          </>
        }
      >
        <p>
          Your <Tag color={COLOR.j}>home A</Tag> is at (3, 1) and the{' '}
          <Tag color={COLOR.i}>shop B</Tag> is at (1, 3). Both are places. Adding the numbers is
          easy:
        </p>
        <Tex block>{String.raw`A + B = (3 + 1,\; 1 + 3) = (4, 4)`}</Tex>
        <Predict
          question="What does (4, 4) tell you?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'halfway',
              label: 'The spot halfway between home and the shop.',
              correct: false,
              explain: (
                <p className="m-0">
                  Halfway between (3, 1) and (1, 3) is (2, 2), not (4, 4). Adding two places does
                  not find anything between them; (4, 4) is further out than both.
                </p>
              ),
            },
            {
              id: 'trip',
              label: 'How to get from home to the shop.',
              correct: false,
              explain: (
                <p className="m-0">
                  The trip from home to the shop is a <strong>subtraction</strong>: B − A = (1 − 3,
                  3 − 1) = (−2, 2), so 2 west and 2 north. Adding the two addresses does not give
                  you directions.
                </p>
              ),
            },
            {
              id: 'far',
              label: 'How far apart the two places are.',
              correct: false,
              explain: (
                <p className="m-0">
                  Distance is a single number, and it comes from the movement between the places,
                  B − A = (−2, 2). Adding the addresses mixes up where each place is with where
                  the origin happens to be.
                </p>
              ),
            },
            {
              id: 'nothing',
              label: 'Nothing useful. It is just some other spot on the map.',
              correct: true,
              explain: (
                <p className="m-0">
                  Right. An address only makes sense relative to the origin. Measure from a
                  different corner of town and home and the shop get new numbers, so their sum
                  lands somewhere else entirely. A real place cannot depend on that, so point +
                  point means nothing. What <em>does</em> make sense is point − point (a movement)
                  and point + movement (a new place).
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="From A to B is B − A"
        layout="wide"
        visual={
          <>
            <Plane height={BIG} label="Two draggable points A and B, with the vector from A to B">
              {showPosition && (
                <>
                  <TripArrow from={[0, 0]} to={a} color={COLOR.ghost} dashed />
                  <TripArrow from={[0, 0]} to={b} color={COLOR.ghost} dashed />
                </>
              )}
              {showWalk && !isZero(ab[0]) && (
                <TripArrow from={a} to={corner} color={COLOR.result} dashed label={directions([ab[0], 0])} side={ab[1] >= 0 ? 's' : 'n'} />
              )}
              {showWalk && !isZero(ab[1]) && (
                <TripArrow from={corner} to={b} color={COLOR.result} dashed label={directions([0, ab[1]])} side={ab[0] >= 0 ? 'e' : 'w'} />
              )}
              <TripArrow from={a} to={b} color={COLOR.v} label="v = B − A" />
              <DraggablePoint value={a} onChange={(q) => setA(clean(q))} color={COLOR.j} />
              <PlaneLabel x={a[0]} y={a[1]} attach="w" distance={14} size={16} color={COLOR.j}>
                A
              </PlaneLabel>
              <DraggablePoint value={b} onChange={(q) => setB(clean(q))} color={COLOR.i} />
              <PlaneLabel x={b[0]} y={b[1]} attach="e" distance={14} size={16} color={COLOR.i}>
                B
              </PlaneLabel>
            </Plane>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Toggle checked={showPosition} onChange={setShowPosition}>
                Show arrows from the origin (position vectors)
              </Toggle>
              <Toggle checked={showWalk} onChange={setShowWalk}>
                Show the walk along the grid
              </Toggle>
            </div>
            <Readout>
              <Tag color={COLOR.j}>A</Tag> = {fmtVec(a)}, <Tag color={COLOR.i}>B</Tag> ={' '}
              {fmtVec(b)}. The movement from A to B is <Tag color={COLOR.v}>v</Tag> = B − A ={' '}
              {fmtVec(ab)}: {directions(ab)}. It goes{' '}
              {whole ? `exactly ${fmt(len)}` : `about ${fmt(len, 1)}`} unit
              {whole && fmt(len) === '1' ? '' : 's'} in a straight line.
              {showPosition && (
                <>
                  {' '}
                  The arrow from the origin to A is {fmtVec(a)}, the same numbers as A.
                </>
              )}
            </Readout>
            <div className="mt-4">
              <NumpySnippet code={understandCode(a, b)} output={understandOutput(a, b)} />
            </div>
          </>
        }
      >
        <p>
          Drag <Tag color={COLOR.j}>A</Tag> and <Tag color={COLOR.i}>B</Tag>. The movement that
          takes you from A to B is &ldquo;where you end&rdquo; minus &ldquo;where you start&rdquo;:
        </p>
        <Tex block>
          {String.raw`\mathbf{v} = B - A = (${fmt(b[0])} - ${p(a[0])},\; ${fmt(b[1])} - ${p(a[1])}) = (${fmt(ab[0])}, ${fmt(ab[1])})`}
        </Tex>
        <p>Turn it around and you get the other rule. Point plus movement is a new point:</p>
        <Tex block>
          {String.raw`A + \mathbf{v} = (${fmt(a[0])} + ${p(ab[0])},\; ${fmt(a[1])} + ${p(ab[1])}) = (${fmt(b[0])}, ${fmt(b[1])}) = B`}
        </Tex>
        <p>
          <strong>The bridge.</strong> Switch on the arrows from the origin. The arrow from (0, 0)
          to A has exactly the same numbers as A, because A − (0, 0) = A. It is called A&rsquo;s{' '}
          <strong>position vector</strong>: &ldquo;how to walk from the origin to A&rdquo;. This is
          why maths and code happily treat points as vectors: once everyone agrees on the origin,
          an address <em>is</em> a walk from it.
        </p>
        <p>
          <strong>How far?</strong> The length of a vector is how far the movement goes in a
          straight line. Put A at (−2, −1) and B at (1, 3) and switch on the walk: 3 across and 4
          up, and the straight arrow is exactly 5 long, the famous 3-4-5 triangle. The general rule
          (<Tex>{String.raw`\sqrt{x^2 + y^2}`}</Tex>) comes properly in a later lesson.
        </p>
        <p>
          <strong>In 3D</strong> it works the same way, with three numbers. From A = (
          {A3.join(', ')}) to B = ({B3.join(', ')}) the movement is B − A = ({V3.join(', ')}).
        </p>
        <p>
          In the code, <code>B - A</code> and <code>A + v</code> subtract and add the numbers one
          position at a time, exactly as above. <code>np.linalg.norm(v)</code> gives the length.
        </p>
      </Step>

      <ApplyStep />
      <HouseExample />
      <PracticeStep />
    </article>
  )
}
