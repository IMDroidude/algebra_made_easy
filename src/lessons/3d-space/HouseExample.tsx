import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { RunningExample } from '../../components/RunningExample'
import { Button, Readout } from '../../components/ui'
import { HOUSES } from '../../data/houses'
import { COLOR } from '../../lib/palette'
import { CORNER_VIEW } from '../../linalg/project3d'
import type { View } from '../../linalg/project3d'
import { Cube3D, ViewControls } from './Cube3D'
import { describeView } from './cube'
import { DROP_NAME, DROP_WALL, HOUSE_AXIS_NAMES, HOUSE_AXIS_TICKS, dropCode, keptText, roomPoint } from './houses'
import type { Drop } from './houses'

const capital = (s: string) => s[0].toUpperCase() + s.slice(1)

const DROPS: [Drop, string][] = [
  ['none', 'Keep all three'],
  [2, 'Drop distance'],
  [1, 'Drop bedrooms'],
  [0, 'Drop size'],
]

/** Running example: the eight houses as points in the room; dropping a feature casts their shadows on a wall. */
export function HouseExample() {
  const [drop, setDrop] = useState<Drop>('none')
  const [view, setView] = useState<View>(CORNER_VIEW)
  const code = dropCode(drop)
  const a = HOUSES[0]
  const houseH = HOUSES[7]

  const choose = (d: Drop) => {
    setDrop(d)
    setView(d === 'none' ? CORNER_VIEW : DROP_WALL[d].view)
  }

  return (
    <RunningExample title="The houses in the room">
      <p>
        Each house has three features, so each house is a point in the room: size along x,
        bedrooms up y, distance to the centre along z. Size runs into the thousands and bedrooms
        stop at 4, so each axis gets its own scale (one step is 500 sqft, 1 bedroom or 3 km) to
        fit the room.
      </p>
      <Cube3D
        label="The eight houses as points in a room: size along x, bedrooms along y, distance to the centre along z"
        view={view}
        onViewChange={setView}
        shadows={false}
        height={520}
        axisNames={HOUSE_AXIS_NAMES}
        axisTicks={HOUSE_AXIS_TICKS}
        points={HOUSES.map((h) => ({ at: roomPoint(h, drop), label: h.id, color: COLOR.v, text: keptText(h, drop) }))}
      />
      <ViewControls view={view} onChange={setView} />
      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Drop a feature">
        {DROPS.map(([d, text]) => (
          <Button key={String(d)} variant={d === drop ? 'primary' : 'secondary'} aria-pressed={d === drop} onClick={() => choose(d)}>
            {text}
          </Button>
        ))}
      </div>
      <Readout>
        {drop === 'none'
          ? `All three features: house A is at ${keptText(a, drop)}, ${a.sqft} sqft, ${a.bedrooms} bedrooms, ${a.distanceKm} km out.`
          : `${capital(DROP_NAME[drop])} dropped: every house falls flat onto ${DROP_WALL[drop].wall}. House A is now just ${keptText(a, drop)}.`}{' '}
        {describeView(view)}
      </Readout>
      <p className="mt-4">
        Dropping a feature is the shadow from this lesson. Press <strong>Drop distance</strong>:
        every house slides onto the back wall, and you see only size and bedrooms. Houses A and H are{' '}
        {Math.abs(a.distanceKm - houseH.distanceKm)} km apart in distance, but on the back wall they sit
        almost on top of each other. A flat chart of data with more features
        always hides something this way.
      </p>
      <p>
        In the code, <code>X[:, [0, 1]]</code> means &ldquo;every row, columns 0 and 1&rdquo;: it
        keeps two features and drops the third.
      </p>
      <NumpySnippet code={code.code} output={code.output} />
    </RunningExample>
  )
}
