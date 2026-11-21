import { fmt } from '../../lib/format'
import type { Vec3 } from '../../linalg/project3d'

export type Fruit = { name: string; kind: 'apple' | 'lemon'; at: Vec3 }

/** Apples and lemons get their own colours and their own letters (A, L). */
export const FRUIT_COLOR = { apple: '#d6336c', lemon: '#a67c00' } as const

/**
 * Made-up but plausible measurements: weight in units of 50 g, roundness and
 * sourness scored 0 to 5. Apples and lemons overlap in weight and roundness;
 * only sourness separates them.
 */
export const FRUIT: Fruit[] = [
  { name: 'A1', kind: 'apple', at: [2, 4, 1] },
  { name: 'L1', kind: 'lemon', at: [2, 2.5, 4] },
  { name: 'A2', kind: 'apple', at: [3, 4.5, 1.5] },
  { name: 'L2', kind: 'lemon', at: [3, 3.5, 3.5] },
  { name: 'A3', kind: 'apple', at: [4, 3, 0.5] },
  { name: 'L3', kind: 'lemon', at: [1.5, 4, 4.5] },
  { name: 'A4', kind: 'apple', at: [3, 2.5, 1] },
  { name: 'L4', kind: 'lemon', at: [4, 4, 4] },
]

/** The NumPy for the Apply step, with the chosen row printed. */
export function fruitCode(row: number): string {
  const head = 'X = np.array(['
  const pad = ' '.repeat(head.length)
  const rows = FRUIT.map((f) => `[${f.at.map((v) => fmt(v)).join(', ')}]`)
  return [
    'import numpy as np',
    '',
    '# one fruit per row: weight, roundness, sourness',
    `${head}${rows.join(`,\n${pad}`)}])`,
    '',
    'print(X.shape)',
    `print(X[${row}])`,
  ].join('\n')
}
