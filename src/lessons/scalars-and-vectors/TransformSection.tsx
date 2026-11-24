import { Line, Polygon } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, CoordPoint, Plane } from '../../components/Plane'
import { Slider } from '../../components/Slider'
import { Tex } from '../../components/Tex'
import { Button, Readout, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { scale } from '../../linalg'
import { unitAt } from '../../linalg/pca'
import type { Vec2 } from '../../linalg'
import { Section } from './Section'
import {
  BEST,
  BEST_LINE,
  MODES,
  NOSE,
  PEOPLE,
  SHIP,
  START,
  projection,
  transformCode,
  transformOutput,
  transformPoint,
} from './transforms'
import type { Mode, Settings } from './transforms'

const col = (w: Vec2) => String.raw`\begin{bmatrix} ${fmt(w[0])} \\ ${fmt(w[1])} \end{bmatrix}`
const mat = (a: number, b: number, c: number, d: number) =>
  String.raw`\begin{bmatrix} ${fmt(a)} & ${fmt(b)} \\ ${fmt(c)} & ${fmt(d)} \end{bmatrix}`

/** Far enough along a direction to cross the whole plane. */
const REACH = 12

const LABEL: Record<Mode, string> = {
  rotate: 'A spaceship shape and the same shape turned about the origin',
  scale: 'A spaceship shape and the same shape stretched along x and y',
  translate: 'A spaceship shape and the same shape moved without turning',
  project: 'Six people as points, a line through the origin, and each point’s shadow on that line',
}

/** Going further: rotate, scale, translate, and project onto a line (the idea behind PCA). */
export function TransformSection() {
  const [mode, setMode] = useState<Mode>('rotate')
  const [s, setS] = useState<Settings>(START)
  const [showBest, setShowBest] = useState(false)
  const set = (patch: Partial<Settings>) => setS({ ...s, ...patch })

  const moved = mode === 'project' ? null : transformPoint(mode, s, NOSE)
  const ship = mode === 'project' ? [] : SHIP.map((q) => transformPoint(mode, s, q))
  const d = unitAt(s.line)
  const shadow = projection(s.line)
  const best = unitAt(BEST_LINE)
  const rad = (s.angle * Math.PI) / 180

  return (
    <Section
      id="transformations-and-projections"
      title="Transformations and projections"
      visual={
        <>
          <div role="group" aria-label="Transformation" className="mb-3 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <Button
                key={m.id}
                variant={mode === m.id ? 'primary' : 'secondary'}
                aria-pressed={mode === m.id}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </Button>
            ))}
          </div>
          <Plane extent={6} label={LABEL[mode]}>
            {moved ? (
              <>
                <Polygon points={SHIP} color={COLOR.ghost} fillOpacity={0.15} strokeStyle="dashed" />
                <Polygon points={ship} color={COLOR.result} fillOpacity={0.25} />
                <Arrow tip={NOSE} color={COLOR.v} label="p" opacity={0.75} />
                {mode === 'translate' && (
                  <Arrow tail={NOSE} tip={moved} color={COLOR.j} dashed weight={2} label="t" labelAt="middle" />
                )}
                <Arrow tip={moved} color={COLOR.result} label="p′" />
              </>
            ) : (
              <>
                {showBest && (
                  <Line.Segment
                    point1={scale(best, -REACH)}
                    point2={scale(best, REACH)}
                    color={COLOR.ghost}
                    style="dashed"
                    weight={2}
                  />
                )}
                <Line.Segment point1={scale(d, -REACH)} point2={scale(d, REACH)} color={COLOR.grid} weight={2} />
                {PEOPLE.map((person, i) => (
                  <Line.Segment
                    key={`drop-${i}`}
                    point1={person}
                    point2={scale(d, shadow.coords[i])}
                    color={COLOR.ghost}
                    style="dashed"
                    weight={1.5}
                  />
                ))}
                {PEOPLE.map((person, i) => (
                  <CoordPoint key={`person-${i}`} at={person} color={COLOR.v} />
                ))}
                {shadow.coords.map((c, i) => (
                  <CoordPoint key={`shadow-${i}`} at={scale(d, c)} color={COLOR.result} />
                ))}
              </>
            )}
          </Plane>
          <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {mode === 'rotate' && (
              <Slider name="angle" value={s.angle} onChange={(angle) => set({ angle })} min={-180} max={180} step={15} accent={COLOR.result} />
            )}
            {mode === 'scale' && (
              <>
                <Slider name="sx" value={s.sx} onChange={(sx) => set({ sx })} min={-1.5} max={1.5} accent={COLOR.result} />
                <Slider name="sy" value={s.sy} onChange={(sy) => set({ sy })} min={-1.5} max={1.5} accent={COLOR.result} />
              </>
            )}
            {mode === 'translate' && (
              <>
                <Slider name="tx" value={s.tx} onChange={(tx) => set({ tx })} accent={COLOR.j} />
                <Slider name="ty" value={s.ty} onChange={(ty) => set({ ty })} accent={COLOR.j} />
              </>
            )}
            {mode === 'project' && (
              <>
                <Slider name="line angle" value={s.line} onChange={(line) => set({ line })} min={0} max={175} step={5} accent={COLOR.grid} />
                <Toggle checked={showBest} onChange={setShowBest}>
                  Show the line PCA would pick
                </Toggle>
              </>
            )}
          </div>
          <Readout>
            {mode === 'rotate' && moved && (
              <>
                Turning by {fmt(s.angle)}° takes the nose <Tag color={COLOR.v}>p</Tag> = {fmtVec(NOSE)}{' '}
                to <Tag color={COLOR.result}>p′</Tag> = {fmtVec(moved)}. Both are {fmt(Math.hypot(...NOSE))}{' '}
                from the origin: a rotation changes direction, never length.
              </>
            )}
            {mode === 'scale' && moved && (
              <>
                x is multiplied by {fmt(s.sx)} and y by {fmt(s.sy)}: the nose{' '}
                <Tag color={COLOR.v}>p</Tag> = {fmtVec(NOSE)} goes to{' '}
                <Tag color={COLOR.result}>p′</Tag> = {fmtVec(moved)}.
                {s.sx === 0 || s.sy === 0
                  ? ' A factor of 0 flattens the ship onto a line.'
                  : s.sx < 0 || s.sy < 0
                    ? ' A negative factor mirrors the ship.'
                    : s.sx === s.sy
                      ? ' Equal factors zoom without changing the shape.'
                      : ' Unequal factors stretch the shape out of proportion.'}
              </>
            )}
            {mode === 'translate' && moved && (
              <>
                Every corner moves by <Tag color={COLOR.j}>t</Tag> = {fmtVec([s.tx, s.ty])}: the nose{' '}
                <Tag color={COLOR.v}>p</Tag> = {fmtVec(NOSE)} goes to{' '}
                <Tag color={COLOR.result}>p′</Tag> = {fmtVec(moved)}. The ship keeps its size and
                the way it points.
              </>
            )}
            {mode === 'project' && (
              <>
                Line at {fmt(s.line)}°. The six <Tag color={COLOR.result}>shadows</Tag> sit at{' '}
                {shadow.coords.map((c) => fmt(c)).join(', ')} along it: one number per person
                instead of two. Their spread is {fmt(shadow.kept)} out of {fmt(shadow.total)}, so
                this line keeps {fmt(shadow.percent, 0)}% of the spread.
                {showBest && (
                  <>
                    {' '}
                    The dashed line, at {fmt(BEST_LINE, 1)}°, is the one PCA picks: it keeps{' '}
                    {fmt(BEST.percent, 1)}%, the most any line can.
                  </>
                )}
              </>
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={transformCode(mode, s)} output={transformOutput(mode, s)} />
          </div>
        </>
      }
    >
      <p>
        A <strong>transformation</strong> is a rule that takes a vector in and gives a vector out.
        A 2D game is a good place to watch one work: the spaceship is a list of corner points, each
        corner is a vector, and to move the ship the game applies the same rule to every corner.
        Pick a rule above the plane. The equations follow one corner, the nose{' '}
        <Tag color={COLOR.v}>p</Tag> = {fmtVec(NOSE)}.
      </p>
      <p>
        <strong>Rotation</strong> turns every point about the origin by the same angle. Lengths
        stay as they were.
      </p>
      {mode === 'rotate' && moved && (
        <Tex block>
          {String.raw`\mathbf{p}' = ${mat(Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad))} ${col(NOSE)} = ${col(moved)}`}
        </Tex>
      )}
      <p>
        <strong>Scaling</strong> multiplies each entry by a factor. In step 2 one number k scaled
        both entries. Here x and y get a factor each, which is how a photo is stretched wider
        without getting taller.
      </p>
      {mode === 'scale' && moved && (
        <Tex block>{String.raw`\mathbf{p}' = ${mat(s.sx, 0, 0, s.sy)} ${col(NOSE)} = ${col(moved)}`}</Tex>
      )}
      <p>
        <strong>Translation</strong> slides everything by adding the same vector{' '}
        <Tag color={COLOR.j}>t</Tag> to every point. It is the vector addition from step 2.
      </p>
      {mode === 'translate' && moved && (
        <Tex block>{String.raw`\mathbf{p}' = \mathbf{p} + \mathbf{t} = ${col(NOSE)} + ${col([s.tx, s.ty])} = ${col(moved)}`}</Tex>
      )}
      <p>
        The grids of numbers in the rotation and scaling equations are matrices; they are the
        subject of <Link to="/lessons/matrices-as-transformations">matrices as transformations</Link>.
        Translation is the odd one out: it moves the origin, which no 2×2 matrix can do, so it
        stays an addition.
      </p>
      <p>
        <strong>Projection</strong> drops each point straight onto a line, like a shadow at noon.
        Two numbers go in and one comes out: how far along the line the shadow falls. Something is
        always lost, and the skill is to lose as little as possible.
      </p>
      {mode === 'project' && (
        <Tex block>
          {String.raw`\text{shadow of } ${col(PEOPLE[5])} = ${fmt(PEOPLE[5][0])} \cdot ${fmt(d[0])} + ${fmt(PEOPLE[5][1])} \cdot ${fmt(d[1])} = ${fmt(shadow.coords[5])}`}
        </Tex>
      )}
      <p>
        Choose <strong>Project</strong>. The six points are six people: x is height and y is
        weight, each measured as the difference from the group average. Taller people tend to be
        heavier, so the points lie close to one slanted line. Turn the line until the shadows are
        as spread out as you can make them. At that angle a single number per person, a kind of
        overall size, keeps almost everything the two numbers said.
      </p>
      <p>
        <strong>Principal component analysis (PCA)</strong> does that search for you: it subtracts
        the average, then finds the line (or the few directions) along which the data is most
        spread out, and projects onto it. It is how 768-number embeddings are squeezed down to 2
        numbers so they can be drawn on a plane like these. More in{' '}
        <Link to="/lessons/projection-least-squares">projection</Link> and{' '}
        <Link to="/lessons/svd">the SVD lesson</Link>.
      </p>
      <p className="text-sm text-muted">
        Honesty about this picture: the six people and their numbers are invented. Each shadow is
        worked out with a dot product, which the next section introduces.
      </p>
    </Section>
  )
}
