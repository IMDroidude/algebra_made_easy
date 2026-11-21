import type { SpanKind } from '../../linalg/span'

/** What the span is, in words, for the readouts. */
export function spanSentence(kind: SpanKind, vectorCount: 1 | 2): string {
  if (vectorCount === 1) {
    return kind === 'point'
      ? 'u is the zero vector, so every a·u is the origin: the span is a single point.'
      : 'With u alone, a·u can only slide along u’s own line: the span is a line through the origin.'
  }
  if (kind === 'plane') {
    return 'u and v point along different lines, so a·u + b·v can reach every point: the span is the whole plane.'
  }
  if (kind === 'line') {
    return 'u and v lie on the same line through the origin (or one of them is zero), so every combination stays on that line: the span is only a line.'
  }
  return 'u and v are both zero, so every combination is the origin: the span is a single point.'
}

/** The rank NumPy's matrix_rank reports, with what it means. */
export function rankMeaning(rank: 0 | 1 | 2): string {
  return rank === 2 ? 'the whole plane' : rank === 1 ? 'a line through the origin' : 'only the origin'
}
