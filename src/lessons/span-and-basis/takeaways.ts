export const takeaways: string[] = [
  'A linear combination a·u + b·v is a recipe: take a copies of u and b copies of v and walk them one after the other.',
  'The span of u and v is every point some recipe can reach.',
  'Two vectors on different lines (independent) span the whole plane and form a basis: every point has exactly one recipe.',
  'Two vectors on the same line (dependent) reach only that line; one vector alone reaches its line, and the zero vector only the origin.',
  'A combination is a matrix times a vector: put u and v as columns and multiply by (a, b); np.linalg.matrix_rank counts the independent directions.',
]
