import { useState } from 'react'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import type { Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { HouseExample } from './HouseExample'
import { DirChoice, LivingRoom, OriginChoice, UnitChoice } from './LivingRoom'
import { PracticeStep } from './PracticeStep'
import { Recap } from './Recap'
import {
  LAMP,
  ORIGINS,
  PREDICT_FROM,
  PREDICT_TO,
  START_FRAME,
  THINGS,
  TILE,
  UNIT_NAME,
  pairText,
  presetAt,
  slide,
  toLocal,
  understandCode,
  understandOutput,
  walkWords,
} from './positions'
import type { Frame, Unit } from './positions'

export function Lesson() {
  const [frame, setFrame] = useState<Frame>(START_FRAME)
  const [uOrigin, setUOrigin] = useState(ORIGINS[1])
  const [uUnit, setUUnit] = useState<Unit>('m')
  const reveal = useTween(1400)

  const lamp = toLocal(LAMP.at, frame)
  const where = presetAt(frame.origin)
  const predictOrigin = slide(PREDICT_FROM, PREDICT_TO, reveal.t)
  const predictFrame: Frame = { origin: predictOrigin, unit: 'm', yDir: 'up' }
  const predictLamp = toLocal(LAMP.at, predictFrame)
  const uFrame: Frame = { origin: uOrigin.at, unit: uUnit, yDir: 'up' }
  const uLamp = toLocal(LAMP.at, uFrame)
  const uLampM = toLocal(LAMP.at, { ...uFrame, unit: 'm' })
  const tex = (v: Vec2) => `(${fmt(v[0])},\\ ${fmt(v[1])})`

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="real-world-positions">
        A chair, a chess piece, a cinema seat, a drone, even an apple: anything can be given an
        address made of numbers. By the end of this lesson you will know the three choices that
        make that possible, and why the same thing can have many different addresses.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="The recipe for an address"
        visual={
          <>
            <LivingRoom
              label="Floor plan of a living room seen from above, with the origin in the bottom-left corner and a lamp"
              frame={START_FRAME}
              things={[LAMP]}
              walkTo={LAMP}
            />
            <Readout>
              Origin in the bottom-left corner, x to the right, y up the map, unit metres. The{' '}
              <Tag color={COLOR.v}>lamp</Tag> is at (5, 3): 5 m right and 3 m up from the corner.
            </Readout>
          </>
        }
      >
        <p>
          Here is a living room, seen from above. Where is the lamp? &ldquo;Over there&rdquo; is
          not much use to a computer. To turn a place into numbers you make three choices:
        </p>
        <ol className="mt-0 mb-4 list-decimal pl-6">
          <li>
            <strong>An origin</strong>: the spot that counts as zero. Here, the bottom-left corner.
          </li>
          <li>
            <strong>Directions for the axes</strong>: <Tag color={COLOR.i}>x</Tag> points right
            along the bottom wall, <Tag color={COLOR.j}>y</Tag> points up the map.
          </li>
          <li>
            <strong>A unit</strong>: how long one step is. Here, one metre.
          </li>
        </ol>
        <p>
          Now the position is just a list of numbers: walk 5 m along x, then 3 m along y, and you
          reach the <Tag color={COLOR.v}>lamp</Tag>. Its address is <strong>(5, 3)</strong>.
        </p>
        <p>
          You have used this recipe all through Module 1. This lesson takes it out into the real
          world.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Same lamp, different numbers"
        layout="wide"
        visual={
          <>
            <LivingRoom
              label="Living room floor plan with a draggable origin, the axes drawn from it, and the lamp"
              frame={frame}
              things={[LAMP]}
              walkTo={LAMP}
              onOriginChange={(origin) => setFrame({ ...frame, origin })}
            />
            <OriginChoice origin={frame.origin} onChange={(origin) => setFrame({ ...frame, origin })} />
            <DirChoice yDir={frame.yDir} onChange={(yDir) => setFrame({ ...frame, yDir })} />
            <UnitChoice unit={frame.unit} onChange={(unit) => setFrame({ ...frame, unit })} />
            <div className="mt-3">
              <Button variant="secondary" onClick={() => setFrame(START_FRAME)}>
                Reset
              </Button>
            </div>
            <Readout>
              Origin at {where ? where.name : 'a spot you chose'}, y {frame.yDir} the map, unit{' '}
              {UNIT_NAME[frame.unit]}. The <Tag color={COLOR.v}>lamp</Tag> is at{' '}
              <strong>{pairText(lamp)}</strong>: {walkWords(lamp, frame)}. The lamp itself has not
              moved.
            </Readout>
          </>
        }
      >
        <p>
          The three choices are yours. Drag the green <Tag color={COLOR.result}>origin</Tag> (or
          click it and use the arrow keys), or use the buttons, and watch the{' '}
          <Tag color={COLOR.v}>lamp</Tag>&rsquo;s numbers.
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>Put the origin on the lamp. What are its numbers now?</li>
          <li>Put the origin to the right of the lamp. Which number turns negative?</li>
          <li>
            Switch to floor tiles. Every tile is half a metre, so every number doubles.
          </li>
          <li>
            Flip y to point down the map, the way screen pixels count. Only the second number
            changes sign.
          </li>
        </ul>
        <p>
          The lamp never moves. Only the description changes. <strong>Coordinates belong to a
          choice of origin, directions and unit</strong>, not to the thing itself.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Move the origin to the door"
        visual={
          <>
            <LivingRoom
              label="Living room floor plan: the origin moves from the corner to the door"
              frame={predictFrame}
              things={[LAMP]}
              walkTo={LAMP}
              ghostOrigin={reveal.t === 0 ? PREDICT_TO : undefined}
            />
            <Readout>
              {reveal.t === 0
                ? 'Origin in the corner, metres, y up. The lamp is at (5, 3). Lock in a prediction to move the origin to the door.'
                : `Origin at ${pairText(predictOrigin)} in old numbers. The lamp is at ${pairText(predictLamp)}, in the same spot on the floor.`}
            </Readout>
          </>
        }
      >
        <p>
          The <Tag color={COLOR.v}>lamp</Tag> is at (5, 3), measured from the corner in metres. The
          door is 2.5 m up the left wall. Keep the directions and the unit, but move the origin
          from the corner to the door.
        </p>
        <Predict
          question="What happens?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'moves',
              label: 'The lamp moves 2.5 m down the map, so it keeps its address (5, 3).',
              correct: false,
              explain: (
                <p className="m-0">
                  Watch the picture: the lamp has not moved at all. Choosing a new origin is like
                  choosing a new place to start measuring from. Nothing in the room is touched, so
                  the lamp stays put and its <em>numbers</em> are what change.
                </p>
              ),
            },
            {
              id: 'same',
              label: 'Nothing changes: the lamp stays put and is still at (5, 3).',
              correct: false,
              explain: (
                <p className="m-0">
                  The lamp does stay put, but (5, 3) meant &ldquo;5 right and 3 up{' '}
                  <em>from the corner</em>&rdquo;. From the door, the lamp is only 0.5 m up, so its
                  address is (5, 0.5). Coordinates always depend on where you measure from.
                </p>
              ),
            },
            {
              id: 'add',
              label: 'The lamp stays put; its address becomes (5, 5.5).',
              correct: false,
              explain: (
                <p className="m-0">
                  Close, but the sign is the wrong way round. The door is 2.5 m <em>higher</em> than
                  the corner, so the lamp is 2.5 m <em>less</em> far up from it: 3 − 2.5 = 0.5,
                  not 3 + 2.5.
                </p>
              ),
            },
            {
              id: 'right',
              label: 'The lamp stays put; its address becomes (5, 0.5).',
              correct: true,
              explain: (
                <p className="m-0">
                  Yes. The lamp has not moved; you moved the place you measure from. From the door
                  it is 5 m right and 0.5 m up. New address = old address − new origin: (5, 3) −
                  (0, 2.5) = (5, 0.5).
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="New origin? Subtract it."
        visual={
          <>
            <LivingRoom
              label="Living room floor plan with a lamp, a plant and a sofa, measured from the chosen origin"
              frame={uFrame}
              things={THINGS}
            />
            <OriginChoice origin={uOrigin.at} onChange={(o) => setUOrigin(presetAt(o)!)} />
            <UnitChoice unit={uUnit} onChange={setUUnit} />
            <Readout>
              Origin at {uOrigin.name}, unit {UNIT_NAME[uUnit]}, y up.{' '}
              {THINGS.map((t, k) => (
                <span key={t.id}>
                  {k > 0 && (k === THINGS.length - 1 ? ' and ' : ', ')}
                  {t.name} {pairText(toLocal(t.at, uFrame))}
                </span>
              ))}
              .
            </Readout>
            <div className="mt-4">
              <NumpySnippet code={understandCode(uOrigin, uUnit)} output={understandOutput(uOrigin.at, uUnit)} />
            </div>
          </>
        }
      >
        <p>
          Here is the rule you just discovered. If you know where something is from the old origin,
          and where the new origin is (measured the old way), then
        </p>
        <Tex block>{String.raw`\text{new address} = \text{old address} - \text{new origin}`}</Tex>
        <p>
          For the <Tag color={COLOR.v}>lamp</Tag>, with the origin at {uOrigin.name}:
        </p>
        <Tex block>
          {`${tex(LAMP.at)} - ${tex(uOrigin.at)} = ${tex(uLampM)}${
            uUnit === 'tiles' ? String.raw`\ \text{m} \;\to\; ${tex(uLamp)}\ \text{tiles}` : String.raw`\ \text{m}`
          }`}
        </Tex>
        <p>
          {uUnit === 'tiles' ? (
            <>
              Changing the unit is a division: each number in metres divided by {TILE} m per tile.
            </>
          ) : (
            <>
              Changing the unit would be a division: switch to tiles and each number is divided by{' '}
              {TILE} m per tile.
            </>
          )}{' '}
          Flipping a direction would flip the sign of that one number.
        </p>
        <p>
          In NumPy you can store every position at once as a table: one row per thing, one column
          per axis. <code>positions - new_origin</code> subtracts the origin from{' '}
          <em>every row</em> in one go (NumPy calls this <em>broadcasting</em>). Pick a different
          origin or unit and the code and its output update. A row of all zeros is the thing
          sitting exactly on the origin.
        </p>
      </Step>

      <ApplyStep />
      <HouseExample />
      <PracticeStep />
      <Recap />
    </article>
  )
}
