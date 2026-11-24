# Vectors and vector embeddings, explained with real examples

_Written 2026-11-24. An explainer, not yet built into a lesson. Every number below was computed and checked. Natural homes in the course: lesson 2.1 (scalars and vectors) for sections 1–3, lesson 3.3 (dot product) for sections 4–5, and the embeddings demo for sections 6–8. Related proposal: [research/cat-tiger-car-similarity.md](research/cat-tiger-car-similarity.md)._

## 1. What a vector is

A vector is an **ordered list of numbers that describes one thing**.

Take a person, Ali, and write down four facts about him:

| Feature | Value |
|---|---|
| Age | 30 |
| Height (cm) | 175 |
| Weight (kg) | 75 |
| Monthly income | 8,000 |

Drop the labels and keep the numbers in the same order:

```
Ali = [30, 175, 75, 8000]
```

That is a vector. It has four numbers, so it is a **four-dimensional** vector. "Dimension" only means "how many numbers are in the list". It does not mean anything mysterious about space.

Two rules make a list of numbers a vector:

1. **Order matters.** Position 1 is always age, position 2 is always height. `[30, 175, 75, 8000]` and `[175, 30, 8000, 75]` are different people.
2. **Every object uses the same positions.** Bilal's vector must also be `[age, height, weight, income]`, or the two cannot be compared.

The object can be anything, as long as you can describe it with numbers:

| Object | Possible features | Vector |
|---|---|---|
| A person | age, height, weight, income | `[30, 175, 75, 8000]` |
| A house | square feet, bedrooms, distance to centre (km) | `[1500, 3, 12]` |
| An email | number of links, capital letters, times "free" appears | `[7, 120, 4]` |
| A photograph | brightness of every pixel | `[0.12, 0.80, 0.33, …]` (thousands of numbers) |
| A sound recording | loudness at each moment | `[0.01, −0.20, 0.45, …]` |
| A sentence | an embedding (section 6) | `[0.82, 0.61, 0.12, …]` |

### Why bother: a vector is also a point

Two numbers `[x, y]` are a point on a flat plane. Three numbers are a point in a room. Four or more numbers are a point in a space we cannot draw, but **the arithmetic is identical**. So once every person is a vector, questions about people become questions about geometry:

- "Who is most like Ali?" becomes "which point is closest to Ali's point?"
- "How well does this film suit this viewer?" becomes "how much do these two arrows point the same way?"

That translation, from meaning to geometry, is the whole reason machine learning uses vectors.

## 2. Turning things that are not numbers into numbers

Real data is not all numeric. Each kind has a standard conversion.

| Kind of fact | Example | Conversion | Result |
|---|---|---|---|
| Already a number | age 30 | keep it | `30` |
| Yes / no | married: yes | 1 for yes, 0 for no | `1` |
| Category | city: Riyadh (out of Riyadh, Jeddah, Dammam) | **one-hot**: one slot per option, 1 in the matching slot | `[1, 0, 0]` |
| Ordered category | size: small / medium / large | numbers in order | `0`, `1`, `2` |
| Text, images, audio | "I love my cat" | word counts (section 7) or an embedding (section 6) | a long vector |

Why not just number the cities 1, 2, 3? Because that would claim Dammam (3) is "three times" Riyadh (1) and that Jeddah sits between them. One-hot avoids inventing an order that does not exist.

Ali with marital status and city added:

```
[age, height, weight, income, married, Riyadh, Jeddah, Dammam]
[ 30,  175,    75,    8000,     1,      1,      0,      0   ]
```

Now an eight-dimensional vector.

## 3. Converting to decimal values (scaling), and why it is necessary

Look at Ali's raw vector again: `[30, 175, 75, 8000]`. Income is in the thousands, age is in the tens. Any calculation that mixes them will be dominated by income, simply because its numbers are bigger.

Here is the problem made concrete. Three people:

| Person | Age | Height | Weight | Income | In words |
|---|---|---|---|---|---|
| Ali | 30 | 175 | 75 | 8,000 | |
| Bilal | 31 | 176 | 76 | 9,000 | nearly Ali's twin, earns a little more |
| Yusuf | 65 | 155 | 55 | 8,000 | 35 years older, 20 cm shorter, 20 kg lighter, same income |

Any human says Bilal is the one who resembles Ali. Measure the straight-line distance between the raw vectors (subtract, square, add, square root):

- Ali to Bilal: √(1² + 1² + 1² + 1000²) ≈ **1000.0**
- Ali to Yusuf: √(35² + 20² + 20² + 0²) = √2025 = **45.0**

The raw numbers say Yusuf is 22 times closer. That is wrong, and it is wrong only because of units. If income were written in thousands (8 instead of 8,000) the answer would flip.

### The fix: min-max scaling

Put every feature on the same 0-to-1 scale:

```
scaled = (value − minimum) / (maximum − minimum)
```

Choose the range each feature can take in the data set:

| Feature | Minimum | Maximum | Ali's raw value | Calculation | Scaled |
|---|---|---|---|---|---|
| Age | 20 | 70 | 30 | (30 − 20) / 50 | **0.20** |
| Height | 150 | 200 | 175 | (175 − 150) / 50 | **0.50** |
| Weight | 50 | 100 | 75 | (75 − 50) / 50 | **0.50** |
| Income | 0 | 20,000 | 8,000 | 8,000 / 20,000 | **0.40** |

Each number now reads as "how far along the range". Ali is 20% of the way from the youngest to the oldest, and exactly mid-range in height and weight.

| Person | Raw vector | Scaled vector |
|---|---|---|
| Ali | `[30, 175, 75, 8000]` | `[0.20, 0.50, 0.50, 0.40]` |
| Bilal | `[31, 176, 76, 9000]` | `[0.22, 0.52, 0.52, 0.45]` |
| Yusuf | `[65, 155, 55, 8000]` | `[0.90, 0.10, 0.10, 0.40]` |

Distances again, on the scaled vectors:

- Ali to Bilal: √(0.02² + 0.02² + 0.02² + 0.05²) ≈ **0.06**
- Ali to Yusuf: √(0.70² + 0.40² + 0.40² + 0²) = √0.81 = **0.90**

Bilal is now 15 times closer than Yusuf, which matches common sense.

### The other common method: standardisation (z-score)

```
scaled = (value − average) / standard deviation
```

The result says "how many standard deviations above or below average". If the average age is 40 with a standard deviation of 10, Ali's age becomes (30 − 40) / 10 = −1.0. Values come out roughly between −3 and +3 and are centred on 0. It copes better with outliers (one billionaire does not squash everyone else's income to near 0, as min-max would).

Rule of thumb: min-max when you want a fixed 0-to-1 range, z-score when the data has outliers or the method expects data centred on zero.

## 4. The dot product: one number for "how well do these match?"

Scaling makes vectors comparable. The dot product is the basic comparison.

**Recipe:** multiply matching positions, then add everything up.

A fresh example where the answer has an obvious meaning: films and a viewer's taste. Describe both with the same three features, each from 0 to 1:

```
[action, comedy, romance]
```

| | Action | Comedy | Romance |
|---|---|---|---|
| Your taste | 0.8 | 0.1 | 0.3 |
| Film A, an action thriller | 0.9 | 0.2 | 0.1 |
| Film B, a romantic comedy | 0.1 | 0.8 | 0.9 |
| Film C, an action comedy | 0.7 | 0.7 | 0.1 |

Taste · Film A:

```
(0.8 × 0.9) + (0.1 × 0.2) + (0.3 × 0.1)
=   0.72    +    0.02    +    0.03
= 0.77
```

| Film | Dot product with your taste |
|---|---|
| A, action thriller | **0.77** |
| C, action comedy | 0.66 |
| B, romantic comedy | 0.43 |

Read each term as "how much you want it × how much the film has of it". A term is large only when **both** numbers are large. Film B has plenty of comedy (0.8), but you barely care about comedy (0.1), so that term contributes only 0.08. The dot product is a match score, and a recommender in its simplest form is exactly this: score every film, show the highest.

The same calculation appears everywhere in AI:

- **A neuron:** inputs · weights. The weights are the neuron's "taste".
- **Search:** question vector · document vector.
- **Attention in a transformer:** query · key decides which words look at which.

### The weakness of the dot product

It rewards size, not only agreement. Double every number in Film A to `[1.8, 0.4, 0.2]` and the dot product doubles to 1.54, although the film's *mix* of genres has not changed at all.

## 5. Cosine similarity: same direction, ignoring size

Cosine similarity fixes that by dividing out the lengths:

```
cosine similarity = (a · b) / (length of a × length of b)
```

The length of a vector is √(sum of its squares). For your taste, √(0.8² + 0.1² + 0.3²) = √0.74 ≈ 0.860.

| Film | Dot product | Cosine similarity | Angle between the arrows |
|---|---|---|---|
| A, action thriller | 0.77 | **0.97** | 15° |
| C, action comedy | 0.66 | 0.77 | 40° |
| B, romantic comedy | 0.43 | 0.41 | 66° |
| A with every number doubled | 1.54 | **0.97** | 15° |

The doubled film gets the same cosine as the original. Cosine only asks whether the two arrows point the same way.

How to read the value:

| Cosine | Meaning |
|---|---|
| 1 | same direction: the same kind of thing |
| around 0 | unrelated |
| −1 | opposite directions |

### Three measures, when to use which

| Measure | Question it answers | Typical use |
|---|---|---|
| Distance (Euclidean) | How far apart are the two points? | Scaled feature data such as the people in section 3, k-nearest neighbours, clustering |
| Dot product | How strong is the match, counting size? | Neurons, attention, recommenders where "more" should count |
| Cosine similarity | Do they point the same way, ignoring size? | Text and embedding search, where a long document should not win only by being long |

One warning that ties back to section 3: on the **raw** people vectors, the cosine between Ali and Yusuf is 0.99998, which looks like "almost identical". Income is so large that every person's arrow points almost straight along the income axis. On the scaled vectors it is 0.53 (and 0.9994 for Ali and Bilal). Scale first, compare second.

## 6. Vector embeddings

In everything so far, **a person chose the features**: age, height, action, comedy. That works for people and houses. It does not work for words. What are the features of "king"? Of "Paris"? Nobody can write that list by hand for every word in a language.

An **embedding** is a vector whose numbers were **learned by a model** instead of chosen by a person.

- The model reads a very large amount of text (or looks at images, or listens to audio).
- It adjusts each word's numbers so that words used in similar contexts end up with similar vectors. "Cat" and "dog" both appear next to "pet", "feed" and "vet", so they are pushed close together.
- The result is a list of typically 384, 768 or 1,536 numbers per word or sentence.

The individual numbers have no names. Dimension 217 is not "royalty". The meaning is in the **geometry**: what is near what, and which way the arrows point.

### Reading the picture (word embeddings in vector space)

The picture you shared shows the two things embeddings give you.

**1. Similar things sit close together.** The blue dots (cat, dog, animal, pet) form one cluster, the red dots (france, spain, country, europe) another. Nobody told the model these were categories. They emerged from how the words are used.

**2. Directions carry relationships.** The arrow from *man* to *woman* is nearly the same arrow as from *king* to *queen*. So is paris → france compared with madrid → spain. The same step in space means the same change in meaning. That is what makes the famous line work:

```
king − man + woman ≈ queen
```

A toy version with two readable features, `[royal, female]`:

| Word | Royal | Female |
|---|---|---|
| man | 0 | 0 |
| woman | 0 | 1 |
| king | 1 | 0 |
| queen | 1 | 1 |

```
king − man + woman = [1, 0] − [0, 0] + [0, 1] = [1, 1] = queen
```

"Start at king, remove what makes a man a man, add what makes a woman a woman." In a real embedding the dimensions are not this tidy and the result is only *close to* queen, which is why the picture writes ≈ and not =.

One honest caveat about such pictures: real embeddings have hundreds of dimensions, and the drawing squashes them to two or three so we can look at them. The clusters are real; the exact positions are a simplification.

### What embeddings are used for

Text, images, products and users can all be embedded. Once they are vectors, sections 4 and 5 apply unchanged:

| Use | What happens |
|---|---|
| Semantic search | Embed the question, return the documents with the highest cosine similarity. Finds "automobile" when you typed "car". |
| RAG (chatbots answering from your documents) | Same search, then the best passages are handed to the language model. |
| Recommendations | Embed users and items in one space; score with the dot product, as in the film example. |
| Duplicate and anomaly detection | Very close vectors are duplicates; a vector far from all others is unusual. |

A **vector database** (pgvector, Pinecone, Milvus and others) is a database built to answer one question quickly: "which of my million stored vectors are nearest to this one?"

## 7. Sparse vectors

A **sparse vector** is very long and almost entirely zeros.

The classic example is counting words. Give every word in the vocabulary its own position, and write how often it appears in the text.

A tiny vocabulary of 8 words:

```
position:   0    1     2    3     4       5      6     7
word:       i   love   my   cat  adore  kitten  car  fast
```

| Sentence | Sparse vector |
|---|---|
| "I love my cat" | `[1, 1, 1, 1, 0, 0, 0, 0]` |
| "I adore my kitten" | `[1, 0, 1, 0, 1, 1, 0, 0]` |
| "my fast car" | `[0, 0, 1, 0, 0, 0, 1, 1]` |

A real vocabulary has 50,000 words or more. A six-word sentence then has at most 6 non-zero numbers and 49,994 zeros. So nobody stores the zeros. Only the positions that have a value are kept:

```
"I love my cat"  →  {0: 1, 1: 1, 2: 1, 3: 1}
```

One-hot categories from section 2 are sparse too: a city out of 5,000 cities is one 1 and 4,999 zeros.

**Strengths:** every position has a name, so you can see exactly why two texts matched. Exact words, product codes and rare names are matched precisely. Cheap to build: no model needed, just counting. Classic keyword search (TF-IDF, BM25) works this way.

**Weakness:** it knows words, not meaning. To a sparse vector, "cat" and "kitten" are as unrelated as "cat" and "car": different positions, nothing in common.

## 8. Dense vectors

A **dense vector** is much shorter, and nearly every number is non-zero. Embeddings are dense vectors.

```
"I love my cat"  →  [0.82, 0.61, 0.12, 0.40, …]     (say 384 numbers, none of them named)
```

Compare the two kinds on the same three sentences. (The dense numbers here are made up, four dimensions instead of hundreds, to show the behaviour.)

| Pair | In meaning | Sparse cosine | Dense cosine |
|---|---|---|---|
| "I love my cat" vs "I adore my kitten" | almost the same | 0.50 | **0.998** |
| "I love my cat" vs "my fast car" | unrelated | 0.29 | 0.36 |

The sparse score for the first pair comes entirely from the filler words "I" and "my". The words that carry the meaning (love/adore, cat/kitten) contributed nothing, because they are different words. The dense vectors put the two sentences almost on top of each other, because the model learned that those words mean nearly the same thing.

### Side by side

| | Sparse | Dense |
|---|---|---|
| Length | vocabulary size: 50,000 or more | a few hundred to a few thousand |
| Contents | almost all zeros | almost all non-zero decimals |
| What a position means | a specific word or category | nothing nameable on its own |
| How it is made | counting or one-hot, no model | a trained model |
| Stored as | only the non-zero positions | the full list |
| Good at | exact keywords, codes, names | meaning, synonyms, paraphrases |
| Weak at | synonyms ("car" vs "automobile") | exact rare terms (a part number, an unusual surname) |
| Typical tools | TF-IDF, BM25 | Word2Vec, sentence transformers, embedding APIs |

Because the strengths are opposite, production search systems often run both and merge the results. That is called **hybrid search**.

## 9. Summary

1. A vector is an ordered list of numbers describing one object; its dimension is how many numbers it has.
2. Anything can be turned into numbers: keep numbers, 0/1 for yes/no, one-hot for categories, counts or embeddings for text.
3. Scale features to a common range before comparing, or the feature with the biggest units decides everything.
4. Distance asks how far apart, the dot product asks how strong the match, cosine similarity asks whether the direction is the same.
5. An embedding is a vector learned by a model, where closeness means similar meaning and directions mean relationships.
6. Sparse vectors are long, mostly zero and match exact words. Dense vectors are short, full and match meaning.
