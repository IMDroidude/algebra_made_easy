import { fmt } from '../../lib/format'
import { npArray, npFloat } from '../../lib/numpy'
import { matVec } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { centres, fisherDirection, withinScatter } from './classifier'
import type { Example } from './classifier'
import { EMAILS, MODEL } from './data'

/**
 * The NumPy code shown in the lesson, and exactly what NumPy prints for it.
 * Outputs are built with lib/numpy and checked against real NumPy in
 * tests/lessons/spam-filter/numpy.test.ts.
 */

/** print() of a NumPy bool array: every entry is 5 characters wide. */
export function npBools(values: readonly boolean[]): string {
  return `[${values.map((b) => (b ? ' True' : 'False')).join(' ')}]`
}

/** X and y as Python literals, four rows per line. */
export function dataCode(data: readonly Example[]): string {
  const head = 'X = np.array(['
  const pad = ' '.repeat(head.length)
  const rows = data.map((e) => `[${fmt(e.at[0])}, ${fmt(e.at[1])}]`)
  const lines = [rows.slice(0, 4).join(', '), rows.slice(4).join(', ')]
  const labels = data.map((e) => (e.kind === 'spam' ? 1 : 0)).join(', ')
  return [
    '# one email per row: links, "!" marks',
    `${head}${lines.join(`,\n${pad}`)}])`,
    `y = np.array([${labels}])  # 0 = normal, 1 = spam`,
  ].join('\n')
}

/** Step 1: the table as a matrix, and one row of it. */
export function tableSnippet(row: number) {
  const code = ['import numpy as np', '', dataCode(EMAILS), '', 'print(X.shape)', `print(X[${row}])   # row ${row + 1}: ${EMAILS[row].name}`].join(
    '\n',
  )
  return { code, output: `(${EMAILS.length}, 2)\n${npArray(EMAILS[row].at, true)}` }
}

/** Step 2: the two centres and their difference, for the (possibly dragged) data. */
export function centresSnippet(data: readonly Example[]) {
  const c = centres(data)
  const code = [
    'import numpy as np',
    '',
    dataCode(data),
    '',
    'mu_normal = X[y == 0].mean(axis=0)',
    'mu_spam = X[y == 1].mean(axis=0)',
    'print(mu_normal)',
    'print(mu_spam)',
    'print(mu_spam - mu_normal)',
  ].join('\n')
  const d: Vec2 = [c.spam[0] - c.normal[0], c.spam[1] - c.normal[1]]
  return { code, output: [npArray(c.normal), npArray(c.spam), npArray(d)].join('\n') }
}

/** Step 4: the whole recipe on the shared emails. */
export function recipeSnippet() {
  const code = [
    'import numpy as np',
    '',
    dataCode(EMAILS),
    '',
    'mu_normal = np.ones(4) @ X[y == 0] / 4   # 1ᵀX / 4: the mean',
    'mu_spam = np.ones(4) @ X[y == 1] / 4',
    'd = mu_spam - mu_normal',
    'w = d / 3                     # same direction, tidier numbers',
    'mid = (mu_normal + mu_spam) / 2',
    'b = w @ mid',
    'print(d, w)',
    'print(mid, b)',
  ].join('\n')
  const output = [
    `${npArray(MODEL.difference)} ${npArray(MODEL.w)}`,
    `${npArray(MODEL.midpoint)} ${npFloat(MODEL.b)}`,
  ].join('\n')
  return { code, output }
}

/** The advanced part: within-class scatter and Fisher's direction. */
export function scatterSnippet(data: readonly Example[]) {
  const code = [
    'import numpy as np',
    '',
    dataCode(data),
    '',
    'mu_normal = X[y == 0].mean(axis=0)',
    'mu_spam = X[y == 1].mean(axis=0)',
    'dev_n = X[y == 0] - mu_normal   # each email minus its own centre',
    'dev_s = X[y == 1] - mu_spam',
    'S_w = dev_n.T @ dev_n + dev_s.T @ dev_s',
    'print(S_w)',
    'print(np.linalg.solve(S_w, mu_spam - mu_normal))',
  ].join('\n')
  const s = withinScatter(data)
  const f = fisherDirection(data)
  return { code, output: `${npArray(s)}\n${f ? npArray(f) : ''}` }
}

/** Step 5: every email scored at once, plus the learner's new email. */
export function scoresSnippet(newEmail: Vec2) {
  const w = MODEL.w
  const X = EMAILS.map((e) => e.at)
  const scores = matVec(X, w)
  const s = newEmail[0] * w[0] + newEmail[1] * w[1]
  const code = [
    'import numpy as np',
    '',
    dataCode(EMAILS),
    `w = np.array([${fmt(w[0])}, ${fmt(w[1])}])`,
    `b = ${fmt(MODEL.b)}`,
    '',
    'scores = X @ w        # one dot product per row',
    'print(scores)',
    'print(scores > b)     # True means "spam"',
    '',
    `new = np.array([${fmt(newEmail[0])}, ${fmt(newEmail[1])}])`,
    'print(new @ w, new @ w > b)',
  ].join('\n')
  const output = [npArray(scores, true), npBools(scores.map((x) => x > MODEL.b)), `${s} ${s > MODEL.b ? 'True' : 'False'}`].join(
    '\n',
  )
  return { code, output }
}
