import type { Vec2 } from '../linalg'

/**
 * The course's second shared dataset: eight emails described by two
 * features, number of links (x) and number of "!" marks (y). Met first in
 * lesson 1.2 as points, then used in 5.1 to learn a spam filter. Made-up but
 * typical; chosen so both groups are round clouds of the same size.
 */
export type Email = { name: string; kind: 'normal' | 'spam'; at: Vec2 }

/** Normal and spam emails get their own colours and their own letters (N, S). */
export const EMAIL_COLOR = { normal: '#1971c2', spam: '#d6336c' } as const

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
