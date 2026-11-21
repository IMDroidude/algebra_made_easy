import { fmtVec } from '../../lib/format'
import { approxEqualVec, isZero } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { moveText, walkSentence } from './plane'

/**
 * The "read and plot" quiz in the Practice step, after coordinategrid.com's
 * Practice Mode: read a highlighted point, plot a given point, or follow a
 * move from a starting point. Wrong answers are diagnosed (swapped x and y,
 * wrong sign, counted from the origin) instead of just marked wrong.
 * None of these points appear elsewhere in the lesson.
 */
export type Question =
  | { kind: 'read'; target: Vec2 }
  | { kind: 'plot'; target: Vec2 }
  | { kind: 'move'; start: Vec2; by: Vec2 }

export const QUIZ: Question[] = [
  { kind: 'read', target: [-4, 3] },
  { kind: 'plot', target: [2, -5] },
  { kind: 'read', target: [0, -6] },
  { kind: 'plot', target: [-7, -2] },
  { kind: 'move', start: [-3, -1], by: [-4, 4] },
  { kind: 'read', target: [5, -8] },
]

/** Where the answer should be. */
export function answerOf(q: Question): Vec2 {
  if (q.kind === 'move') return [q.start[0] + q.by[0], q.start[1] + q.by[1]]
  return q.target
}

const same = (a: Vec2, b: Vec2) => approxEqualVec(a, b)
const clean = ([x, y]: Vec2): Vec2 => [x + 0, y + 0]

/**
 * Four answer choices for a read or move question: the right one plus the
 * classic slips. Kept in a fixed, non-revealing order (sorted by x, then y).
 */
export function choicesFor(q: Question): Vec2[] {
  const a = answerOf(q)
  const [x, y] = a
  const candidates: Vec2[] =
    q.kind === 'move'
      ? [a, q.by, [q.start[0] - q.by[0], y], [x, q.start[1] - q.by[1]], [y, x]]
      : [a, [y, x], [-x, y], [x, -y], [-y, -x], [-x, -y], [-y, x]]
  const out: Vec2[] = []
  for (const c of candidates.map(clean)) {
    if (out.length < 4 && !out.some((o) => same(o, c))) out.push(c)
  }
  return out.sort((p, r) => p[0] - r[0] || p[1] - r[1])
}

export type Verdict = { correct: boolean; title: string; detail: string }

/** Marks an answer and names the likely slip behind a wrong one. */
export function diagnose(q: Question, given: Vec2): Verdict {
  const a = answerOf(q)
  const [x, y] = a
  const how =
    q.kind === 'move'
      ? `Start at ${fmtVec(q.start)}: ${moveText(q.by[0], 'right', 'left', 'x')} gives x = ${x}, then ${moveText(q.by[1], 'up', 'down', 'y')} gives y = ${y}. You land on ${fmtVec(a)}.`
      : `${walkSentence(a)}: that is ${fmtVec(a)}.`
  if (same(given, a)) return { correct: true, title: `Correct: ${fmtVec(a)}.`, detail: how }

  const [gx, gy] = given
  let title = `Not quite: you chose ${fmtVec(given)}.`
  if (q.kind === 'move' && same(given, q.by)) {
    title += ' You counted the move from the origin, not from the starting point.'
  } else if (same(given, [y, x])) {
    title += ' You swapped x and y. The first number is always left–right.'
  } else if (q.kind !== 'move' && isZero(x) && isZero(gy) && !isZero(gx)) {
    title += ` x is 0, so the point is on the y-axis, not the x-axis.`
  } else if (q.kind !== 'move' && isZero(y) && isZero(gx) && !isZero(gy)) {
    title += ` y is 0, so the point is on the x-axis, not the y-axis.`
  } else if (same(given, [-x, y])) {
    title += ' The sign of x is flipped: check which side of the y-axis it is on.'
  } else if (same(given, [x, -y])) {
    title += ' The sign of y is flipped: check whether it is above or below the x-axis.'
  } else if (same(given, [-x, -y])) {
    title += ' Both signs are flipped.'
  } else if (q.kind === 'move' && Math.sign(gx - q.start[0]) !== Math.sign(q.by[0])) {
    title += ' You moved the wrong way along x.'
  } else if (q.kind === 'move' && Math.sign(gy - q.start[1]) !== Math.sign(q.by[1])) {
    title += ' You moved the wrong way along y.'
  }
  return { correct: false, title, detail: how }
}

/** The question as a sentence. */
export function promptOf(q: Question): string {
  if (q.kind === 'read') return 'What are the coordinates of the point marked “?”'
  if (q.kind === 'plot') return `Put the point A at ${fmtVec(q.target)}, then check.`
  return `You are at ${fmtVec(q.start)}. Move ${moveText(q.by[0], 'right', 'left', 'x')} and ${moveText(q.by[1], 'up', 'down', 'y')}. Where do you land?`
}
