# Fact check: types of vector, transformations, dot and cross product

_2026-11-25. A pasted summary (types of vectors; transformations and projections; dot and cross product) was checked before it went into lesson 3.1. Verdict per claim, and what the lesson says instead where the wording was loose._

| Claim | Verdict | What the lesson says |
|---|---|---|
| A row vector is written across, a column vector down | Correct | Same numbers, different shape (1×n against n×1). Added: a plain NumPy array is neither until reshaped. |
| A zero vector has every entry 0; it is the origin | Correct | Added: adding it changes nothing, and it has no direction. |
| Zero vectors are "useful when solving optimization problems" | True but vague | Made specific: training stops changing the model when the gradient is the zero vector. |
| A unit vector has magnitude 1; u = v / ‖v‖ | Correct, with one gap | Added: the zero vector has no unit vector (division by 0; NumPy prints `nan`). |
| Sparse vectors are mostly zeros (text, recommendation); dense vectors mostly non-zero (images, deep learning) | Correct | Kept, with a shopping basket as the example. |
| "Vectors enable transformations such as rotation, scaling and translation" | Loosely worded | Vectors are what gets transformed. Rotation and scaling are done by matrices; translation is done by adding a vector and cannot be a 2×2 matrix because it moves the origin. |
| PCA projects datasets into lower dimensions | Correct | Added the two steps it leaves out: subtract the average, then pick the direction with the most spread. |
| The dot product sums the products of matching entries of two same-length vectors and gives a scalar; also called scalar or inner product; used for projections, decompositions and orthogonality | Correct | Kept. Orthogonal means the dot product is 0. |
| The cross product a × b is a new vector perpendicular to a and b | Correct, with limits the summary omits | Only defined for vectors with three entries. Its length is the area of the parallelogram; swapping the inputs flips it; parallel inputs give the zero vector. Rarely used in machine learning. |

Numbers behind the lesson's examples (all covered by tests, NumPy outputs checked against NumPy 2.5.5):

- Unit vector: (3, 4) has length 5 and unit vector (0.6, 0.8).
- Basket: 3 of 12 entries non-zero, 75% zeros. A 30,000-product shop with 20 items in the basket is 99.93% zeros.
- PCA example (six invented people, centred): total spread 7.25; the x-axis keeps 4.67 (64%); the best line is at 36.5° and keeps 7.20 (99.3%).
- Bill: (2, 1, 3) · (0.5, 2, 1.5) = 7.5.
- Cross product: (1, 2, 3) × (4, 5, 6) = (−3, 6, −3), and its dot product with each input is 0.
