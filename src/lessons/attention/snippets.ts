/**
 * The NumPy code and printed output for steps 4 and 5, built from live state.
 * Outputs are computed with src/linalg and printed the way NumPy prints them.
 */
import { fmt } from '../../lib/format'
import { approxEqual } from '../../linalg'
import { attention, attentionScores, softmax } from '../../linalg/attention'
import type { Vec2 } from '../../linalg'
import { PRINT_OPTIONS, npArray, npLiteral } from './numpyText'

const HEADER = ['import numpy as np', '# print 2 decimals', PRINT_OPTIONS, '']

/** True when the divisor is √d_k for 2D vectors, the value attention itself uses. */
export const isSqrtDk = (T: number) => approxEqual(T, Math.SQRT2)

/** Step 4: scale and softmax, printing the row for query `i`. */
export function understandCode(Q: Vec2[], K: Vec2[], i: number, T: number): string {
  return [
    ...HEADER,
    npLiteral('Q', Q, 'a query per row'),
    npLiteral('K', K, 'a key per row'),
    ...(isSqrtDk(T)
      ? ['d_k = K.shape[1]  # entries per key: 2', '', 'scores = Q @ K.T / np.sqrt(d_k)']
      : [`T = ${fmt(T)}  # instead of √d_k`, '', 'scores = Q @ K.T / T']),
    '',
    '# softmax, row by row (minus row max: no overflow)',
    'e = np.exp(scores - scores.max(axis=1, keepdims=True))',
    'weights = e / e.sum(axis=1, keepdims=True)',
    '',
    `print(scores[${i}])   # query ${i + 1}`,
    `print(weights[${i}])`,
  ].join('\n')
}

export function understandOutput(Q: Vec2[], K: Vec2[], i: number, T: number): string {
  const row = attentionScores(Q, K)[i]
  return [npArray(row.map((s) => s / T)), npArray(softmax(row, T))].join('\n')
}

/** Step 5: the whole attention function, printing one output row per query. */
export function applyCode(Q: Vec2[], K: Vec2[], V: Vec2[]): string {
  return [
    ...HEADER,
    'def softmax(x):',
    '    e = np.exp(x - x.max(axis=-1, keepdims=True))',
    '    return e / e.sum(axis=-1, keepdims=True)',
    '',
    'def attention(Q, K, V):',
    '    d_k = K.shape[-1]',
    '    weights = softmax(Q @ K.T / np.sqrt(d_k))',
    '    return weights @ V',
    '',
    npLiteral('Q', Q),
    npLiteral('K', K),
    npLiteral('V', V),
    '',
    'print(attention(Q, K, V))  # row i: token i',
  ].join('\n')
}

export function applyOutput(Q: Vec2[], K: Vec2[], V: Vec2[]): string {
  return npArray(attention(Q, K, V).output)
}
