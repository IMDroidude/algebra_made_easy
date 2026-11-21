import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { MatrixInput } from '../../components/MatrixInput'
import { DraggableArrow, Plane } from '../../components/Plane'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import { columns2, det2, fromColumns2, isSingular2 } from '../../linalg'
import type { Mat2 } from '../../linalg'
import { SquareImage } from './SquareImage'
import { PRACTICE_START } from './data'
import { describeDet, detText } from './determinant'
import { PRACTICE_CHECKS } from './practice'

const SNAP = snapTo(0.5, 3)

const ITEMS: Challenge[] = [
  {
    id: 'double',
    title: 'Double everything',
    task: (
      <p className="m-0">
        The plane starts at [[1, 1], [−1, 1]], determinant 2. Double all four entries. Before you
        look: does the determinant double too?
      </p>
    ),
    insight: (
      <p className="m-0">
        It goes from 2 to 8, four times as much. Doubling the entries doubles both î and ĵ, so the
        square gets twice as wide <em>and</em> twice as tall. In 2D, scaling a matrix by k
        multiplies its determinant by k².
      </p>
    ),
  },
  {
    id: 'flip',
    title: 'Mirror and triple',
    task: <p className="m-0">Build any matrix with determinant exactly −3.</p>,
    insight: (
      <p className="m-0">
        Area is multiplied by 3 and the F reads backwards. Many matrices do this, for example
        [[3, 0], [0, −1]] or [[0, 1], [3, 0]]: the determinant pins down the area and the flip, not
        the whole matrix.
      </p>
    ),
  },
  {
    id: 'line',
    title: 'Flat, with no zeros',
    task: (
      <p className="m-0">
        Squash the plane onto a line using a matrix with <strong>no zero entries</strong>.
      </p>
    ),
    insight: (
      <p className="m-0">
        î and ĵ point along the same line (one column is a multiple of the other), so ad = bc and
        the determinant is 0. A matrix can look perfectly ordinary and still throw away a whole
        dimension.
      </p>
    ),
  },
  {
    id: 'point',
    title: 'Nothing left',
    task: <p className="m-0">Collapse the whole plane to a single point.</p>,
    insight: (
      <p className="m-0">
        Only the zero matrix does this: both î and ĵ land on the origin. The determinant is 0 here
        too, so it cannot tell a line from a point. Rank, in the next lesson, can.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [m, setMatrix] = useState<Mat2>(PRACTICE_START)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setM = (next: Mat2) => {
    setMatrix(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const [iHat, jHat] = columns2(m)
  const det = det2(m)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Hit these determinants"
      visual={
        <>
          <Plane label="Practice plane: the unit square and F under a matrix with draggable basis vectors" extent={3}>
            <SquareImage m={m} />
            <DraggableArrow value={iHat} onChange={(n) => setM(fromColumns2(n, jHat))} color={COLOR.i} label="î" snap={SNAP} />
            <DraggableArrow value={jHat} onChange={(n) => setM(fromColumns2(iHat, n))} color={COLOR.j} label="ĵ" snap={SNAP} />
          </Plane>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <MatrixInput value={m} onChange={setM} />
            <Button variant="secondary" onClick={() => setM(PRACTICE_START)}>
              Reset
            </Button>
          </div>
          <Readout>
            <span className="block">
              <Tag color={COLOR.i}>î</Tag> lands at {fmtVec(iHat)}, <Tag color={COLOR.j}>ĵ</Tag>{' '}
              lands at {fmtVec(jHat)}. Determinant {detText(det)}
              {isSingular2(m) && ' (treated as singular)'}, area {detText(Math.abs(det))}.
            </span>
            <span className="mt-1 block">{describeDet(m)}</span>
          </Readout>
        </>
      }
    >
      <p>
        No answers are shown. Drag î and ĵ, or type into the matrix, until each goal is met. A goal
        is ticked as soon as your matrix meets it; the Reset button goes back to the starting
        matrix.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
