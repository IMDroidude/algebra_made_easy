import { Text } from 'mafs'
import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { CoordPoint } from '../../components/Plane'
import { Button, Step, Tag } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec2 } from '../../linalg'
import { SpanPlane } from './SpanPlane'
import { PRACTICE_START, TARGET, solvedChallenges } from './practice'

const ITEMS: Challenge[] = [
  {
    id: 'collapse',
    title: 'Collapse the span',
    task: (
      <p className="m-0">
        Drag u or v so that the span shrinks to a single line. Neither vector may be the zero
        vector.
      </p>
    ),
    insight: (
      <p className="m-0">
        u and v now lie on one line through the origin: one is a multiple of the other. However you
        set a and b, w cannot leave that line.
      </p>
    ),
  },
  {
    id: 'restore',
    title: 'Restore the plane',
    task: <p className="m-0">After collapsing it, make the span the whole plane again.</p>,
    insight: (
      <p className="m-0">
        Any nudge off the line is enough. Being independent is all or nothing: two vectors at a
        tiny angle still reach every point, they just need large a and b to do it.
      </p>
    ),
  },
  {
    id: 'reach',
    title: 'Hit the star with the sliders',
    task: (
      <p className="m-0">
        With u = (2, −1) and v = (1, 1.5) where they start (press Reset if you moved them), set a
        and b so that w lands on the star at {fmtVec(TARGET)}.
      </p>
    ),
    insight: (
      <p className="m-0">
        a = −1.75 and b = −0.5: −1.75·(2, −1) + (−0.5)·(1, 1.5) = (−4, 1). Because u and v are
        independent, this is the only pair that works.
      </p>
    ),
  },
  {
    id: 'reach-line',
    title: 'Hit the star with a collapsed span',
    task: (
      <p className="m-0">
        Now reach the same star while u and v lie on one line (neither zero). You may move
        anything.
      </p>
    ),
    insight: (
      <p className="m-0">
        It only works if the star is on their line, so the line had to point at (−4, 1). A
        dependent pair reaches the points on its line and nothing else.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [u, setU] = useState<Vec2>(PRACTICE_START.u)
  const [v, setV] = useState<Vec2>(PRACTICE_START.v)
  const [a, setA] = useState(PRACTICE_START.a)
  const [b, setB] = useState(PRACTICE_START.b)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  // Tick challenges from the live state. Ticks stay once earned.
  const now = solvedChallenges({ u, v, a, b }, done)
  if (now.some((id) => !done.has(id))) setDone(new Set([...done, ...now]))

  const reset = () => {
    setU(PRACTICE_START.u)
    setV(PRACTICE_START.v)
    setA(PRACTICE_START.a)
    setB(PRACTICE_START.b)
  }

  return (
    <Step
      n={6}
      kind="Practice"
      title="Collapse, restore, and hit a target"
      visual={
        <>
          <SpanPlane
            u={u}
            setU={setU}
            v={v}
            setV={setV}
            a={a}
            setA={setA}
            b={b}
            setB={setB}
            showSpanAtStart
            extra={
              <>
                {/* Label first, so the point's hover target sits on top of it. */}
                <Text x={TARGET[0]} y={TARGET[1]} attach="n" attachDistance={14} size={14} color={COLOR.result}>
                  ★ star
                </Text>
                <CoordPoint at={TARGET} color={COLOR.result} />
              </>
            }
          />
          <div className="mt-3">
            <Button variant="secondary" onClick={reset}>
              Reset u, v, a and b
            </Button>
          </div>
        </>
      }
    >
      <p>
        New vectors this time: <Tag color={COLOR.i}>u</Tag> = (2, −1) and{' '}
        <Tag color={COLOR.j}>v</Tag> = (1, 1.5). Drag them, move the sliders, and watch the span.
        Each task is ticked as soon as the live state meets it.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
