# Module 4: Matrices

A matrix moves every point at once. This is what a neural-network layer does.

## Lessons at a glance

| # | Lesson | In one line | Why an AI engineer needs it |
|---|---|---|---|
| 4.1 | [Matrices as transformations](https://imdroidude.github.io/algebra_made_easy/#/lessons/matrices-as-transformations) | A matrix moves the whole plane. Drag it and see. | A neural-network layer is a matrix transforming a cloud of data points. |
| 4.2 | [Matrix multiplication](https://imdroidude.github.io/algebra_made_easy/#/lessons/matrix-multiplication) | One transformation after another. | Forward propagation is matrix multiplication, layer after layer. |
| 4.3 | [Shapes, transpose, non-square matrices](https://imdroidude.github.io/algebra_made_easy/#/lessons/shapes-and-transpose) | Changing the number of dimensions. | Matching shapes is half of debugging a model; projection layers change dimension. |
| 4.4 | [Determinant](https://imdroidude.github.io/algebra_made_easy/#/lessons/determinant) | How much a matrix stretches area. | A determinant of zero means information is lost and cannot be recovered. |
| 4.5 | [Inverse, rank, null space](https://imdroidude.github.io/algebra_made_easy/#/lessons/inverse-rank-null-space) | When a transformation can be undone. | Low-rank matrices are the idea behind efficient fine-tuning methods such as LoRA. |

## 4.1 Matrices as transformations

A matrix moves the whole plane. Drag it and see. A neural-network layer is a matrix transforming a cloud of data points.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/matrices-as-transformations
- Source: `src/lessons/matrices-as-transformations/`

**Before you start**

- Earlier lessons: 3.1 Vector arithmetic; 3.2 Linear combinations, span, basis
- Read a·u + b·v as “a copies of u plus b copies of v”

**What the lesson covers**

1. Step 1 · See: Start with one vector
2. Step 2 · Manipulate: A matrix says where the two basis arrows land
3. Step 3 · Predict: Before you look: what will this matrix do?
4. Step 4 · Understand: The arithmetic behind the picture
5. Step 5 · Apply: This is what a neural network layer does
6. Running example (houses): One matrix moves every house
7. Step 6 · Practice: Build these four transformations yourself

**Key takeaways**

- A 2×2 matrix is a record of where the two basis arrows î and ĵ land: column 1 for î, column 2 for ĵ.
- Where î and ĵ land decides the whole grid, so every point (x, y) goes to x copies of the new î plus y copies of the new ĵ.
- Areas are multiplied by the determinant ad − bc; a negative determinant means the plane was flipped over, and 0 means it was squashed flat.
- Rotations, scalings, reflections and shears are the basic moves; chaining them builds new transformations.

## 4.2 Matrix multiplication

One transformation after another. Forward propagation is matrix multiplication, layer after layer.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/matrix-multiplication
- Source: `src/lessons/matrix-multiplication/`

**Before you start**

- Earlier lessons: 4.1 Matrices as transformations
- Explain what the two columns of a 2×2 matrix mean
- Work out A·v for a 2×2 matrix and a vector

**What the lesson covers**

1. Step 1 · See: Two moves in a row are one move
2. Step 2 · Manipulate: Play the two moves, then swap them
3. Step 3 · Predict: Before you look: does the order matter here?
4. Step 4 · Understand: Row times column, one cell at a time
5. Step 5 · Apply: Stacking layers, and why networks need a kink
6. Running example (houses): Two steps on the houses, one matrix
7. Step 6 · Practice: Pick B to get these results

**Key takeaways**

- Multiplying two matrices means doing one transformation and then the other, and the result is again a single matrix.
- AB means "B first, then A", read right to left: ABx = A(Bx), just as f(g(x)) runs g first.
- The order usually matters: AB and BA are generally different matrices.
- Each cell of AB is a row of A times a column of B, multiplied entry by entry and added (a dot product); in NumPy it is A @ B.
- Stacked linear layers always collapse into one matrix, so neural networks put a non-linear activation such as ReLU between them.

## 4.3 Shapes, transpose, non-square matrices

Changing the number of dimensions. Matching shapes is half of debugging a model; projection layers change dimension.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/shapes-and-transpose
- Source: `src/lessons/shapes-and-transpose/`

**Before you start**

- Earlier lessons: 4.2 Matrix multiplication
- Multiply two 2×2 matrices with the row-times-column rule

**What the lesson covers**

1. Step 1 · See: Rows first, then columns
2. Step 2 · Manipulate: Will A @ B work? Check the inner sizes
3. Step 3 · Predict: A matrix with one row
4. Step 4 · Understand: Non-square matrices change the number of dimensions
5. Step 5 · Apply: A batch of embeddings through a projection layer
6. Running example (houses): Eight houses, three features: X is 8 × 3
7. Step 6 · Practice: Four shape puzzles

**Key takeaways**

- A matrix’s shape is rows first, then columns: "2×3" means 2 rows and 3 columns, which NumPy writes as (2, 3).
- Read the shape as outputs × inputs: a 2×3 matrix takes vectors with 3 numbers and returns vectors with 2.
- A @ B works only when the inner sizes match: (m, k) @ (k, n) gives a result of shape (m, n).
- The transpose A.T turns rows into columns, so shape (m, n) becomes (n, m); it is not an undo.
- A matrix that maps to fewer dimensions squeezes whole lines of inputs onto one output, and that information is gone.

## 4.4 Determinant

How much a matrix stretches area. A determinant of zero means information is lost and cannot be recovered.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/determinant
- Source: `src/lessons/determinant/`

**Before you start**

- Earlier lessons: 4.1 Matrices as transformations
- Picture what a matrix does to the grid
- Find the area of a square and a rectangle

**What the lesson covers**

1. Step 1 · See: Watch what happens to one square
2. Step 2 · Manipulate: Stretch it, flip it, flatten it
3. Step 3 · Predict: Swap the two columns
4. Step 4 · Understand: Where ad − bc comes from
5. Step 5 · Apply: A zero determinant loses information
6. Running example (houses): A feature transform that loses houses
7. Step 6 · Practice: Hit these determinants

**Key takeaways**

- The determinant of a 2×2 matrix is the factor by which it multiplies every area, read off the unit square.
- For the matrix with rows (a, b) and (c, d), det = ad − bc.
- A negative determinant means the plane was flipped over: the F reads backwards. Swapping the two columns flips the sign.
- A determinant of zero means the plane is flattened onto a line or a point, so different inputs give the same output and information is lost.
- Computers store numbers with tiny rounding errors, so a determinant very close to zero is treated as zero (singular).

## 4.5 Inverse, rank, null space

When a transformation can be undone. Low-rank matrices are the idea behind efficient fine-tuning methods such as LoRA.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/inverse-rank-null-space
- Source: `src/lessons/inverse-rank-null-space/`

**Before you start**

- Earlier lessons: 2.1 Variables and equations; 4.2 Matrix multiplication; 4.4 Determinant
- Explain what a determinant of 0 does to the plane
- Know that A·B means “B first, then A”

**What the lesson covers**

1. Step 1 · See: Every reversible transformation has an undo
2. Step 3 · Predict: Before you look: can this one be undone?
3. Step 2 · Manipulate: Squeeze the plane until the undo breaks
4. Step 4 · Understand: Ax = b: two lines, and the three things that can happen
5. Step 5 · Apply: Low rank: the idea behind cheap fine-tuning
6. Running example (houses): A column that adds nothing, and weights from three houses
7. Step 6 · Practice: Build these matrices yourself

**Key takeaways**

- The inverse A⁻¹ undoes A: doing A and then A⁻¹ is doing nothing, A⁻¹A = I.
- The inverse exists only when the determinant is not zero; as the determinant shrinks towards zero, the entries of A⁻¹ blow up.
- The rank is the dimension of everything A can output: 2 for the plane, 1 for a line, 0 for a single point.
- The null space is every input A crushes to zero, and rank plus null-space dimension equals the number of input dimensions.
- Ax = b has one solution, none, or infinitely many, like two lines that cross, are parallel, or are the same line; np.linalg.solve finds x without building A⁻¹.
