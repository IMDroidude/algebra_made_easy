import { fmt, numpyVec } from '../../lib/format'
import { combine2, numpySolve2 } from '../../linalg/span'
import type { Vec2 } from '../../linalg'
import { numpyPrint as numpyPrint1d } from '../../lib/format'

/**
 * The Apply step: a movie described by two made-up scores (action, romance),
 * re-described as a mix of two "learned" feature directions.
 */
export const F1: Vec2 = [1, 1]
export const F2_GOOD: Vec2 = [1, -1]
/** A feature that adds nothing new: it is just −1 times f1. */
export const F2_REDUNDANT: Vec2 = [-1, -1]

export const MOVIE_START: Vec2 = [3, 1]

export type Decomposition =
  | { ok: true; c: Vec2; rebuilt: Vec2 }
  | { ok: false }

/** How much of f1 and f2 make up x, computed exactly as np.linalg.solve would. */
export function decompose(x: Vec2, f1: Vec2, f2: Vec2): Decomposition {
  const c = numpySolve2(f1, f2, x)
  if (!c) return { ok: false }
  return { ok: true, c, rebuilt: combine2(c[0], f1, c[1], f2) }
}

const pad = (s: string, n: number) => s.padEnd(n)

/** The NumPy snippet for the Apply step and the output NumPy prints for it. */
export function featureSnippet(x: Vec2, f2: Vec2): { code: string; output: string } {
  const lines = [
    [numpyVec('x', x), `# a movie: action ${fmt(x[0])}, romance ${fmt(x[1])}`],
    [numpyVec('f1', F1), '# feature 1'],
    [numpyVec('f2', f2), '# feature 2'],
  ]
  const width = Math.max(...lines.map(([c]) => c.length)) + 2
  const code = [
    'import numpy as np',
    '',
    ...lines.map(([c, comment]) => pad(c, width) + comment),
    '',
    'F = np.column_stack([f1, f2])   # f1 and f2 as columns',
    'c = np.linalg.solve(F, x)       # how much of each feature',
    'print(c)',
    'print(c[0] * f1 + c[1] * f2)    # mix them back together',
  ].join('\n')
  const d = decompose(x, F1, f2)
  const output = d.ok
    ? `${numpyPrint1d(d.c, false)}\n${numpyPrint1d(d.rebuilt, false)}`
    : 'Traceback (most recent call last):\n  ...\nnumpy.linalg.LinAlgError: Singular matrix'
  return { code, output }
}
