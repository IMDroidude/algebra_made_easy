import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { Arrow, DraggableArrow, Plane } from '../../components/Plane'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { dot, norm } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { cosineSimilarity, scalarProjection } from '../../linalg/projection'
import { PRACTICE_CHECKS, PRACTICE_START, PRACTICE_U } from './content'
import { Shadow } from './Drawings'
import { pyFixed } from './pyFormat'

const U = PRACTICE_U

const ITEMS: Challenge[] = [
  {
    id: 'perpendicular',
    title: 'Right angle',
    task: (
      <p className="m-0">
        Make u · w = 0, with w not the zero vector.
      </p>
    ),
    insight: (
      <p className="m-0">
        w is at 90° to u and casts no shadow on it. Every arrow along this line works, at any
        length: in 2D, the vectors with zero dot product against u all lie on one line through
        the origin.
      </p>
    ),
  },
  {
    id: 'opposite',
    title: 'Opposites',
    task: <p className="m-0">Make the cosine similarity of u and w exactly −1.</p>,
    insight: (
      <p className="m-0">
        w points exactly against u. Any length works, since cosine similarity ignores length:
        (−2, 1) and (−4, 2) both score −1, although their dot products with u are −5 and −10.
      </p>
    ),
  },
  {
    id: 'shadow',
    title: 'Same shadow, different arrow',
    task: (
      <p className="m-0">
        Make w&rsquo;s shadow end exactly at the tip of u, without putting w on top of u.
      </p>
    ),
    insight: (
      <p className="m-0">
        The shadow has u&rsquo;s length, so u · w = |u| × |u| = u · u = 5. Slide w along the
        dashed drop line and the shadow, and so the dot product, stays the same: all those arrows
        share one dot product with u.
      </p>
    ),
  },
  {
    id: 'unit',
    title: 'Unit vector',
    task: (
      <p className="m-0">
        Make w a unit vector (length exactly 1) that leans the same way as u (positive dot
        product).
      </p>
    ),
    insight: (
      <p className="m-0">
        With |w| = 1, u · w = |u| cos θ: the dot product is now just the length of u&rsquo;s
        shadow on w. That is why unit vectors are so convenient: dotting with one measures
        &ldquo;how far along this direction&rdquo;.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [w, setVector] = useState<Vec2>(PRACTICE_START)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setW = (next: Vec2) => {
    setVector(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const cos = cosineSimilarity(U, w)
  const shadow = scalarProjection(w, U)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Four targets for one draggable arrow"
      visual={
        <>
          <Plane label="Practice plane: a fixed vector u and a draggable vector w, with w's shadow on u">
            <Shadow a={U} b={w} />
            <Arrow tip={U} color={COLOR.j} label="u" />
            <DraggableArrow value={w} onChange={setW} color={COLOR.v} label="w" />
          </Plane>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => setW(PRACTICE_START)}>
              Reset w
            </Button>
          </div>
          <Readout>
            <Tag color={COLOR.j}>u</Tag> = {fmtVec(U)}, <Tag color={COLOR.v}>w</Tag> = {fmtVec(w)}{' '}
            (length {fmt(norm(w))}). u · w = {fmt(dot(U, w))}
            {cos === null
              ? '. w has length 0, so the cosine similarity is undefined.'
              : `, cosine similarity ${pyFixed(cos, 3)}, shadow of w on u ${fmt(shadow ?? 0)} long (u itself is ${fmt(norm(U))} long).`}
          </Readout>
        </>
      }
    >
      <p>
        A new fixed arrow <Tag color={COLOR.j}>u</Tag> = {fmtVec(U)}. Drag{' '}
        <Tag color={COLOR.v}>w</Tag> (or focus it and use the arrow keys) until it does what each
        task asks. A task is ticked as soon as w does it.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
