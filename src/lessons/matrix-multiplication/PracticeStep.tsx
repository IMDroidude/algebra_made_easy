import { Polygon } from 'mafs'
import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { MatrixInput } from '../../components/MatrixInput'
import { Plane, TransformedGrid } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { IDENTITY2, apply2, mul2 } from '../../linalg'
import type { Mat2 } from '../../linalg'
import { PRACTICE_A, PRACTICE_CHECKS, SHAPE, texMat } from './content'

const ITEMS: Challenge[] = [
  {
    id: 'undo',
    title: 'Undo',
    task: (
      <p className="m-0">
        Choose B so that AB is the identity: the F ends up exactly where it started.
      </p>
    ),
    insight: (
      <p className="m-0">
        B halves the width and doubles the height, and A then undoes both. A matrix that undoes
        A is called its <strong>inverse</strong>, A⁻¹; a later lesson shows when one exists.
      </p>
    ),
  },
  {
    id: 'turn',
    title: 'Quarter turn',
    task: (
      <p className="m-0">
        Choose B so that AB is a quarter turn counter-clockwise (î lands at (0, 1), ĵ at (−1, 0)).
      </p>
    ),
    insight: (
      <p className="m-0">
        B has to turn the plane <em>and</em> pre-squash it, so that A&rsquo;s stretch puts it
        back in shape. Working backwards like this, B = A⁻¹ × (the turn), is a common trick.
      </p>
    ),
  },
  {
    id: 'commute',
    title: 'Order does not matter',
    task: (
      <p className="m-0">
        Find a B with AB = BA. B must not be the identity or any other plain scaling of it, such
        as 2 × identity.
      </p>
    ),
    insight: (
      <p className="m-0">
        Your B only stretches along the x- and y-axes (zeros off the diagonal), just like A.
        Stretches along the same axes do not interfere, so they can go in either order. Any
        turn or shear breaks this.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [B, setMatrix] = useState<Mat2>(IDENTITY2)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setB = (next: Mat2) => {
    setMatrix(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const AB = mul2(PRACTICE_A, B)
  const BA = mul2(B, PRACTICE_A)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Pick B to get these results"
      visual={
        <>
          <Plane label="Practice plane: the F after B, then the fixed A">
            <TransformedGrid matrix={AB} color={COLOR.grid} />
            <Polygon points={SHAPE} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
            <Polygon points={SHAPE.map((q) => apply2(AB, q))} color={COLOR.v} fillOpacity={0.3} />
          </Plane>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <MatrixInput value={B} onChange={setB} name="B" />
            <Button variant="secondary" onClick={() => setB(IDENTITY2)}>
              Reset B to identity
            </Button>
          </div>
          <Readout>
            <Tag color={COLOR.v}>AB</Tag> has rows {fmtVec(AB[0])} and {fmtVec(AB[1])}; the dashed
            F is the original. For comparison, BA has rows {fmtVec(BA[0])} and {fmtVec(BA[1])}.
          </Readout>
        </>
      }
    >
      <p>A is fixed: it makes everything twice as wide and half as tall.</p>
      <Tex block>{String.raw`A = ${texMat(PRACTICE_A)}`}</Tex>
      <p>
        You choose B, which acts <em>first</em>; the plane shows the{' '}
        <Tag color={COLOR.v}>F</Tag> after AB. Type into B (arrow keys step by 0.5). A task is
        ticked as soon as your B does it.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
