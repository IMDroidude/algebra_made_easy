# Desmos "Coordinate Plane" graph (q8mwzeylbk): what it does, and what to take from it

Source: https://www.desmos.com/calculator/q8mwzeylbk (title "Coordinate Plane").
Studied 2026-11-21 with Playwright (Chromium, 1440×900 and 390×844), compared with our lesson at
`src/lessons/coordinate-plane/` (http://localhost:5173/#/lessons/coordinate-plane).

**Did it load?** Yes (HTTP 200). `window.Calc.getState()` worked and returned the full state, so the
expression list below is exact, not read off screenshots. Dragging, `Calc.setExpression` and the
slider play button all worked under automation.

Screenshots are in the scratchpad folder
(the researcher's local scratchpad, not committed)
(the raw state is `state.json` in the same folder).

## Summary in one paragraph

The graph is much smaller than its title suggests. It contains **one draggable red point (a, b)** and
**one live text label above it naming the quadrant it is in** ("Quadrant 1" … "Quadrant 4"). The
label is built from four conditional points, only one of which is ever defined; on an axis or at the
origin none is defined, so the label disappears. That is the whole teaching device. There are **no**
dashed projections to the axes, **no** coordinate label like "(3, 2)", **no** shaded quadrants, **no**
quadrant labels fixed on the plane, **no** notes/text items, **no** tables and **no** actions. Our
lesson already does more than this graph in every respect except one: the quadrant name travels with
the point, right where the learner is looking.

## Exact expression list (from `Calc.getState()`)

Viewport: `xmin -10, xmax 10, ymin -8.6089, ymax 8.6089` (x is fixed at ±10; y is derived from the
aspect ratio of the graph area). No custom graph settings (default grid, default axis numbering).

| # | id | Folder | LaTeX | Visible? | Colour | Label | What it draws |
|---|----|--------|-------|----------|--------|-------|---------------|
| 1 | 5 | (folder) "Movable Points", collapsed | – | – | – | – | Folder |
| 2 | 1 | Movable Points | `(a,b)` | shown | `#c74440` (Desmos red) | none ("Label" box unchecked) | The draggable point |
| 3 | 4 | Movable Points | `a=2.39` | hidden | `#fa7e19` | – | Slider for x, default range −10…10, no step |
| 4 | 3 | Movable Points | `b=2.59` | hidden | `#388c46` | – | Slider for y, default range −10…10, no step |
| 5 | 8 | (folder) "Messages", collapsed | – | – | – | – | Folder |
| 6 | 9 | Messages | `M_1=(a, b+0.5{a>0}{b>0})` | point hidden, label shown | `#c74440` | "Quadrant 1" | Label 0.5 units above P, only when x>0, y>0 |
| 7 | 10 | Messages | `M_2=(a, b+0.5{a<0}{b>0})` | point hidden, label shown | `#c74440` | "Quadrant 2" | Only when x<0, y>0 |
| 8 | 11 | Messages | `M_3=(a, b+0.5{a<0}{b<0})` | point hidden, label shown | `#c74440` | "Quadrant 3" | Only when x<0, y<0 |
| 9 | 12 | Messages | `M_4=(a, b+0.5{a>0}{b<0})` | point hidden, label shown | `#c74440` | "Quadrant 4" | Only when x>0, y<0 |

How the trick works: in Desmos `{a>0}` is 1 when true and *undefined* when false. Multiplying the
0.5 offset by two such conditions makes the whole point undefined unless P is in that quadrant, so
exactly one label is drawn (strict inequalities: none on the axes or origin). The hidden point keeps
`showLabel: true`, so only the text shows, in the same red as P, 0.5 units above it.

## What I observed when interacting

| Action | Result | Screenshot |
|---|---|---|
| Initial load, 1440×900 | Expression panel 448 px wide on the left (folders collapsed); graph fills the remaining 992×854 px. P at (2.39, 2.59) with "Quadrant 1" above it. About 49.6 px per unit. Axis numbers every 2; major grid every 2 units, minor grid every 0.4 | `desmos-1440-initial.png` |
| Expanded both folders | Shows `(a,b)` = (2.39, 2.59), sliders a and b (−10…10), the four `M` rows; three of them read "undefined" | `desmos-1440-folders-open.png`, `desmos-1440-drag-q2-during.png` |
| Drag P to quadrant II | a=−3.3, b=4.2; label switches to "Quadrant 2" live while dragging | `desmos-1440-drag-q2-during.png`, `desmos-1440-drag-q2.png` |
| Drag to quadrant III / IV | (−5.18, −2.84) "Quadrant 3"; (6.03, −3.02) "Quadrant 4" | `desmos-1440-drag-q3.png`, `desmos-1440-drag-q4.png` |
| Drag onto the x-axis | Landed at (4.01, 0.02); still says "Quadrant 1" because 0.02 > 0, even though P visibly sits on the axis | `desmos-1440-drag-xaxis.png` |
| Drag to y-axis / origin | (0.01, 5) and (0.03, 0): hard to land exactly on 0 by hand | `desmos-1440-drag-yaxis.png`, `desmos-1440-drag-origin.png` |
| Set exactly (4, 0), (0, 3), (0, 0) | No label at all: P is shown with no message | `desmos-1440-set-on-xaxis.png`, `-set-on-yaxis.png`, `-set-origin.png` |
| Set (12, 3) | P leaves the viewport; nothing keeps it on screen | `desmos-1440-set-offscreen.png` |
| Click / hover P | No coordinate tooltip (the point's label is off); only the drag halo | `desmos-1440-click-point.png`, `desmos-1440-hover-point.png` |
| Play slider a | P sweeps left and right at constant height, label flips between Quadrant 1 and 2 as it crosses the y-axis | `desmos-1440-play-a-1.png`, `desmos-1440-play-a-2.png` |
| 390×844 | Graph on top (~390×335 px), expression list below; viewport still x ±10, y ±8.59; numbers every 5 | `desmos-390-initial.png` |

Snapping: none to integers. Dragging rounds to about 0.01 (pixel precision), with a weak pull onto
gridlines (a 1.98 target became 2; a −0.02 target became 0). Typical results are values like
(2.39, 2.59) or (−5.18, −2.84).

## Our lesson for comparison

- Plane: 542×380 px at 1440 (≈36 px/unit), x ≈ −7…7, y −5…5, numbers every 1, no minor grid. 356×380 at 390 wide. Screenshots `ours-1440-top.png`, `ours-1440-full.png`, `ours-390-step1.png`.
- Step 1 static P (3, 2) with dashed projections, axis names, "origin" label, hover coordinates.
- Step 2 draggable P (snap 0.5, arrow keys), quadrant shading and fixed "I (+, +)" labels behind a toggle, live text readout with walk directions and region.
- Step 3 predict (flip x sign), Step 4 order x-then-y with walk arrows and swapped ghost point plus NumPy, then Apply and Practice.

## Feature table

| Feature (Desmos) | How it works there | Adopt? | Why |
|---|---|---|---|
| Single draggable point | `(a,b)` from two sliders; free drag | **Yes (have it)** | Same as our Step 2 |
| Live quadrant label riding on the point | 4 conditional hidden points with labels, 0.5 units above P, colour of P | **Yes** | The one idea we lack: feedback appears where the eye already is, not in a readout under the plane |
| Label disappears on the axes/origin | Strict inequalities make every `M_k` undefined | **Adapt** | Silence is ambiguous for a learner. Show "on the x-axis", "on the y-axis", "origin" instead |
| Quadrant naming "Quadrant 1…4" (Arabic) | Label text | **Partly** | Keep Roman I–IV (our text and the quadrant overlay use them), but spell out the word: "Quadrant II" |
| x and y sliders linked to the point | `a`, `b` sliders, −10…10, play button | **Yes, as an option** | Gives a second, keyboard/touch-friendly way to move P and connects "change one number" with "move one direction" (playing `a` shows a pure horizontal move, exactly our Step 3 idea) |
| Free drag to 0.01 | No slider step | **No** | Makes exact axis/origin placement nearly impossible and produced a wrong "Quadrant 1" while P sat on the x-axis. Keep our snap (0.5, or 1 in Step 2) |
| Non-integer start (2.39, 2.59) | Slider default | **No** | Integer start (3, 2) is easier to read off the grid |
| Viewport x ±10, y from aspect | Desmos default | **No** | At our plane size ±10 gives ~18 px cells; ±5–7 with every integer numbered is better for beginners |
| Big graph that dominates the page (992×854) | Full-app layout | **Partly** | Our 380 px plane is small next to it; make the manipulate step's plane taller, but not a full-screen app |
| Minor gridlines, numbers every 2 | Desmos defaults | **No** | Integer gridlines with every integer labelled suits counting steps |
| Point colour #c74440 with halo | Desmos default point style | **No** | Our palette (COLOR.v) already encodes "P"; Mafs MovablePoint has its own halo |
| Folders "Movable Points" / "Messages" | Organises the authoring, not the learner | **No** | Authoring structure, no teaching content |
| No dashed projections, no "(x, y)" label, no notes | Absent | **No (keep ours)** | Our projections, hover coordinates and readout are what teach reading coordinates; removing them would be a regression |

## Teaching sequence implied by the expression list

There is none beyond "move the point and read which quadrant it is in". No notes, no ordered steps,
no prompts. The two folders are authoring groups (inputs vs. messages). The pedagogy is pure
exploration with one immediate piece of feedback. Our See → Manipulate → Predict → Understand →
Apply → Practice sequence should stay; the Desmos idea belongs inside Step 2 (Manipulate).

## What would not translate well

- **Undefined-point trick**: Desmos-specific. In React it is just `regionOf(p)` → a `<Text>` at `[x, y + 0.5]` (we already have `regionOf` in `plane.ts`).
- **Free drag precision**: produces values like 2.39 that beginners cannot read off the grid, and makes "on the axis" unreachable by dragging.
- **Silent axes**: the label vanishing on an axis teaches nothing; our readout already handles this better.
- **Expression panel as UI**: the learner-facing value of seeing `M_1=(a,b+0.5{a>0}{b>0})` is low for this audience; we should not show formulae for the label.
- **Pan/zoom and off-screen points**: Desmos lets P leave the view; our fixed, non-panning plane is better for a lesson.
- **Label near the top edge**: in Desmos the label can be clipped when P is near the top; we need to flip it below P when y is near the top of the view.

## Recommendations for our lesson (ranked)

1. **Add a live quadrant label that rides on P in Step 2, always on (not behind the toggle).**
   New component in `Guides.tsx`, e.g. `QuadrantTag({ p })`: `<Text x={x} y={y + 0.6}>` (use
   `y - 0.6` when `y > extent - 1`), text `Quadrant ${regionOf(p)}` in `COLOR.v` at size ~15,
   rendered in Step 2's `<Plane>` after `<DraggablePoint>`. This is the core of the Desmos graph.
2. **Do not go silent on the axes.** For `regionOf(p)` of `'x-axis'`, `'y-axis'`, `'origin'`, render
   "on the x-axis", "on the y-axis", "origin" in `COLOR.ghost`, at the same offset. (Desmos shows
   nothing there; that is its weakest spot.)
3. **Make Step 2 snap to whole numbers** (`snap={snapTo(1)}` on Step 2's `DraggablePoint`) so learners
   can actually land on an axis or the origin, which the Step 2 checklist asks them to do. Desmos's
   free drag showed "Quadrant 1" while P visibly sat on the x-axis at y = 0.02.
4. **Add two linked x / y controls under the Step 2 plane** (range input or −/+ steppers, −5…5,
   step 1), bound to the same `p` state. Mirrors Desmos's `a` / `b` sliders, gives a non-drag path for
   touch and keyboard users, and shows that changing one number moves P in one direction only.
5. **Make the manipulate plane bigger.** Desmos's graph is ~50 px/unit and is the page's main object;
   ours is ~36 px/unit at 380 px tall. Pass `height={460}` (or 480) to Step 2's `<Plane>` at desktop
   widths, keep 380 under ~640 px wide. Keep `extent = 5`.
6. **Keep the quadrant shading toggle, but rename and demote it**: the moving label now carries the
   quadrant name, so the toggle becomes "Show the signs in each quadrant" (the `(+, −)` labels and
   shading), which is still useful and which Desmos lacks.
7. **Keep what Desmos lacks and do not "simplify to match" it**: dashed projections (`Guides`), the
   hover coordinate tooltip, the walk-direction readout, and integer start (3, 2). These teach
   *reading* a point's numbers; the Desmos graph only teaches naming quadrants.
8. **Optional "play x" demo in Step 3 or 4**: animate x from 3 to −3 with y fixed (we have `useTween`),
   with the moving quadrant label flipping from I to II as P crosses the y-axis, the same thing that
   playing slider `a` shows in Desmos.

Not adopted: ±10 viewport, minor gridlines, Desmos red, 0.01 drag precision, non-integer start,
expression-panel UI.
