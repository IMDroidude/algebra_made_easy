export const takeaways: string[] = [
  'A matrix’s shape is rows first, then columns: "2×3" means 2 rows and 3 columns, which NumPy writes as (2, 3).',
  'Read the shape as outputs × inputs: a 2×3 matrix takes vectors with 3 numbers and returns vectors with 2.',
  'A @ B works only when the inner sizes match: (m, k) @ (k, n) gives a result of shape (m, n).',
  'The transpose A.T turns rows into columns, so shape (m, n) becomes (n, m); it is not an undo.',
  'A matrix that maps to fewer dimensions squeezes whole lines of inputs onto one output, and that information is gone.',
]
