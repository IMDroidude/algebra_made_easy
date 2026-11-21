import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { Readout, Step, Tag } from '../../components/ui'
import { COLOR } from '../../lib/palette'
import { CORNER_VIEW, shadow } from '../../linalg/project3d'
import type { Vec3, View } from '../../linalg/project3d'
import { Cube3D, PointSliders, ViewControls } from './Cube3D'
import { coord3Text, describeView } from './cube'
import { PRACTICE_CHECKS, PRACTICE_START } from './practice'

const ITEMS: Challenge[] = [
  {
    id: 'goto',
    title: 'Go to a point',
    task: <p className="m-0">Put P at (1, 4, 2).</p>,
    insight: (
      <p className="m-0">
        1 along x, 4 up, 2 toward you. Three numbers, always in the order x, y, z, pin down exactly
        one spot in the room.
      </p>
    ),
  },
  {
    id: 'detective',
    title: 'Shadow detective',
    task: (
      <p className="m-0">
        A hidden point has its floor shadow at (4, 0, 1) and its back-wall shadow at (4, 2.5, 0).
        Put P exactly where that point is.
      </p>
    ),
    insight: (
      <p className="m-0">
        The floor shadow gave x = 4 and z = 1; the back-wall shadow gave y = 2.5. One shadow alone
        always loses a number, but two different shadows together give back all three.
      </p>
    ),
  },
  {
    id: 'edge',
    title: 'On the edge',
    task: (
      <p className="m-0">
        Put P on the x-axis, the edge where the floor meets the back wall, at least 2 steps from
        the corner.
      </p>
    ),
    insight: (
      <p className="m-0">
        On the x-axis both y and z are 0. P is now on two walls at once, so it is its own shadow on
        both of them.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [p, setPoint] = useState<Vec3>(PRACTICE_START)
  const [view, setView] = useState<View>(CORNER_VIEW)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setP = (next: Vec3) => {
    setPoint(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  return (
    <Step
      n={6}
      kind="Practice"
      title="Find these points yourself"
      visual={
        <>
          <Cube3D
            label="Practice room with a movable point P and its shadows"
            view={view}
            onViewChange={setView}
            point={p}
            onPointChange={setP}
          />
          <ViewControls view={view} onChange={setView} />
          <PointSliders value={p} onChange={setP} />
          <Readout>
            <Tag color={COLOR.v}>P</Tag> = {coord3Text(p)}. Floor shadow {coord3Text(shadow(p, 'xz'))},
            back-wall shadow {coord3Text(shadow(p, 'xy'))}. {describeView(view)}
          </Readout>
        </>
      }
    >
      <p>
        No answers are shown. Use the sliders (or drag the floor shadow) until P does what each task
        asks. A task is ticked as soon as P is in the right place.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
