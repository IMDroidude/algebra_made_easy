export const takeaways: string[] = [
  'Euclidean distance is the straight line, Manhattan adds up the differences one feature at a time, and Chebyshev keeps only the largest difference. Chebyshev ≤ Euclidean ≤ Manhattan, always.',
  'The three can disagree about which of two vectors is closer: Euclidean and Chebyshev punish one big difference, Manhattan counts the total.',
  'Cosine similarity ignores length, so use it when size is noise (a long and a short text on the same topic). Use a distance when size is part of the answer.',
  'For yes/no data, Hamming counts positions that differ and Jaccard counts shared items out of all items; Jaccard ignores everything neither side has.',
  'Scale features to a common range before measuring distance, or the feature with the biggest units decides the answer on its own.',
]
