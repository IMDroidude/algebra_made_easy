import { Line, Polygon, Text } from 'mafs'
import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec2 } from '../../linalg'
import { distance, legSquares, square } from './powers'
import { PRACTICE_A, PRACTICE_B_START, PRACTICE_CHECKS } from './practiceData'

const ITEMS: Challenge[] = [
  {
    id: 'area',
    title: 'Root of an area',
    task: (
      <p className="m-0">
        Move B so that the <strong>across</strong> square has an area of exactly 6.25.
      </p>
    ),
    insight: (
      <p className="m-0">
        √6.25 = 2.5, so B must be 2.5 across from A. Left or right both work: 2.5² and (−2.5)² are
        both 6.25. The square root only tells you the size; the sign is lost when you square.
      </p>
    ),
  },
  {
    id: 'negative',
    title: 'Negative sides, positive squares',
    task: (
      <p className="m-0">
        Put B <strong>below and to the left</strong> of A so that both squares have area 4.
      </p>
    ),
    insight: (
      <p className="m-0">
        Δx = −2 and Δy = −2, yet each square has area (−2)² = 4. Distance never goes negative: here
        it is √(4 + 4) = √8 ≈ 2.83, the same as if B were up and to the right.
      </p>
    ),
  },
  {
    id: 'five',
    title: 'Exactly 5, on a slant',
    task: (
      <p className="m-0">
        Put B exactly 5 away from A, but not straight across or straight up (both Δx and Δy must be
        non-zero).
      </p>
    ),
    insight: (
      <p className="m-0">
        3² + 4² = 9 + 16 = 25, and √25 = 5: a whole-number distance from two whole-number sides.
        The squares on the legs always add up to the square on the slant, but the sides themselves
        do not: 3 + 4 is 7, not 5.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [b, setBPoint] = useState<Vec2>(PRACTICE_B_START)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setB = (next: Vec2) => {
    setBPoint(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const legs = legSquares(PRACTICE_A, b)
  const d = distance(PRACTICE_A, b)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Place the point"
      visual={
        <>
          <Plane label="Fixed point A, draggable point B, and squares on the legs of the triangle between them">
            <Polygon points={legs.across} color={COLOR.i} fillOpacity={0.15} weight={1.5} />
            <Polygon points={legs.upDown} color={COLOR.j} fillOpacity={0.15} weight={1.5} />
            <Line.Segment point1={PRACTICE_A} point2={legs.corner} color={COLOR.i} weight={3} />
            <Line.Segment point1={legs.corner} point2={b} color={COLOR.j} weight={3} />
            <Line.Segment point1={PRACTICE_A} point2={b} color={COLOR.result} weight={3} />
            <CoordPoint at={PRACTICE_A} color={COLOR.ghost} />
            <Text x={PRACTICE_A[0]} y={PRACTICE_A[1]} attach="w" attachDistance={14} size={16} color={COLOR.ghost}>
              A
            </Text>
            <DraggablePoint value={b} onChange={setB} color={COLOR.v} />
            <Text x={b[0]} y={b[1]} attach="w" attachDistance={18} size={16} color={COLOR.v}>
              B
            </Text>
          </Plane>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => setB(PRACTICE_B_START)}>
              Reset B
            </Button>
          </div>
          <Readout>
            <Tag color={COLOR.ghost}>A</Tag> = {fmtVec(PRACTICE_A)}, <Tag color={COLOR.v}>B</Tag> ={' '}
            {fmtVec(b)}. <Tag color={COLOR.i}>Across Δx = {fmt(legs.dx)}</Tag>, square area{' '}
            {fmt(square(legs.dx))}. <Tag color={COLOR.j}>Up Δy = {fmt(legs.dy)}</Tag>, square area{' '}
            {fmt(square(legs.dy))}. <Tag color={COLOR.result}>Distance</Tag> √
            {fmt(square(legs.dx) + square(legs.dy))} = {fmt(d, 3)}.
          </Readout>
        </>
      }
    >
      <p>
        A is fixed; drag B (or click it and use the arrow keys, which move it in steps of 0.5). The
        readout gives every square&rsquo;s area and the distance. No answers are shown. A task is
        ticked as soon as B is in a right place.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
