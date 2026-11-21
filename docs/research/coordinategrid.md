# coordinategrid.com: what it does, and what to take from it

Source: https://coordinategrid.com/ ("CoordinateGrid: Tactile Coordinate Plane Playground").
Studied 2026-11-21 with Playwright (Chromium) at 1440×900/1500 and 390×844, compared with our lesson
at `src/lessons/coordinate-plane/`.

**Did it load?** Yes, every page returned HTTP 200. Automation was not blocked. No ad scripts
(no `adsbygoogle` / `googlesyndication` in the page). The grids are drawn on a `<canvas>`, so I
clicked them by first calibrating screen position against the site's own "Cursor: (x, y)" readout.

Screenshots and scripts are in the scratchpad folder
(the researcher's local scratchpad, not committed)
(`practice-1440.png`, `plot-wrong.png`, `name-a.png`, `Curriculum-q.png`, `pg-labels.png`,
`practice-390.png`, …).

## What the site is

A free, single-author school maths tool (US grades 4–12) with five areas:

| Page | What it is |
|---|---|
| **Playground** (`/`) | Canvas grid, x ±10 by default (y from the aspect ratio). Click to plot, scroll to zoom, drag to pan. A cursor readout shows "(x, y)" plus the quadrant ("Quadrant III (−, −)"). Toggles: Snap to Integer, Connect Points, Labels, Equal Scale, 4 Quads / Quad I view, scale presets ±5…±1000. Side panels: **Plotted Points** list ("A(−3, 3)", "B(2, 4)", coloured dots, × to delete each), **Quick Shape Presets** (triangle, rectangle, star, diamond), a **Function Plotter** (y = …). Long guide article below. |
| **Practice** (`/practice-mode`) | Quiz. Header card with the prompt, Streak / Best / Score, a "Show Hint" link. Three difficulty levels (Quad I only; 4 quadrants ±10; decimals and axis points). Six categories: Mixed, **Plot the Point**, **Name the Point**, **Quadrants & Axes**, **Move & Navigate**, **Curriculum Lessons** (12 fixed questions). |
| Graph Paper (`/graph-paper`) | Printable PDF graph paper generator (grid sizes, paper size). Not about coordinates as such. |
| Studio (`/graph-paper/draw`) | Drawing on graph paper: pen, highlighter, line, arrow, shapes, ruler, text; export PNG/print. |
| About, Contact, Privacy, Terms | Info pages. |

## What I observed when interacting (Practice)

| Action | Result |
|---|---|
| Plot the Point "(−3, −9)", I clicked (−9, −3) (swapped) | Red banner: "You clicked (−9, −3). Look at the dotted guide line to (−3, −9)!" plus "The point (−3, −9) is plotted by starting at the origin (0, 0), moving 3 units left (−X), then 9 units down (−Y)." Dotted guide lines appear on the grid. One try only, then "Next Question →". |
| Plot the Point "(8, 6)", clicked correctly | Green: "🎉 Great job! Correct answer (+10 pts)!", same walk explanation, streak 1, score 10. |
| Prompt text under each plot question | "Move along X-axis to 8 horizontally, then along Y-axis to 6 vertically. Click to place your answer!" |
| Name the Point | Orange "?" marker on the grid; four buttons **(8, 1) (1, −8) (−1, 8) (1, 8)**: the answer plus swapped and sign-flipped distractors. Wrong: "Not quite!" + "The highlighted point is at horizontal position x = 1 and vertical position y = 8, giving coordinates (1, 8)." |
| Quadrants & Axes | E.g. "What are the coordinates of the point lying on the origin?" choices (1, 1) (0, 1) (1, 0) (0, 0). |
| Move & Navigate | "You are at (−3, −1). Move 4 left and 4 up. Where do you land?" Choices (1, 3) (−7, 3) (−7, −5) (1, −5): each wrong one has one direction reversed. Wrong: "Moving 4 left: −3 − 4 = −7 on the x-axis. Moving 4 up: −1 + 4 = 3 on the y-axis. Final point: (−7, 3)." Grid click also accepted. |
| Curriculum Lessons | "In which quadrant does point A(−2, 4) lie?" with buttons Quadrant I…IV; the point is drawn labelled "A" with a "(−2, 4)" tag; a hint line "Look at the signs: X is negative (−2), Y is positive (4). Left and Up!" |
| A "Quadrant Cheat Sheet" modal popped up once ("Got it, let's practice!") | Signs per quadrant. |
| 390 px | Usable: prompt card on top, answer buttons wrap, grid below. Toasts ("Difficulty set to Level 1") cover the grid briefly. |

Playground: plotting four points produced the Plotted Points list A–D with colours; **Connect
Points** joined them in click order with a dashed outline and a light fill; **Labels** toggles the
on-grid coordinate tags. The written guide includes a "six common mistakes" list (swapping x and y,
counting from 1, ignoring scale, putting axis points in a quadrant, numbering quadrants clockwise,
sign errors) and a worked example: plot A(−4, −2), B(4, −2), C(4, 4), D(−4, 4), identify the
rectangle, perimeter, area, diagonal.

Note: in Practice the grid does not use equal scale (≈34 px per x unit vs ≈28 px per y unit).

## Feature table

| Feature | How it works there | Adopt? | Why |
|---|---|---|---|
| Plot-the-point question | Prompt "(x, y)", click grid, one try, feedback | **Yes** | Practises the symbol → position direction with immediate feedback; our Practice step only had open tasks |
| Name-the-point question with distractors | "?" marker, four buttons: answer, swapped, sign flips | **Yes** | Position → symbol direction; distractors target exactly the slips our Predict step warns about |
| Move & Navigate | Start point plus "4 left, 4 up" | **Yes, one question** | It is our "walk" idea from a different start; previews vectors. Distractor "counted from the origin" added (their mistake #4) |
| Diagnosed wrong answers | "You clicked (−9, −3)…" plus walk explanation and dotted guides | **Yes, and sharper** | They give the walk but rarely name the slip; ours says "you swapped x and y", "the sign of y is flipped", "x is 0, so it is on the y-axis", "you counted from the origin" |
| Hidden coordinates while plotting | Cursor readout still shows coordinates | **Adapt** | Their live cursor readout gives the answer away; our quiz point A shows no coordinates until checked (screen-reader text still announces A's position) |
| Plotted Points list with letters | A(−3, 3), B(2, 4)… chips | **Yes, behind a toggle** | Links points to a table of rows, the bridge to the Apply step's data table |
| Connect Points into a shape | Dashed outline + fill, click order | **Yes, with the pins** | Cheap, shows that a list of points can describe a shape; their worked rectangle is our suggested example |
| Quadrant name in the cursor readout | "Quadrant III (−, −)" | **Have it** | Our moving "Quadrant II" tag and the signs toggle already do this |
| Streak / best / score points, emoji, confetti, toasts | Gamified | **No** | Lesson must stay calm; a plain "3 of 6 correct" is kept |
| Difficulty levels (Quad I, decimals) | Selector | **No** | Our audience is adults; the lesson already moves from 1D to 4 quadrants; decimals add nothing here |
| Random questions | New prompt each time | **No** | A fixed set is reproducible and testable; restart re-asks the same points so you can check you fixed a slip |
| Zoom, pan, scale presets ±5…±1000, unequal scale | Toolbar | **No** | Fixed ±10 square grid is better for a lesson (Desmos/GeoGebra studies said the same) |
| Function plotter, graph paper PDF, drawing studio | Separate tools | **No** | Out of scope for F1 (functions are F4) |
| "Show Hint" | Reveals a sentence | **No (folded in)** | Our feedback after answering already gives the walk; the open tasks have insights |
| Six-mistakes article, worked example | Long text | **Partly** | The mistakes became quiz diagnoses; the rectangle became the pin suggestion |

## Ranked recommendations (all implemented unless noted)

1. **Quick quiz in Step 6**, as a second mode next to the existing tasks (segmented switch, so one
   plane at a time). Six fixed questions not used elsewhere in the lesson: read (−4, 3), plot (2, −5),
   read (0, −6), plot (−7, −2), move from (−3, −1) by 4 left and 4 up, read (5, −8). One try each,
   then a diagnosis and the walk, the correct point drawn with guides, the learner's wrong point in
   red; "Next question"; final "n of 6 correct" and "Start again". Logic in `quiz.ts`, UI in
   `QuizParts.tsx`, state in `useQuiz.ts`.
2. **Click to plot** on the quiz plane (and drag / arrow keys as alternatives). Added as `onPick` on
   our local `GridPlane`.
3. **Pins in Step 2** behind the toggle "Pin several points: a table and a shape": "Pin A at (x, y)"
   button, letters A–H, a table (point, x, y, where), "Join the pins in order" draws a dashed shape,
   "Clear pins". Suggests the site's rectangle (−4, −2), (4, −2), (4, 4), (−4, 4). Code in
   `pins.ts` / `PinParts.tsx`.
4. Not adopted: scoring/streaks, levels, randomness, zoom/pan/scales, function plotter, printable
   paper (reasons in the table).
