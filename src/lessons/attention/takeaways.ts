export const takeaways: string[] = [
  'Each word has a query (what it looks for), a key (what it advertises) and a value (what it hands over if picked).',
  'A score is a query dotted with a key, and Q Kᵀ computes the whole table of scores in one matrix product.',
  'The scores are divided by √d_k, then softmax turns them into positive weights that add up to 1.',
  'Each word’s output is the weighted average of all the values, weights × V: attention = softmax(Q Kᵀ / √d_k) V.',
  'In a real transformer, Q, K and V come from the token embeddings through learned weight matrices, and training adjusts them so the right words match.',
]
