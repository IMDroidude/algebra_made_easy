export const takeaways: string[] = [
  'An eigenvector of a matrix is a direction the matrix does not turn: Av = λv, where the eigenvalue λ says how much it stretches, shrinks or flips.',
  'An eigenvector is really a whole line: if v is one, so is −v and any other non-zero multiple of v.',
  'Eigenvalues are the λ that make det(A − λI) = 0; for a 2×2 matrix that is λ² − (trace)λ + (determinant) = 0.',
  'Not every matrix has real eigenvectors: a rotation turns every direction, and a shear has only one eigen line.',
  'PCA centres the data, builds the covariance matrix and takes its eigenvectors: the principal directions, with each eigenvalue the variance along it.',
]
