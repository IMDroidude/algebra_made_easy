import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { MatrixInput } from '../../components/MatrixInput'
import { Button, Step } from '../../components/ui'
import { IDENTITY2 } from '../../linalg'
import type { Mat2 } from '../../linalg'
import { CHECKS } from './challenges'
import { SweepPlane } from './SweepPlane'

const ITEMS: Challenge[] = [
  {
    id: 'twoAndMinusOne',
    title: 'Stretch one way, flip the other',
    task: <p className="m-0">Build a matrix whose eigenvalues are exactly 2 and −1.</p>,
    insight: (
      <p className="m-0">
        The simplest answer puts them on the diagonal: [[2, 0], [0, −1]] doubles x and flips y.
        Any matrix with trace 1 and determinant −2 works too, because the eigenvalues add up to
        the trace and multiply to the determinant.
      </p>
    ),
  },
  {
    id: 'everyFlipped',
    title: 'Every direction, flipped and halved',
    task: (
      <p className="m-0">
        Make <em>every</em> vector an eigenvector, with eigenvalue −0.5: each arrow flips round and
        shrinks to half its length.
      </p>
    ),
    insight: (
      <p className="m-0">
        Only −0.5 × the identity does this. A matrix that keeps every line must be a plain
        number times I; anything else turns at least one direction.
      </p>
    ),
  },
  {
    id: 'turnAndScale',
    title: 'Turn and grow',
    task: (
      <p className="m-0">
        Make a matrix with no real eigenvectors that is not a pure rotation: it should also change
        the area of shapes (its determinant is not ±1).
      </p>
    ),
    insight: (
      <p className="m-0">
        Sweep v round: nothing stays on its line, yet the trace is no longer a circle. Complex
        eigenvalues mean &ldquo;some turning is going on&rdquo;, not &ldquo;pure rotation&rdquo;.
      </p>
    ),
  },
  {
    id: 'oneTwo',
    title: 'Choose the eigenvector',
    task: (
      <p className="m-0">
        Make (1, 2) an eigenvector with eigenvalue 2, without making every direction an
        eigenvector. Set the angle slider to 63.4° to check.
      </p>
    ),
    insight: (
      <p className="m-0">
        You needed A·(1, 2) = (2, 4): two equations, a + 2b = 2 and c + 2d = 4, with four unknowns,
        so there are many answers. Fixing one eigenvector still leaves the matrix freedom
        elsewhere.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [m, setMatrix] = useState<Mat2>(IDENTITY2)
  const [angle, setAngle] = useState(30)
  const [showEigen, setShowEigen] = useState(true)
  const [showTrace, setShowTrace] = useState(false)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setM = (next: Mat2) => {
    setMatrix(next)
    const solved = Object.keys(CHECKS).filter((id) => CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  return (
    <Step
      n={6}
      kind="Practice"
      title="Build matrices with the eigenvectors you want"
      visual={
        <>
          <SweepPlane
            matrix={m}
            angle={angle}
            onAngle={setAngle}
            label="Practice plane: a unit vector v, Av, and the eigen directions of your matrix"
            showEigen={showEigen}
            onShowEigen={setShowEigen}
            showTrace={showTrace}
            onShowTrace={setShowTrace}
          />
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <MatrixInput value={m} onChange={setM} />
            <Button variant="secondary" onClick={() => setM(IDENTITY2)}>
              Reset to identity
            </Button>
          </div>
        </>
      }
    >
      <p>
        No answers are shown. Type into the matrix until it does what each task asks; a task is
        ticked as soon as your matrix does it. The eigen directions are shown to help you check;
        switch them off for a harder time.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
