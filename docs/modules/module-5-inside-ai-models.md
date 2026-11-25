# Module 5: Inside AI models

The linear algebra running inside real models, from regression to transformers.

## Lessons at a glance

| # | Lesson | In one line | Why an AI engineer needs it |
|---|---|---|---|
| 5.1 | [Build a spam filter](https://imdroidude.github.io/algebra_made_easy/#/lessons/spam-filter) | From a table to a learned decision line, using only vectors and matrices. | A linear classifier is a learned direction plus a threshold: the core of many real models. |
| 5.2 | [Projection and least squares](https://imdroidude.github.io/algebra_made_easy/#/lessons/projection-least-squares) | The best-fit line. | Linear regression, the simplest trainable model, is a projection. |
| 5.3 | [Eigenvectors and eigenvalues](https://imdroidude.github.io/algebra_made_easy/#/lessons/eigenvectors) | Directions a matrix does not turn. | PCA finds the most informative directions in data using eigenvectors. |
| 5.4 | [Singular value decomposition](https://imdroidude.github.io/algebra_made_easy/#/lessons/svd) | Rotate, stretch, rotate. | SVD compresses data and models by keeping only what matters most. |
| 5.5 | [Capstone: attention](https://imdroidude.github.io/algebra_made_easy/#/lessons/attention) | A tiny attention head, step by step. | Attention is the core operation of every transformer, including GPT-style models. |

## 5.1 Build a spam filter

From a table to a learned decision line, using only vectors and matrices. A linear classifier is a learned direction plus a threshold: the core of many real models.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/spam-filter
- Source: `src/lessons/spam-filter/`

**Before you start**

- Earlier lessons: 1.2 The coordinate plane; 3.1 Vector arithmetic; 3.3 Dot product, length and cosine similarity; 4.3 Shapes, transpose, non-square matrices
- Average a group of vectors, coordinate by coordinate
- Use a dot product as a score along a direction
- Read X @ w as “one dot product per row”
- Helpful, not required: the inverse of a matrix (lesson 4.5)

**What the lesson covers**

1. Step 1 · See: A table is already a matrix
2. Step 2 · Manipulate: Find the centre of each cloud
3. Step 3 · Predict: Before you look: where does the line go?
4. Step 4 · Understand: From two centres to one rule
5. Step 5 · Apply: Score every email at once, then a new one
6. Running example (houses): The same recipe sorts the houses
7. Step 6 · Practice: Retrain it yourself

**Key takeaways**

- A table is a matrix X: one row per example, one column per feature, and every row is a vector you can draw as an arrow.
- The centre of a group is its mean vector, the average taken coordinate by coordinate: (1, 1) for the normal emails, (4, 4) for the spam.
- Subtracting the centres, μ_spam − μ_normal, gives the direction that points from one group to the other; that direction is w.
- A linear classifier scores with a dot product and compares it with a threshold: spam when w · x > b, here x + y > 5.
- X @ w scores every email in one multiplication; the model keeps only a direction and a cut-off, and real filters do the same with thousands of features.

## 5.2 Projection and least squares

The best-fit line. Linear regression, the simplest trainable model, is a projection.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/projection-least-squares
- Source: `src/lessons/projection-least-squares/`

**Before you start**

- Earlier lessons: 2.3 Lines: slope, intercept and boundaries; 3.3 Dot product, length and cosine similarity; 4.5 Inverse, rank, null space
- Read y = mx + b: slope m, intercept b
- Know why squared error punishes big misses more than small ones

**What the lesson covers**

1. Step 1 · See: No line goes through every point
2. Step 3 · Predict: Before you look: one point goes rogue
3. Step 2 · Manipulate: Try to beat the best line
4. Step 4 · Understand: The normal equations: least squares is a projection
5. Step 5 · Apply: This is linear regression, the simplest trainable model
6. Running example (houses): Predict a house's price from all three features
7. Step 6 · Practice: Shape the data

**Key takeaways**

- A residual is the vertical gap between a point and the line: actual y minus predicted y.
- Least squares picks the line that makes the sum of squared residuals as small as possible, so big misses are punished much more than small ones.
- The predictions Xw can only reach the column space of X; the best fit is the projection of y onto it, where the residuals are perpendicular to every column.
- That perpendicular condition gives the normal equations: (XᵀX)w = Xᵀy.
- This is linear regression, the simplest trainable model; np.linalg.lstsq(X, y) finds its weight and bias directly.

## 5.3 Eigenvectors and eigenvalues

Directions a matrix does not turn. PCA finds the most informative directions in data using eigenvectors.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/eigenvectors
- Source: `src/lessons/eigenvectors/`

**Before you start**

- Earlier lessons: 4.1 Matrices as transformations; 4.4 Determinant
- Predict what a 2×2 matrix does to a vector
- Helpful, not required: solving a quadratic like λ² − 5λ + 6 = 0 (the lesson shows the steps)

**What the lesson covers**

1. Step 1 · See: Two vectors, one matrix
2. Step 2 · Manipulate: Sweep a vector round and hunt for directions that stay put
3. Step 3 · Predict: Before you sweep: does a rotation keep any direction?
4. Step 4 · Understand: Where eigenvalues come from
5. Step 5 · Apply: PCA: the eigenvectors of a cloud of data
6. Running example (houses): The main direction of the houses: overall size
7. Step 6 · Practice: Build matrices with the eigenvectors you want

**Key takeaways**

- An eigenvector of a matrix is a direction the matrix does not turn: Av = λv, where the eigenvalue λ says how much it stretches, shrinks or flips.
- An eigenvector is really a whole line: if v is one, so is −v and any other non-zero multiple of v.
- Eigenvalues are the λ that make det(A − λI) = 0; for a 2×2 matrix that is λ² − (trace)λ + (determinant) = 0.
- Not every matrix has real eigenvectors: a rotation turns every direction, and a shear has only one eigen line.
- PCA centres the data, builds the covariance matrix and takes its eigenvectors: the principal directions, with each eigenvalue the variance along it.

## 5.4 Singular value decomposition

Rotate, stretch, rotate. SVD compresses data and models by keeping only what matters most.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/svd
- Source: `src/lessons/svd/`

**Before you start**

- Earlier lessons: 5.3 Eigenvectors and eigenvalues; 3.3 Dot product, length and cosine similarity; 4.5 Inverse, rank, null space
- Recognise rotation, stretch and reflection matrices
- Know what “low rank” means from the rank lesson

**What the lesson covers**

1. Step 1 · See: Every matrix turns a circle into an ellipse
2. Step 2 · Manipulate: Play a matrix as three steps: rotate, stretch, rotate
3. Step 3 · Predict: Before you look: what does a shear do to the circle?
4. Step 4 · Understand: The three matrices, with numbers
5. Step 5 · Apply: Compress an image by keeping the biggest singular values
6. Running example (houses): How many ideas are in the house table?
7. Step 6 · Practice: Shape the ellipse

**Key takeaways**

- Every 2×2 matrix turns the unit circle into an ellipse; the lengths of its longest and shortest radii are the singular values σ₁ and σ₂.
- The SVD writes any matrix as A = UΣVᵀ: read right to left, rotate (Vᵀ), stretch along the axes (Σ), rotate again (U).
- Singular values are never negative and come sorted largest first; any mirror flip is left to U or V.
- Av₁ = σ₁u₁ and Av₂ = σ₂u₂: the matrix sends the perpendicular directions v₁, v₂ to the ellipse axes u₁, u₂, stretched by σ₁ and σ₂.
- Keeping only the k largest singular values gives the closest rank-k approximation, which is how SVD compresses images and weight matrices.

## 5.5 Capstone: attention

A tiny attention head, step by step. Attention is the core operation of every transformer, including GPT-style models.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/attention
- Source: `src/lessons/attention/`

**Before you start**

- Earlier lessons: 3.2 Linear combinations, span, basis; 3.3 Dot product, length and cosine similarity; 4.2 Matrix multiplication; 4.3 Shapes, transpose, non-square matrices
- Use a dot product as a similarity score
- Read matrix shapes and Kᵀ (transpose)
- Form a weighted average: weights that add up to 1

**What the lesson covers**

1. Step 1 · See: Every word asks a question and offers an answer
2. Step 2 · Manipulate: Scores: every query dotted with every key
3. Step 3 · Predict: Before you look: turn one key towards the query
4. Step 4 · Understand: Scale, then softmax: from scores to weights
5. Step 5 · Apply: The output: a weighted average of the values
6. Running example (houses): Similar houses vote on the price
7. Step 6 · Practice: Steer the attention yourself

**Key takeaways**

- Each word has a query (what it looks for), a key (what it advertises) and a value (what it hands over if picked).
- A score is a query dotted with a key, and Q Kᵀ computes the whole table of scores in one matrix product.
- The scores are divided by √d_k, then softmax turns them into positive weights that add up to 1.
- Each word’s output is the weighted average of all the values, weights × V: attention = softmax(Q Kᵀ / √d_k) V.
- In a real transformer, Q, K and V come from the token embeddings through learned weight matrices, and training adjusts them so the right words match.
