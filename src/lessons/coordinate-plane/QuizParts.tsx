import { MovablePoint, Point } from 'mafs'
import { Arrow, CoordPoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Button, Readout } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { isZero } from '../../linalg'
import { GridPlane } from './GridPlane'
import { AxisNames, Guides, PointLabels, Quadrants } from './Guides'
import { snapWhole } from './plane'
import { answerOf, choicesFor, promptOf } from './quiz'
import type { QuizState } from './useQuiz'

const MYSTERY = '#e67700'

/** The question, the answer buttons and the feedback (text column of the Practice step). */
export function QuizPanel({ quiz }: { quiz: QuizState }) {
  const { q, verdict, given, finished, score, total, index } = quiz
  if (finished) {
    return (
      <div className="rounded-xl border border-line bg-surface p-4">
        <p role="status" className="m-0 font-semibold">
          Quiz finished: {score} of {total} correct.
        </p>
        <p className="mt-2 mb-3 text-sm">
          {score === total
            ? 'Every point read and placed correctly, signs and order included.'
            : 'Each miss above named its slip. Run it again; the points are the same, so you can check you have fixed it.'}
        </p>
        <Button onClick={quiz.restart}>Start again</Button>
      </div>
    )
  }
  const choices = q.kind === 'plot' ? [] : choicesFor(q)
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="m-0 text-xs font-semibold tracking-wide text-muted uppercase">
        Question {index + 1} of {total} · {score} correct so far
      </p>
      <p className="mt-1 mb-3 font-semibold">{promptOf(q)}</p>
      {q.kind === 'plot' ? (
        <>
          <p className="mt-0 mb-3 text-sm text-muted">
            Click the plane where it goes, or drag A (arrow keys work too). No coordinates are shown
            until you check.
          </p>
          <Button onClick={() => quiz.answer(quiz.placed)} disabled={!!verdict}>
            Check my answer
          </Button>
        </>
      ) : (
        <div role="group" aria-label="Answer choices" className="flex flex-wrap gap-2">
          {choices.map((c) => {
            const chosen = given && given[0] === c[0] && given[1] === c[1]
            const right = verdict && answerOf(q)[0] === c[0] && answerOf(q)[1] === c[1]
            const tone = right ? 'border-ok bg-ok-bg' : chosen ? 'border-bad bg-bad-bg' : 'border-line'
            return (
              <button
                key={`${c[0]},${c[1]}`}
                type="button"
                disabled={!!verdict}
                onClick={() => quiz.answer(c)}
                className={`cursor-pointer rounded-lg border-2 px-3 py-1.5 font-mono text-sm disabled:cursor-default ${tone}`}
              >
                {fmtVec(c)}
              </button>
            )
          })}
        </div>
      )}
      {verdict && (
        <div
          role="status"
          className={`mt-3 rounded-lg border-2 px-3 py-2 text-sm ${verdict.correct ? 'border-ok bg-ok-bg' : 'border-bad bg-bad-bg'}`}
        >
          <p className="m-0 font-semibold">{verdict.title}</p>
          <p className="m-0 mt-1">{verdict.detail}</p>
        </div>
      )}
      {verdict && (
        <div className="mt-3">
          <Button onClick={quiz.next}>{index + 1 < total ? 'Next question' : 'See my score'}</Button>
        </div>
      )}
    </div>
  )
}

/** The plane for the current question (visual column of the Practice step). */
export function QuizPlane({ quiz, height }: { quiz: QuizState; height: number }) {
  const { q, verdict, given, placed, finished } = quiz
  if (finished) return null
  const a = answerOf(q)
  const wrong = verdict && !verdict.correct && given
  return (
    <>
      <GridPlane
        height={height}
        label="Quiz plane"
        onPick={q.kind === 'plot' && !verdict ? quiz.place : undefined}
      >
        <Quadrants />
        <AxisNames />
        {q.kind === 'move' && (
          <>
            <CoordPoint at={q.start} color={COLOR.ghost} />
            <PlaneLabel x={q.start[0]} y={q.start[1]} attach="sw" distance={8} size={14} color={COLOR.ghost}>
              start
            </PlaneLabel>
          </>
        )}
        {q.kind === 'read' && !verdict && (
          <>
            <Point x={a[0]} y={a[1]} color={MYSTERY} />
            <PlaneLabel x={a[0]} y={a[1]} attach="ne" distance={10} size={18} color={MYSTERY}>
              ?
            </PlaneLabel>
          </>
        )}
        {q.kind === 'plot' && !verdict && (
          <>
            <MovablePoint point={placed} onMove={quiz.place} constrain={snapWhole} color={COLOR.v} />
            <PlaneLabel x={placed[0]} y={placed[1]} attach="ne" distance={14} size={16} color={COLOR.v}>
              A
            </PlaneLabel>
          </>
        )}
        {wrong && (
          <>
            <Point x={given[0]} y={given[1]} color="var(--bad)" />
            {/* Away from the y-axis numbers, unless that would run off the right edge. */}
            <PlaneLabel
              x={given[0]}
              y={given[1]}
              attach={given[0] >= 0 && given[0] <= 4 ? 'se' : 'sw'}
              distance={10}
              size={14}
              color="var(--bad)"
            >
              {`your answer ${fmtVec(given)}`}
            </PlaneLabel>
          </>
        )}
        {verdict && (
          <>
            {q.kind === 'move' ? (
              <>
                {!isZero(q.by[0]) && <Arrow tail={q.start} tip={[a[0], q.start[1]]} color={COLOR.i} showCoords={false} />}
                {!isZero(q.by[1]) && <Arrow tail={[a[0], q.start[1]]} tip={a} color={COLOR.j} showCoords={false} />}
              </>
            ) : (
              <Guides p={a} />
            )}
            <CoordPoint at={a} color={COLOR.v} />
            <PointLabels p={a} />
          </>
        )}
      </GridPlane>
      <Readout>
        {verdict
          ? `The answer is ${fmtVec(a)}.${wrong ? ` Your answer, ${fmtVec(given)}, is marked in red.` : ''}`
          : q.kind === 'read'
            ? 'A point marked “?” is on the plane. Which pair of numbers names it?'
            : q.kind === 'plot'
              ? <>Move A to the asked-for spot, then check.<span className="sr-only"> A is at {fmtVec(placed)}.</span></>
              : `The start point ${fmtVec(q.start)} is marked. Follow the move in your head and pick where you land.`}
      </Readout>
    </>
  )
}
