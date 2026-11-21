import { Line, MovablePoint, Point, Polygon } from 'mafs'
import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { DraggablePoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Slider } from '../../components/Slider'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec2 } from '../../linalg'
import { FrameAxes, MapPlane, OriginMark, ThingMark, Walls } from './MapPlane'
import {
  BIN,
  BUILDING,
  CHAIR,
  CLASSROOM,
  DRONE_START,
  FRUITS,
  FRUIT_X,
  FRUIT_Y,
  HOVER,
  MYSTERY_START,
  PLUM,
  PRACTICE_CHECKS,
  PRACTICE_ORIGIN,
  TARGET_WINDOW,
  WINDOWS,
  pairText,
  roomSnap,
  snapFruit,
  toLocal,
  triple,
} from './positions'
import type { Frame, PracticeState, Vec3 } from './positions'

const ITEMS: Challenge[] = [
  {
    id: 'chair',
    title: 'Put the chair at (2, 1)',
    task: (
      <p className="m-0">
        In the classroom map, drag the origin so the <strong>chair</strong> has the address (2, 1)
        in metres.
      </p>
    ),
    insight: (
      <p className="m-0">
        The origin is 2 m left of the chair and 1 m below it. You did not touch the chair: you
        chose where to measure from, and the numbers followed.
      </p>
    ),
  },
  {
    id: 'drone',
    title: 'Send the drone to the window',
    task: (
      <p className="m-0">
        Measuring from the bottom-left corner of the wall (x along the wall, y up, z straight out
        from the wall, in metres), fly the drone so it hovers {HOVER} m in front of the window
        marked <strong>W</strong>.
      </p>
    ),
    insight: (
      <p className="m-0">
        The window&rsquo;s centre is at ({TARGET_WINDOW[0]}, {TARGET_WINDOW[1]}) on the wall, and{' '}
        {HOVER} m out makes z = {HOVER}. A drone pilot&rsquo;s software sends exactly this kind of
        three-number target.
      </p>
    ),
  },
  {
    id: 'plum',
    title: 'Place the plum',
    task: (
      <p className="m-0">
        A plum weighs {PLUM.grams} g and scores {PLUM.sweet} out of 10 for sweetness. Put the mystery
        fruit where the plum belongs on the chart.
      </p>
    ),
    insight: (
      <p className="m-0">
        The plum is now the list [{PLUM.grams}, {PLUM.sweet}]. A model that has never tasted a plum
        can still compare it with every other fruit, because it is just a point.
      </p>
    ),
  },
]

const classSnap = roomSnap(CLASSROOM.w, CLASSROOM.h)
const droneSnap = ([x, y]: Vec2): Vec2 => [
  Math.min(BUILDING.w, Math.max(0, Math.round(x))),
  Math.min(BUILDING.h, Math.max(0, Math.round(y))),
]

export function PracticeStep() {
  const [state, setState] = useState<PracticeState>({
    origin: PRACTICE_ORIGIN,
    drone: DRONE_START,
    fruit: MYSTERY_START,
  })
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const update = (patch: Partial<PracticeState>) => {
    const next = { ...state, ...patch }
    setState(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const frame: Frame = { origin: state.origin, unit: 'm', yDir: 'up' }
  const [dx, dy, dz] = state.drone
  const setDrone = (d: Vec3) => update({ drone: d })

  return (
    <Step
      n={6}
      kind="Practice"
      title="Give these things an address"
      layout="wide"
      visual={
        <div className="grid gap-8">
          <div>
            <h3 className="mt-0 mb-2 text-base font-semibold">Classroom (seen from above)</h3>
            <MapPlane
              label="Classroom floor plan with a chair, a bin and a draggable origin"
              x={[-1, CLASSROOM.w + 0.6]}
              y={[-0.6, CLASSROOM.h + 0.6]}
              grid={0.5}
            >
              <Walls w={CLASSROOM.w} h={CLASSROOM.h} />
              <FrameAxes frame={frame} w={CLASSROOM.w} h={CLASSROOM.h} />
              <ThingMark at={CHAIR} name="chair" frame={frame} attach="w" />
              <ThingMark at={BIN} name="bin" frame={frame} color={COLOR.ghost} attach="se" />
              <OriginMark at={state.origin} onChange={(origin) => update({ origin })} constrain={classSnap} />
            </MapPlane>
            <Readout>
              Origin placed, metres, y up. <Tag color={COLOR.v}>Chair</Tag> at{' '}
              {pairText(toLocal(CHAIR, frame))}, bin at {pairText(toLocal(BIN, frame))}.
            </Readout>
          </div>

          <div>
            <h3 className="mt-0 mb-2 text-base font-semibold">Drone and building</h3>
            <div className="grid gap-4 sm:grid-cols-[3fr_2fr]">
              <div>
                <p className="m-0 mb-1 text-xs text-muted">Front view: x across, y up</p>
                <MapPlane
                  label="Front view of a building wall with nine windows and a draggable drone"
                  x={[-0.5, BUILDING.w + 0.5]}
                  y={[-0.5, BUILDING.h + 0.5]}
                  grid={1}
                  maxHeight={360}
                >
                  <Walls w={BUILDING.w} h={BUILDING.h} />
                  {WINDOWS.map(([wx, wy]) => (
                    <Polygon
                      key={`${wx},${wy}`}
                      points={[
                        [wx - 0.8, wy - 0.8],
                        [wx + 0.8, wy - 0.8],
                        [wx + 0.8, wy + 0.8],
                        [wx - 0.8, wy + 0.8],
                      ]}
                      color={COLOR.j}
                      fillOpacity={wx === TARGET_WINDOW[0] && wy === TARGET_WINDOW[1] ? 0.45 : 0.15}
                      weight={wx === TARGET_WINDOW[0] && wy === TARGET_WINDOW[1] ? 3 : 1}
                    />
                  ))}
                  <PlaneLabel x={TARGET_WINDOW[0]} y={TARGET_WINDOW[1] + 0.8} attach="n" distance={3} size={15} color={COLOR.j}>
                    W
                  </PlaneLabel>
                  <MovablePoint
                    point={[dx, dy]}
                    onMove={([x, y]) => setDrone([x, y, dz])}
                    constrain={droneSnap}
                    color={COLOR.v}
                  />
                  <PlaneLabel x={dx} y={dy} attach={dx > 8 ? 'w' : 'e'} distance={16} size={14} color={COLOR.v}>
                    drone
                  </PlaneLabel>
                </MapPlane>
              </div>
              <div>
                <p className="m-0 mb-1 text-xs text-muted">Top view: x across, z out from the wall</p>
                <MapPlane
                  label="Top view: the wall along the bottom and the drone's distance out from it"
                  x={[-0.5, BUILDING.w + 0.5]}
                  y={[-0.5, 8.5]}
                  grid={1}
                  maxHeight={280}
                >
                  <Line.Segment point1={[0, 0]} point2={[BUILDING.w, 0]} color={COLOR.ghost} weight={6} />
                  <PlaneLabel x={BUILDING.w / 2} y={0} attach="n" distance={8} size={12} color="var(--muted)">
                    wall (z = 0)
                  </PlaneLabel>
                  <Line.Segment point1={[dx, 0]} point2={[dx, dz]} color={COLOR.v} weight={2} style="dashed" />
                  <Point x={dx} y={dz} color={COLOR.v} />
                </MapPlane>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Slider name="x" value={dx} onChange={(x) => setDrone([x, dy, dz])} min={0} max={BUILDING.w} step={1} accent={COLOR.i} />
              <Slider name="y" value={dy} onChange={(y) => setDrone([dx, y, dz])} min={0} max={BUILDING.h} step={1} accent={COLOR.j} />
              <Slider name="z" value={dz} onChange={(z) => setDrone([dx, dy, z])} min={0} max={8} step={1} accent={COLOR.v} />
            </div>
            <Readout>
              <Tag color={COLOR.v}>Drone</Tag> at {triple(state.drone)}: {fmt(dx)} m along the wall,{' '}
              {fmt(dy)} m up, {fmt(dz)} m out from the wall.
            </Readout>
          </div>

          <div>
            <h3 className="mt-0 mb-2 text-base font-semibold">Fruit chart</h3>
            <MapPlane
              label="Fruit chart: weight in grams across, sweetness up, with a draggable mystery fruit"
              x={[FRUIT_X[0] - 35, FRUIT_X[1] + 10]}
              y={[FRUIT_Y[0] - 1.3, FRUIT_Y[1] + 0.6]}
              grid={50}
              gridY={2}
              stretch
              axes
              height={280}
            >
              {FRUITS.map((f) => (
                <FruitMark key={f.name} at={[f.grams, f.sweet]} name={f.name} />
              ))}
              <DraggablePoint value={state.fruit} onChange={(fruit) => update({ fruit })} color={COLOR.v} snap={snapFruit} />
              <PlaneLabel
                x={state.fruit[0]}
                y={state.fruit[1]}
                attach={state.fruit[0] > 220 ? 'w' : 'e'}
                distance={16}
                size={14}
                color={COLOR.v}
              >
                mystery fruit
              </PlaneLabel>
            </MapPlane>
            <Readout>
              <Tag color={COLOR.v}>Mystery fruit</Tag> at ({fmt(state.fruit[0])} g, sweetness{' '}
              {fmt(state.fruit[1])}).
            </Readout>
          </div>
        </div>
      }
    >
      <p>
        Three new situations, one recipe. For each, think about the origin, the directions and the
        unit before you move anything.
      </p>
      <Challenges items={ITEMS} done={done} />
      <p className="mt-4 text-sm text-muted">
        Everything here can be done by keyboard: click a point and use the arrow keys, or use the
        sliders.
      </p>
    </Step>
  )
}

function FruitMark({ at, name }: { at: Vec2; name: string }) {
  return (
    <>
      <Point x={at[0]} y={at[1]} color={COLOR.i} />
      <PlaneLabel x={at[0]} y={at[1]} attach="n" distance={10} size={13} color={COLOR.i}>
        {name}
      </PlaneLabel>
    </>
  )
}
