import { fmt } from '../../lib/format'
import type { Vec2 } from '../../linalg'

// The emails are shared with lesson 5.1 (the spam filter), so they live in src/data.
export { EMAILS, EMAIL_COLOR } from '../../data/emails'
export type { Email } from '../../data/emails'
import { EMAILS } from '../../data/emails'

export const NEW_EMAIL_START: Vec2 = [2, 3]

/** The NumPy for the Apply step: the dataset, its shape, and the new email as a row. */
export function emailCode([x, y]: Vec2): string {
  const head = 'X = np.array(['
  const pad = ' '.repeat(head.length)
  const rows = EMAILS.map((e) => `[${fmt(e.at[0])}, ${fmt(e.at[1])}]`)
  return [
    'import numpy as np',
    '',
    '# one email per row: links, exclamation marks',
    `${head}${rows.join(`,\n${pad}`)}])`,
    `new = np.array([${fmt(x)}, ${fmt(y)}])`,
    '',
    'print(X.shape)',
    'print(new)',
  ].join('\n')
}
