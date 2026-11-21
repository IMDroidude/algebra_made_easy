import { fmt } from '../../lib/format'
import type { Vec2 } from '../../linalg'

export type Email = { name: string; kind: 'normal' | 'spam'; at: Vec2 }

/** Normal and spam emails get their own colours and their own letters (N, S). */
export const EMAIL_COLOR = { normal: '#1971c2', spam: '#d6336c' } as const

/** Two features per email: number of links (x) and number of "!" marks (y). Made-up but typical. */
export const EMAILS: Email[] = [
  { name: 'N1', kind: 'normal', at: [1, 0] },
  { name: 'N2', kind: 'normal', at: [0, 1] },
  { name: 'N3', kind: 'normal', at: [1, 2] },
  { name: 'N4', kind: 'normal', at: [2, 1] },
  { name: 'S1', kind: 'spam', at: [4, 3] },
  { name: 'S2', kind: 'spam', at: [3, 4] },
  { name: 'S3', kind: 'spam', at: [5, 4] },
  { name: 'S4', kind: 'spam', at: [4, 5] },
]

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
