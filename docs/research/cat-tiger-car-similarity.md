# Cat, tiger, car: design proposal for a named-vector similarity interactive

Status: **built 2026-11-24** as step 5 of lesson 3.3 (`src/lessons/dot-product/SimilarityStep.tsx`, data in `animals.ts`, maths in `src/linalg/similarity.ts`). See "What was built" at the end for where it differs from this proposal.

The owner's idea: give vectors names (cat, tiger, car), show their dot products live, and let the learner see how an AI system knows which things resemble each other. The visual starting point was the pythonalchemist "Dot Product Visualizer".

Built on three studies done the same day:

- [pythonalchemist-dot-product.md](pythonalchemist-dot-product.md): the reference widget, its rules and its bugs.
- [transformer-explainer.md](transformer-explainer.md): similarity grid with linked labels, one colour per entity.
- [measuring-diversity.md](measuring-diversity.md): hand-readable features, formula with live numbers, one widget reused in stages.

## What already exists

Lesson 3.3 ([src/lessons/dot-product/](../../src/lessons/dot-product/)) already has two draggable arrows with a shadow, angle arc and sign badge (step 2), a unit-circle view of cosine similarity (step 4), and an embedding search that ranks five made-up documents against a draggable query (step 5). It guards the zero vector, works by keyboard and has live text readouts, so most of the reference widget's bugs do not apply.

What is missing is the thing the owner asked for: the vectors are anonymous (`a`, `b`, `D1`…), and nothing shows *why* two things are similar, feature by feature.

## The one idea none of the three sites has

Each number in the vector is a named feature, so every term of the dot product can be read in words. The reference widget draws anonymous arrows; Transformer Explainer draws unreadable striped rectangles and never unpacks the multiply-and-add. Named features are what make "how AI knows" visible.

## The example (numbers confirmed by NumPy 2.4.6 and covered by unit tests)

Features on a 0–5 scale.

| | furry | big | wheels |
|---|---|---|---|
| 🐱 cat | 4 | 1 | 0 |
| 🐯 tiger | 4 | 4 | 0 |
| 🚗 car | 0 | 3 | 4 |

| Pair | Dot product | Cosine, two features (furry, big) | Cosine, all three |
|---|---|---|---|
| cat · tiger | 20 | 0.857 | 0.857 |
| cat · car | 3 | 0.243 | 0.146 |
| tiger · car | 12 | 0.707 | 0.424 |

These numbers carry three lessons:

1. **Similar things share features.** cat · tiger = 4×4 + 1×4 + 0×0 = 20: nearly all of it comes from "furry". cat · car = 3: only "big" overlaps, and weakly.
2. **Two features are not enough.** With only furry and big, a tiger scores 0.707 against a car, because both are big. Add "wheels" and it falls to 0.424. This is the honest reason real embeddings have hundreds of numbers.
3. **Raw dot product rewards size, cosine does not.** cat · cat = 17 but cat · tiger = 20: by raw dot product a cat is more like a tiger than like itself. Cosine fixes it (1.000 against 0.857).

The 🐱 and 🐯 match the neural network lab in the Playground, which also uses made-up animals.

## Layout

One component, three linked views, one colour per animal used in all of them.

1. **Feature bars.** One row per animal, one bar per feature, each draggable (and movable by keyboard) from 0 to 5, with the number printed. This replaces free number boxes.
2. **3×3 similarity grid.** Cosine printed in every cell, not colour alone. Choosing a cell selects that pair; the row and column names turn bold. A toggle switches the grid to raw dot products.
3. **Worked calculation for the selected pair**, each term labelled with its feature:
   `cat · tiger = 4×4 (furry) + 1×4 (big) + 0×0 (wheels) = 20`, then `÷ (4.123 × 5.657) = 0.857`.
4. **The plane**, with three named arrows on axes "furry" and "big" and the angle arc for the selected pair. When "wheels" is switched on the plane says plainly that three features no longer fit on a flat picture; the bars, grid and calculation carry on.
5. **One sentence in words**, graded by cosine rather than by sign: "tiger is the closest to cat (0.857); car is far (0.146)".

At 390 px the grid and the sentence sit directly under the bars, so the numbers stay in view while dragging.

## Stages (one new idea each, same component throughout)

1. One pair, cat and tiger, two features. Read the calculation.
2. All three animals, the full grid. Which pair is closest?
3. Predict: "By raw dot product, which is most like a cat: cat, tiger or car?" The answer (tiger) is hidden until locked in.
4. Switch on "wheels". Watch tiger–car fall.
5. Challenges that tick themselves: "make the car more like a cat than the tiger is"; "make two animals share nothing (cosine 0)".

## Taken from the reference widget, and left out

Kept: draggable arrows with snapping, the live calculation strip, a result-dependent sentence, the angle arc, presets as "try this" states.

Left out: component bars at the origin, projection as a default layer (it is asymmetric; three pairs are symmetric), free number inputs, Random, the blur-only "Challenge".

## What was built

Placement: step 5 (Apply) of lesson 3.3. The document search follows as "Step 5 · Apply, continued".

Differences from the proposal above:

- **Sliders, not draggable bars**, for the features: whole numbers 0 to 5, one slider per animal per feature. The arrows in the plane are draggable too and move the same numbers.
- **The diagonal of the table is not selectable.** It shows 1.000 (or the squared length in raw mode), but only pairs of different things can be chosen for the live calculation.
- **Raw dot products are hidden until the prediction is locked in**, so the prediction (cat · tiger = 20 beats cat · cat = 17) cannot be read off the table first.
- **With wheels on, the angle arc is hidden** and a note says the flat picture no longer shows the real angles.
- **A change that would leave a vector of all zeros is refused** with an explanation, as in the search section.
- **Stages are not separate screens.** One component starts on cat and tiger with two features; the text walks through the grid, the prediction, wheels and the two goals in order.
- **Not built:** dimming of the parts that do not matter, an animated re-sort, and preset scenes (kitten, truck).
- Added: NumPy for all pairs at once (`X @ X.T`, `np.outer`), with output tested against real NumPy (`tests/lessons/dot-product/animals-fixtures.json`).
