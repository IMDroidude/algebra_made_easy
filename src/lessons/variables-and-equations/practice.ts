/** Practice equations and the checks for their challenges. Pure logic, no React. */
import { eq, isBalanced, isSolved, replay, solve } from './equation'
import type { Equation, Move } from './equation'

/** Equations not seen earlier in the lesson. */
export const PRACTICE: Equation[] = [eq(5, 4, 0, 29), eq(2, -6, 0, 8), eq(0, 20, 4, 8)]

export type Moves = Move[][]

const solvedAt = (all: Moves, k: number) => {
  const steps = replay(PRACTICE[k], all[k])
  return isSolved(steps[steps.length - 1], solve(PRACTICE[k]) ?? 0)
}

/** Which challenges the current moves satisfy. */
export function practiceDone(all: Moves): string[] {
  const done: string[] = []
  if (solvedAt(all, 0)) done.push('five')
  if (solvedAt(all, 1)) done.push('minus')
  if (solvedAt(all, 2)) done.push('right')
  const neat = PRACTICE.some((e, k) => {
    const xTrue = solve(e) ?? 0
    return solvedAt(all, k) && all[k].length === 2 && replay(e, all[k]).every((q) => isBalanced(q, xTrue))
  })
  if (neat) done.push('neat')
  return done
}

