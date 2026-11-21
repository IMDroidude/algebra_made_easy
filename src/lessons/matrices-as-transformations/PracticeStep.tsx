import { Polygon } from 'mafs'
import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { MatrixInput } from '../../components/MatrixInput'
import { DraggableArrow, Plane, TransformedGrid } from '../../components/Plane'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmtDet, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import {
  IDENTITY2,
  apply2,
  approxEqualVec,
  columns2,
  det2,
  fromColumns2,
  isSingular2,
  isZero,
} from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'

/** An "F" shape: asymmetric, so flips and turns are easy to see. */
const SHAPE: Vec2[] = [
  [0, 0],
  [0, 2],
  [1.5, 2],
  [1.5, 1.5],
  [0.5, 1.5],
  [0.5, 1.25],
  [1, 1.25],
  [1, 0.75],
  [0.5, 0.75],
  [0.5, 0],
]

const matches = (m: Mat2, target: Mat2) => approxEqualVec(m.flat(), target.flat())

const CHECKS: Record<string, (m: Mat2) => boolean> = {
  mirror: (m) => matches(m, [[-1, 0], [0, 1]]),
  shear: (m) => matches(m, [[1, 1], [0, 1]]),
  rotate: (m) => matches(m, [[0, -1], [1, 0]]),
  collapse: (m) => isSingular2(m) && m.flat().some((x) => !isZero(x)),
}

const ITEMS: Challenge[] = [
  {
    id: 'mirror',
    title: 'Mirror',
    task: (
      <p className="m-0">
        Flip the plane left to right, like a mirror standing on the y-axis: every point (x, y)
        should go to (−x, y).
      </p>
    ),
    insight: (
      <p className="m-0">
        î now points left and ĵ is untouched. The determinant is −1: areas keep their size, but
        the F reads backwards. A negative determinant means the plane was flipped over.
      </p>
    ),
  },
  {
    id: 'shear',
    title: 'Lean',
    task: (
      <p className="m-0">
        Make the F lean to the right like italic text: the floor stays where it is, and the point
        (0, 1) slides across to (1, 1).
      </p>
    ),
    insight: (
      <p className="m-0">
        This is a shear. î did not move, so the x-axis is unchanged; ĵ tipped over. The
        determinant is still 1: the shape is distorted but its area is not.
      </p>
    ),
  },
  {
    id: 'rotate',
    title: 'Quarter turn',
    task: (
      <p className="m-0">Rotate the whole plane a quarter turn counter-clockwise (90°).</p>
    ),
    insight: (
      <p className="m-0">
        î turned to where ĵ was, (0, 1), and ĵ turned to (−1, 0). You found a rotation matrix
        without any trigonometry, just by asking where the two arrows land.
      </p>
    ),
  },
  {
    id: 'collapse',
    title: 'Flatten',
    task: (
      <p className="m-0">
        Squash the entire plane onto a single line (not just a single point).
      </p>
    ),
    insight: (
      <p className="m-0">
        î and ĵ lie along the same line, so every output does too. The determinant is 0: area is
        destroyed, different inputs land on the same output, and no matrix can undo this.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [m, setMatrix] = useState<Mat2>(IDENTITY2)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setM = (next: Mat2) => {
    setMatrix(next)
    const solved = Object.keys(CHECKS).filter((id) => CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const [iHat, jHat] = columns2(m)
  const det = det2(m)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Build these four transformations yourself"
      visual={
        <>
          <Plane label="Practice plane with draggable basis vectors and an F shape">
            <TransformedGrid matrix={m} color={COLOR.grid} />
            <Polygon
              points={SHAPE.map((q) => apply2(m, q))}
              color={COLOR.v}
              fillOpacity={0.3}
            />
            <DraggableArrow
              value={iHat}
              onChange={(next) => setM(fromColumns2(next, jHat))}
              color={COLOR.i}
              label="î"
            />
            <DraggableArrow
              value={jHat}
              onChange={(next) => setM(fromColumns2(iHat, next))}
              color={COLOR.j}
              label="ĵ"
            />
          </Plane>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <MatrixInput value={m} onChange={setM} />
            <Button variant="secondary" onClick={() => setM(IDENTITY2)}>
              Reset to identity
            </Button>
          </div>
          <Readout>
            <Tag color={COLOR.i}>î</Tag> lands at {fmtVec(iHat)}, <Tag color={COLOR.j}>ĵ</Tag> lands
            at {fmtVec(jHat)}. Determinant {fmtDet(det)}
            {isSingular2(m) && ' (treated as singular)'}.
          </Readout>
        </>
      }
    >
      <p>
        No answers are shown. Drag î and ĵ, or type into the matrix, until the{' '}
        <Tag color={COLOR.v}>F</Tag> does what each task asks. A task is ticked as soon as your
        matrix does it; reset between tasks if you like.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
