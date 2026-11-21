import { useState } from 'react'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, isInteger, numpyPrint, numpyVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { CORNER_VIEW, FRONT_VIEW, lerpView, overlapOnScreen, shadow } from '../../linalg/project3d'
import type { Vec3, View, Wall } from '../../linalg/project3d'
import { ApplyStep } from './ApplyStep'
import { Cube3D, PointSliders, ViewControls } from './Cube3D'
import { AXIS_COLOR, Q, WALL_MASK, WALL_NAME, coord3Text, describeView } from './cube'
import { DimensionStrip } from './DimensionStrip'
import { PlanesSection } from './PlanesSection'
import { PracticeStep } from './PracticeStep'
import { START, walkSteps } from './walk'
import { PointPresets, WalkPanel } from './WalkPanel'

const WALL_ORDER: Wall[] = ['xz', 'xy', 'yz']

export function Lesson() {
  const [p, setP] = useState<Vec3>(START)
  const [seeView, setSeeView] = useState<View>(CORNER_VIEW)
  const [view, setView] = useState<View>(CORNER_VIEW)
  const [showShadows, setShowShadows] = useState(true)
  const [showWalk, setShowWalk] = useState(true)
  const [understandView, setUnderstandView] = useState<View>(CORNER_VIEW)
  const [wall, setWall] = useState<Wall>('xz')
  const reveal = useTween(1400)
  const [x, y, z] = p
  const steps = walkSteps(p)
  const resetStep2 = () => {
    setP(START)
    setView(CORNER_VIEW)
  }

  const predictView = lerpView(CORNER_VIEW, FRONT_VIEW, reveal.t)
  const qShadow = shadow(Q, 'xy')
  const s = shadow(p, wall)
  const mask = WALL_MASK[wall]
  const code = [
    'import numpy as np',
    '',
    `${numpyVec('p', p)}   # x, y, z`,
    `${wall === 'xz' ? 'floor' : wall === 'xy' ? 'back' : 'side'} = p * np.array([${mask.join(', ')}])`,
    `print(${wall === 'xz' ? 'floor' : wall === 'xy' ? 'back' : 'side'})`,
  ].join('\n')

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="3d-space">
        One number is a spot on a line, two numbers are a spot on a flat plane, and three numbers are a
        spot in a room. By the end of this lesson you will be able to read a point&rsquo;s (x, y, z) as
        width, height and depth, walk to it from the corner, find its shadow on each wall, say what a
        flat plane inside the room is, and explain why a flat picture of data always hides something.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="A line, then a plane, then a room"
        layout="wide"
        visual={
          <>
            <DimensionStrip point={p} />
            <div className="mt-3">
              <Cube3D
                label={`A room corner with three axes and a point P at ${coord3Text(p)}`}
                view={seeView}
                onViewChange={setSeeView}
                point={p}
                shadows={false}
              />
            </div>
            <Readout>
              <Tag color={COLOR.v}>P</Tag> = {coord3Text(p)}: {fmt(x)} to the right (width, x),{' '}
              {fmt(y)} up (height, y), {fmt(z)} toward you (depth, z). {describeView(seeView)}
            </Readout>
          </>
        }
      >
        <p>
          <strong>One number</strong> picks a spot on a line: how far along it you are.{' '}
          <strong>Two numbers</strong> pick a spot on a flat plane, as in the last lesson: x for how
          far right, y for how far up. <strong>Three numbers</strong> pick a spot in a room. Each new
          number adds one new direction and keeps the old ones exactly as they were.
        </p>
        <p>The three directions have everyday names:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            <Tag color={AXIS_COLOR.x}>x = width</Tag>: left and right
          </li>
          <li>
            <Tag color={AXIS_COLOR.y}>y = height</Tag>: down and up
          </li>
          <li>
            <Tag color={AXIS_COLOR.z}>z = depth</Tag>: back and front (toward you)
          </li>
        </ul>
        <p>
          The picture is the corner of a room. The <strong>back wall</strong> is the flat plane you
          already know; the <strong>floor</strong> and the <strong>side wall</strong> are new. The
          corner where all three meet is <strong>(0, 0, 0)</strong>, the <em>origin</em>. A point
          is always written in the same order, (x, y, z): <Tag color={COLOR.v}>P</Tag> is at{' '}
          {coord3Text(p)}.
        </p>
        <p>
          If you have written a game, you already know this. In a 3D game world, x is how far you
          move sideways, y is how high you jump, and z is how far you move forward or back. A
          character&rsquo;s position is three numbers, updated every frame.
        </p>
        <p>
          A screen is flat, so the room is drawn at an angle. Drag the picture (or click it and use
          the arrow keys) to turn it and get a feel for its depth.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Walk to the point, watch its shadows"
        layout="wide"
        visual={
          <>
            <Cube3D
              label="A room corner with a movable point P, the walk from the corner to P, and its shadows on the three walls"
              view={view}
              onViewChange={setView}
              point={p}
              onPointChange={setP}
              walk={showWalk}
              shadows={showShadows}
            />
            <ViewControls view={view} onChange={setView} />
            <PointSliders value={p} onChange={setP} />
            <PointPresets value={p} onChange={setP} onReset={resetStep2} />
            <WalkPanel point={p} />
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              <Toggle checked={showWalk} onChange={setShowWalk}>
                Draw the walk in the room
              </Toggle>
              <Toggle checked={showShadows} onChange={setShowShadows}>
                Show shadows on the walls
              </Toggle>
            </div>
            <Readout>
              <Tag color={COLOR.v}>P</Tag> = {coord3Text(p)}: width x = {fmt(x)}, height y = {fmt(y)},
              depth z = {fmt(z)}.
              {showShadows && (
                <>
                  {' '}
                  Shadows: on the floor {coord3Text(shadow(p, 'xz'))}, on the back wall{' '}
                  {coord3Text(shadow(p, 'xy'))}, on the side wall {coord3Text(shadow(p, 'yz'))}.
                </>
              )}{' '}
              {describeView(view)}
            </Readout>
          </>
        }
      >
        <p>
          Use the three sliders to move <Tag color={COLOR.v}>P</Tag>. Each slider changes one
          number and moves the point in one direction only: width, height or depth.
        </p>
        <p>
          The box under the sliders turns the numbers into directions: start at the corner, walk
          along the width, then up, then forward. The same three legs are drawn in the room, each in
          its axis&rsquo;s colour and numbered 1, 2, 3. A 0 means &ldquo;stay put&rdquo; in that
          direction. In this room every number is between 0 and 5; a negative number would mean
          walking the other way: left, down, or back behind the back wall.
        </p>
        <p>
          Try the <strong>Origin</strong> button (no walk at all) and <strong>Equal
          coordinates</strong> (the same distance in every direction).
        </p>
        <p>
          Now the hollow <strong>shadows</strong>. Imagine a light shining straight at each wall:
          each shadow is P squashed flat against one wall. Try to:
        </p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>make the floor shadow and P meet (what does y have to be?),</li>
          <li>move only z, and see which shadow stays perfectly still,</li>
          <li>click the Front, Side and Top buttons and see which shadow P hides in front of.</li>
        </ul>
        <p className="text-sm text-muted">
          Dragging a point in 3D with a mouse is ambiguous: the screen cannot tell &ldquo;further
          away&rdquo; from &ldquo;lower&rdquo;. So dragging only works on the{' '}
          <strong>floor shadow</strong> (the ring with a halo): P slides along the floor, changing x
          and z while its height stays the same.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: what does the front view show?"
        visual={
          <>
            <Cube3D
              label={`A room corner with the point Q at ${coord3Text(Q)} and its shadows`}
              view={predictView}
              point={Q}
              pointLabel="Q"
            />
            <Readout>
              {reveal.t === 0
                ? 'Corner view. Lock in a prediction to turn to the front view.'
                : reveal.t < 1
                  ? 'Turning…'
                  : overlapOnScreen(Q, qShadow, predictView)
                    ? `Front view: Q is drawn exactly on top of its back-wall shadow ${coord3Text(qShadow)}. Its z = ${fmt(Q[2])} cannot be seen.`
                    : describeView(predictView)}
            </Readout>
          </>
        }
      >
        <p>
          The point <Tag color={COLOR.v}>Q</Tag> is at {coord3Text(Q)}: 3 to the right (width), 2 up
          (height) and 4 toward you (depth). You are about to turn the room so you look straight at the back wall, the
          way you looked at the flat plane in the last lesson.
        </p>
        <Predict
          question="Where will Q appear in the front view?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'xz',
              label: 'At x = 3, y = 4 on the back wall.',
              correct: false,
              explain: (
                <p className="m-0">
                  That mixes up which number goes missing. The back wall is the <strong>xy</strong>{' '}
                  wall, so the two numbers you can still see are x = 3 and y = 2. The 4 is z, the
                  axis pointing straight at you.
                </p>
              ),
            },
            {
              id: 'xy',
              label: 'At x = 3, y = 2, exactly on its back-wall shadow. The 4 cannot be seen.',
              correct: true,
              explain: (
                <p className="m-0">
                  From the front, z points straight at your eye, so moving along z does not move
                  the point on the screen at all. You see only x and y. The front view of Q is the
                  same as its shadow on the back wall.
                </p>
              ),
            },
            {
              id: 'bigger',
              label: 'Further to the right, because it is 4 steps in front of the wall.',
              correct: false,
              explain: (
                <p className="m-0">
                  Moving toward you is not moving sideways. Coming straight at you, Q stays over the
                  same spot of the wall. (A camera photo would also make it look a bit bigger;
                  these drawings leave that effect out so the numbers stay easy to read.)
                </p>
              ),
            },
            {
              id: 'hidden',
              label: 'It disappears behind the back wall.',
              correct: false,
              explain: (
                <p className="m-0">
                  The back wall is where z = 0, and Q has z = 4, so Q is in front of the wall,
                  between the wall and you. Nothing can hide it. What disappears is not the point
                  but one of its numbers.
                </p>
              ),
            },
          ]}
        />
        {reveal.t === 1 && (
          <p className="mt-4">
            This is what every flat chart of 3D data does: it lets one coordinate disappear. The same
            Q seen from the side would hide x; seen from the top it would hide y.
          </p>
        )}
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="Three numbers, three walks, three shadows"
        layout="wide"
        visual={
          <>
            <Cube3D
              label="The walk from the corner to P: along the width x, up the height y, then forward along the depth z"
              view={understandView}
              onViewChange={setUnderstandView}
              point={p}
              walk
              shadows={wall}
            />
            <Readout>
              Walk: 1. {steps[0]} 2. {steps[1]} 3. {steps[2]} You arrive at{' '}
              <Tag color={COLOR.v}>P</Tag> = {coord3Text(p)}. Its shadow on the {WALL_NAME[wall]} is{' '}
              {coord3Text(s)}.
            </Readout>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">Shadow on:</span>
              {WALL_ORDER.map((w) => (
                <Button
                  key={w}
                  variant={w === wall ? 'primary' : 'secondary'}
                  aria-pressed={w === wall}
                  onClick={() => setWall(w)}
                >
                  {WALL_NAME[w]}
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <NumpySnippet code={code} output={numpyPrint(shadow(p, wall), isInteger(...p))} />
            </div>
          </>
        }
      >
        <p>
          This is your point from step 2. Its three numbers are three walks from the corner, one
          along each axis. The order of the walks does not matter; the order of the numbers does:
          always x, then y, then z.
        </p>
        <Tex block>
          {String.raw`P = (\textcolor{${AXIS_COLOR.x}}{${fmt(x)}},\ \textcolor{${AXIS_COLOR.y}}{${fmt(y)}},\ \textcolor{${AXIS_COLOR.z}}{${fmt(z)}})`}
        </Tex>
        <p>
          A shadow keeps two numbers and sets the third to 0. Which one becomes 0 is the axis that
          sticks out of that wall:
        </p>
        <Tex block>
          {String.raw`\begin{aligned} \text{floor } (y = 0):&\quad (${fmt(x)},\ 0,\ ${fmt(z)}) \\ \text{back wall } (z = 0):&\quad (${fmt(x)},\ ${fmt(y)},\ 0) \\ \text{side wall } (x = 0):&\quad (0,\ ${fmt(y)},\ ${fmt(z)}) \end{aligned}`}
        </Tex>
        <p className="text-sm text-muted">
          One honest detail: the three directions are independent, and which one is called
          &ldquo;up&rdquo; is only a convention. This site uses y for up, like most game engines and
          graphics libraries (three.js, Unity). Many maths textbooks and tools such as Blender use z
          for up instead. The maths is the same; only the names of the axes swap.
        </p>
        <p>
          In NumPy a point is a 1-D array of three numbers. Multiplying two arrays with{' '}
          <code>*</code> multiplies them entry by entry, so multiplying by{' '}
          <code>[{mask.join(', ')}]</code> keeps the entries with a 1 and zeroes the one with a 0.
          Pick a wall with the buttons by the picture: the hollow shadow, the equations and the code all show the same point.
        </p>
      </Step>

      <PlanesSection />
      <ApplyStep />
      <PracticeStep />

      <section aria-labelledby="beyond-three" className="border-t border-line py-10">
        <h2 id="beyond-three" className="mt-0 mb-4 font-display text-2xl leading-tight">
          Beyond three directions
        </h2>
        <div className="prose-lesson max-w-[62ch]">
          <p>
            The pattern does not stop at three. A line needs one number, a plane two, a room three;
            a point with four numbers lives in a space with four independent directions, and so on.
            You cannot draw a fourth direction, but you can still write the point down: a list of
            numbers in a fixed order.
          </p>
          <p>
            That is exactly what data looks like. A row with hundreds of features is a point in a
            space with hundreds of directions. Everything from this lesson still works there:
            reading one coordinate, walking along one direction at a time, and dropping coordinates
            to get a flat picture, which always hides the rest.
          </p>
        </div>
      </section>
    </article>
  )
}
