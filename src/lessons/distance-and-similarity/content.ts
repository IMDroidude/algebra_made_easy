/**
 * The fixed examples of this lesson, its NumPy code and the checks for its
 * practice goals, kept out of the components so the unit tests can check
 * every number against real NumPy.
 */
import { numpyVec } from '../../lib/format'
import { npFloat } from '../../lib/numpy'
import { COLOR } from '../../lib/palette'
import { approxEqual, isZero, norm, scale } from '../../linalg'
import type { Vec, Vec2 } from '../../linalg'
import { chebyshev, euclidean, manhattan } from '../../linalg/distance'
import { cosineSimilarity } from '../../linalg/projection'
import { pyFixed } from '../dot-product/pyFormat'

/** One colour per measure, used in the drawings, the cards and the text. */
export const MEASURE_COLOR = {
  euclidean: COLOR.v,
  manhattan: COLOR.i,
  chebyshev: COLOR.result,
} as const

/** Step 1: a 3-4-5 triangle, so all three distances are whole numbers. */
export const SEE_A: Vec2 = [2, 3]
export const SEE_B: Vec2 = [5, 7]

/** Step 2 starts somewhere else, so the learner meets new numbers. */
export const DRAG_A: Vec2 = [2, 2]
export const DRAG_B: Vec2 = [6, 4]

/** Step 3: Q differs a little everywhere, R differs a lot in one place. */
export const P: Vec = [1, 1, 1, 1]
export const Q: Vec = [2, 2, 2, 2]
export const R: Vec = [1, 1, 1, 4]

export const MEASURE_NAMES = ['Euclidean', 'Manhattan', 'Chebyshev'] as const
export const THREE = [euclidean, manhattan, chebyshev] as const

/** NumPy code for the three distances in step 4, and exactly what it prints. */
export function normSnippet(a: Vec2, b: Vec2) {
  const code = [
    'import numpy as np',
    '',
    numpyVec('a', a),
    numpyVec('b', b),
    'd = a - b                              # the difference',
    '',
    'print(np.linalg.norm(d, ord=1))        # Manhattan',
    'print(np.linalg.norm(d, ord=2))        # Euclidean',
    'print(np.linalg.norm(d, ord=np.inf))   # Chebyshev',
  ].join('\n')
  const output = [manhattan(a, b), euclidean(a, b), chebyshev(a, b)].map(npFloat).join('\n')
  return { code, output }
}

/** Step 5: three documents as word counts. */
export const DOC_WORDS = ['football', 'goal', 'election'] as const
export const DOC_A: Vec = [2, 1, 0]
export const DOC_C: Vec = [0, 1, 2]
/** The long article: the short note's counts, k times over. */
export const docB = (k: number): Vec => scale(DOC_A, k)
export const DOC_START_K = 1
export const DOC_MAX_K = 10

/** Distance and cosine for the two pairs that matter: A with B, and A with C. */
export function docScores(k: number) {
  const B = docB(k)
  return {
    ab: { distance: euclidean(DOC_A, B), cosine: cosineSimilarity(DOC_A, B) ?? 0 },
    ac: { distance: euclidean(DOC_A, DOC_C), cosine: cosineSimilarity(DOC_A, DOC_C) ?? 0 },
  }
}

/** NumPy code for the document comparison, and exactly what it prints. */
export function docSnippet(k: number) {
  const s = docScores(k)
  const times = k === 1 ? 'the same length' : `${k} times as long`
  const code = [
    'import numpy as np',
    '',
    `# word counts: ${DOC_WORDS.join(', ')}`,
    'A = np.array([2, 1, 0])   # short sports note',
    `${`B = ${k} * A`.padEnd(26)}# sports article, ${times}`,
    'C = np.array([0, 1, 2])   # short politics note',
    '',
    'def cos(u, v):',
    '    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))',
    '',
    'print(f"A-B  distance {np.linalg.norm(A - B):.2f}  cosine {cos(A, B):.3f}")',
    'print(f"A-C  distance {np.linalg.norm(A - C):.2f}  cosine {cos(A, C):.3f}")',
  ].join('\n')
  const line = (name: string, x: { distance: number; cosine: number }) =>
    `${name}  distance ${pyFixed(x.distance, 2)}  cosine ${pyFixed(x.cosine, 3)}`
  return { code, output: `${line('A-B', s.ab)}\n${line('A-C', s.ac)}` }
}

/** Step 5, continued: two shopping baskets as 0/1 vectors over these products. */
export const PRODUCTS = ['milk', 'bread', 'eggs', 'butter', 'jam', 'tea'] as const
export const SHOPPERS = ['Ali', 'Sara'] as const
export const BASKETS: [Vec, Vec] = [
  [1, 1, 1, 1, 0, 0],
  [1, 1, 0, 0, 1, 0],
]
/** How many products the shop sells; everything beyond the six listed is bought by nobody. */
export const SHOP_SIZES = [6, 100, 10000] as const

/** Ratings of the same four films, 1 to 5 stars. */
export const FILMS = ['Film 1', 'Film 2', 'Film 3', 'Film 4'] as const
export const RATINGS = {
  Ali: [5, 5, 3, 2],
  Sara: [4, 4, 2, 1],
  Omar: [2, 3, 5, 5],
} as const satisfies Record<string, Vec>

/** Step 6: a fixed point not used anywhere else in the lesson. */
export const PRACTICE_A: Vec2 = [2, 1]
export const PRACTICE_START: Vec2 = [5, 3]

export const PRACTICE_CHECKS: Record<string, (b: Vec2) => boolean> = {
  /** Manhattan equals Euclidean: the two points share a row or a column. */
  straight: (b) =>
    !isZero(euclidean(PRACTICE_A, b)) && approxEqual(manhattan(PRACTICE_A, b), euclidean(PRACTICE_A, b)),
  /** Manhattan is twice Chebyshev: an exact diagonal. */
  diagonal: (b) =>
    !isZero(chebyshev(PRACTICE_A, b)) && approxEqual(manhattan(PRACTICE_A, b), 2 * chebyshev(PRACTICE_A, b)),
  /** Same direction from the origin, yet far apart. */
  parallel: (b) => {
    const c = cosineSimilarity(PRACTICE_A, b)
    return c !== null && approxEqual(c, 1) && euclidean(PRACTICE_A, b) >= 4 && !isZero(norm(b))
  },
}

export const QUIZ_MEASURES = [
  'Euclidean',
  'Manhattan',
  'Chebyshev',
  'Cosine',
  'Hamming',
  'Jaccard',
  'Pearson',
] as const
export type QuizMeasure = (typeof QUIZ_MEASURES)[number]

/** Step 6: seven situations, one per measure, none of them used earlier in the lesson. */
export const QUIZ: { id: string; scenario: string; answer: QuizMeasure; why: string; hint: string }[] = [
  {
    id: 'ships',
    scenario: 'Two ships on a small, flat sea chart. How far apart are they?',
    answer: 'Euclidean',
    why: 'A ship can sail straight, and both coordinates are in the same unit, so the straight line is the real distance.',
    hint: 'Nothing stops a ship from sailing directly towards the other one.',
  },
  {
    id: 'robot',
    scenario: 'A warehouse robot that can only drive along the aisles, never through the shelves.',
    answer: 'Manhattan',
    why: 'It has to cover the east-west gap and the north-south gap separately, so the two add up.',
    hint: 'It cannot cut corners: think about how the two gaps combine.',
  },
  {
    id: 'part',
    scenario: 'A machined part passes inspection only if none of its five measurements is off by more than 0.1 mm.',
    answer: 'Chebyshev',
    why: 'Only the worst single deviation matters; four perfect measurements do not make up for one bad one.',
    hint: 'One bad measurement fails the part, however good the others are.',
  },
  {
    id: 'tweet',
    scenario: 'A short post and a whole book chapter on the same subject, as word-count vectors.',
    answer: 'Cosine',
    why: 'The chapter has far bigger counts, but the same mix of words. Direction is the topic; length is only how much was written.',
    hint: 'One vector is hundreds of times longer than the other, for a reason that has nothing to do with the subject.',
  },
  {
    id: 'hash',
    scenario: 'Two photos, each reduced to a 64-bit fingerprint. Are they the same picture?',
    answer: 'Hamming',
    why: 'Each position is one bit, and a bit is either the same or different: count the positions that differ.',
    hint: 'Every position is a 0 or a 1, and "how different" has no size.',
  },
  {
    id: 'tags',
    scenario: 'Two blog posts, each with a handful of tags out of thousands of possible tags.',
    answer: 'Jaccard',
    why: 'Shared tags out of all tags used. The thousands of tags neither post has say nothing about how alike they are.',
    hint: 'Almost every tag is missing from both posts. Should that count as agreement?',
  },
  {
    id: 'judges',
    scenario: 'Two competition judges. One gives everyone about two points less than the other. Do they agree on who was good?',
    answer: 'Pearson',
    why: 'Subtracting each judge’s own average removes the strictness, leaving only whether their scores rise and fall together.',
    hint: 'Their numbers differ by a constant, but their rankings may be identical.',
  },
]
