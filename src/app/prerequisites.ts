/**
 * What a learner should know before starting each lesson.
 *
 * `lessons`: earlier lessons in this course that the lesson builds on (slugs;
 * a test checks they exist and come earlier in the curriculum).
 * `skills`: things to be comfortable with, phrased as "you can …" so a
 * learner can check themselves honestly.
 */
export type Prerequisites = { lessons: string[]; skills: string[] }

export const PREREQUISITES: Record<string, Prerequisites> = {
  // ---------- Module 1 · Coordinates and 3D space ----------
  'dimensions-and-origin': {
    lessons: [],
    skills: [
      'Count forwards and backwards in whole numbers',
      'Know that numbers below zero are written with a minus sign, like −3',
    ],
  },
  'coordinate-plane': {
    lessons: ['dimensions-and-origin'],
    skills: [
      'Count steps forwards and backwards on a number line',
      'Read negative numbers: −3 is three steps below zero',
    ],
  },
  '3d-space': {
    lessons: ['coordinate-plane'],
    skills: ['Read and plot a point (x, y), including negative coordinates'],
  },
  'points-and-vectors': {
    lessons: ['coordinate-plane', '3d-space'],
    skills: ['Plot a point (x, y) and read one off the plane, including negatives'],
  },
  'real-world-positions': {
    lessons: ['coordinate-plane', '3d-space', 'points-and-vectors'],
    skills: [
      'Write a point in 2D as (x, y) and in 3D as (x, y, z)',
      'Say whether a pair of numbers means a place or a movement',
    ],
  },

  // ---------- Module 2 · The algebra toolkit ----------
  'variables-and-equations': {
    lessons: [],
    skills: [
      'Add, subtract, multiply and divide whole numbers, including negatives',
      'Know that “=” means both sides have the same value',
    ],
  },
  functions: {
    lessons: ['coordinate-plane', 'variables-and-equations'],
    skills: [
      'Put a number in place of x and work out 2x + 1 (for x = 3: 2 × 3 + 1 = 7)',
      'Plot a point (x, y)',
    ],
  },
  'lines-slope-intercept': {
    lessons: ['functions'],
    skills: [
      'Make a table of inputs and outputs for a rule like f(x) = 2x + 1',
      'Read a fraction as a division: 6/3 = 2',
    ],
  },
  'exponents-and-roots': {
    lessons: ['coordinate-plane'],
    skills: [
      'Multiply numbers, including negatives: (−3) × (−3) = 9',
      'Find the area of a rectangle: width × height',
    ],
  },

  // ---------- Modules 3–5 · Vectors, matrices, inside AI models ----------
  'scalars-and-vectors': {
    lessons: ['points-and-vectors'],
    skills: [
      'Plot points with negative coordinates',
      'Add and multiply negative numbers',
      'Helpful, not required: a little Python (lists, print)',
    ],
  },
  'span-and-basis': {
    lessons: ['scalars-and-vectors'],
    skills: ['Add two vectors and multiply a vector by a number, on paper and on the plane'],
  },
  'dot-product': {
    lessons: ['scalars-and-vectors', 'exponents-and-roots'],
    skills: [
      'Work out the length of a vector with √(x² + y²)',
      'Have a rough feel for angles in degrees (90° is a right angle)',
    ],
  },
  'matrices-as-transformations': {
    lessons: ['scalars-and-vectors', 'span-and-basis'],
    skills: ['Read a·u + b·v as “a copies of u plus b copies of v”'],
  },
  'matrix-multiplication': {
    lessons: ['matrices-as-transformations'],
    skills: [
      'Explain what the two columns of a 2×2 matrix mean',
      'Work out A·v for a 2×2 matrix and a vector',
    ],
  },
  'shapes-and-transpose': {
    lessons: ['matrix-multiplication'],
    skills: ['Multiply two 2×2 matrices with the row-times-column rule'],
  },
  determinant: {
    lessons: ['matrices-as-transformations'],
    skills: [
      'Picture what a matrix does to the grid',
      'Find the area of a square and a rectangle',
    ],
  },
  'inverse-rank-null-space': {
    lessons: ['variables-and-equations', 'matrix-multiplication', 'determinant'],
    skills: [
      'Explain what a determinant of 0 does to the plane',
      'Know that A·B means “B first, then A”',
    ],
  },
  'spam-filter': {
    lessons: ['coordinate-plane', 'scalars-and-vectors', 'dot-product', 'shapes-and-transpose'],
    skills: [
      'Average a group of vectors, coordinate by coordinate',
      'Use a dot product as a score along a direction',
      'Read X @ w as “one dot product per row”',
      'Helpful, not required: the inverse of a matrix (lesson 4.5)',
    ],
  },
  'projection-least-squares': {
    lessons: ['lines-slope-intercept', 'dot-product', 'inverse-rank-null-space'],
    skills: [
      'Read y = mx + b: slope m, intercept b',
      'Know why squared error punishes big misses more than small ones',
    ],
  },
  eigenvectors: {
    lessons: ['matrices-as-transformations', 'determinant'],
    skills: [
      'Predict what a 2×2 matrix does to a vector',
      'Helpful, not required: solving a quadratic like λ² − 5λ + 6 = 0 (the lesson shows the steps)',
    ],
  },
  svd: {
    lessons: ['eigenvectors', 'dot-product', 'inverse-rank-null-space'],
    skills: [
      'Recognise rotation, stretch and reflection matrices',
      'Know what “low rank” means from the rank lesson',
    ],
  },
  attention: {
    lessons: ['span-and-basis', 'dot-product', 'matrix-multiplication', 'shapes-and-transpose'],
    skills: [
      'Use a dot product as a similarity score',
      'Read matrix shapes and Kᵀ (transpose)',
      'Form a weighted average: weights that add up to 1',
    ],
  },
}
