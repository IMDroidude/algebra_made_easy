# PAIR "Measuring Diversity" explorable: patterns worth borrowing

Source: https://pair.withgoogle.com/explorables/measuring-diversity/

Studied 2026-11-24 with Playwright (the project's own install, full Chromium, 1280 px and 390 px) and by reading the page's un-minified JS and CSS.
Purpose: design reference for a planned "cat / tiger / car" similarity interactive in lesson 3.3 ([src/lessons/dot-product/](../../src/lessons/dot-product/)): how to mix prose with small figures, use concrete items, and turn a set of items into a score the reader can move.

Not verified: hover-to-select on the ranking rows (seen in the source only; the hover test did not visibly change the selection) and touch behaviour.

## Narrative structure

1. Motivation in real terms: biased "CEO pictures" search results.
2. An explicit abstraction step: "The mathematics of all this is a little easier to follow with abstract shapes", then a static grid of 21 shapes.
3. One metric: pick a subset that is about 30% green.
4. Same grid, different metric: 35% dots.
5. Three metrics at once, combined two ways (mean difference, max difference). Takeaway: the two disagree.
6. Scale up: 20 sets ranked by both measures.
7. The same figure again, preset to an extreme (green target 100%) to show the disagreement.
8. Back to reality: doctor photos reuse the same target/actual gauge.

Each figure adds exactly one idea. The items and the gauge widget stay the same from start to finish.

## The figures

| Figure | What the reader does | What updates |
|---|---|---|
| All shapes | Nothing (static). 7×3 grid of 110 px tiles; each shape varies in colour, size and dot / no dot. | — |
| Pick green / pick dots | Click a tile to add or remove it from the subset. Selected tiles: full opacity, magenta outline. Others: 30% opacity. | A mini gauge above the grid (120 px line, black tick up = target, magenta tick down = actual) and the text "Green Target: 30% / Actual: 13% / Difference: 18%", instantly. "Show Best" snaps to an optimal subset. |
| Pick metric | Same grid, three gauges side by side. | Two score blocks: a bold headline "Mean Difference: 22.50%" with the formula and live numbers under it, "mean(18%, 28%, 22%)"; the same for max. Each block has its own "Show Best", and the two land on different subsets. |
| Ranking | Drag three target sliders. | Two columns show the same 20 sets sorted by mean and by max, scores beside each row, thin grey lines joining each set's two positions. Both columns re-sort live. The selected set is outlined in both columns and described in sentences in a side panel. |
| Ranking, preset | The identical component with green = 100%. | Shapes and sliders that do not matter are dimmed to about 30%. |
| Doctors | Nothing (static photos). | The same gauges, reused. |

## How prose and figures are linked

Lightly: no scrollytelling, no sticky figure, no hover-linked words. The pattern is a short paragraph ending in an instruction or question ("how close to **35% dots** can you get?"), then the figure, then a one-line "Notice that…" debrief. Bold in the prose marks the exact target the figure labels. A later paragraph describes a scenario and the next figure is the same widget already set to it.

## Visual design

- **Layout**: prose column 750 px; figures 775–850 px, centred. White background, about 80 px after each figure. **Not responsive**: `min-width: 800px`, horizontal scroll at 390 px.
- **Type**: Roboto 16 px light for prose, Google Sans for headings, 13–16 px labels inside figures, white halo behind SVG text.
- **Colour**: muted data palette (green #5A9F8A, orange #DF831F, blue #80BAD4). One magenta, #bf0bbf, is reserved for "your selection / the actual value" everywhere: outlines, ticks, numbers, histogram bars. Black for targets and controls.
- **Shapes**: flat squares, 1 px outlines, plain bordered buttons, no shadows or gradients.
- **Animation**: effectively none; state snaps.
- **Numbers**: integer percentages always labelled in words; aggregates to two decimals; the formula shown with the current values substituted.

## Tech

D3 v4.12 with d3-jetpack and lodash, seedrandom for repeatable examples, about 900 lines of vanilla JS. HTML divs each wrapping a small inline SVG (95 SVGs, no canvas, no framework).

## Ideas that transfer to cat / tiger / car, ranked

1. **One accent colour for the pair under inspection**: both vectors, their score, their cell in a pair table.
2. **The formula with live numbers under a bold headline score**: "cat · tiger = 0.9×0.8 + 0.8×0.9 + 0.1×0.0 = 1.44".
3. **Hand-readable features**: three or four named features per item (furry, has wheels, size, fierce), like colour / size / dot, so every product term means something.
4. **One small gauge reused everywhere**: a line from −1 to 1 with a tick for the cosine, repeated for cat–tiger, cat–car, tiger–car.
5. **A challenge prompt with a reveal**: "Can you make the car look more like a cat than the tiger does?"
6. **Staged repetition of one component**: one pair, then all three pairs, then a "most similar to cat" ranking that re-sorts; dim what does not matter in each stage.
7. **Plain-sentence readout**: "tiger is 0.93 similar to cat, 0.71 more than car".
8. **Fixed examples**, so the prose can quote exact numbers.

## What does not transfer

- Subset selection and target percentages (the essay's core mechanic).
- The 20-row slope ranking: too much for three items.
- The fixed 800 px layout: it breaks our 390 px rule.
- Instant re-sorting: with three items, animate the re-sort.
- The photo and societal-context section.

Screenshots were saved to a temporary session folder and are not kept in the repository.
