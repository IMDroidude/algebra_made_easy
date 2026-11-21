import { Line, Point, Polygon } from 'mafs'
import { useState } from 'react'
import { NumberField } from '../../components/NumberField'
import { Arrow } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Readout, Tag } from '../../components/ui'
import { COLOR } from '../../lib/palette'
import { approxEqualVec } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { ARM_ROOM, CHAIN, CUP_IN_GRIPPER, FRAME_NAMES, PRACTICE_GRIPPER, chainPositions, practiceAnswer } from './frames'
import { MapPlane, Walls } from './MapPlane'
import { pairText } from './positions'

/** Frames inside frames: the cup in the gripper's frame, the robot's, the room's and the map's. */
export function RobotArm() {
  const pos = chainPositions()
  const base = CHAIN[1].offset
  const gripper = CHAIN[0].offset.map((x, i) => x + base[i]) as Vec2
  const cup = pos[2]
  return (
    <>
      <MapPlane
        label="A room with a robot: its base, its arm reaching to the gripper, and a cup just ahead of the gripper. Dashed arrows show each frame's offset."
        x={[-0.6, ARM_ROOM.w + 0.6]}
        y={[-0.6, ARM_ROOM.h + 0.6]}
        maxHeight={360}
      >
        <Walls w={ARM_ROOM.w} h={ARM_ROOM.h} />
        <Line.Segment point1={base} point2={gripper} color={COLOR.ghost} weight={6} opacity={0.6} />
        <Arrow tail={gripper} tip={cup} color={COLOR.j} dashed weight={2} />
        <Polygon
          points={[
            [base[0] - 0.3, base[1] - 0.3],
            [base[0] + 0.3, base[1] - 0.3],
            [base[0] + 0.3, base[1] + 0.3],
            [base[0] - 0.3, base[1] + 0.3],
          ]}
          color={COLOR.i}
          fillOpacity={0.3}
        />
        <Arrow tail={[0, 0]} tip={base} color={COLOR.i} dashed label={`+${pairText(base)}`} labelAt="middle" />
        <PlaneLabel x={base[0]} y={base[1]} attach="s" distance={18} size={13} color={COLOR.i}>
          robot base
        </PlaneLabel>
        <Point x={gripper[0]} y={gripper[1]} color={COLOR.j} />
        <PlaneLabel x={gripper[0]} y={gripper[1]} attach="n" distance={12} size={13} color={COLOR.j}>
          gripper
        </PlaneLabel>
        <Point x={cup[0]} y={cup[1]} color={COLOR.v} />
        <PlaneLabel x={cup[0]} y={cup[1]} attach="se" distance={10} size={14} color={COLOR.v}>
          cup
        </PlaneLabel>
        <PlaneLabel x={0} y={0} attach="se" distance={6} size={12} color="var(--muted)">
          room corner
        </PlaneLabel>
      </MapPlane>
      <ol className="mt-3 mb-0 list-none p-0 text-sm" aria-label="The cup's coordinates in each frame">
        {pos.map((p, k) => (
          <li key={FRAME_NAMES[k]} className="border-b border-line py-1">
            In the <strong>{FRAME_NAMES[k]}</strong>&rsquo;s frame: <span className="font-mono">{pairText(p)}</span>
            {k > 0 && (
              <span className="text-muted">
                {' '}
                = {pairText(pos[k - 1])} + {pairText(CHAIN[k - 1].offset)}, where the {CHAIN[k - 1].holder} sits
              </span>
            )}
          </li>
        ))}
      </ol>
      <Readout>
        The <Tag color={COLOR.v}>cup</Tag> is {pairText(CUP_IN_GRIPPER)} from the gripper,{' '}
        {pairText(pos[1])} from the robot base, {pairText(pos[2])} in the room and {pairText(pos[3])} on the
        building map. One cup, four addresses.
      </Readout>
      <ArmCheck />
    </>
  )
}

/** A quick check: the arm reaches somewhere new; where is the cup in the room? */
function ArmCheck() {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const answer = practiceAnswer()
  const right = approxEqualVec([x, y], answer)
  return (
    <div className="mt-4 rounded-xl border border-line p-3">
      <p className="m-0 text-sm">
        <strong>Check:</strong> the arm reaches so the gripper is at {pairText(PRACTICE_GRIPPER)} in the robot&rsquo;s
        frame. The cup is still {pairText(CUP_IN_GRIPPER)} ahead of the gripper, and the robot has not moved. Where
        is the cup in the room?
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <NumberField label="cup x in the room" value={x} onChange={setX} step={1} min={0} max={20} />
        <NumberField label="cup y in the room" value={y} onChange={setY} step={1} min={0} max={20} />
      </div>
      <p className="m-0 mt-2 text-sm" role="status">
        {right
          ? `Right: ${pairText(CUP_IN_GRIPPER)} + ${pairText(PRACTICE_GRIPPER)} + ${pairText(CHAIN[1].offset)} = ${pairText(answer)}. Add one offset per frame.`
          : 'Add the offsets one frame at a time: cup in gripper, plus gripper in robot, plus robot in room.'}
      </p>
    </div>
  )
}
