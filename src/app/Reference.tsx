import { Link } from 'react-router-dom'
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

