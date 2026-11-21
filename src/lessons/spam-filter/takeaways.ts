export const takeaways: string[] = [
  'A table is a matrix X: one row per example, one column per feature, and every row is a vector you can draw as an arrow.',
  'The centre of a group is its mean vector, the average taken coordinate by coordinate: (1, 1) for the normal emails, (4, 4) for the spam.',
  'Subtracting the centres, μ_spam − μ_normal, gives the direction that points from one group to the other; that direction is w.',
  'A linear classifier scores with a dot product and compares it with a threshold: spam when w · x > b, here x + y > 5.',
  'X @ w scores every email in one multiplication; the model keeps only a direction and a cut-off, and real filters do the same with thousands of features.',
]
