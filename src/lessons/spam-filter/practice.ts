import { approxEqual } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { mistakes, sameLine, verdict } from './classifier'
import type { Example, Model } from './classifier'
import { MODEL } from './data'

export const PRACTICE_START: Vec2 = [5, 1]

/** Which challenges the live state solves. */
export function solved(data: readonly Example[], model: Model | null, e: Vec2): Set<string> {
  const done = new Set<string>()
  if (!model) return done
  const v = verdict(model.w, model.b, e)
  if (v === 'on the line') done.add('on-line')
  if (approxEqual(e[0], 1) && v === 'spam') done.add('one-link')
  if (!sameLine(model, MODEL)) done.add('move')
  if (mistakes(model, data).length > 0) done.add('fool')
  return done
}
