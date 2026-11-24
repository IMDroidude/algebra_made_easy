import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Button, Readout, Step } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import type { Vec2 } from '../../linalg'
import { chebyshev, euclidean, manhattan } from '../../linalg/distance'
import { cosineSimilarity } from '../../linalg/projection'
import { pyFixed } from '../dot-product/pyFormat'
import { PRACTICE_A, PRACTICE_CHECKS, PRACTICE_START, QUIZ, QUIZ_MEASURES } from './content'
import type { QuizMeasure } from './content'
import { GapLines } from './Drawings'

const A = PRACTICE_A
const snap = snapTo(1)

const ITEMS: Challenge[] = [
  {
    id: 'straight',
    title: 'No corner to cut',
    task: <p className="m-0">Make the Manhattan and Euclidean distances equal, with B not on top of A.</p>,
    insight: (
      <p className="m-0">
        B is directly beside, above or below A. There is only one leg, so the taxi and the drone
        take the same route, and Chebyshev gives the same number as well.
      </p>
    ),
  },
  {
    id: 'diagonal',
    title: 'The biggest disagreement',
    task: <p className="m-0">Make the Manhattan distance exactly twice the Chebyshev distance.</p>,
    insight: (
      <p className="m-0">
        B is on an exact diagonal from A: both legs are the same length. This is where the
        measures differ most. Manhattan is twice Chebyshev, and √2 ≈ 1.41 times Euclidean.
      </p>
    ),
  },
  {
    id: 'parallel',
    title: 'Same direction, far apart',
    task: (
      <p className="m-0">
        Make the cosine similarity of A and B exactly 1 while the Euclidean distance is at least 4.
      </p>
    ),
    insight: (
      <p className="m-0">
        B is a multiple of A: (6, 3) is 3 × (2, 1). As arrows from the origin they point the same
        way, so cosine calls them identical, while as places they are far apart. Which of the two
        is right depends on whether size means anything in your data.
      </p>
    ),
  },
]

/** Match each situation to the measure that fits it. */
function MeasureQuiz() {
  const [picks, setPicks] = useState<Record<string, QuizMeasure | ''>>({})
  const right = QUIZ.filter((q) => picks[q.id] === q.answer).length
  return (
    <div>
      <p role="status" className="m-0 mb-3 text-sm font-medium text-muted">
        {right} of {QUIZ.length} matched
      </p>
      <ol className="m-0 grid list-none gap-3 p-0">
        {QUIZ.map((q, n) => {
          const pick = picks[q.id] ?? ''
          const correct = pick === q.answer
          const tone = pick === '' ? 'border-line bg-surface' : correct ? 'border-ok bg-ok-bg' : 'border-bad bg-bad-bg'
          return (
            <li key={q.id} className={`rounded-xl border-2 p-4 ${tone}`}>
              <p id={`quiz-${q.id}`} className="m-0">
                <span className="font-semibold">{n + 1}.</span> {q.scenario}
              </p>
              <select
                aria-labelledby={`quiz-${q.id}`}
                value={pick}
                onChange={(e) => setPicks({ ...picks, [q.id]: e.target.value as QuizMeasure | '' })}
                className="mt-2 rounded-lg border-2 border-line bg-surface px-2 py-1 text-sm"
              >
                <option value="">Choose a measure…</option>
                {QUIZ_MEASURES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {pick !== '' && (
                <p role="status" className="mt-2 mb-0 text-sm">
                  <strong className={correct ? 'text-ok' : 'text-bad'}>
                    {correct ? '✓ Yes.' : '✗ Not this one.'}
                  </strong>{' '}
                  {correct ? q.why : q.hint}
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function PracticeStep() {
  const [b, setPoint] = useState<Vec2>(PRACTICE_START)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setB = (next: Vec2) => {
    setPoint(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const cos = cosineSimilarity(A, b)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Three targets, then seven situations"
      visual={
        <>
          <Plane x={[-1, 9]} y={[-1, 7]} label="Practice plane: a fixed point A and a draggable point B with the gap between them">
            <GapLines a={A} b={b} />
            <CoordPoint at={A} color={COLOR.grid} />
            <PlaneLabel x={A[0]} y={A[1]} attach="sw" distance={14} size={18} color={COLOR.grid}>
              A
            </PlaneLabel>
            <PlaneLabel x={b[0]} y={b[1]} attach="ne" distance={18} size={18} color={COLOR.grid}>
              B
            </PlaneLabel>
            <DraggablePoint value={b} onChange={setB} color={COLOR.grid} snap={snap} />
          </Plane>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => setB(PRACTICE_START)}>
              Reset B
            </Button>
          </div>
          <Readout>
            A = {fmtVec(A)}, B = {fmtVec(b)}. Euclidean {fmt(euclidean(A, b))}, Manhattan{' '}
            {fmt(manhattan(A, b))}, Chebyshev {fmt(chebyshev(A, b))}
            {cos === null
              ? '. B is at the origin, so it has no direction and the cosine similarity is undefined.'
              : `, cosine similarity ${pyFixed(cos, 3)}.`}
          </Readout>
        </>
      }
    >
      <p>
        A new fixed point A = {fmtVec(A)}. Drag B (or focus it and use the arrow keys) until it
        does what each task asks. A task is ticked as soon as B does it.
      </p>
      <Challenges items={ITEMS} done={done} />
      <h3 className="mt-8 mb-2 font-display text-xl">Which measure fits?</h3>
      <p>
        Seven situations, seven measures, each used once. Pick the one that asks the right
        question. A wrong pick gets a hint, and you can change it.
      </p>
      <MeasureQuiz />
    </Step>
  )
}
