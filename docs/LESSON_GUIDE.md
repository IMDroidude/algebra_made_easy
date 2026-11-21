# How to build a lesson

Rules and building blocks for adding a lesson to Algebra Made Easy. Read [PLAN.md](PLAN.md) sections 1, 3, 4, 5 and 6b first: they define the audience, the six-step format, the architecture rules and the per-lesson checklist. The reference implementation is [src/lessons/matrices-as-transformations/](../src/lessons/matrices-as-transformations/); copy its structure and tone.

## 1. Where things go

| What | Where |
|---|---|
| The lesson | `src/lessons/<slug>/` (slug from `src/app/curriculum.ts`) |
| Entry point | `src/lessons/<slug>/index.ts` containing `export { Lesson as default } from './Lesson'` |
| Lesson-only components | inside the lesson folder |
| New math | a new file `src/linalg/<topic>.ts`, imported by its own path (not through `src/linalg/index.ts`) |
| Unit tests for new math | `tests/linalg/<topic>.test.ts` |
| Component / lesson tests | `tests/lessons/<slug>/*.test.tsx` |
| Browser tests | `tests/e2e/lessons/<slug>.spec.ts` |

Every lesson also needs `src/lessons/<slug>/takeaways.ts` exporting `takeaways: string[]` (3–5 short sentences to remember; shown in a "Key takeaways" box after the lesson), an entry in `src/app/curriculum.ts` with its one-line `ai` reason ("why an AI engineer needs this"), and an entry in `src/app/prerequisites.ts` (earlier lessons it builds on, and skills to check yourself against); a test fails without it, and the lesson header shows it as a "Before you start" box.

Adding the folder with an `index.ts` is all it takes: the lesson appears at `/#/lessons/<slug>`, is marked "Available" on the home page, and gets previous/next navigation automatically.

**When several lessons are being built in parallel, only touch files you created.** Do not edit anything under `src/components/`, `src/lib/`, `src/app/`, existing `src/linalg/` files, `package.json`, or other lessons. If a shared component lacks something, build a local variant in your lesson folder and mention it in your report.

## 1b. The running example: the house dataset

Every lesson includes one `<RunningExample title="…">` section (from `components/RunningExample`) that applies the lesson's tool to the shared houses in `src/data/houses.ts` (8 houses: sqft, bedrooms, distance_km → price in $k; helpers `featureVector`, `featureMatrix`, `prices`, `housesNumpy`, and the `<HouseTable>` component). Use the shared data, never a private copy, so learners meet the same houses in every lesson. Keep it compact (one idea, one visual or table, NumPy with exact output), place it after the Apply step or inside it, and test every number it shows.

## 2. Page skeleton

```tsx
import { LessonHeader } from '../../components/LessonHeader'
import { Step } from '../../components/ui'

export function Lesson() {
  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="<slug>">One or two sentences: what the learner will be able to do.</LessonHeader>
      <Step n={1} kind="See" title="…" visual={…}>…</Step>
      <Step n={2} kind="Manipulate" title="…" visual={…}>…</Step>
      <Step n={3} kind="Predict" title="…" visual={…}>…</Step>
      <Step n={4} kind="Understand" title="…" visual={…}>…</Step>
      <Step n={5} kind="Apply" title="…" visual={…}>…</Step>
      <Step n={6} kind="Practice" title="…" visual={…}>…</Step>
    </article>
  )
}
```

`LessonHeader` takes number, part and title from the curriculum, and adds the "skip" link for Foundations lessons. Do not add your own previous/next links.

## 3. Shared building blocks

| Import from | Component | Use |
|---|---|---|
| `components/Plane` | `Plane` | The 2D plane. Props `label` (required, screen-reader description), `extent`, `height`; `x` / `y` ranges for a plane not centred on the origin; `stretch` for axes with different scales. |
| | `Arrow` | Vector from `tail` to `tip`, optional `label`, `labelAt="middle"`, `dashed`. Tip shows coordinates on hover. |
| | `DraggableArrow` | Arrow whose tip can be dragged or moved with arrow keys. Coordinates on hover/drag/focus. |
| | `DraggablePoint` | A bare draggable point, same behaviour. |
| | `CoordPoint` | A fixed point that shows coordinates on hover. |
| | `TransformedGrid` | Grid lines after a 2×2 matrix. |
| | `snapTo(step, limit)` is in `lib/snap` | Snap function for draggables. |
| `components/PlaneLabel` | `PlaneLabel` | Text next to a point. **Use it instead of Mafs `Text`**: Mafs 0.21 places `attach="n"` / `"s"` labels on the wrong side. |
| `components/Slider` | `Slider` | Labelled range slider for one value. |
| `components/MatrixInput` | `MatrixInput` | Editable 2×2 matrix; columns colour-matched to î and ĵ. |
| `components/NumberField` | `NumberField` | One validated number box. |
| `components/Predict` | `Predict` | Predict-before-you-see: options each with `correct` and their own `explain`; `onReveal` / `onRetry`. |
| `components/Challenges` | `Challenges` | Goal list; you compute which ids are `done` from live state. |
| `components/NumpySnippet` | `NumpySnippet` | Read-only code bound to state, with `output`. |
| `components/Tex` | `Tex` | KaTeX; `block` for display maths. Use `String.raw` for LaTeX. |
| `components/ui` | `Step` (`layout="wide"` gives the visual most of the width), `Button`, `Toggle`, `Readout`, `Tag` | Layout and small controls. `Readout` is the live text description every visual needs. `Tag` names a coloured object in text. |
| `lib/format` | `fmt`, `fmtVec`, `fmtDet`, `numpyVec`, `numpyMat2`, `numpyPrint`, `asTyped2`, `isInteger`, `coordText` | Number display. Literals use 3 decimals, like the number boxes; compute printed output from `asTyped2(m)` so it matches the literal. |
| `lib/numpy` | `npArray`, `npFloat`, `npRound`, `pyLiteral` | Exact NumPy print output (8 digits, round-half-to-even, `-0.`, scientific notation, wrapping), tested against real NumPy. |
| `lib/palette` | `COLOR` | `i`, `j` (basis / columns), `v` (studied vector), `result`, `grid`, `ghost`. |
| `lib/useTween` | `useTween` | 0→1 animation for reveals; honours reduced motion. |
| `linalg` | vectors, 2×2 and general matrices, `det2`, `inverse2`, `lerp2`, `rotation2`, `isZero`, `approxEqual` | All maths. `ml-matrix` is installed for decompositions. |
| `mafs` | `Polygon`, `Line.Segment`, `Plot.OfX`, `Text`, `Point`, `Circle`, `Transform` | Extra drawing primitives inside a `Plane`. |

## 4. Rules (from PLAN.md, restated because they are easy to break)

1. **Conventions:** column vectors, `y = Ax`, matrix columns are where basis vectors land, y-axis up, angles counter-clockwise.
2. **No maths inside components.** Compute with `src/linalg`; never compare floats with `=== 0`, use `isZero` / `approxEqual`.
3. **Every number shown is tested.** Each worked example, equation and NumPy output in the lesson is covered by a unit test. NumPy outputs must be what real NumPy prints.
4. **Visual, equation and code always show the same numbers**, bound to the same state.
5. **Accessibility:** every plane has a `label` and a `Readout` with the live values in words; colour is never the only cue (use `Tag` or text labels); everything works by keyboard.
6. **Low density:** one primary object per step, at most one comparison; everything else behind a `Toggle`.
7. **Prediction:** at least one `Predict` with the result hidden until locked in; every wrong option explains its specific misconception.
8. **Practice:** at least two challenges that use examples not shown earlier in the lesson; each ticks itself from live state and shows an insight when solved.
9. **Honesty about 2D:** where a picture stands in for high dimensions, say so.
10. **Tone:** plain English, short paragraphs, second person, no hype. Audience: programmers who are rusty at maths. Explain any NumPy syntax beyond the basics.
11. **Phone width:** no horizontal page scroll at 390px. Wide equations sit inside `Tex block` (which scrolls on its own).

## 5. Checking your work

The dev server for tests runs on port 5199. Run only your own files:

```bash
npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep <slug-or-your-files>
npx vitest run tests/lessons/<slug> tests/linalg/<topic>.test.ts
npx playwright test tests/e2e/lessons/<slug>.spec.ts --project=desktop
```

Fix every type error, lint warning (`npx oxlint src/lessons/<slug>`) and failing test in your files. Errors in files you did not create belong to someone else; ignore them. Do not run `npm run build`, do not commit.

Before finishing, take screenshots of each step at 1280px and at 390px (Playwright, `channel: 'chromium'`) and look at them: overlapping labels, clipped equations and empty-looking planes are the usual problems.
