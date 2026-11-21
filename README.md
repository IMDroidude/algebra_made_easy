# Algebra Made Easy

An interactive website for learning the algebra behind AI. Drag a vector, edit a matrix, and watch the plane respond, with the equation and the matching NumPy code updating alongside.

Built for engineers who can code but never got a feel for the math. The full plan and curriculum are in [docs/PLAN.md](docs/PLAN.md).

## What works today

- **21 lessons in 5 modules**, each lesson in six steps (see, manipulate, predict, understand, apply to AI, practice), with prerequisites, a "why an AI engineer needs this" line and key takeaways:
  1. *Understanding coordinates and 3D space:* dimensions and the origin, coordinate plane, 3D space, points vs vectors, real-world positions (+ a companion Jupyter notebook in `notebooks/`).
  2. *The algebra toolkit:* variables and equations, functions, lines and decision boundaries, exponents and roots.
  3. *Vectors:* vector arithmetic, span and basis, dot product.
  4. *Matrices:* matrices as transformations (with a transformation gallery), multiplication, shapes and transpose, determinant, inverse and rank.
  5. *Inside AI models:* least squares, eigenvectors and PCA, SVD and image compression, attention.
- **Playground.** A vector lab (add two vectors, scale a vector) and a matrix lab (presets, draggable basis vectors, determinant and inverse).
- Hover, drag or focus any point to see its coordinates. Every NumPy snippet prints what real NumPy prints.

To add a lesson, follow [docs/LESSON_GUIDE.md](docs/LESSON_GUIDE.md).

## Run it

Requires Node 22 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check and build the static site into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm test` | Unit and component tests (Vitest) |
| `npm run e2e` | Browser tests (Playwright; first run `npx playwright install chromium`) |
| `npm run lint` | Lint |

## Deploy

The site is fully static and uses hash routing with a relative base path, so the same build works on either host with no configuration.

- **Vercel:** import the repository. Vercel detects Vite; build command `npm run build`, output directory `dist`.
- **GitHub Pages:** push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes. Enable it once under *Settings → Pages → Source: GitHub Actions*.

## How the code is organised

```
src/
  linalg/       pure math (no React). Vectors, matrices, determinant, inverse, tolerance
  components/   reusable visuals: Plane, MatrixInput, Predict, Challenges, NumpySnippet
  lessons/      one folder per lesson
  playground/   the free sandbox
  lib/          formatting, colours, animation helper
  app/          routes, layout, home page, curriculum list
tests/
  linalg/  lib/  components/   Vitest
  e2e/                         Playwright
```

Conventions used everywhere: vectors are column vectors, transforms are written `y = Ax`, the columns of a matrix are where the basis vectors land, and the y-axis points up.
