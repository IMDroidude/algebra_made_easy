export const takeaways: string[] = [
  'Every 2×2 matrix turns the unit circle into an ellipse; the lengths of its longest and shortest radii are the singular values σ₁ and σ₂.',
  'The SVD writes any matrix as A = UΣVᵀ: read right to left, rotate (Vᵀ), stretch along the axes (Σ), rotate again (U).',
  'Singular values are never negative and come sorted largest first; any mirror flip is left to U or V.',
  'Av₁ = σ₁u₁ and Av₂ = σ₂u₂: the matrix sends the perpendicular directions v₁, v₂ to the ellipse axes u₁, u₂, stretched by σ₁ and σ₂.',
  'Keeping only the k largest singular values gives the closest rank-k approximation, which is how SVD compresses images and weight matrices.',
]
