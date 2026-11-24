# pythonalchemist "Dot Product Visualizer": how it works and what is broken

Source: https://www.pythonalchemist.com/blog/dot-product-explained ("Dot Product Explained: The Foundation of Neural Networks").

Studied 2026-11-24 with Playwright (the project's own install, full Chromium, 1280 px and 390 px) and by reading the widget's source. The article and widget sit inside a sandboxed `srcdoc` iframe; the widget is one inline 530-line script.
Purpose: it is the visual reference the owner sent for a planned "cat / tiger / car" similarity interactive in lesson 3.3 ([src/lessons/dot-product/](../../src/lessons/dot-product/)).

Not verified: touch behaviour on a real phone, screen-reader output, and the worked-example tabs after the first.

## Teaching sequence of the article

1. Hero picture and TL;DR, with a "Try the Simulator" jump link.
2. **The "agreement" intuition**: two friends rate pizza toppings from −10 to +10, A = [8, 5, −3], B = [7, 6, −2], dot product 92. "Voting together" versus "cancelling out"; negative × negative counts as agreement.
3. **The two formulas**: algebraic, geometric, projection; cards for 0° / 90° / 180°.
4. **Dot product vs cosine similarity**: length and direction versus direction only.
5. **Where you will see it**: semantic search, Transformer attention, recommendations, CNN kernels.
6. Five worked examples (tabs).
7. **The widget**, about 70% of the way down, after all the theory.
8. Why neural networks use it: a neuron mini-widget and an attention demo.
9. FAQ.

The article talks about similarity search and attention but never uses the word "embedding" and never compares named concept vectors. The widget has no AI framing at all. Named vectors (cat, tiger, car) would be new, not a copy.

## The widget

A 2D grid with two draggable vectors A and B from the origin, three stat cards (A·B, angle θ, cos θ), a coloured interpretation box, a "Projection insight" box, a "Live calculation" strip, presets, and Random / Reset.

### The three "modes" are independent toggles, all on by default

| Toggle | Draws |
|---|---|
| Projection | Green dashed perpendicular from A's tip to its foot on B's line, a green dot and the label "proj". Hidden when the projection is shorter than 0.3. Also shows or hides the "Projection insight" box. |
| Angle | Amber arc of radius 35 px with a rounded degree label. Hidden at ≤ 0.5° or ≥ 179.5°. |
| Components | Two bars at the origin, 3 px per unit: horizontal for Ax·Bx, vertical for Ay·By, red when negative, labelled "x: 8.00", "y: 15.00". |

### Presets

| Preset | A | B |
|---|---|---|
| Same Direction | (4, 3) | (4, 3) |
| Perpendicular | (4, 0) | (0, 4) |
| Opposite | (4, 3) | (−4, −3) |
| Acute Angle | (5, 2) | (3, 5) |
| Obtuse Angle | (5, 1) | (−2, 5) |

Reset gives A (4, 3), B (2, 5). Random draws each component from [−6, 6] in steps of 0.5.

### Challenge mode

1. The button turns amber; the final result is blurred in the Live calculation strip and in the A·B card. The vectors do not change.
2. A hint appears: "Can you guess the result? Click to reveal!"
3. Clicking the blurred strip result reveals it. Clicking the blurred card does nothing.
4. Any drag, preset, Random or Reset blurs it again.

There is no answer input, no check and no score. The answer also leaks: the interpretation box prints "The negative dot product (−26.25)…" unblurred, next to both partial products and the sign label.

### Rules behind every derived value

| Shown | Rule |
|---|---|
| A·B | 2 decimals. > 0 "Positive ✓" (green), < 0 "Negative ✗" (red), exactly 0 "Zero (⊥)" (grey). |
| Angle θ | acos of the clamped cosine, 1 decimal. < 90 "Acute", > 90 "Obtuse", exactly 90 "Right". So 0° reads "Acute" and 180° reads "Obtuse". |
| cos(θ) | 3 decimals, always sub-labelled "Similarity"; 0 if either vector is zero. |
| Interpretation box | Keyed only on the sign of A·B: "Vectors Point Similarly", "Vectors Point Oppositely", "Vectors are Perpendicular". |
| Projection insight | "Length = \|A·B\| / \|B\| (same / opposite direction as B)". |
| Live calculation | Ax×Bx + Ay×By = result, red chips for negative terms. |

### Grid, snapping, phone width

- SVG viewBox 400×400 at 25 px per unit: the grid shows ±8, values clamp to ±7. No tick numbers on the axes.
- Dragging snaps to 0.5; the number inputs have step 0.5.
- At 390 px it becomes one column about 1,750 px tall. The stat cards and interpretation box sit roughly two screens below the grid, so the numbers cannot be watched while dragging. Handles shrink to about 15 px.

### Tech

Host site: Next.js with Sanity. Widget: vanilla JS and inline SVG, no canvas, no framework. It rebuilds the whole widget with `innerHTML` and re-attaches every listener on each mouse move or keystroke.

## Bugs (all reproduced)

- **Number inputs lose focus after every keystroke** (full re-render). Typing "-35" yields 0.0, because "-" alone parses as NaN and becomes 0.
- **Zero vector**: B = (0, 0) gives "Length = NaN". Any zero vector shows "Perpendicular (90°)" while the angle card says "0.0° Acute".
- **Pointer drift**: the pointer mapping ignores the SVG's letterboxing, so the handle sits up to 12.5 px off the cursor on desktop and further on mobile. In touch emulation the handle jumped to (7, −7) and froze after the first move.
- **Text does not match the drawing**: "the green arrow" is a dashed line and a dot. When the projection falls beyond B's tip or behind the origin, the dot floats in empty space.
- **Clipped and overlapping labels**: "A[7.0," is cut off at x = 7. Component labels, "origin", the angle label and the bars pile up at the origin. "proj" overlaps the A and B labels when the vectors are nearly parallel.
- **Fonts**: the page's CSP blocks the Google Fonts stylesheet, so SVG labels fall back to Times.
- Presets never show an active state.

Accessibility: handles are not keyboard-focusable; no `aria-pressed`, `aria-live`, SVG title or label/input association; 9–11 px text; sign carried mostly by red/green.

Confusing wording: "Oppositely" for a 100° angle; 0° called "acute"; "Similarity" under cos θ with no explanation; raw dot product and cosine both presented as similarity with no hint that length inflates one of them.

## What to take for a three-vector (cat / tiger / car) version

**Keep**

1. Draggable arrows from the origin with 0.5 snapping.
2. The live calculation strip with operands colour-matched to their vectors.
3. The stat cards.
4. A one-sentence interpretation that changes with the result.
5. Presets as guided "try this" states.
6. The angle arc.

**Fix**

1. Update state without rebuilding the DOM (already true in our React components).
2. Inset the plot, flip labels at the edges, keep labels from colliding.
3. Guard the zero vector (lesson 3.3 already does).
4. Keyboard nudging and a live text readout (lesson 3.3 already has both).
5. Keep the readout beside or over the plot on a phone.
6. Grade the wording by cosine: nearly identical / similar / unrelated / opposite.
7. Make the challenge real: predict which pair is most similar, then check.

**Drop**

1. Component bars at the origin; the calculation strip does the same job.
2. Projection as a default layer: projecting A onto B is asymmetric, which makes no sense for three symmetric pairs.
3. Free numeric inputs; drag or sliders only.
4. Random.
5. Anonymous coordinate labels on arrow tips.

**Add**

- Axes with meaning (for example "furry / animal" and "mechanical / fast"), so each component is a readable feature.
- A three-pair similarity readout with the selected pair's arc and calculation highlighted.
- Cosine first, raw dot product second, with a "make tiger longer" demo to show why length matters.

Screenshots were saved to a temporary session folder and are not kept in the repository.
