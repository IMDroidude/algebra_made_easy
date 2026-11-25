# Module 3: Vectors

Arrows you can add, scale and compare: the language of embeddings.

## Lessons at a glance

| # | Lesson | In one line | Why an AI engineer needs it |
|---|---|---|---|
| 3.1 | [Vector arithmetic](https://imdroidude.github.io/algebra_made_easy/#/lessons/scalars-and-vectors) | Add, subtract and scale arrows. | Word embeddings are vectors, and arithmetic on them captures meaning. |
| 3.2 | [Linear combinations, span, basis](https://imdroidude.github.io/algebra_made_easy/#/lessons/span-and-basis) | Which points can two vectors reach? | A feature vector is a mix of basis features; span tells you what a model can represent. |
| 3.3 | [Dot product, length and cosine similarity](https://imdroidude.github.io/algebra_made_easy/#/lessons/dot-product) | How alike are two embeddings? | Cosine similarity ranks search results; dot products are the scores inside attention. |
| 3.4 | [Distance and similarity: choosing a measure](https://imdroidude.github.io/algebra_made_easy/#/lessons/distance-and-similarity) | Euclidean, Manhattan, cosine, Jaccard: which one for which data? | Search, clustering and recommendations all depend on one choice: how to measure “close”. |

## 3.1 Vector arithmetic

Add, subtract and scale arrows. Word embeddings are vectors, and arithmetic on them captures meaning.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/scalars-and-vectors
- Source: `src/lessons/scalars-and-vectors/`

**Before you start**

- Earlier lessons: 1.4 Points and vectors
- Plot points with negative coordinates
- Add and multiply negative numbers
- Helpful, not required: a little Python (lists, print)

**What the lesson covers**

1. Step 1 · See: A scalar is a number; a vector is a list of numbers
2. Step 2 · Manipulate: Add, subtract and scale by dragging
3. Step 3 · Predict: Which way does u − v point?
4. Step 4 · Understand: Each operation works one entry at a time
5. Step 5 · Apply: Words as points: king − man + woman
6. Running example (houses): Houses are vectors too
7. Step 6 · Practice: Four targets to hit
8. Going further: Kinds of vector
9. Going further: Transformations and projections
10. Going further: Dot and cross products

**Key takeaways**

- A scalar is a single number; a vector is an ordered list of numbers, drawn as an arrow, and the order of its entries matters.
- To add vectors, put the tail of v on the tip of u; the order does not matter, so u + v = v + u.
- u − v is the arrow from the tip of v to the tip of u.
- Multiplying by a scalar k stretches or shrinks the arrow along its own line; a negative k flips it to the opposite direction.
- Every operation works one entry at a time, which is exactly what + , - and k * u do on NumPy arrays.

## 3.2 Linear combinations, span, basis

Which points can two vectors reach? A feature vector is a mix of basis features; span tells you what a model can represent.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/span-and-basis
- Source: `src/lessons/span-and-basis/`

**Before you start**

- Earlier lessons: 3.1 Vector arithmetic
- Add two vectors and multiply a vector by a number, on paper and on the plane

**What the lesson covers**

1. Step 1 · See: A recipe: so much of u, plus so much of v
2. Step 2 · Manipulate: Mix u and v with two sliders
3. Step 3 · Predict: Two arrows, opposite ways: what can they reach?
4. Step 4 · Understand: A combination is a matrix times a vector
5. Step 5 · Apply: A feature vector is a mix of basis features
6. Running example (houses): What your features can describe
7. Step 6 · Practice: Collapse, restore, and hit a target

**Key takeaways**

- A linear combination a·u + b·v is a recipe: take a copies of u and b copies of v and walk them one after the other.
- The span of u and v is every point some recipe can reach.
- Two vectors on different lines (independent) span the whole plane and form a basis: every point has exactly one recipe.
- Two vectors on the same line (dependent) reach only that line; one vector alone reaches its line, and the zero vector only the origin.
- A combination is a matrix times a vector: put u and v as columns and multiply by (a, b); np.linalg.matrix_rank counts the independent directions.

## 3.3 Dot product, length and cosine similarity

How alike are two embeddings? Cosine similarity ranks search results; dot products are the scores inside attention.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/dot-product
- Source: `src/lessons/dot-product/`

**Before you start**

- Earlier lessons: 3.1 Vector arithmetic; 2.4 Exponents and roots
- Work out the length of a vector with √(x² + y²)
- Have a rough feel for angles in degrees (90° is a right angle)

**What the lesson covers**

1. Step 1 · See: One arrow casts a shadow on another
2. Step 2 · Manipulate: Drag the arrows and watch the sign
3. Step 3 · Predict: Before you look: what is a · b here?
4. Step 4 · Understand: Length, direction, and cosine similarity
5. Step 5 · Apply: How an AI knows a tiger is more like a cat than a car
6. Going further: Finding similar documents: embedding search
7. Running example (houses): A price model is a dot product
8. Step 6 · Practice: Four targets for one draggable arrow

**Key takeaways**

- The dot product multiplies matching entries and adds them up: (a1, a2) · (b1, b2) = a1·b1 + a2·b2.
- Its sign tells you the angle: positive means the arrows lean the same way, zero means perpendicular, negative means they lean apart.
- A vector dotted with itself is its squared length, so |a| = √(a · a); dividing by the length gives a unit vector.
- a · b = |a||b|cos θ, so cosine similarity, a · b divided by |a||b|, keeps only direction and always lies between −1 and 1.
- Embedding search ranks documents by cosine similarity with the query, so a short arrow pointing the right way can beat a long one pointing less well.

## 3.4 Distance and similarity: choosing a measure

Euclidean, Manhattan, cosine, Jaccard: which one for which data? Search, clustering and recommendations all depend on one choice: how to measure “close”.

- Open the lesson: https://imdroidude.github.io/algebra_made_easy/#/lessons/distance-and-similarity
- Source: `src/lessons/distance-and-similarity/`

**Before you start**

- Earlier lessons: 2.4 Exponents and roots; 3.1 Vector arithmetic; 3.3 Dot product, length and cosine similarity
- Subtract one vector from another, entry by entry
- Work out a square root such as √25, and know that |−3| means 3
- Explain what a cosine similarity of 1 says about two vectors

**What the lesson covers**

1. Step 1 · See: One gap, three distances
2. Step 2 · Manipulate: Drag the points and watch the three numbers
3. Step 3 · Predict: Before you look: which one is closer?
4. Step 4 · Understand: Three formulas, one family
5. Step 5 · Apply: Long and short documents: where distance gets the wrong answer
6. Going further: Yes/no data: shopping baskets
7. Going further: Ratings: when everyone has their own baseline
8. Running example (houses): Which house is most like the Corner house?
9. Step 6 · Practice: Three targets, then seven situations

**Key takeaways**

- Euclidean distance is the straight line, Manhattan adds up the differences one feature at a time, and Chebyshev keeps only the largest difference. Chebyshev ≤ Euclidean ≤ Manhattan, always.
- The three can disagree about which of two vectors is closer: Euclidean and Chebyshev punish one big difference, Manhattan counts the total.
- Cosine similarity ignores length, so use it when size is noise (a long and a short text on the same topic). Use a distance when size is part of the answer.
- For yes/no data, Hamming counts positions that differ and Jaccard counts shared items out of all items; Jaccard ignores everything neither side has.
- Scale features to a common range before measuring distance, or the feature with the biggest units decides the answer on its own.
