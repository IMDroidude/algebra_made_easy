# Algebra Made Easy — Product & Build Plan

_Last updated: 2026-11-21 (rev 5: all 18 lessons built; rev 4: Foundations track added at the owner's request; two external reviews folded in, see section 9)_

## 0. Status (2026-11-21)

| Phase | State |
|---|---|
| 0 — Scaffold | Done |
| 1 — Vertical slice | Done: lesson 4 and the playground |
| Gate — Does it teach? | Not run: the owner asked for all lessons to be built at once. Still worth doing before public release |
| 2–4 — All lessons | Done: all 18 lessons (F1–F6, 1–12) built in parallel by nine agents on 2026-11-21, each to [LESSON_GUIDE.md](LESSON_GUIDE.md), then integrated and checked. 1,017 unit/component tests, 316 browser tests (desktop and tablet-touch); every NumPy output checked against real NumPy 2.4 |
| 5 — Release | Deploy config ready; not deployed. Local progress saving, shareable playground URLs and a full accessibility review are still open |

Added since the plan was written: coordinate tooltips on every point (hover, drag, keyboard focus).

2026-11-21, second round:
- **Dragging reaches the visible edge.** Points were clamped to ±5 even where the plane showed ±7; each plane now reports its exact visible area and points stop there (all lessons).
- **F1 redesigned** after studying a Desmos graph and a GeoGebra applet ([research/desmos-coordinates.md](research/desmos-coordinates.md), [research/geogebra-coordinates.md](research/geogebra-coordinates.md)): ±10 range, large wide plane, quadrants labelled and tinted, a live quadrant label on the point, permanent (x, y) label, linked x/y sliders, number line first (1D → 2D).
- **F2 improved:** x/y/z named width/height/depth, a live "how to reach this point" walk drawn in the room, Origin / equal-coordinates presets, a game-world analogy, the y-up vs z-up convention note, larger room.
- New `Step layout="wide"` option for steps where the visual is the lesson.
- **Prerequisites on every lesson:** a "Before you start" box (earlier lessons + self-check skills), defined in `src/app/prerequisites.ts`; a test keeps it complete and ordered.
- **Modules (third round):** the course is regrouped into 5 modules with ids 1.1 … 5.4 (slugs and URLs unchanged). Module 1 "Understanding coordinates and 3D space" has 3 new lessons (1.1 dimensions and the origin, 1.4 points and vectors, 1.5 real-world positions with a recap of the module's 7 goal questions) and a companion Jupyter notebook (`notebooks/`, served from `public/notebooks/`: NumPy, Matplotlib, Plotly 3D; executed clean). Every lesson header has a "why an AI engineer needs this" line; every lesson ends with Key takeaways. Lesson 2.3 gained a decision-boundary section, 1.3 gained planes in 3D, 4.1 gained a transformation gallery (rotation, scaling, reflection, shear), 4.2 links to TensorFlow Playground. Tools considered and rejected for the site: Desmos/GeoGebra embeds (API key / 10–60 s load), Manim (offline video), Plotly on the site (bundle size; used in the notebook instead).
- **Running example and Reference (fourth round):** one shared dataset, 8 houses `[sqft, bedrooms, distance_km] → price` in `src/data/houses.ts`, appears in a "Running example" section of every lesson. New Reference page (`/#/reference`): what each object means (point, vector, line, plane, matrix, operation) and an operation-to-scenario map, each row linked to its lesson.
- **Backlog (suggested by a review, not scheduled):** parametric lines; planes with normal vectors and point-to-plane distance; homogeneous coordinates for translation; orthogonality and orthonormal bases; change of basis as its own lesson. Jacobians and backpropagation need calculus and stay out of scope.
- **F1 quiz and pins** adopted from coordinategrid.com ([research/coordinategrid.md](research/coordinategrid.md)): a 6-question quick quiz in step 6 whose wrong answers name the slip (swapped x/y, flipped sign) and draw both points; optional pinned points A–H with a table and a joining shape in step 2.
- **Neural network lab (2026-11-24):** a third Playground tab, "Neural network: cat or tiger?" (`/#/playground?lab=network`), modelled on TensorFlow Playground after running the owner's link live ([research/tensorflow-playground.md](research/tensorflow-playground.md)). A small network (0–2 hidden layers, tanh / ReLU / linear) trains in the browser on made-up animals (body size, stripes): coloured decision plane with 🐱 🐯 🐭, network diagram, loss curve, live W and b per layer, "ask about a new animal", five set-up experiments. Maths in `src/linalg/neuralNet.ts`, UI in `src/playground/network/`; lesson 4.2 links to it. The Playground lab is now chosen by `?lab=` in the URL. This relaxes the non-goal "not a neural-network training environment" for the Playground only, at the owner's request.
- **Cat / tiger / car similarity (2026-11-24):** lesson 3.3 has a new step 5, "How an AI knows a tiger is more like a cat than a car": three named vectors with readable features (furry, big, and wheels on a toggle), sliders and draggable arrows, a table of every pair's cosine (or raw dot product), a live calculation with each term labelled by its feature, a prediction (cat · tiger beats cat · cat), two self-ticking goals, and NumPy (`X @ X.T`) checked against real NumPy. The document search is now "Step 5 · Apply, continued". Maths in `src/linalg/similarity.ts`, data in `src/lessons/dot-product/animals.ts`, UI in `SimilarityStep.tsx`. Design and sources: [research/cat-tiger-car-similarity.md](research/cat-tiger-car-similarity.md), based on three sites studied live: the pythonalchemist dot product visualizer ([research/pythonalchemist-dot-product.md](research/pythonalchemist-dot-product.md)), Transformer Explainer ([research/transformer-explainer.md](research/transformer-explainer.md)) and PAIR's Measuring Diversity ([research/measuring-diversity.md](research/measuring-diversity.md)).
- **Vectors and embeddings explainer (2026-11-24, written, not built into a lesson):** [vectors-and-embeddings-explained.md](vectors-and-embeddings-explained.md) covers what a vector is (person `[age, height, weight, income]`), converting non-numbers to numbers (0/1, one-hot), min-max and z-score scaling with a worked case where raw distance gives the wrong answer, dot product and cosine on a film-taste example, embeddings and king − man + woman, and sparse versus dense vectors. All numbers checked. Candidate content for lessons 2.1 and 3.3.
- **Vector types and similarity measures (written 2026-11-24, built 2026-11-25):** the explainer [vector-types-and-similarity-measures.md](vector-types-and-similarity-measures.md) is now in the app in two places. (1) **New lesson 3.4, "Distance and similarity: choosing a measure"** (`/#/lessons/distance-and-similarity`, the course now has 23 lessons): Euclidean, Manhattan and Chebyshev on draggable points with the circle / diamond / square of equally distant points; a prediction where the three disagree; the Minkowski p dial; documents of different lengths (distance against cosine); shopping baskets (Hamming against Jaccard, with a shop-size switch); ratings (Pearson); the house example (nearest house changes after min-max scaling); three drag goals and a seven-situation "which measure fits?" quiz. Maths in `src/linalg/distance.ts`; NumPy output checked against real NumPy. (2) **"Types of vector" on the Reference page** (`/#/reference`, data in `src/data/vectorTypes.ts`): 14 types by meaning and 8 by property, each with object → numbers → vector → use. Not built from the explainer: Mahalanobis distance and KL divergence (mentioned in the doc only), and an interactive for the dot-product film example.
- **Lesson 3.1 "Going further" sections (2026-11-25):** three sections after the practice step, built from a pasted summary that was fact-checked first ([research/vector-kinds-fact-check.md](research/vector-kinds-fact-check.md)). *Kinds of vector*: row and column, zero, unit (drag v, see its unit vector on the unit circle; wind speed × direction) and sparse against dense (a 12-product shopping basket you fill and empty). *Transformations and projections*: a spaceship sprite rotated, scaled and translated, and six people's height and weight projected onto a line you turn, with the spread kept and the line PCA picks. *Dot and cross products*: a shopping bill as a dot product; two draggable vectors on a floor with their dot product, cross product and a side view showing it point up or down. Maths in `src/linalg/cross.ts` and `src/linalg/pca.ts`; UI in `KindsSection.tsx`, `TransformSection.tsx`, `ProductsSection.tsx` under `src/lessons/scalars-and-vectors/`. Every NumPy output is tested against fixtures from real NumPy 2.5.5 for every slider and drag position.
- **Module summaries (2026-11-25):** one Markdown file per module in [modules/](modules/README.md): lessons at a glance, and for each lesson its prerequisites, section outline and key takeaways, with links to the live site. Generated from the curriculum source by `scripts/gen-module-docs.mjs`; regenerate rather than edit by hand.

Deviations from the plan below, made while building:

- **Playground has three tabs**: a neural network lab (added 2026-11-24, see above), plus a vector lab (add, scale) and a matrix lab, because adding and scaling vectors visually was asked for explicitly and lesson 1 is not built yet.
- **Click-drag scrubbing on matrix cells is not built.** Typing, stepper arrows, arrow keys and dragging the basis vectors cover the input needs.
- **Not yet built:** Zustand/progress saving and shareable playground URLs.
- **Deploy config is already in place** (relative base path, hash routing, GitHub Pages workflow), ahead of phase 5.

## 1. What we are building

An interactive web app that teaches **linear algebra for AI** to **engineers who can code but lack math intuition**. Every concept is taught through a visual the learner can manipulate (drag a vector, edit a matrix cell, move a slider) and see the result live, followed by a small ML demo showing where that concept appears in real AI systems.

The goal is that learners can **predict** what an operation will do, not just watch it happen.

### Decisions made (requirements interview, 2026-11-20)

| Topic | Decision |
|---|---|
| Scope | Two parts. **Foundations** (added 2026-11-20): coordinate plane, 3D space, variables, functions, lines, exponents. **Linear algebra for AI**: vectors through SVD. No calculus or probability. |
| Audience | Coders weak on math. Programming literacy assumed; math intuition not. NumPy is helpful, not required: every snippet is explained and the math is always visible without it. |
| Format | Ordered guided lessons, each with embedded interactives, plus a free playground. |
| Platform | Static web app, no backend. |
| Dimensions | 2D throughout, with one exception: the Foundations lesson on 3D space shows a rotatable cube, drawn in SVG with our own projection (no 3D library). Full 3D scenes for linear algebra remain a later expansion. |
| ML tie-ins | One live ML demo per concept. |
| Code | Read-only NumPy snippets that update as the learner changes values. |
| Extras in v1 | Quizzes/challenges, progress saved in the browser. |
| Out of v1 | Arabic/RTL, AI tutor chat, accounts, runnable Python in the browser, 3D, gamification. |

### Non-goals

- Not a university linear algebra textbook, and no formal proofs.
- Not a NumPy course.
- Not a neural-network training environment (one exception since 2026-11-24: the small network lab in the Playground).
- Not a general-purpose graphing calculator.

### Lesson format (same six steps in every lesson)

| Step | What the learner does |
|---|---|
| 1. See | Reads a short framing of the concept with a static picture. |
| 2. Manipulate | Drags and edits the live visual. |
| 3. Predict | Picks an answer to "what will happen if…", confirms it, and only then sees the result animate. Wrong answers get an explanation of the specific misconception, not just a red cross. The learner can retry or continue. |
| 4. Understand | Sees the equation and reasoning behind what they observed, with the matching NumPy next to the notation. |
| 5. Apply | Works through the ML demo, which shows the real equation and code, not just an animation. |
| 6. Practice | Completes challenges checked against live state. |

## 2. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Build | Vite + React + TypeScript | Fast dev loop, static output, hostable anywhere. |
| 2D visuals | [Mafs](https://mafs.dev) (SVG, React) | Ships draggable points, vectors, coordinate grids and transforms; saves writing a plot engine. Used for rendering only; all results come from `linalg`. |
| Math notation | KaTeX | Fast, no server rendering needed. |
| Math engine | Own small typed `linalg` module, `ml-matrix` for eigen/SVD | Basic operations are simple and worth unit-testing ourselves; decompositions are not worth re-implementing. `ml-matrix` also cross-checks our own functions in tests. |
| Routing | React Router, hash routing | Hash routes work on GitHub Pages with no server fallback. |
| State | Zustand with `localStorage` persistence | Progress store is separate from playground state. Stored data carries a schema version. |
| Lesson authoring | Plain React (TSX) for the first lessons; MDX decided after two or three lessons exist | The right content format is only clear once the lesson pattern has repeated. |
| Styling | Tailwind CSS | Quick, consistent, light/dark themes. |
| Tests | Vitest + React Testing Library, plus a few Playwright tests | Math module gets full coverage. Dragging is the core interaction and can only be tested in a real browser. |

## 3. Architecture rules

1. **`linalg` imports nothing from React, Mafs or Zustand.** It is plain functions on numbers and arrays.
2. **Visual components do not know which lesson they are in.** The same `<DraggableVector>` serves the vectors lesson, the dot product lesson and the playground.
3. **Lessons contain no math implementation.** They configure components and call `linalg`.
4. **One place for numerical tolerance.** `linalg` exports the epsilon and helpers such as `isZero` and `isSingular`; nothing else compares floats with `=== 0`. The interface is honest about it: a determinant of 0.00000002 is shown as "≈ 0, treated as singular", which also explains why the inverse is unavailable.
5. **One set of conventions, documented and tested.** Vectors are column vectors and transforms are written `y = Ax`. The columns of a matrix are where the basis vectors land. The y-axis points up; conversion to screen pixels happens only inside the rendering layer.
6. **One set of shared types.** `Vec` is `number[]` (`Vec2` is `[x, y]`, which is also what Mafs uses) and `Matrix` is `number[][]` in row order, so the same types serve 2×2 and non-square matrices. No component invents its own representation.

## 4. Core building blocks

- **`linalg/`** — vector ops, matrix multiply, transpose, determinant, inverse, rank, projection, eigen, SVD. Eigen returns an explicit "complex, no real eigenvectors" result for rotations instead of `NaN`.
- **`<Plane>`** — the 2D coordinate grid. Can draw a second, transformed grid on top so the learner sees space warp.
- **`<DraggablePoint>`** — a point with live coordinate readout; used throughout Foundations.
- **`<FunctionPlot>`** — plots `f(x)` from parameters bound to sliders (lines, `x²`, `√x`).
- **`<Cube3D>`** — rotatable 3D axes and cube in SVG, using a projection from `linalg`. Used only in F2.
- **`<BalanceScale>`** — the equation-solving visual for F3.
- **`<DraggableVector>`** — a vector with a draggable tip; optional snap-to-grid; arrow-key nudging.
- **`<MatrixInput>`** — editable grid of cells. Primary input is typing, stepper buttons and arrow keys, with a clear focus state and validation; click-drag scrubbing is an extra convenience on desktop. Columns are matched to basis vectors by colour **and** label.
- **`<TransformAnimator>`** — animates from identity to a matrix so the transformation is seen as motion, not a jump.
- **`<NumpySnippet>`** — read-only code bound to current state, with its output shown beneath and a copy button.
- **`<Predict>`** — multiple-choice question with select, confirm, reveal, explain, then retry or continue; each wrong option carries its own misconception explanation.
- **`<Challenge>`** — a goal checked against live state (for example "drag **v** so the dot product with **u** is 0").
- **`<LessonLayout>`** — lays out the six steps.

Visual density rule: each lesson step shows one primary object (what is being studied) and at most one supporting object for comparison. Everything else (extra grids, labels, determinant, code output) is a toggle or appears as the lesson progresses.

Accessibility baseline for all of the above: nothing is distinguished by colour alone, every visual has a live text readout of its values, and matrix cells and vectors are keyboard-operable.

## 5. Curriculum

> **Superseded on 2026-11-21:** the course is now organised in five modules (see section 0 and `src/app/curriculum.ts`, the source of truth). The tables below are the original plan, kept for history; slugs are unchanged, ids are now 1.1 … 5.4.

### Part A — Foundations (prerequisites)

Each lesson opens with a "Already know this? Skip" link, so experienced learners go straight to Part B. Lessons are short and follow the same six steps, with a lighter ML tie-in.

| # | Lesson | Main interactive | Why it matters for AI |
|---|---|---|---|
| F1 | The coordinate plane | Drag a point and read its `(x, y)`; quadrants; negative coordinates. Challenge: place the point at `(-3, 2)` | A data example with two features is a point on this plane |
| F2 | 3D space: the cube | A rotatable cube with a draggable point `(x, y, z)` and its shadows on the three walls | Three features need three axes. Real data has hundreds; we cannot draw that, but the same rules apply |
| F3 | Variables and equations | A balance scale for `x + 5 = 12` and `3x = 15`: do the same thing to both sides until `x` stands alone | A model's weights are unknowns; training is solving for them |
| F4 | Functions | An input → output machine for `f(x) = 2x + 1`; each input fed in drops a point on the plane | A model is a function: data in, prediction out |
| F5 | Lines: slope and intercept | Sliders for `m` and `b` in `y = mx + b`; rise-over-run triangle. Challenge: fit the line through given points by hand | A single neuron is `w·x + b`: slope is the weight, intercept is the bias. The most important line in ML |
| F6 | Exponents and roots | `x²` as the area of a square with side `x`, `√x` as the side of a square with area `x`; `x` and `x²` plotted together to show how fast squaring grows | Squared error punishes big mistakes much more than small ones; square roots give distances between points |

F5 is deliberately the direct ancestor of lesson 4: `y = mx + b` becomes `y = Wx + b`.

### Part B — Linear algebra for AI

| # | Lesson | Main interactive | ML demo |
|---|---|---|---|
| 1 | Scalars and vectors | Drag vectors; add, subtract and scale them. A vector as a position and as a displacement | Words as points in embedding space |
| 2 | Linear combinations, span, basis | Sliders on `a·u + b·v`; watch which points are reachable. Challenge: make the span collapse to a line, then restore it | A feature vector as a mix of basis features |
| 3 | Dot product, length, cosine | Drag two vectors; live projection shadow and angle | Embedding similarity search on a small editable set of vectors |
| 4 | Matrices as transformations | Drag the two basis vectors; the grid warps, matrix cells update. Identity and zero matrix as presets | A layer's weight matrix `Wx` moving data points; then bias `+ b` introduced as a shift that makes it affine, not linear |
| 5 | Matrix multiplication | Apply two transforms in sequence; swap the order. Row-by-column cell highlighting | Stacking layers; why linear layers collapse without an activation |
| 6 | Shapes, transpose, non-square matrices | Shape checker for `A @ B`; a 2×1 and a 1×2 matrix changing dimension | A batch of embeddings through a projection layer (768 → 256 explained, shown as a small analogy) |
| 7 | Determinant | Unit square under the matrix: absolute value is the area scaling, sign is orientation flip, zero is collapse to a line | Collapsed dimensions as information loss |
| 8 | Inverse, rank, null space, linear systems | Undo a transform; watch it fail when the determinant hits 0. Two lines intersecting as `Ax = b` | What "low rank" means geometrically, framed as the intuition behind methods such as LoRA, not as a LoRA tutorial |
| 9 | Projection and least squares | Drag data points; best-fit line and residuals update | Linear regression |
| 10 | Eigenvectors and eigenvalues | Sweep a vector around; highlight directions that keep their line. Rotation shown as the no-real-eigenvector case | PCA done properly: centre the cloud, build the covariance matrix, then its eigenvectors are the principal directions and eigenvalues the variance. Stated plainly: eigenvectors belong to a matrix; PCA applies them to one particular matrix, the covariance of centred data |
| 11 | SVD | Any matrix played as three steps in order: `Vᵀ` rotate, `Σ` stretch, `U` rotate | Image compression by keeping top-k singular values |
| 12 | Capstone: attention | Queries, keys and values as draggable vectors | A tiny attention head step by step: `QKᵀ`, scale by `√d`, softmax (briefly explained as "turn scores into weights that sum to 1"), weighted sum of `V` |

Wherever a 2D picture stands in for a high-dimensional reality, the lesson says so explicitly.

**Playground** (`/playground`): one sandbox, not separate labs. Editable matrix, draggable vectors, presets (identity, scale x, scale y, rotate 90°, reflect, shear, singular, project onto a line), a reorderable stack of transforms to show that order matters, live determinant/eigenvectors/rank readout, and a shareable URL with a versioned schema.

## 6. Phases

| Phase | Deliverable | Done when |
|---|---|---|
| 0 — Scaffold | Vite/React/TS project, Tailwind, hash routing, lint, Vitest, Playwright, empty lesson shell | App runs; test command passes |
| 1 — Vertical slice | `linalg` basics with tests, and **one complete lesson: Matrices as transformations** (lesson 4, scripted in section 6a) with all six steps, NumPy sync, ML demo, prediction, challenges. A minimal playground: the same transform widget, free-form, with presets. Works with touch and at tablet width | You can go through the lesson start to finish |
| Gate — Does it teach? | You try the lesson on a few engineers (3–5 is enough). Each gets a handful of "what does this matrix do?" questions before and after: scale, rotate, reflect, shear, singular | Most of them predict noticeably better afterwards and finish without help. If not, the format is reworked before any more lessons are written |
| 2 — Foundations | Format adjusted from gate feedback; lessons F1–F6; local progress; lesson navigation with skip links | A beginner can go from the coordinate plane to `y = mx + b` |
| 2b — MVP | Lessons 1–3; full playground | Foundations, lessons 1–4 and the playground work on shared components |
| 3 — Core course | Lessons 5–9 | Each lesson has a prediction and at least 2 challenges |
| 4 — Advanced | Lessons 10–12, PCA, image-compression and attention demos | Full curriculum playable end to end |
| 5 — Release | Deploy to GitHub Pages, phone layout pass, accessibility check, performance check | Publicly hosted |
| Later | 3D scenes (cross product, 3×3 transforms), Arabic, AI tutor, runnable Python | Not scheduled |

Lesson 4 is the slice because it is the flagship interaction and exercises nearly every building block. If the format works there, it works everywhere.

### 6a. Script for the slice lesson (Matrices as transformations)

1. **See.** A single vector `v = [2, 1]` the learner can drag, with coordinates and length shown as text.
2. **Manipulate.** Start from the identity matrix and explain that its columns say where the two basis vectors go. The learner drags the basis vectors: matrix cells update, the grid warps, and `v` is shown before and after.
3. **Predict.** "The first column changes from `[1, 0]` to `[2, 0]`. What happens?" Options: x-direction doubles / y-direction doubles / the plane rotates / the transform becomes impossible. Each wrong option has its own explanation.
4. **Understand.** `Av = [ax + by, cx + dy]` with the row-by-column pairs highlighted, next to the live NumPy `A @ v`.
5. **Apply.** Four data points through a layer: first `y = Wx` (space is transformed), then `y = Wx + b` (result is shifted, origin no longer stays put, so it is affine rather than linear).
6. **Practice.** Challenges on new matrices: build a reflection, build a shear, make the grid collapse onto a line.

### 6b. Checklist every lesson must pass

- Notation matches the conventions in section 3.
- Visual, equation and code all show the same numbers.
- Every numerical claim is backed by a `linalg` test.
- The limits of the 2D picture are stated.
- At least one prediction and one addressed misconception.
- At least two challenges that use an example not shown in the lesson.
- Every core activity can be done by keyboard.

## 7. Project layout

```
src/
  linalg/          pure math, fully unit-tested
  components/      Plane, DraggableVector, MatrixInput, NumpySnippet, Predict, Challenge, ...
  lessons/         one folder per lesson: content, visuals, ML demo, challenges
  playground/
  store/           progress store, playground store
  app/             routes, layout, navigation
tests/
  linalg/  components/  lessons/  e2e/
docs/
  PLAN.md
```

Sub-folders are added when a folder gets crowded, not up front.

## 8. Open decisions and risks

| Question | Default |
|---|---|
| Hosting | GitHub Pages |
| Licence / open source | Undecided — needed before public release, not before |

- **Lesson content is the real cost.** Eighteen well-explained lessons (6 foundations, 12 linear algebra) are most of the effort; the Foundations track added half again to the original scope. Phase 1 builds exactly one so the format is proven before it is repeated.
- **Wrong math destroys trust.** Every equation and worked example in a lesson is backed by a `linalg` test, and decompositions are cross-checked against `ml-matrix`.
- **2D analogies can mislead.** Real embeddings have hundreds of dimensions; lessons flag each simplification.
- **Mafs limits.** SVG slows down with thousands of points. ML demos use small point sets; canvas is the fallback.
- **Numerical edge cases.** Near-singular matrices and complex eigenvalues are handled explicitly (architecture rule 4).
- **Too many controls.** Each lesson step shows only the controls it needs; the playground is where everything is available.

## 9. External reviews (2026-11-20): what was adopted

### Second review

| Suggestion | Verdict | Reason |
|---|---|---|
| Detailed script for the slice lesson | Adopted | Section 6a. |
| Shared vector and matrix types | Adopted, different shape | Arrays rather than `{a, b, c, d}`, so non-square matrices (lesson 6) use the same types. |
| Explicit coordinate conventions | Adopted | Architecture rule 5. |
| Show "≈ 0, treated as singular" | Adopted | Explains disabled actions instead of hiding the reason. |
| Scrubbing as optional, not primary, input | Adopted | Better on touch and for keyboard users. |
| Confirm-then-reveal prediction flow | Adopted | Keeps the prediction meaningful. |
| Low visual density, progressive reveal | Adopted | Density rule in section 4. |
| Determinant, LoRA, PCA, span wording | Adopted | Curriculum table updated. |
| Postpone MDX; hardcode the first lessons | Adopted | Content format decided after the pattern repeats. |
| First product is one lesson plus a small playground | Adopted | The playground is nearly free once the slice widget exists. |
| Test learning before expanding | Adopted, simplified | New gate after phase 1. Informal before/after questions with 3–5 people; percentage targets on a sample that small would be false precision. |
| Non-goals and lesson checklist | Adopted | Sections 1 and 6b. |
| Interview 5–8 learners with sketches before coding | Rejected | The slice is small, and a working prototype gets better feedback than sketches. The gate covers the same risk. |
| Separate phases for math engine and flagship interaction | Rejected | Both are steps inside phase 1; splitting them adds no checkpoint worth having. |

### First review (ChatGPT)

| Suggestion | Verdict | Reason |
|---|---|---|
| Predict-before-you-see step in every lesson | Adopted | Cheap to build, and it is the difference between watching and learning. |
| Misconception-specific feedback | Adopted | It is only text per wrong option. |
| Build one complete lesson before generalising | Adopted | New phase 1. Slice is lesson 4 rather than Vectors, because it stresses more of the engine. |
| `Wx + b` is affine, not linear | Adopted | Correct; lesson 4 now teaches `Wx` first, then bias. |
| PCA needs centring and a covariance matrix | Adopted | Correct; lesson 10 demo spelled out. |
| SVD step order, rectangular matrices | Adopted | New lesson 6 covers shapes and non-square matrices. |
| Attention needs softmax explained | Adopted | One short explanation in the capstone. |
| Math independent of React; central tolerance | Adopted | Architecture rules 1 and 4. |
| Transpose, shape, identity, zero, linear systems | Adopted, folded in | One new lesson (6) plus additions to lessons 4 and 8, instead of several new lessons. |
| Hash routing, versioned storage and URL schema | Adopted | Avoids known GitHub Pages and migration problems. |
| Touch and basic accessibility from the start | Adopted | Interaction problems found late are expensive. |
| 3D not required for release | Adopted | Moved to "Later". |
| Reorderable transform stack, presets | Adopted | Directly teaches non-commutativity. |
| Split vectors into two lessons | Rejected | Too slow for coders; scalars are one paragraph. |
| "Concept model" layer between lessons and visuals | Rejected | Abstraction with no second use yet; the architecture rules give the same protection. Revisit if duplication appears. |
| Seven separate playground labs | Rejected | Scope creep; one sandbox with presets covers it. |
| Mastery states and prediction-accuracy analytics | Rejected | With no backend, nobody can see aggregate data. Progress stays as lessons completed and challenges passed. |
| Separate "math mode" and "AI mode" | Rejected | Every lesson already contains both. |
| PRD, curriculum, visualization-spec and architecture documents before coding | Rejected | This plan plus the vertical slice serves that purpose. |
| Deep directory tree | Rejected for now | Folders are split when they get crowded. |
