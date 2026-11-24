# Types of vectors and how to compare them

_Written 2026-11-24. Built into the app on 2026-11-25: section 2 is the "Types of vector" section of the Reference page, and sections 3 and 4 are lesson 3.4, "Distance and similarity: choosing a measure". Every number below was computed with NumPy. It continues [vectors-and-embeddings-explained.md](vectors-and-embeddings-explained.md), which covers what a vector is, scaling, the dot product, cosine and embeddings in more depth._

## 1. The starting idea

A vector is an ordered list of numbers that represents something:

```
x = [x₁, x₂, x₃, …, xₙ]
```

Machine learning always follows the same path:

```
real-world object  →  numbers  →  vector  →  model
```

What changes from one problem to the next is **what the numbers stand for**. That gives the different types of vector in section 2. Once things are vectors, the next question is always "how alike are these two?", and section 3 covers the ways to answer it.

## 2. Types of vector

### 2a. By what the numbers mean

| Type | What each number is | Example | Used for |
|---|---|---|---|
| **Feature vector** | One measured property of the object | A customer: `[age, monthly spend, visits, is member]` = `[34, 120, 6, 1]` | Almost all classic ML on tables: predicting churn, prices, credit risk |
| **Binary vector** | A yes/no answer, written 1 or 0 | A customer: `[has app, has card, gets newsletter]` = `[1, 0, 1]` | Flags, survey answers, "bought it or not" |
| **One-hot vector** | One 1 marking a single category, the rest 0 | Colour out of `[red, green, blue]`: red = `[1, 0, 0]` | Categories with no order; the correct answer (label) in classification |
| **Multi-hot vector** | Several 1s, one per category that applies | Film genres `[action, comedy, romance, sci-fi]`: an action sci-fi film = `[1, 0, 0, 1]` | Tags, genres, symptoms, items in a basket |
| **Count vector (bag of words)** | How many times each word appears | Vocabulary `[the, cat, sat, on, mat, dog]`; "the cat sat on the mat" = `[2, 1, 1, 1, 1, 0]` | Spam filters, simple document classification |
| **TF-IDF vector** | A word count, raised for rare words and lowered for common ones | "cat" appears 2 times in a document and in 1 of 3 documents: 2 × ln(3/1) = 2.197. "the" appears in all 3: 2 × ln(3/3) = 0 | Keyword search |
| **Pixel vector** | Brightness of one pixel | A 2×2 grey image with rows `0, 255` and `128, 64`, flattened: `[0, 255, 128, 64]`, scaled to `[0, 1, 0.502, 0.251]` | Image input to a model |
| **Signal / time-series vector** | A measurement at each moment | Temperature every hour: `[21.0, 21.4, 22.1, 23.0]` | Audio, sensors, stock prices |
| **Embedding vector** | A number learned by a model; no single position has a name | The word "cat" as 300 numbers: `[0.21, −0.47, 0.83, …]` (made-up values) | Search by meaning, recommendations, the input to every language model |
| **Preference (user) vector** | How much a user likes each kind of thing | Film taste `[action, romance]` = `[0.9, 0.1]` | Recommender systems |
| **Probability vector** | A chance for each possible answer; all between 0 and 1, adding to 1 | Model scores `[2, 1, 0]` through softmax: `[0.665, 0.245, 0.090]` for cat / dog / bird | The output of a classifier or a language model |
| **State vector** | Everything needed to describe a system right now | A robot: `[x, y, heading, speed]` = `[2.0, 3.5, 90°, 0.4]`. One second later, moving north at 0.4 m/s: `[2.0, 3.9, 90°, 0.4]` | Robotics, games, control, reinforcement learning |
| **Weight (parameter) vector** | How much the model cares about each feature | House price weights `[0.2, 15, −3]` on a house `[1500 sq ft, 3 bedrooms, 12 km]`: 0.2×1500 + 15×3 − 3×12 = 309 ($k) | This is the model itself; training means finding these numbers |
| **Gradient vector** | How much the error changes if each weight is nudged | Weights `[0.5, −1]`, gradient `[0.2, −0.4]`, learning rate 0.1: new weights `[0.48, −0.96]` | Training: every step moves the weights against the gradient |

The seven items in the pasted list map onto this table like this: features of an email and properties of a customer are feature vectors; pixels are a pixel vector; words in a document are a count, TF-IDF or embedding vector; a user's preferences are a preference vector; the state of a robot is a state vector; the parameters of a model are a weight vector.

### 2b. By mathematical property

These labels describe the shape or contents of a vector, whatever it stands for. One vector can carry several at once: a one-hot vector is also binary, sparse and a unit vector.

| Type | Meaning | Example | Why it matters |
|---|---|---|---|
| **Column / row vector** | Written top to bottom, or left to right | A 3×1 column, or `[1, 2, 3]` as a 1×3 row | Decides which matrix multiplications are allowed. One data record is usually one row of a table. |
| **Zero vector** | Every number is 0 | `[0, 0, 0]` | Has length 0 and no direction, so cosine similarity with it is undefined |
| **Unit vector** | Length exactly 1 | `[3, 4]` has length 5, so `[0.6, 0.8]` is its unit vector | Keeps direction and discards size. Embeddings are often stored this way. |
| **Basis vector** | One of the directions everything else is built from | `[1, 0]` and `[0, 1]`; then `[3, 4]` = 3×`[1, 0]` + 4×`[0, 1]` | Each feature is one basis direction |
| **Orthogonal vectors** | At a right angle: dot product 0 | `[1, 0]` and `[0, 1]`; also `[3, 1]` and `[−1, 3]` | "Have nothing in common". Any two different one-hot vectors are orthogonal. |
| **Sparse vector** | Almost all zeros | A count vector over a 50,000-word vocabulary with 12 non-zero entries | Stored as only the non-zero positions; matches exact words |
| **Dense vector** | Almost no zeros | An embedding: 384 decimals | Captures meaning; costs the full list to store |
| **Position / displacement** | A place, or a movement from one place to another | Position `[2, 3]`; moving to `[5, 7]` is the displacement `[3, 4]` | The difference of two vectors is itself a vector, and every distance below is the size of that difference |

## 3. Similarity and distance measures

Two words are used, and they run in opposite directions:

- A **distance** is 0 for identical vectors and grows as they differ. Small means alike.
- A **similarity** is largest for identical vectors. Big means alike.

### 3a. One pair, every measure

Take A = `[2, 3]` and B = `[5, 7]`. The difference is `[3, 4]`.

| Measure | Formula in words | Worked | Result |
|---|---|---|---|
| Euclidean distance | Square the differences, add, square root | √(3² + 4²) = √25 | **5** |
| Manhattan distance | Add the sizes of the differences | 3 + 4 | **7** |
| Chebyshev distance | The single largest difference | max(3, 4) | **4** |
| Dot product | Multiply matching entries, add | 2×5 + 3×7 | **31** |
| Cosine similarity | Dot product divided by both lengths | 31 ÷ (√13 × √74) | **0.9995** |

Same two vectors, five different numbers, because each measure asks a different question.

### 3b. Euclidean distance (L2): the straight line

```
d(A, B) = √( (a₁ − b₁)² + (a₂ − b₂)² + … )
```

**Example.** Two delivery drones are at `[2, 3]` and `[5, 7]` km on a map. A drone flies straight, so they are 5 km apart.

**Use it when** the numbers are real measurements on comparable scales and "how far apart" is the honest question: physical positions, k-nearest neighbours, k-means clustering, comparing scaled feature vectors.

**Watch out for:**

- **Unscaled features.** With `[age, income]`, a difference of 1,000 in income swamps a difference of 30 years. Scale first.
- **Size.** A long document and a short one on the same topic are far apart (section 3e).
- **One large difference dominates**, because differences are squared (section 3d).

### 3c. Manhattan distance (L1): the city grid

```
d(A, B) = |a₁ − b₁| + |a₂ − b₂| + …
```

**Example.** A taxi in a city of square blocks goes from `[2, 3]` to `[5, 7]`. It cannot cut through buildings: 3 blocks east and 4 blocks north is 7 blocks, not 5.

**Use it when** movement or cost adds up one feature at a time (grid routes, warehouse pickers, total stock difference across products), or when you do not want a single extreme feature to dominate.

### 3d. Chebyshev distance (L∞): the worst single difference

```
d(A, B) = max( |a₁ − b₁|, |a₂ − b₂|, … )
```

**Example.** A king on a chessboard moves one square in any direction, including diagonally. From `[2, 3]` to `[5, 7]` takes 4 moves: the larger of 3 and 4. The same holds for a crane that drives both axes at once: the time is set by the longer axis.

**Use it when** only the worst deviation matters: quality control ("is any one measurement out of tolerance?"), machines that move on all axes together.

**These three disagree, and that is the point.** Compare a reference P = `[1, 1, 1, 1]` with two others:

| | Q = `[2, 2, 2, 2]` (a little different everywhere) | R = `[1, 1, 1, 4]` (identical except one feature) | Closer to P |
|---|---|---|---|
| Euclidean | 2 | 3 | Q |
| Manhattan | 4 | 3 | R |
| Chebyshev | 1 | 3 | Q |

Euclidean and Chebyshev punish the one large difference in R. Manhattan counts total difference, so R wins. Pick the measure whose idea of "different" matches yours.

All three are one family, the **Minkowski distance**: raise each difference to the power p, add, take the p-th root. p = 1 is Manhattan, p = 2 is Euclidean, and as p grows it approaches Chebyshev.

### 3e. Cosine similarity: same direction, ignoring size

```
cos(A, B) = (A · B) ÷ (|A| × |B|)
```

It runs from −1 (opposite) through 0 (unrelated) to 1 (same direction). **Cosine distance** is 1 − cosine similarity.

**Example.** Three documents as word counts over `[football, goal, election]`:

- A, a short sports note: `[2, 1, 0]`
- B, a long sports article, ten times the length: `[20, 10, 0]`
- C, a short politics note: `[0, 1, 2]`

| Pair | Euclidean distance | Cosine similarity |
|---|---|---|
| A and B (same topic) | 20.12 | 1.000 |
| A and C (different topic) | 2.83 | 0.200 |

Euclidean distance says the sports note is closer to the politics note than to the sports article, only because both are short. Cosine gets it right: A and B point exactly the same way.

**Use it when** size is not the message: text of different lengths, embedding search, comparing tastes of a heavy user and a light user.

**Do not use it when** size carries meaning. `[1, 1]` and `[100, 100]` have cosine 1, which is wrong if those are a small and a large purchase.

### 3f. Dot product: direction and size together

```
A · B = a₁b₁ + a₂b₂ + …
```

**Example.** A user's taste over `[action, romance]` is `[0.9, 0.1]`. Three films:

| Film | Vector | Dot product with the user | Cosine with the user |
|---|---|---|---|
| Blockbuster action | `[2, 0.2]` | 1.82 | 0.99994 |
| Small action film | `[1, 0.1]` | 0.91 | 0.99994 |
| Romance | `[0.5, 1.5]` | 0.60 | 0.419 |

Cosine cannot separate the two action films: same direction. The dot product ranks the blockbuster first, because its vector is longer. If length encodes something you want (popularity, confidence, strength), the dot product keeps it.

**Use it when** bigger should count: recommenders, neuron activations, attention scores inside language models, and embedding search whenever the model was trained with it.

**Unit vectors make the choice disappear.** If every vector is scaled to length 1, the dot product *is* the cosine, and squared Euclidean distance = 2 − 2 × cosine. For A and C above, after scaling: squared distance 1.6 = 2 − 2 × 0.2. All three then rank results in the same order.

### 3g. Hamming distance: how many positions differ

**Example.** Two binary vectors of the same length:

```
[1, 0, 1, 1, 0, 1]
[1, 1, 1, 0, 0, 1]
    ↑     ↑          2 positions differ: Hamming distance 2
```

It works on any equal-length sequence: the DNA strings `GATTACA` and `GACTATA` also differ in 2 positions.

**Use it when** every position is a category or a bit and "different" has no size: error detection in transmitted data, comparing binary fingerprints or hashes, DNA, answers to a multiple-choice test.

### 3h. Jaccard similarity: shared items out of all items

```
J(A, B) = (number of items in both) ÷ (number of items in either)
```

**Example.** Two shopping baskets:

- A = {milk, bread, eggs, butter}
- B = {milk, bread, jam}

In both: milk, bread (2). In either: milk, bread, eggs, butter, jam (5). Jaccard = 2 ÷ 5 = **0.4**.

**Use it when** the data is a set or a multi-hot vector and absences mean nothing. A shop sells 10,000 products; two customers both not buying 9,995 of them is not evidence that they are alike. Jaccard ignores shared zeros; Hamming would count them as agreement. Typical uses: baskets, tags, near-duplicate documents, comparing sets of words.

### 3i. Pearson correlation: do they rise and fall together?

Subtract each vector's own average, then take the cosine. It runs from −1 to 1.

**Example.** Ratings of the same four films, 1 to 5:

- Ali: `[5, 5, 3, 2]`
- Sara: `[4, 4, 2, 1]` (same taste, but always one star lower)
- Omar: `[2, 3, 5, 5]` (opposite taste)

| Pair | Euclidean | Cosine | Pearson |
|---|---|---|---|
| Ali and Sara | 2.00 | 0.994 | **1.000** |
| Ali and Omar | 5.10 | 0.794 | **−0.926** |

Pearson sees that Sara agrees with Ali perfectly once her stricter marking is removed. It also shows what cosine hides: Ali and Omar get a cosine of 0.794, which looks like agreement, only because all ratings are positive numbers. Their Pearson correlation is −0.926.

**Use it when** each vector has its own baseline: ratings from generous and harsh users, sensor readings with different offsets, comparing the shape of two time series.

### 3j. Two more you will meet

- **Mahalanobis distance**: Euclidean distance after correcting for features that are on different scales *and* move together (height and weight). Used for spotting outliers and fraud.
- **KL divergence / cross-entropy**: compares two probability vectors. It is what a classifier or language model minimises during training, with the model's predicted probabilities on one side and the one-hot correct answer on the other. It is not symmetric, so it is not a true distance.

## 4. Which measure, in which case

| Your data | Use | Why |
|---|---|---|
| Physical positions, or scaled numeric features | Euclidean | Straight-line distance is the real question |
| Grid movement, or costs that add up feature by feature | Manhattan | Total difference, without squaring |
| Only the worst single difference matters | Chebyshev | Takes the maximum |
| Text of different lengths; embeddings | Cosine | Topic is direction; length is noise |
| Embeddings where length means strength or popularity; neurons; attention | Dot product | Keeps size in the score |
| Unit-length embeddings | Any of cosine, dot product, Euclidean | They give the same ranking; dot product is the cheapest to compute |
| Equal-length bit strings, codes, DNA | Hamming | Counts mismatched positions |
| Sets, tags, baskets (multi-hot, mostly zeros) | Jaccard | Ignores shared absences |
| Ratings or readings with different baselines | Pearson | Removes each vector's own average |
| Correlated features, outlier detection | Mahalanobis | Accounts for scale and correlation |
| Two probability vectors | KL divergence / cross-entropy | Built for probabilities |

Three rules that hold in every row:

1. **Scale first.** Every measure except Jaccard and Hamming is distorted when one feature has much larger units than the others.
2. **Match the measure to what size means.** If a longer vector means "more of the same thing", use cosine. If it means "a stronger signal", use the dot product. If it means "a different object", use a distance.
3. **For embeddings from a model, use the measure the model was trained with.** Its documentation says which (cosine, dot product or Euclidean), and a vector database must be set to the same one.
