import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MEANING_TYPES, PROPERTY_TYPES } from '../data/vectorTypes'
import { ALL_LESSONS } from './curriculum'

type Row = { what: string; means: string; houses: string; ai: string; lessons: string[] }

/** What each mathematical object stands for. */
const OBJECTS: Row[] = [
  {
    what: 'Point',
    means: 'A location: where something is.',
    houses: 'House B as the point (1500, 3, 5) in “house space”.',
    ai: 'One data example.',
    lessons: ['dimensions-and-origin', 'coordinate-plane', '3d-space'],
  },
  {
    what: 'Vector',
    means: 'A direction or movement, or a list of features.',
    houses: 'A renovation (+200 sqft, +1 bedroom, 0 km), or a house’s feature list.',
    ai: 'Embeddings, feature vectors, model updates.',
    lessons: ['points-and-vectors', 'scalars-and-vectors'],
  },
  {
    what: 'Line',
    means: 'A relationship between two quantities, or a path.',
    houses: 'price ≈ 0.22 × sqft + 30 (the best-fit line): one rule that links size to price.',
    ai: 'A one-feature model; a boundary in two dimensions.',
    lessons: ['functions', 'lines-slope-intercept'],
  },
  {
    what: 'Plane',
    means: 'A flat surface: a relationship among three quantities, or a boundary.',
    houses: 'Every (sqft, bedrooms, distance) a model would price at exactly $400k.',
    ai: 'Linear decision boundaries and constraints.',
    lessons: ['3d-space', 'lines-slope-intercept'],
  },
  {
    what: 'Matrix',
    means: 'A transformation, or a table of relationships.',
    houses: 'X: 8 houses × 3 features. W: a layer that mixes the features.',
    ai: 'Datasets (rows = examples) and neural-network layers.',
    lessons: ['matrices-as-transformations', 'shapes-and-transpose'],
  },
  {
    what: 'Matrix operation',
    means: 'An action: rotate, scale, project, combine, change coordinates.',
    houses: 'Convert units, centre the data, compress it, predict prices.',
    ai: 'Every step of a model’s forward pass.',
    lessons: ['matrix-multiplication', 'projection-least-squares'],
  },
]

type Op = { op: string; form: string; geometry: string; ai: string; lessons: string[] }

/** The operation-to-scenario map: when and why to use each operation. */
const OPERATIONS: Op[] = [
  { op: 'Vector addition', form: 'u + v', geometry: 'Walk one movement, then the other', ai: 'Applying an update; combining signals', lessons: ['points-and-vectors', 'scalars-and-vectors'] },
  { op: 'Point − point', form: 'B − A', geometry: 'The movement from A to B', ai: 'How two examples differ', lessons: ['points-and-vectors'] },
  { op: 'Scaling a vector', form: 'k·v', geometry: 'Longer, shorter or reversed, same line', ai: 'Learning rate × gradient', lessons: ['scalars-and-vectors'] },
  { op: 'Mean vector', form: '(x₁ + … + xₙ) / n', geometry: 'The centre of a cloud of points', ai: 'The “typical” example of a class; centring data', lessons: ['scalars-and-vectors', 'spam-filter'] },
  { op: 'Linear combination', form: 'a·u + b·v', geometry: 'Reach a point with two arrows', ai: 'Mixing basis features', lessons: ['span-and-basis'] },
  { op: 'Length / distance', form: '‖v‖ = √(x² + y²)', geometry: 'How far', ai: 'Nearest neighbours; normalisation', lessons: ['exponents-and-roots', 'dot-product'] },
  { op: 'Dot product', form: 'u·v = Σ uᵢvᵢ', geometry: 'How much two arrows point the same way', ai: 'Similarity search; a neuron’s weighted sum; attention scores', lessons: ['dot-product', 'attention'] },
  { op: 'Matrix × vector', form: 'y = A x', geometry: 'Move one point with the whole plane', ai: 'A neural-network layer', lessons: ['matrices-as-transformations'] },
  { op: 'Matrix × matrix', form: 'A B (B first)', geometry: 'One transformation after another', ai: 'Stacking layers; forward propagation', lessons: ['matrix-multiplication'] },
  { op: 'Transpose', form: 'Aᵀ', geometry: 'Swap rows and columns', ai: 'X @ W.T on a batch; QKᵀ in attention', lessons: ['shapes-and-transpose', 'attention'] },
  { op: 'Determinant', form: 'det A = ad − bc', geometry: 'Area scaling; sign = flipped', ai: 'Detecting lost information', lessons: ['determinant'] },
  { op: 'Inverse', form: 'A⁻¹', geometry: 'Undo the transformation', ai: 'Solving systems; recovering inputs', lessons: ['inverse-rank-null-space'] },
  { op: 'Rank / outer product', form: 'u vᵀ', geometry: 'How many dimensions survive', ai: 'Low-rank updates such as LoRA', lessons: ['inverse-rank-null-space'] },
  { op: 'Linear classifier', form: 'w·x > b', geometry: 'Which side of a line or plane a point is on', ai: 'Spam filters and other yes/no decisions', lessons: ['lines-slope-intercept', 'spam-filter'] },
  { op: 'Projection / least squares', form: '(XᵀX) w = Xᵀy', geometry: 'Closest point on a line or plane', ai: 'Linear regression', lessons: ['projection-least-squares'] },
  { op: 'Eigenvectors', form: 'A v = λ v', geometry: 'Directions the matrix only stretches', ai: 'PCA', lessons: ['eigenvectors'] },
  { op: 'SVD', form: 'A = U Σ Vᵀ', geometry: 'Rotate, stretch, rotate', ai: 'Compression; recommendations', lessons: ['svd'] },
  { op: 'Softmax-weighted sum', form: 'softmax(QKᵀ/√d) V', geometry: 'A weighted average of value arrows', ai: 'Attention in transformers', lessons: ['attention'] },
]

function LessonLinks({ slugs }: { slugs: string[] }) {
  return (
    <span className="flex flex-col gap-0.5">
      {slugs.map((s) => {
        const l = ALL_LESSONS.find((x) => x.slug === s)
        if (!l) return null
        return (
          <Link
            key={s}
            to={`/lessons/${s}`}
            className="text-accent underline decoration-1 underline-offset-2"
          >
            {l.id} {l.title}
          </Link>
        )
      })}
    </span>
  )
}

type PickerStep = { label: string; text: string; mono?: boolean }
type PickerItem = { id: string; name: string; steps: PickerStep[] }

const MEANING_ITEMS: PickerItem[] = MEANING_TYPES.map((t) => ({
  id: t.id,
  name: t.name,
  steps: [
    { label: 'Each number is', text: t.each },
    { label: 'Object', text: t.object },
    { label: 'Numbers', text: t.numbers },
    { label: 'Vector', text: t.vector, mono: true },
    ...(t.note ? [{ label: 'Worked', text: t.note }] : []),
    { label: 'Used for', text: t.usedFor },
  ],
}))

const PROPERTY_ITEMS: PickerItem[] = PROPERTY_TYPES.map((t) => ({
  id: t.id,
  name: t.name,
  steps: [
    { label: 'Meaning', text: t.meaning },
    { label: 'Example', text: t.example },
    { label: 'Why it matters', text: t.why },
  ],
}))

/**
 * A list of types; choosing one shows its details beside (or, on a phone, below) the list.
 * The chosen button is marked with aria-pressed, a "▸" and bold text, not colour alone.
 */
function TypePicker({ name, items }: { name: string; items: PickerItem[] }) {
  const [chosenId, setChosenId] = useState(items[0].id)
  const chosen = items.find((x) => x.id === chosenId) ?? items[0]
  const panelId = `${name}-panel`
  return (
    <div className="grid gap-4 md:grid-cols-[17rem_minmax(0,1fr)]">
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0 md:flex-col md:flex-nowrap md:gap-1">
        {items.map((x) => {
          const on = x.id === chosen.id
          return (
            <li key={x.id}>
              <button
                type="button"
                aria-pressed={on}
                aria-controls={panelId}
                onClick={() => setChosenId(x.id)}
                className={`w-full cursor-pointer rounded-md border px-3 py-1.5 text-left text-sm ${
                  on
                    ? 'border-accent bg-accent font-semibold text-accent-ink'
                    : 'border-line bg-surface text-ink hover:border-accent'
                }`}
              >
                <span aria-hidden="true" className="inline-block w-4">
                  {on ? '▸' : ''}
                </span>
                {x.name}
              </button>
            </li>
          )
        })}
      </ul>
      <div
        id={panelId}
        role="region"
        aria-live="polite"
        aria-label={`${chosen.name}: details`}
        className="self-start rounded-lg border border-line bg-surface p-4"
      >
        <h4 className="m-0 mb-3 font-display text-xl">{chosen.name}</h4>
        <dl className="m-0 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
          {chosen.steps.map((st) => (
            <div key={st.label} className="contents">
              <dt className="font-semibold text-muted">{st.label}</dt>
              <dd className={`m-0 mb-1 break-words sm:mb-0 ${st.mono ? 'font-mono' : ''}`}>
                {st.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

const PIPELINE = ['real-world object', 'numbers', 'vector', 'model']

const th = 'border-b-2 border-line py-2 pr-4 text-left align-bottom font-semibold'
const td = 'border-b border-line py-2 pr-4 align-top'

export function Reference() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20">
      <header className="py-10">
        <h1 className="m-0 font-display text-4xl leading-tight sm:text-5xl">Reference</h1>
        <p className="mt-3 max-w-[66ch] text-lg text-muted">
          What each object means, and which operation to reach for. Every row uses the course’s
          running example, the house dataset (size, bedrooms, distance to the centre → price),
          and links to the lesson that teaches it.
        </p>
      </header>

      <section aria-labelledby="objects" className="mb-12">
        <h2 id="objects" className="m-0 mb-3 font-display text-2xl">
          What each object means
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className={th}>Object</th>
                <th className={th}>It represents</th>
                <th className={th}>In the house dataset</th>
                <th className={th}>In AI</th>
                <th className={th}>Learn it in</th>
              </tr>
            </thead>
            <tbody>
              {OBJECTS.map((r) => (
                <tr key={r.what}>
                  <td className={`${td} font-semibold`}>{r.what}</td>
                  <td className={td}>{r.means}</td>
                  <td className={td}>{r.houses}</td>
                  <td className={td}>{r.ai}</td>
                  <td className={td}>
                    <LessonLinks slugs={r.lessons} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="vector-types" className="mb-12">
        <h2 id="vector-types" className="m-0 mb-1 font-display text-2xl">
          Types of vector
        </h2>
        <p className="mt-0 mb-3 max-w-[66ch] text-muted">
          A vector is an ordered list of numbers that represents something. Machine learning
          always follows the same path. What changes from one problem to the next is what the
          numbers stand for.
        </p>
        <p
          data-testid="vector-pipeline"
          className="m-0 mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-surface px-4 py-3 font-mono text-sm"
        >
          {PIPELINE.map((stage, i) => (
            <span key={stage} className="whitespace-nowrap">
              {i > 0 && <span className="mr-2 text-muted">→</span>}
              {stage}
            </span>
          ))}
        </p>

        <h3 id="vector-types-meaning" className="m-0 mb-1 font-display text-xl">
          By what the numbers mean
        </h3>
        <p className="mt-0 mb-3 max-w-[66ch] text-muted">
          Choose a type to follow one example from object to numbers to vector.
        </p>
        <TypePicker name="vector-meaning" items={MEANING_ITEMS} />
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-accent">
            Show all {MEANING_TYPES.length} as a table
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-sm">
              <thead>
                <tr>
                  <th className={th}>Type</th>
                  <th className={th}>What each number is</th>
                  <th className={th}>Example object</th>
                  <th className={th}>Vector</th>
                  <th className={th}>Used for</th>
                </tr>
              </thead>
              <tbody>
                {MEANING_TYPES.map((t) => (
                  <tr key={t.id}>
                    <td className={`${td} font-semibold`}>{t.name}</td>
                    <td className={td}>{t.each}</td>
                    <td className={td}>{t.object}</td>
                    <td className={`${td} font-mono`}>{t.vector}</td>
                    <td className={td}>{t.usedFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <h3 id="vector-types-property" className="m-0 mt-10 mb-1 font-display text-xl">
          By mathematical property
        </h3>
        <p className="mt-0 mb-3 max-w-[66ch] text-muted">
          These labels describe the shape or contents of a vector, whatever it stands for. One
          vector can carry several at once: a one-hot vector is also binary, sparse and a unit
          vector.
        </p>
        <TypePicker name="vector-property" items={PROPERTY_ITEMS} />
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-accent">
            Show all {PROPERTY_TYPES.length} as a table
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[48rem] border-collapse text-sm">
              <thead>
                <tr>
                  <th className={th}>Type</th>
                  <th className={th}>Meaning</th>
                  <th className={th}>Example</th>
                  <th className={th}>Why it matters</th>
                </tr>
              </thead>
              <tbody>
                {PROPERTY_TYPES.map((t) => (
                  <tr key={t.id}>
                    <td className={`${td} font-semibold`}>{t.name}</td>
                    <td className={td}>{t.meaning}</td>
                    <td className={td}>{t.example}</td>
                    <td className={td}>{t.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section aria-labelledby="operations">
        <h2 id="operations" className="m-0 mb-1 font-display text-2xl">
          Operation-to-scenario map
        </h2>
        <p className="mt-0 mb-3 max-w-[66ch] text-muted">
          Read it as: what should happen geometrically, which operation does that, and where it
          shows up in an AI system.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className={th}>Operation</th>
                <th className={th}>Form</th>
                <th className={th}>What it does geometrically</th>
                <th className={th}>AI / engineering use</th>
                <th className={th}>Learn it in</th>
              </tr>
            </thead>
            <tbody>
              {OPERATIONS.map((r) => (
                <tr key={r.op}>
                  <td className={`${td} font-semibold`}>{r.op}</td>
                  <td className={`${td} font-mono whitespace-nowrap`}>{r.form}</td>
                  <td className={td}>{r.geometry}</td>
                  <td className={td}>{r.ai}</td>
                  <td className={td}>
                    <LessonLinks slugs={r.lessons} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

