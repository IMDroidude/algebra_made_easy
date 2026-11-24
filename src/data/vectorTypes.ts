import { fmt, fmtVec } from '../lib/format'
import { dot, norm, scale, sub } from '../linalg'
import type { Vec } from '../linalg'

/**
 * The "Types of vector" tables on the Reference page.
 * Source of wording: docs/vector-types-and-similarity-measures.md, section 2.
 *
 * Every number that is the result of a calculation is computed here from its
 * inputs (see DERIVED) and then formatted into the text, so a test can check it.
 */

/** A minus sign that reads as one, instead of a hyphen. */
const minus = (s: string) => s.replace(/-/g, '−')

/** A vector written the way the source doc writes it: [1, 2, 3]. */
export function bracket(v: Vec, digits = 2): string {
  return minus(`[${fmtVec(v, digits).slice(1, -1)}]`)
}

const num = (x: number, digits = 2) => minus(fmt(x, digits))

export function softmax(scores: Vec): Vec {
  const exps = scores.map((s) => Math.exp(s))
  const total = exps.reduce((a, b) => a + b, 0)
  return scale(exps, 1 / total)
}

/** Term frequency × inverse document frequency, with the natural log. */
export function tfIdf(countInDoc: number, docsWithWord: number, totalDocs: number): number {
  return countInDoc * Math.log(totalDocs / docsWithWord)
}

export function countWords(vocabulary: string[], sentence: string): Vec {
  const words = sentence.toLowerCase().split(/\s+/)
  return vocabulary.map((v) => words.filter((w) => w === v).length)
}

// ---- Inputs ---------------------------------------------------------------

const VOCABULARY = ['the', 'cat', 'sat', 'on', 'mat', 'dog']
const SENTENCE = 'the cat sat on the mat'
const TOTAL_DOCS = 3
const WORD_COUNT = 2
const PIXELS: Vec = [0, 255, 128, 64]
const SCORES: Vec = [2, 1, 0]
/** Robot: x and y in metres, heading in degrees (counter-clockwise from east), speed in m/s. */
const ROBOT = { x: 2.0, y: 3.5, headingDeg: 90, speed: 0.4 }
const HOUSE_WEIGHTS: Vec = [0.2, 15, -3]
const HOUSE: Vec = [1500, 3, 12]
const WEIGHTS: Vec = [0.5, -1]
const GRADIENT: Vec = [0.2, -0.4]
const LEARNING_RATE = 0.1
const V34: Vec = [3, 4]
const POSITION: Vec = [2, 3]
const DESTINATION: Vec = [5, 7]
const ORTHOGONAL_PAIRS: [Vec, Vec][] = [
  [[1, 0], [0, 1]],
  [[3, 1], [-1, 3]],
]

function robotAfter(seconds: number) {
  const rad = (ROBOT.headingDeg * Math.PI) / 180
  return {
    ...ROBOT,
    x: ROBOT.x + ROBOT.speed * Math.cos(rad) * seconds,
    y: ROBOT.y + ROBOT.speed * Math.sin(rad) * seconds,
  }
}

// ---- Derived numbers (all tested) -----------------------------------------

export const DERIVED = {
  wordCounts: countWords(VOCABULARY, SENTENCE),
  tfIdfRare: tfIdf(WORD_COUNT, 1, TOTAL_DOCS),
  tfIdfCommon: tfIdf(WORD_COUNT, TOTAL_DOCS, TOTAL_DOCS),
  pixelsScaled: scale(PIXELS, 1 / 255),
  probabilities: softmax(SCORES),
  robotNow: ROBOT,
  robotNext: robotAfter(1),
  housePrice: dot(HOUSE_WEIGHTS, HOUSE),
  newWeights: sub(WEIGHTS, scale(GRADIENT, LEARNING_RATE)),
  length34: norm(V34),
  unit34: scale(V34, 1 / norm(V34)),
  displacement: sub(DESTINATION, POSITION),
  orthogonalDots: ORTHOGONAL_PAIRS.map(([a, b]) => dot(a, b)),
}

const robotText = (r: typeof ROBOT) =>
  `[${fmt(r.x)}, ${fmt(r.y)}, ${fmt(r.headingDeg)}°, ${fmt(r.speed)}]`

// ---- 2a. By what the numbers mean -----------------------------------------

export type MeaningType = {
  id: string
  name: string
  /** What each number in the vector is. */
  each: string
  /** The real-world object in the example. */
  object: string
  /** How that object becomes numbers. */
  numbers: string
  vector: string
  /** A worked follow-up, where the doc has one. */
  note?: string
  usedFor: string
}

export const MEANING_TYPES: MeaningType[] = [
  {
    id: 'feature',
    name: 'Feature vector',
    each: 'One measured property of the object.',
    object: 'A customer.',
    numbers: 'Age, monthly spend, visits, is member.',
    vector: '[34, 120, 6, 1]',
    usedFor: 'Almost all classic ML on tables: predicting churn, prices, credit risk.',
  },
  {
    id: 'binary',
    name: 'Binary vector',
    each: 'A yes/no answer, written 1 or 0.',
    object: 'A customer.',
    numbers: 'Has app, has card, gets newsletter.',
    vector: '[1, 0, 1]',
    usedFor: 'Flags, survey answers, “bought it or not”.',
  },
  {
    id: 'one-hot',
    name: 'One-hot vector',
    each: 'One 1 marking a single category, the rest 0.',
    object: 'The colour red.',
    numbers: 'One slot each for red, green, blue.',
    vector: '[1, 0, 0]',
    usedFor: 'Categories with no order; the correct answer (label) in classification.',
  },
  {
    id: 'multi-hot',
    name: 'Multi-hot vector',
    each: 'Several 1s, one per category that applies.',
    object: 'An action sci-fi film.',
    numbers: 'One slot each for the genres action, comedy, romance, sci-fi.',
    vector: '[1, 0, 0, 1]',
    usedFor: 'Tags, genres, symptoms, items in a basket.',
  },
  {
    id: 'count',
    name: 'Count vector (bag of words)',
    each: 'How many times each word appears.',
    object: `The sentence “${SENTENCE}”.`,
    numbers: `Count each word of the vocabulary: ${VOCABULARY.join(', ')}.`,
    vector: bracket(DERIVED.wordCounts),
    usedFor: 'Spam filters, simple document classification.',
  },
  {
    id: 'tf-idf',
    name: 'TF-IDF vector',
    each: 'A word count, raised for rare words and lowered for common ones.',
    object: `One document out of ${TOTAL_DOCS}. “cat” and “the” each appear ${WORD_COUNT} times in it.`,
    numbers:
      `“cat” is in 1 of ${TOTAL_DOCS} documents: ${WORD_COUNT} × ln(${TOTAL_DOCS}/1) = ${num(DERIVED.tfIdfRare, 3)}. ` +
      `“the” is in all ${TOTAL_DOCS}: ${WORD_COUNT} × ln(${TOTAL_DOCS}/${TOTAL_DOCS}) = ${num(DERIVED.tfIdfCommon, 3)}.`,
    vector: `${bracket([DERIVED.tfIdfRare, DERIVED.tfIdfCommon], 3)} for [cat, the]`,
    usedFor: 'Keyword search.',
  },
  {
    id: 'pixel',
    name: 'Pixel vector',
    each: 'Brightness of one pixel.',
    object: 'A 2×2 grey image with rows 0, 255 and 128, 64.',
    numbers: `Flatten it row by row: ${bracket(PIXELS)}. Then divide by 255.`,
    vector: bracket(DERIVED.pixelsScaled, 3),
    usedFor: 'Image input to a model.',
  },
  {
    id: 'signal',
    name: 'Signal / time-series vector',
    each: 'A measurement at each moment.',
    object: 'The temperature in a room.',
    numbers: 'One reading every hour.',
    vector: '[21.0, 21.4, 22.1, 23.0]',
    usedFor: 'Audio, sensors, stock prices.',
  },
  {
    id: 'embedding',
    name: 'Embedding vector',
    each: 'A number learned by a model; no single position has a name.',
    object: 'The word “cat”.',
    numbers: '300 numbers that a model learned. The values here are made up.',
    vector: '[0.21, −0.47, 0.83, …]',
    usedFor: 'Search by meaning, recommendations, the input to every language model.',
  },
  {
    id: 'preference',
    name: 'Preference (user) vector',
    each: 'How much a user likes each kind of thing.',
    object: 'A user’s taste in films.',
    numbers: 'How much they like action, and how much they like romance.',
    vector: '[0.9, 0.1]',
    usedFor: 'Recommender systems.',
  },
  {
    id: 'probability',
    name: 'Probability vector',
    each: 'A chance for each possible answer; all between 0 and 1, adding to 1.',
    object: `A model’s scores for cat / dog / bird: ${bracket(SCORES)}.`,
    numbers: 'Softmax: take e to the power of each score, then divide by the total.',
    vector: bracket(DERIVED.probabilities, 3),
    usedFor: 'The output of a classifier or a language model.',
  },
  {
    id: 'state',
    name: 'State vector',
    each: 'Everything needed to describe a system right now.',
    object: 'A robot.',
    numbers: 'x, y, heading, speed.',
    vector: robotText(DERIVED.robotNow),
    note: `One second later, moving north at ${fmt(ROBOT.speed)} m/s: ${robotText(DERIVED.robotNext)}.`,
    usedFor: 'Robotics, games, control, reinforcement learning.',
  },
  {
    id: 'weight',
    name: 'Weight (parameter) vector',
    each: 'How much the model cares about each feature.',
    object: 'A house-price model.',
    numbers: 'One weight each for size in sq ft, bedrooms, and km to the centre.',
    vector: bracket(HOUSE_WEIGHTS),
    note:
      `On a house [${HOUSE[0]} sq ft, ${HOUSE[1]} bedrooms, ${HOUSE[2]} km]: ` +
      `${HOUSE_WEIGHTS[0]}×${HOUSE[0]} + ${HOUSE_WEIGHTS[1]}×${HOUSE[1]} − ${Math.abs(HOUSE_WEIGHTS[2])}×${HOUSE[2]} = ${num(DERIVED.housePrice)} ($k).`,
    usedFor: 'This is the model itself; training means finding these numbers.',
  },
  {
    id: 'gradient',
    name: 'Gradient vector',
    each: 'How much the error changes if each weight is nudged.',
    object: `One training step of a model with weights ${bracket(WEIGHTS)}.`,
    numbers: 'One number per weight: the change in error for a small nudge to that weight.',
    vector: bracket(GRADIENT),
    note:
      `Learning rate ${fmt(LEARNING_RATE)}: new weights = ${bracket(WEIGHTS)} − ${fmt(LEARNING_RATE)} × ${bracket(GRADIENT)} = ${bracket(DERIVED.newWeights)}.`,
    usedFor: 'Training: every step moves the weights against the gradient.',
  },
]

// ---- 2b. By mathematical property -----------------------------------------

export type PropertyType = {
  id: string
  name: string
  meaning: string
  example: string
  why: string
}

const [pairA, pairB] = ORTHOGONAL_PAIRS

export const PROPERTY_TYPES: PropertyType[] = [
  {
    id: 'column-row',
    name: 'Column / row vector',
    meaning: 'Written top to bottom, or left to right.',
    example: 'A 3×1 column, or [1, 2, 3] as a 1×3 row.',
    why: 'Decides which matrix multiplications are allowed. One data record is usually one row of a table.',
  },
  {
    id: 'zero',
    name: 'Zero vector',
    meaning: 'Every number is 0.',
    example: '[0, 0, 0]',
    why: 'Has length 0 and no direction, so cosine similarity with it is undefined.',
  },
  {
    id: 'unit',
    name: 'Unit vector',
    meaning: 'Length exactly 1.',
    example: `${bracket(V34)} has length ${num(DERIVED.length34)}, so ${bracket(DERIVED.unit34)} is its unit vector.`,
    why: 'Keeps direction and discards size. Embeddings are often stored this way.',
  },
  {
    id: 'basis',
    name: 'Basis vector',
    meaning: 'One of the directions everything else is built from.',
    example: `[1, 0] and [0, 1]. Then ${bracket(V34)} = ${V34[0]}×[1, 0] + ${V34[1]}×[0, 1].`,
    why: 'Each feature is one basis direction.',
  },
  {
    id: 'orthogonal',
    name: 'Orthogonal vectors',
    meaning: 'At a right angle: dot product 0.',
    example:
      `${bracket(pairA[0])} and ${bracket(pairA[1])}: dot product ${num(DERIVED.orthogonalDots[0])}. ` +
      `Also ${bracket(pairB[0])} and ${bracket(pairB[1])}: dot product ${num(DERIVED.orthogonalDots[1])}.`,
    why: '“Have nothing in common”. Any two different one-hot vectors are orthogonal.',
  },
  {
    id: 'sparse',
    name: 'Sparse vector',
    meaning: 'Almost all zeros.',
    example: 'A count vector over a 50,000-word vocabulary with 12 non-zero entries.',
    why: 'Stored as only the non-zero positions; matches exact words.',
  },
  {
    id: 'dense',
    name: 'Dense vector',
    meaning: 'Almost no zeros.',
    example: 'An embedding: 384 decimals.',
    why: 'Captures meaning; costs the full list to store.',
  },
  {
    id: 'position-displacement',
    name: 'Position / displacement',
    meaning: 'A place, or a movement from one place to another.',
    example: `Position ${bracket(POSITION)}. Moving to ${bracket(DESTINATION)} is the displacement ${bracket(DESTINATION)} − ${bracket(POSITION)} = ${bracket(DERIVED.displacement)}.`,
    why: 'The difference of two vectors is itself a vector, and every distance is the size of that difference.',
  },
]
