import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { MatrixInput } from '../../components/MatrixInput'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { IDENTITY2, det2, scale } from '../../linalg'
import { svd2 } from '../../linalg/svd'
import type { Mat2 } from '../../linalg'
import { CHECKS } from './challenges'
import { SIGMA1, SIGMA2 } from './colors'
import { columnsOf, extentFor } from './describe'
import { StagePlane } from './StagePlane'

const ITEMS: Challenge[] = [
  {
    id: 'bigCircle',
    title: 'A bigger circle, the hard way',
    task: (
      <p className="m-0">
        Make the circle grow into a circle of radius 2, using any matrix except 2 × the identity.
      </p>
    ),
    insight: (
      <p className="m-0">
        σ₁ = σ₂ = 2: the stretch step scales both axes equally, so the turns around it cannot
        change the shape. Any rotation (or reflection) times 2 does this, for example
        [[0, −2], [2, 0]].
      </p>
    ),
  },
  {
    id: 'diagonal',
    title: 'Along the diagonal',
    task: (
      <p className="m-0">
        Make an ellipse with semi-axes 3 and 1 whose long axis lies along the line y = x.
      </p>
    ),
    insight: (
      <p className="m-0">
        U has to turn the x-axis onto the diagonal, so u₁ is (0.71, 0.71). One answer is the
        symmetric [[2, 1], [1, 2]]: for a symmetric matrix with positive eigenvalues, the SVD and
        the eigen-decomposition are the same thing.
      </p>
    ),
  },
  {
    id: 'segment',
    title: 'Flatten to a segment',
    task: (
      <p className="m-0">
        Squash the circle onto a line segment 4 units long (from −2 to 2 along its line).
      </p>
    ),
    insight: (
      <p className="m-0">
        σ₂ = 0 and σ₁ = 2: the matrix has rank 1 and its determinant is 0. The number of
        non-zero singular values is the rank, the link used for image compression in step 5.
      </p>
    ),
  },
  {
    id: 'mirrored',
    title: 'Same stretch, mirrored',
    task: (
      <p className="m-0">
        Make a matrix with singular values 2 and 1 that also flips the plane over (negative
        determinant).
      </p>
    ),
    insight: (
      <p className="m-0">
        The ellipse looks no different from an unflipped one; singular values ignore the flip.
        It hides in U or V, and the determinant, −2 = −σ₁σ₂, is where you see it.
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

  const s = svd2(m)
  const [u1, u2] = columnsOf(s.U)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Shape the ellipse"
      visual={
        <>
          <StagePlane svd={s} stage={3} extent={Math.max(4, extentFor(s))} label="Practice plane: the unit circle after your matrix" />
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <MatrixInput value={m} onChange={setM} />
            <Button variant="secondary" onClick={() => setM(IDENTITY2)}>
              Reset to identity
            </Button>
          </div>
          <Readout>
            σ₁ = {fmt(s.sigma[0])} along <Tag color={SIGMA1}>σ₁u₁</Tag> ={' '}
            {fmtVec(scale(u1, s.sigma[0]))}, σ₂ = {fmt(s.sigma[1])} along{' '}
            <Tag color={SIGMA2}>σ₂u₂</Tag> = {fmtVec(scale(u2, s.sigma[1]))}. Determinant{' '}
            {fmt(det2(m))}.
          </Readout>
        </>
      }
    >
      <p>
        No answers are shown. Type into the matrix until the ellipse does what each task asks; a
        task is ticked as soon as your matrix does it. Think in three steps: which way should
        things turn, how much should each axis stretch, where should it end up?
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
