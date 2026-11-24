# Transformer Explainer: patterns worth borrowing

Source: https://poloclub.github.io/transformer-explainer/

Studied 2026-11-24 with a headless Chromium driven from the project's own Playwright install (the shared Playwright MCP browser was locked by another session, so it was not used).
Purpose: design reference for a planned "cat / tiger / car" similarity interactive in lesson 3.3 ([src/lessons/dot-product/](../../src/lessons/dot-product/)): how the page draws embeddings, vectors and dot products (attention = query · key).

Not verified:

- **Typing your own prompt and Generate.** All 63 GPT-2 model chunks (about 600 MB) downloaded, but Generate stayed disabled and the banner kept saying "being downloaded" for the whole session. Everything below was exercised on the five precomputed example prompts.
- The top-k / top-p slider, the "Logits" eye toggle, the block next/prev arrows and the MLP expansion.
- Hover linking in the collapsed overview: the article says hovering a token highlights attention weights, but no linked highlight was visible there. Linking was seen only in the expanded matrix.

## Narrative structure

- One left-to-right pipeline fills the first screen: Embedding → Transformer Block (Multi-head Self Attention → MLP) → "11 more identical blocks" → Probabilities.
- A 20-page "textbook" popup is docked bottom-right with prev/next and a progress bar. Order: what a Transformer is, the next-word question, embedding (tokenise, token embedding, positional), block, Query/Key/Value, heads, dot product → mask → softmax, MLP, logits, temperature, sampling, then residual / layer norm / dropout last. Each page highlights its target on the diagram with a yellow marker and a pointing hand.
- Below the fold: a conventional long article in the same order, with five static figures, one formula and a "web search" analogy for Query / Key / Value.

## How vectors and the dot product are drawn

- **A vector** is a thin vertical rectangle of grey stripes. No numbers; hovering shows only `vector(768)`. Positional vectors use red/blue stripes.
- **Embedding, expanded**: a literal equation per token row: `token → [vector] id 6601 + [vector] position 0 = [vector]`.
- **Dot products**: an n×n grid of circles. Query tokens label the rows in blue; Key tokens feed the columns in red. Purple opacity encodes the value. Each grid has a small gradient legend with its min and max in monospace (`-25.3 … 7.4`).
- **A pipeline of grids**: expanding attention shows three grids joined by arrows: Dot product → Scaling · Mask → Softmax. Masked cells turn grey; softmax runs 0 to 1.
- **Animation**: on expand, the single collapsed matrix slides and splits into three over about 0.5 s while the rest of the page fades to roughly 10% opacity.
- **The dot product itself is never unpacked.** Only the resulting number is shown, never the multiply-matching-entries-and-add. That step is the core of our lesson, and it is the gap this page leaves.

## Interaction patterns

| Pattern | What happens |
|---|---|
| Expand in place | Section titles with a magnifier icon expand that section and dim everything else. Click again to collapse. |
| Cell hover with linked labels | Hovering a grid cell shows the exact value in a monospace tooltip (`-3.48`), and the matching Query row label and Key column label grow and turn bold. The best pattern on the page. |
| Formula on hover | Hovering a step title shows its KaTeX formula (`Q · Kᵀ`). |
| Click for help | Clicking a step title opens the textbook at the matching page. |
| Live substitution panel | In Probabilities, hovering a token opens a panel with the real numbers plugged in: `logit −137.65 ÷ temperature 0.8 → −172.06 → exp(−172.06) / (exp(…) + …) = 6.26%`. |
| One slider drives everything | Moving temperature updates every column, bar and the worked formula. At 0.3 the top token is 90.86%; at 7 the top five are roughly 18–23% each. |
| Examples dropdown | Five precomputed prompts, usable while the model loads. Switching relabels every view. |
| Head pager | "Head 1 of 12" with arrows, drawn as a stack of cards. |

## Visual design

- **Layout**: white background, a full-width ribbon diagram, generous whitespace.
- **Colour is semantic and consistent**: Query blue, Key red, Value green, attention/output purple, neutral vectors grey. The same colours mark those words in the tour and article text.
- **Type**: system sans for labels, monospace for every number. Article body 17 px / 27 px, about 835 px wide.
- **Numbers**: 2 decimals in tooltips, 1 in legends, percentages beside thin bars.
- **Motion**: opacity and background transitions of 0.2–0.5 s; no bounce.

## Tech

Svelte with Tailwind, D3 for SVG (152 `<svg>` and 96 `<canvas>` elements on the page), KaTeX, and ONNX Runtime Web running a nanoGPT-derived GPT-2 small split into 63 chunks.

## Ideas that transfer to cat / tiger / car, ranked

1. **A similarity grid with linked labels**: 3×3, cat / tiger / car on both sides; pointing at a cell bolds the row and column names and shows the exact value.
2. **A live worked formula** with the real numbers, recomputed as the learner changes a component.
3. **One colour per entity, everywhere**: in the vector, the grid labels, the prose and the formula.
4. **Staged grids with arrows**: dot product → divide by lengths → cosine similarity.
5. **Focus by dimming** instead of navigating away.
6. **Monospace numbers** so values do not jitter as they update.
7. **Click a label to jump to its explanation.**
8. **Preset examples** that swap the whole scene (for example adding "kitten" or "truck").

## Confusing, or too much for beginners

- Striped 768-number rectangles carry no readable information. Use two or three named features with visible bars and numbers.
- The ribbons, the 12-head card stack, residual / dropout / layer norm.
- Raw values like `−137.65` or a range of `−25.3 … 7.4` have no intuitive anchor.
- Opacity-only encoding makes middle values hard to tell apart. At 3×3 there is room to print the number in the cell.
- Twenty tour pages is long, and a 600 MB download stands between the reader and "type your own".

Screenshots were saved to a temporary session folder and are not kept in the repository.
