import { Line } from 'mafs'
import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { MatrixInput } from '../../components/MatrixInput'
import { Arrow, DraggableArrow, Plane } from '../../components/Plane'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtDet, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { Tex } from '../../components/Tex'
import { IDENTITY2, columns2, det2, fromColumns2, inverse2 } from '../../linalg'
import { nullSpace2, rank2 } from '../../linalg/systems'
import type { Mat2 } from '../../linalg'
import { CHECKS, UNDONE_BY } from './challenges'
import { FShape } from './FShape'
import { RANK_SHAPE, texMat2 } from './text'

const ITEMS: Challenge[] = [
  {
    id: 'diagonal',
    title: 'Crush the diagonal',
    task: (
      <p className="m-0">
        Make a rank-1 matrix whose null space is the diagonal line y = x: the point (1, 1) must land
        on the origin.
      </p>
    ),
    insight: (
      <p className="m-0">
        For A(1, 1) = 0 you need column 1 + column 2 = 0, so the columns are opposites: î and ĵ land
        on opposite points. Every point (t, t) on the diagonal is crushed to zero.
      </p>
    ),
  },
  {
    id: 'selfUndo',
    title: 'Its own undo',
    task: (
      <p className="m-0">
        Find a matrix, other than the identity, that is its own inverse: doing it twice gets you
        back to the start.
      </p>
    ),
    insight: (
      <p className="m-0">
        Mirrors (and the half turn, −I) undo themselves: flip twice and nothing has changed. Here
        A⁻¹ = A, so A·A = I.
      </p>
    ),
  },
  {
    id: 'yAxis',
    title: 'Everything onto the y-axis',
    task: (
      <p className="m-0">
        Make the output exactly the y-axis: rank 1, with every point landing somewhere on the
        vertical axis.
      </p>
    ),
    insight: (
      <p className="m-0">
        The outputs are combinations of the columns, so both columns must point straight up or
        down (top row all zeros), and at least one must be non-zero. The output line is called the{' '}
        <strong>column space</strong>.
      </p>
    ),
  },
  {
    id: 'undoneBy',
    title: 'Work backwards',
    task: (
      <div className="m-0">
        Build the matrix that is undone by this one, so that your A⁻¹ equals:
        <Tex block>{texMat2(UNDONE_BY)}</Tex>
      </div>
    ),
    insight: (
      <p className="m-0">
        The undo of an undo is the original: (A⁻¹)⁻¹ = A. The given matrix shears by −2, so yours
        must shear by +2: [[1, 2], [0, 1]].
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
  const rank = rank2(m)
  const ns = nullSpace2(m)
  const inv = inverse2(m)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Build these matrices yourself"
      visual={
        <>
          <Plane label="Practice plane with draggable basis vectors, an F shape and the null space">
            <FShape matrix={m} />
            {ns.dim === 1 && (
              <Line.ThroughPoints point1={[0, 0]} point2={ns.direction} color={COLOR.result} style="dashed" />
            )}
            {ns.dim === 1 && <Arrow tip={ns.direction} color={COLOR.result} label="null space" dashed showCoords />}
            <DraggableArrow value={iHat} onChange={(next) => setM(fromColumns2(next, jHat))} color={COLOR.i} label="î" />
            <DraggableArrow value={jHat} onChange={(next) => setM(fromColumns2(iHat, next))} color={COLOR.j} label="ĵ" />
          </Plane>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <MatrixInput value={m} onChange={setM} />
            <Button variant="secondary" onClick={() => setM(IDENTITY2)}>
              Reset to identity
            </Button>
          </div>
          <Readout>
            <Tag color={COLOR.i}>î</Tag> lands at {fmtVec(iHat)}, <Tag color={COLOR.j}>ĵ</Tag> lands at{' '}
            {fmtVec(jHat)}. Determinant {fmtDet(det2(m))}
            {!inv && ' (treated as singular)'}. Rank {rank}: outputs fill {RANK_SHAPE[rank]}.{' '}
            {inv
              ? `A⁻¹ = [[${fmt(inv[0][0])}, ${fmt(inv[0][1])}], [${fmt(inv[1][0])}, ${fmt(inv[1][1])}]].`
              : 'No inverse.'}
            {ns.dim === 1 && <> <Tag color={COLOR.result}>Null space</Tag>: the line along {fmtVec(ns.direction)}.</>}
            {ns.dim === 2 && ' Null space: the whole plane.'}
          </Readout>
        </>
      }
    >
      <p>
        No answers are shown. Drag î and ĵ, or type into the matrix, until it does what each task
        asks. The readout shows the rank, the inverse and the null space as you go; when there is a
        null space, it is drawn as a dashed green line.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
