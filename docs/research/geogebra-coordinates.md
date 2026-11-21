# GeoGebra "Coordinate Plane" (VWN3g9rE): what it does, and what to take from it

Source: https://www.geogebra.org/m/VWN3g9rE (title "Coordinate Plane", author Celia Jimenez).
Studied 2026-11-21 with Playwright (Chromium, 1440×900 and 390×844), compared with our lesson at
`src/lessons/coordinate-plane/` (http://localhost:5173/#/lessons/coordinate-plane).

Screenshots and scripts are in
(the researcher's local scratchpad, not committed)
(`gg-*.png` are GeoGebra, `ours-*.png` are our lesson; the applet's saved state is `gg-state.xml`).

**Did it load?** Yes, with a catch. The page first shows a static PNG preview ("Press Enter to start
activity"); the live applet only starts after a click, and start-up took 10–60 s and sometimes needed
several clicks under automation. Once running, the GeoGebra JS API (`ggbApplet…`) answered, so the
numbers below come from the applet's own state, not only from screenshots.

## Summary in one paragraph

This is **not a lesson**. It is an **empty GeoGebra Classic workspace**: the construction contains
**zero objects** (`getObjectNumber() = 0`, empty `<construction>` in the XML). There are no points,
no instructions, no task, no checkboxes, no sliders, no quadrant labels and no text beyond the page
title "Coordinate Plane". What the learner gets is a blank graph with axes and a dashed grid, the full
GeoGebra toolbar (11 tool groups), a graphics style bar, and an "Input…" command bar. Everything
"teaching" would have to come from a teacher standing next to it. The useful lessons for us are in
how GeoGebra's plain graph *behaves* (magnetic snapping, tick spacing, selection halo, keyboard
nudging), plus a clear list of things not to copy.

## What is on screen (1440×900)

| Aspect | Observed |
|---|---|
| Applet size | 1091×936 px block inside the page (canvas 1089×840 px), about 76% of the page width. Toolbar 52 px on top, Input bar at the bottom. Below the first fold at 900 px height: the lower third of the plane and the Input bar need scrolling (`gg-01-full.png`). |
| Axes range | x ≈ −10.6 … 11.2, y ≈ −8.8 … 8.0 at 50 px per unit. The origin is **not centred** (528, 398 in an 1089×840 canvas), so the left/right and up/down halves are slightly unequal. |
| Grid | Major lines only, every 1 unit, **light grey (#C0C0C0), dashed**. No minor grid. Grid type "Cartesian". (`gg-04-live.png`) |
| Axes | Solid black, with a small arrowhead at the positive end of each axis. No axis names ("x", "y" are not shown). |
| Numbering | Every integer, tiny (~9 px) black numbers, below the x-axis and left of the y-axis; "0" printed once near the origin. Minus signs are typographic (−). When zoomed out to 31 px/unit numbering switches to every 2 (`gg-21-home.png`). |
| Quadrants | No labels, no shading, no colours. |
| Colours | White background, black axes, grey grid; new points are blue (#4D4DFF-ish) with a dark outline. |
| Ad slot | A grey fixed-position box (≈975×100 px) with a collapse chevron sits at the bottom of the viewport on every screenshot, covering the lower part of the plane. It is page chrome (an advert slot), not part of the applet, but it hides about a fifth of the grid at 900 px height (`gg-04-live.png`). |

## Every interaction we found

All of these are standard GeoGebra Classic behaviour; the author added nothing on top.

| Interaction | What happens | Evidence |
|---|---|---|
| Point tool (2nd toolbar button), click on the plane | Creates a point A, B, C… at the click. **Magnetic snap**: a click within ~6 px of a grid intersection lands exactly on it ((2, 3), (−3, 1)); a click 10 px off stays off-grid at 2-decimal precision ((4.2, −2.16), (3.14, 1.9)). Default point-capture mode is "Automatic". | `gg-05-point-created.png`, `gg-11-hover-exact.png` |
| Labels on points | **None.** New points have `labelVisible = false`: no name, no coordinates on the plane. With the Algebra view hidden there is **no readout anywhere** of where a point is. | `gg-05`, `gg-11` |
| Hover a point (Move tool) | No tooltip, no guides, no highlight seen in headless Chromium. | `gg-06-hover-A.png`, `gg-11-hover-exact.png` |
| Click a point | Selects it: a translucent blue **halo ring** appears and the style bar switches to colour / point style / label style / lock / settings. | `gg-12-selected.png` |
| Drag a point | Moves freely (not snapped while dragging far from grid points); no dashed projections, no coordinate label, nothing tells you the new coordinates. | `gg-07-mid-drag.png`, `gg-08-after-drag.png` |
| Arrow keys on a selected point | Nudges by **0.1** per press ((2, 3) → (2.2, 3.1) after →, →, ↑). | `gg-13-after-arrows.png` |
| Arrow keys with nothing selected | **Pans the whole view** (origin moved), which is disorienting. | `gg-09-selected-arrows.png` |
| Mouse wheel | Zooms around the pointer; 3 notches in went to 66.5 px/unit (x −7.9…8.4), 8 notches out to 31 px/unit (x −17…18). No limit was hit. | `gg-18-zoom-in.png`, `gg-19-zoom-out.png` |
| Drag on empty space | Pans with no bounds; the origin can be dragged off-screen. | `gg-20-pan.png` |
| Style bar: axes button | Toggles axes on/off. | `gg-17` toolbar |
| Style bar: grid button | Menu: no grid / major grid / major+minor grid / polar grid. | `gg-17-grid-menu.png` |
| Style bar: home button | Menu: "Standard view" / "Show all objects" (clicking the top-level button only opens the menu; it did not reset the view by itself). | `gg-21-home.png` |
| Style bar: magnet button | Point capture: Automatic / Snap to Grid / Fixed to Grid / Off. | `gg-16-magnet-menu.png` |
| Input bar | A command line: typing `C=(5,-3)` creates a point (tested through the API's `evalCommand`, not by typing). | `gg-10-input-point.png` |
| Undo / redo, search, main menu | Present in the top-right; full GeoGebra app menus. | all |
| Tasks, quiz, checking | **None.** |  |
| Instructions / teaching sequence | **None.** The only text is the title "Coordinate Plane" (twice). |  |

## Mobile (390×844)

The applet does **not** reflow: the whole 1091 px applet is scaled with `transform: scale(0.34)` to a
369×284 px block, still showing x −10…11. That is ~17 px per unit, the axis numbers are about 3 px
tall and unreadable, the toolbar disappears from view, and the bottom ad slot covers part of the
next section (`gg-23-mobile-390.png`, `gg-24-mobile-390-full.png`). Our lesson's Mafs plane already
does better here.

## How it compares with our lesson

Our lesson (`ours-02-plane1.png` … `ours-04-plane3.png`) already has nearly everything this applet
lacks: a named point P, dashed guides to both axes, coloured axis names, a live sentence readout,
an optional quadrant overlay with sign patterns, a predict step, a swap demo and auto-checked
practice. Measured against GeoGebra, our gaps are small and specific:

- Our point's coordinates appear only on hover (`CoordTooltip`); GeoGebra shows nothing at all, so this
  is not a gap versus GeoGebra, but the screenshots make clear how much a learner loses when the
  coordinates are not visible on the plane while dragging.
- Our `DraggablePoint` snaps hard to 0.5 everywhere (`snapTo(0.5)` in `src/components/Plane.tsx`);
  GeoGebra's "magnetic" snap (exact integer when close, free otherwise) is a different model.
- GeoGebra nudges by 0.1 per arrow key, which is too fine for this lesson; I did not measure our own
  arrow-key step in the browser (Mafs `MovablePoint` keyboard steps pass through the `constrain` snap).
- Our horizontal dashed guide runs over the y-axis tick number (the "2" in `ours-02-plane1.png`).
- Our plane is ±7 × ±5 at 1440 px and fixed (no pan/zoom); GeoGebra's is ±10 × ±8 and unbounded.

## Feature table

| Feature | How it works in GeoGebra | Adopt? | Why |
|---|---|---|---|
| Empty workspace, no task | Blank plane, learner must invent what to do | No | Our step sequence (See → Manipulate → Predict → Understand → Apply → Practice) is the point of the lesson. |
| Integer grid, 1 line per unit | Dashed grey major lines, no minor | Partly | One line per unit is right for this lesson; dashed grid lines compete with our dashed guide lines, so keep our solid light grid. |
| Every integer numbered | Small numbers on every unit | Yes (we already do) | Counting steps is the core skill; keep every integer labelled at our larger size. |
| Auto tick thinning on zoom | Numbers every 2 at ~31 px/unit | Yes, if we ever allow wider ranges | Avoids crowded numbers on small screens (see recommendation 6). |
| Magnetic snap | Exact lattice point within ~6 px, free otherwise | Yes, adapted | Hitting (−3, 2) exactly is easy, yet the point still feels continuous. For this lesson integer snap is simpler (rec. 2). |
| Snap modes menu | Automatic / snap / fixed / off | No | A settings menu is a distraction for beginners; pick the mode per step in code. |
| Selection halo | Translucent ring around a selected point | Yes (we already have a halo on hover/drag) | Clear "this is the thing you can move" signal; keep it visible when the point has keyboard focus. |
| Arrow-key nudge | 0.1 per press on a selected point | Yes, with step 1 | Keyboard access matters; 0.1 is too fine for integer tasks. |
| Arrow keys pan the view when nothing is selected | View jumps | No | Disorienting; our planes have pan disabled, keep it that way. |
| Wheel zoom / drag pan, unbounded | Origin can leave the screen | No | Learners lose the origin, the one fixed reference; fixed view is better for this lesson. |
| No point labels, no readout | Learner can't see coordinates at all | No (anti-pattern) | Shows exactly why our always-visible readout matters. |
| Off-centre origin | Origin at 48% × 47% of the canvas | No | Unequal halves suggest the negative side is "smaller"; keep our symmetric view. |
| Axis arrowheads on positive ends | Small arrows | Maybe | Cheap cue for "numbers grow this way"; we use coloured "x"/"y" names instead, which do more. |
| Toolbar with 11 tool groups, input bar, menus | Full Classic UI | No | Heavy, intimidating, and irrelevant to reading coordinates. |
| Click-to-start preview, 10–60 s load | Static image until clicked | No | Our plane renders instantly; never gate the visual. |
| Fixed-size applet scaled down on mobile | 0.34× scale on a 390 px phone | No | Unreadable; keep our responsive SVG. |

## Recommendations for our lesson, ranked by value

1. **Show P's coordinates on the plane at all times while dragging, not only on hover.** Render the
   existing `CoordTooltip` box (offset up-right, flipping left in the right 30% and below in the top
   12%) whenever P is being dragged or has keyboard focus, in steps 2, 4 and 6. Keep the readout below.
   GeoGebra's bare points show how lost a learner is when the plane gives no coordinates.
2. **Snap P to whole numbers in this lesson.** Pass `snap={snapTo(1)}` to the `DraggablePoint`s in
   `Lesson.tsx` steps 2 and 4 and in `PracticeStep.tsx`. Every task (`(−3, 2)`, "4 steps from the
   x-axis", `(−2, −2)`) uses integers, and half-steps add a decimal the lesson never explains. If
   half-steps are wanted later, use a magnetic snap instead: round to the nearest integer when within
   0.15 units, else to 0.5.
3. **Arrow keys move P by exactly 1 unit and never pan.** With integer snap this follows from Mafs'
   `constrain`; check that one key press moves one grid square and that the readout says "1 step".
   (GeoGebra's 0.1 nudge and view-panning are both things to avoid.)
4. **Stop the dashed guides from crossing the axis numbers.** In `Guides.tsx`, end the horizontal
   guide ~0.25 units short of the y-axis when x > 0 (start at `[0.25, y]`, or `[-0.25, y]` when x < 0),
   and likewise for the vertical guide, so the tick label under/next to the foot stays readable
   (`ours-02-plane1.png` shows the "2" struck through). Optionally highlight that tick number in the
   axis colour (`COLOR.i` / `COLOR.j`) as the "answer" for each coordinate.
5. **Keep pan and zoom off and the origin centred.** Do not copy GeoGebra's unbounded wheel-zoom and
   drag-pan; our `pan={false} zoom={false}` and symmetric `viewBox` are right. Write this down in
   `docs/LESSON_GUIDE.md` as a rule for future lessons if it is not there already.
6. **Thin the axis numbers on narrow screens.** At 390 px our ±7 range gives ~25 px per unit; label
   every 2nd integer when the pane has under ~28 px per unit (Mafs `Coordinates.Cartesian`
   `xAxis={{ labels: ... }}` can return "" for odd numbers), but keep the grid line for every unit so
   counting still works. GeoGebra does this automatically when zoomed out.
7. **Give the selected/focused point a visible halo and a hint.** When P has keyboard focus, keep the
   Mafs halo on and show a short hint under the plane ("Arrow keys move P one step"). GeoGebra's
   selection ring is the clearest "you can move this" signal it has.
8. **Optional: a small arrowhead at the positive end of each axis**, coloured like the axis name, to
   show the direction numbers grow. Low value next to our existing coloured "x"/"y" names; only do it if
   it does not crowd the corner labels.

## What would not translate well (and why)

- The full GeoGebra toolbar, style bar, input bar and menus: dozens of controls unrelated to reading a
  point, and an easy way to lose the point you were working with.
- Click-to-activate preview and a slow start-up: the learner sees a picture that looks interactive but
  is not.
- Unbounded zoom/pan and arrow keys that move the view: the origin, the learner's only reference,
  can disappear.
- A fixed-size applet shrunk on phones: unreadable at 390 px.
- No instructions, labels, feedback or tasks: the applet relies entirely on a teacher.
