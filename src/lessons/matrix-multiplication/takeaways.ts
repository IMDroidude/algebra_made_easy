export const takeaways: string[] = [
  'Multiplying two matrices means doing one transformation and then the other, and the result is again a single matrix.',
  'AB means "B first, then A", read right to left: ABx = A(Bx), just as f(g(x)) runs g first.',
  'The order usually matters: AB and BA are generally different matrices.',
  'Each cell of AB is a row of A times a column of B, multiplied entry by entry and added (a dot product); in NumPy it is A @ B.',
  'Stacked linear layers always collapse into one matrix, so neural networks put a non-linear activation such as ReLU between them.',
]
