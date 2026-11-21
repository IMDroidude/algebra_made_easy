/**
 * The fixed examples of this lesson and the NumPy code it shows, kept out of
 * the components so the unit tests can check every number against real NumPy.
 */
import { fmt, isInteger, numpyVec } from '../../lib/format'
import { approxEqual, approxEqualVec, dot, isZero, norm } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { cosineSimilarity, isZeroVec } from '../../linalg/projection'
import type { DotSign, Ranked } from '../../linalg/projection'
import { numpyRowDot, pyFixed, pyScalar } from './pyFormat'

/** Step 1's fixed example: the shadow of b on a is exactly (2, 0). */
export const SEE_A: Vec2 = [4, 0]
export const SEE_B: Vec2 = [2, 3]

/** Step 3: b is a quarter turn of a, so a · b = 0 although |a| |b| = 10. */
export const PREDICT_A: Vec2 = [3, 1]
export const PREDICT_B: Vec2 = [-1, 3]

export const SIGN_TEXT: Record<DotSign, string> = {
  positive: 'positive: the angle is less than 90°, and the shadow points the same way as a',
  zero: 'zero: a right angle, so b casts no shadow on a at all',
  negative: 'negative: the angle is more than 90°, and the shadow points backwards, away from a',
}

/** Wraps negative numbers in brackets so products read correctly: 2 · (−1). */
export const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

/** NumPy code for step 4, and exactly what it prints. */
export function understandSnippet(a: Vec2, b: Vec2) {
  const integer = isInteger(...a, ...b)
  const d = dot(a, b)
  const cos = cosineSimilarity(a, b)
  const code = [
    'import numpy as np',
    '',
    numpyVec('a', a),
    numpyVec('b', b),
    '',
    `dot = a @ b                  # ${p(a[0])}*${p(b[0])} + ${p(a[1])}*${p(b[1])}`,
    'len_a = np.linalg.norm(a)    # length of a',
    'len_b = np.linalg.norm(b)',
    'cos = dot / (len_a * len_b)',
    '',
    'print(dot)',
    'print(f"{len_a:.2f} {len_b:.2f}")',
    'print(f"{cos:.3f}")',
  ].join('\n')
  const output = [
    pyScalar(d, integer),
    `${pyFixed(norm(a), 2)} ${pyFixed(norm(b), 2)}`,
    cos === null ? 'nan' : pyFixed(cos, 3),
  ].join('\n')
  return { code, output, warns: cos === null }
}


/** Step 5: a tiny "library" of documents, each reduced to a 2D embedding. */
export const DOC_NAMES = [
  'Puppy training tips',
  'What do cats eat?',
  'Quick pasta recipes',
  'Pet-friendly cafes',
  'Car repair manual',
] as const

export const DOCS: Vec2[] = [
  [4, 0.5],
  [2, 3],
  [0.5, 4],
  [1.5, 1],
  [-2, -2.5],
]

export const QUERY: Vec2 = [3, 2]

/** How many results the search returns. */
export const TOP_K = 3

/** Scores as NumPy computes them in the snippet, including the sign of a zero. */
export function numpyScores(docs: Vec2[], q: Vec2, by: 'cosine' | 'dot'): number[] {
  const integer = isInteger(...docs.flat(), ...q)
  return docs.map((d) => {
    const s = numpyRowDot(d, q, integer)
    return by === 'dot' ? s : s / (norm(d) * norm(q))
  })
}

/** NumPy code for the similarity search, and exactly what it prints. */
export function searchSnippet(docs: Vec2[], q: Vec2, by: 'cosine' | 'dot', top: Ranked[]) {
  const scores = numpyScores(docs, q, by)
  const nameLines = DOC_NAMES.map((n) => `"${n}"`).join(',\n         ')
  const docRows = docs.map((d) => `[${fmt(d[0])}, ${fmt(d[1])}]`).join(',\n                 ')
  const code = [
    'import numpy as np',
    '',
    `names = [${nameLines}]`,
    `docs = np.array([${docRows}])`,
    `${numpyVec('q', q)}   # the query`,
    '',
    by === 'cosine'
      ? 'scores = docs @ q / (np.linalg.norm(docs, axis=1) * np.linalg.norm(q))'
      : 'scores = docs @ q   # raw dot products, no normalising',
    `best = np.argsort(-scores, kind="stable")[:${TOP_K}]`,
    'for i in best:',
    '    print(f"{scores[i]:.3f}  {names[i]}")',
  ].join('\n')
  const output = top
    .slice(0, TOP_K)
    .map((r) => `${pyFixed(scores[r.index], 3)}  ${DOC_NAMES[r.index]}`)
    .join('\n')
  return { code, output }
}

/** Step 6: a fixed vector not used anywhere else in the lesson. */
export const PRACTICE_U: Vec2 = [2, -1]
export const PRACTICE_START: Vec2 = [3, 2]

export const PRACTICE_CHECKS: Record<string, (w: Vec2) => boolean> = {
  perpendicular: (w) => !isZeroVec(w) && isZero(dot(PRACTICE_U, w)),
  opposite: (w) => {
    const c = cosineSimilarity(PRACTICE_U, w)
    return c !== null && approxEqual(c, -1)
  },
  shadow: (w) =>
    approxEqual(dot(PRACTICE_U, w), dot(PRACTICE_U, PRACTICE_U)) && !approxEqualVec(w, PRACTICE_U),
  unit: (w) => approxEqual(norm(w), 1) && dot(PRACTICE_U, w) > 0 && !isZero(dot(PRACTICE_U, w)),
}
