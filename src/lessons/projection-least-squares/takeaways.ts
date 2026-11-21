export const takeaways: string[] = [
  'A residual is the vertical gap between a point and the line: actual y minus predicted y.',
  'Least squares picks the line that makes the sum of squared residuals as small as possible, so big misses are punished much more than small ones.',
  'The predictions Xw can only reach the column space of X; the best fit is the projection of y onto it, where the residuals are perpendicular to every column.',
  'That perpendicular condition gives the normal equations: (XᵀX)w = Xᵀy.',
  'This is linear regression, the simplest trainable model; np.linalg.lstsq(X, y) finds its weight and bias directly.',
]
