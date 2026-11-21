import { useState } from 'react'
import { Button, Readout, Tag, Toggle } from '../../components/ui'
import { CORNER_VIEW, planeSide } from '../../linalg/project3d'
import type { View } from '../../linalg/project3d'
import { Cube3D, ViewControls } from './Cube3D'
import type { CubePlane, CubePoint } from './Cube3D'
import { coord3Text, describeView } from './cube'
import { GROUPS, PLANES, RELATION, RELATION_OFF, RELATION_ON, relationSum, relationValue, PLANE_COLOR, SIDE_COLOR, PLANE_ORDER, SPLIT_LABEL_AT, SPLIT_PLANE, SPLIT_RULE, SPLIT_VIEW } from './planes'
import type { PlaneId } from './planes'

/**
 * Understand, continued: a plane inside the room. The floor, the back wall and
 * a tilted sheet are all flat and infinite, and each splits space into two
 * sides. A toggle shows a tilted sheet keeping two groups of points apart.
 */
export function PlanesSection() {
  const [id, setId] = useState<PlaneId>('floor')
  const [split, setSplit] = useState(false)
  const [view, setView] = useState<View>(CORNER_VIEW)
  const info = PLANES[id]

  const planes: CubePlane[] = split
    ? [{ plane: SPLIT_PLANE, color: PLANE_COLOR, label: SPLIT_RULE, labelAt: SPLIT_LABEL_AT }]
    : [{ plane: info.plane, color: PLANE_COLOR, label: `${info.name}: ${info.rule}` }]
  const points: CubePoint[] = split
    ? GROUPS.map((g) => ({ at: g.at, label: g.name, color: g.name.startsWith('A') ? SIDE_COLOR.a : SIDE_COLOR.b }))
    : info.examples.map((at, k) => ({ at, label: k === 0 ? 'A' : 'B', color: k === 0 ? SIDE_COLOR.a : SIDE_COLOR.b }))

  const groupSides = GROUPS.map((g) => planeSide(g.at, SPLIT_PLANE))
  const allSplit = GROUPS.every((g, k) => groupSides[k] === (g.name.startsWith('A') ? 1 : -1))

  return (
    <section aria-labelledby="planes-heading" className="border-t border-line py-10">
      <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">
        Step 4 · Understand, continued
      </p>
      <h2 id="planes-heading" className="mt-1 mb-5 font-display text-3xl leading-tight">
        A plane inside the room
      </h2>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="prose-lesson max-w-[62ch]">
          <p>
            The walls you have been casting shadows on are <strong>planes</strong>: flat sheets
            inside 3D space. The floor is every point whose height is 0, so its rule is{' '}
            <strong>y = 0</strong>. The back wall is every point with <strong>z = 0</strong>.
          </p>
          <p>Two facts about every plane:</p>
          <ul className="mt-0 mb-4 list-disc pl-6">
            <li>
              It is <strong>flat</strong>: no bumps, no bends.
            </li>
            <li>
              It is <strong>infinite</strong>. The room only shows a piece of it; the faint dashed
              edge in the picture is a reminder that it keeps going in every direction along the
              sheet.
            </li>
          </ul>
          <p>
            A plane does not have to line up with the walls. The <strong>tilted sheet</strong> y = z
            is a ramp: it rises from the bottom of the back wall to the top of the front edge,
            holding every point whose height equals its depth.
          </p>
          <p>
            Most important: a plane <strong>splits space into two sides</strong>. Every point is on
            one side, on the other, or exactly on the sheet. The two example points{' '}
            <Tag color={SIDE_COLOR.a}>A</Tag> and <Tag color={SIDE_COLOR.b}>B</Tag> sit on
            opposite sides; a point&rsquo;s coordinates tell you which side without looking.
          </p>
          <p>
            You have seen this in 2D already: on a flat plane a line splits the points into two
            sides. One dimension up, a flat sheet does the same job in the room.
          </p>
          <p>
            A plane is also a <strong>relationship among three numbers</strong>. The rule{' '}
            <strong>
              {RELATION.a}x + {RELATION.b}y + z = {RELATION.d}
            </strong>{' '}
            means: all the points (x, y, z) that satisfy it. Together they form one flat sheet.{' '}
            {coord3Text(RELATION_ON)} is on it: {relationSum(RELATION_ON)} = {relationValue(RELATION_ON)}.{' '}
            {coord3Text(RELATION_OFF)} is not: {relationSum(RELATION_OFF)} = {relationValue(RELATION_OFF)}, less
            than {RELATION.d}, so it is on one side.
          </p>
          <p>
            That is why planes turn up everywhere in machine learning. A plane can{' '}
            <strong>separate two classes</strong> (the toggle below), <strong>describe a constraint</strong>{' '}
            (buy x, y and z of three things that cost {RELATION.a}, {RELATION.b} and {RELATION.c} each, and spend exactly{' '}
            {RELATION.d}), or{' '}
            <strong>relate features</strong> to each other.
          </p>
        </div>
        <div>
          <Cube3D
            label={
              split
                ? `A room with the tilted sheet ${SPLIT_RULE} and ten points: group A on one side, group B on the other`
                : `A room with the plane ${info.rule} (${info.name.toLowerCase()}) and a point on each side of it`
            }
            view={view}
            onViewChange={setView}
            shadows={false}
            planes={planes}
            points={points}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Plane:</span>
            {PLANE_ORDER.map((p) => (
              <Button
                key={p}
                variant={!split && p === id ? 'primary' : 'secondary'}
                aria-pressed={!split && p === id}
                onClick={() => {
                  setId(p)
                  setSplit(false)
                }}
              >
                {PLANES[p].name} ({PLANES[p].rule})
              </Button>
            ))}
          </div>
          <ViewControls view={view} onChange={setView} />
          <div className="mt-3">
            <Toggle
              checked={split}
              onChange={(on) => {
                setSplit(on)
                setView(on ? SPLIT_VIEW : CORNER_VIEW)
              }}
            >
              Show two groups split by a tilted sheet
            </Toggle>
          </div>
          <Readout>
            {split ? (
              <>
                The tilted sheet {SPLIT_RULE}. Every point of group <Tag color={SIDE_COLOR.a}>A</Tag>{' '}
                (A1 to A5) has x + y − z bigger than 2.5, so it is on one side; every point of group{' '}
                <Tag color={SIDE_COLOR.b}>B</Tag> (B1 to B5) has it smaller, so it is on the other.{' '}
                {allSplit ? 'No point is on the wrong side.' : 'Some points are on the wrong side.'}
              </>
            ) : (
              <>
                {info.name}: every point with {info.rule}. It is flat and goes on forever.{' '}
                <Tag color={SIDE_COLOR.a}>A</Tag> {coord3Text(info.examples[0])} is {info.sides[0]} (
                {info.sideRules[0]}); <Tag color={SIDE_COLOR.b}>B</Tag> {coord3Text(info.examples[1])}{' '}
                is {info.sides[1]} ({info.sideRules[1]}).
              </>
            )}{' '}
            {describeView(view)}
          </Readout>
          {split && (
            <p className="mt-3 text-sm">
              Keeping two groups of data apart with one flat sheet is one of the first things
              machine learning does. You will place the 2D version, a line between two groups, in
              lesson 2.3.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
