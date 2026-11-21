/**
 * Frames inside frames (Apply, "Robot arm" tab). Every frame here points the
 * same way as the room, so converting between frames is just adding the
 * offset of each frame's origin: translation only, no rotation.
 */
import { add } from '../../linalg'
import type { Vec2 } from '../../linalg'

export type FrameLink = {
  /** Name of the frame the position is written in. */
  frame: string
  /** The thing whose origin sits at `offset` in the next frame out. */
  holder: string
  /** Where this frame's origin sits, measured in the next frame out. */
  offset: Vec2
}

/** The cup, seen by a camera on the gripper. */
export const CUP_IN_GRIPPER: Vec2 = [1, 0]

/** From the inside out: gripper inside robot, robot inside room, room on the map (all in metres). */
export const CHAIN: FrameLink[] = [
  { frame: 'gripper', holder: 'gripper', offset: [4, 3] },
  { frame: 'robot', holder: 'robot base', offset: [5, 2] },
  { frame: 'room', holder: 'room corner', offset: [100, 40] },
]

/** The frame names in order, ending with the outermost one. */
export const FRAME_NAMES = ['gripper', 'robot', 'room', 'map'] as const

/** The cup's coordinates in each frame, inside out: gripper, robot, room, map. */
export function chainPositions(start: Vec2 = CUP_IN_GRIPPER, chain: FrameLink[] = CHAIN): Vec2[] {
  const out: Vec2[] = [start]
  for (const link of chain) out.push(add(out[out.length - 1], link.offset) as Vec2)
  return out
}

/** Room size for the picture (metres). */
export const ARM_ROOM = { w: 12, h: 6 }

/** Practice: the arm reaches to a new spot in the robot's frame; the cup is still 1 m ahead of the gripper. */
export const PRACTICE_GRIPPER: Vec2 = [2, 2]

/** The answer: the cup's position in the room after the reach. */
export const practiceAnswer = (): Vec2 => add(add(CUP_IN_GRIPPER, PRACTICE_GRIPPER), CHAIN[1].offset) as Vec2
