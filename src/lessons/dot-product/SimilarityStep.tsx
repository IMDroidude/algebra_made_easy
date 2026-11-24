import { Fragment, useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { NumpySnippet } from '../../components/NumpySnippet'
import { DraggableArrow, Plane } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Predict } from '../../components/Predict'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { norm } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { angleBetweenDeg } from '../../linalg/projection'
import { dotTerms, extremePairs, pairwiseCosines, pairwiseDots } from '../../linalg/similarity'
import type { Pair } from '../../linalg/similarity'
import {
  ANIMALS,
  ANIMAL_CHECKS,
  CAR,
  CAT,
  FEATURES,
  FEATURE_MAX,
  START,
  TIGER,
  activeVectors,
  animalSnippet,
  clampFeature,
  grade,
  hasZeroVector,
  planePoint,
} from './animals'
import type { Features } from './animals'
import { AngleArc } from './Drawings'
import { pyFixed } from './pyFormat'

/** The starting numbers, quoted in the text and in the prediction's explanations. */
const START_DOTS = pairwiseDots(activeVectors(START, false))
const START_COS_2 = pairwiseCosines(activeVectors(START, false)) ?? []
const START_COS_3 = pairwiseCosines(activeVectors(START, true)) ?? []

const cos3 = (c: number) => pyFixed(c, 3)

/** "4×4 + 1×4": the sum a dot product works out, for the fixed starting vectors. */
const sumText = (a: number[], b: number[]) => a.map((x, k) => `${x}×${b[k]}`).join(' + ')

const snapFeature = ([x, y]: Vec2): Vec2 => [clampFeature(x), clampFeature(y)]

function Name({ k }: { k: number }) {
  return (
    <Tag color={ANIMALS[k].color}>
      {ANIMALS[k].emoji} {ANIMALS[k].name}
    </Tag>
  )
}

const pairText = ([i, j]: Pair) => `${ANIMALS[i].name} and ${ANIMALS[j].name}`

const ITEMS: Challenge[] = [
  {
    id: 'impostor',
    title: 'The impostor',
    task: (
      <p className="m-0">
        Change the numbers until the car is more like the cat than the tiger is (by cosine).
      </p>
    ),
    insight: (
      <p className="m-0">
        The model has no idea what a car is. It only sees the numbers, so anything with
        cat-like numbers counts as cat-like. An embedding is only as good as the features in it.
      </p>
    ),
  },
  {
    id: 'nothing',
    title: 'Nothing in common',
    task: <p className="m-0">Make any two of them score exactly 0 against each other.</p>,
    insight: (
      <p className="m-0">
        Every term of the sum is 0: wherever one has a feature, the other has none. With no
        negative numbers, that is the only way to reach 0, and it is the same right angle you
        made in step 2.
      </p>
    ),
  },
]

export function SimilarityStep() {
  const [features, setFeatures] = useState<Features>(START)
  const [wheels, setWheels] = useState(false)
  const [pair, setPair] = useState<Pair>([CAT, TIGER])
  const [revealed, setRevealed] = useState(false)
  const [byDot, setByDot] = useState(false)
  const [refused, setRefused] = useState(false)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  /** Every change goes through here: all-zero vectors are refused, challenges are checked. */
  const apply = (next: Features, nextWheels: boolean) => {
    if (hasZeroVector(next, nextWheels)) {
      setRefused(true)
      return
    }
    setRefused(false)
    setFeatures(next)
    setWheels(nextWheels)
    const solved = Object.keys(ANIMAL_CHECKS).filter((id) => ANIMAL_CHECKS[id](next, nextWheels))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const setFeature = (k: number, f: number, value: number) =>
    apply(
      features.map((row, i) => (i === k ? row.map((x, c) => (c === f ? clampFeature(value) : x)) : row)),
      wheels,
    )

  const vectors = activeVectors(features, wheels)
  const dots = pairwiseDots(vectors)
  const cos = pairwiseCosines(vectors)
  // `apply` never lets a zero vector in, so the cosines always exist.
  if (!cos) return null

  const [i, j] = pair
  const terms = dotTerms(vectors[i], vectors[j])
  const biggest = terms.indexOf(Math.max(...terms))
  const extremes = extremePairs(cos)
  const shown = byDot ? dots : cos
  const top = Math.max(...shown.flat())
  const snippet = animalSnippet(features, wheels)
  const names = FEATURES.slice(0, vectors[0].length)
  const flatAngle = angleBetweenDeg(planePoint(features[i]), planePoint(features[j]))

  return (
    <Step
      n={5}
      kind="Apply"
      title="How an AI knows a tiger is more like a cat than a car"
      visual={
        <>
          <div
            role="group"
            aria-label="Feature values for the cat, the tiger and the car"
            className="grid items-center gap-x-3 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3"
            style={{ gridTemplateColumns: `auto repeat(${names.length}, minmax(0, 1fr))` }}
          >
            <span />
            {names.map((f) => (
              <span key={f} className="text-xs font-semibold tracking-widest text-muted uppercase">
                {f}
              </span>
            ))}
            {ANIMALS.map((animal, k) => (
              <Fragment key={animal.name}>
                <span className="text-sm whitespace-nowrap">
                  <Name k={k} />
                </span>
                {names.map((f, c) => (
                  <div key={f} className="flex min-w-0 items-center gap-1.5">
                    <input
                      type="range"
                      aria-label={`${animal.name} ${f}`}
                      min={0}
                      max={FEATURE_MAX}
                      step={1}
                      value={features[k][c]}
                      aria-valuetext={`${features[k][c]} out of ${FEATURE_MAX}`}
                      onChange={(e) => setFeature(k, c, Number(e.target.value))}
                      className="min-w-0 flex-1"
                      style={{ accentColor: animal.color }}
                    />
                    <span aria-hidden="true" className="w-3 font-mono text-sm">
                      {features[k][c]}
                    </span>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Toggle checked={wheels} onChange={(on) => apply(features, on)}>
              Add a third feature: wheels
            </Toggle>
            {revealed && (
              <Toggle checked={byDot} onChange={setByDot}>
                Show raw dot products
              </Toggle>
            )}
            <Button variant="secondary" onClick={() => apply(START, wheels)}>
              Reset the numbers
            </Button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-sm">
              <caption className="mb-1 text-left text-xs font-semibold tracking-widest text-muted uppercase">
                {byDot ? 'Dot product of every pair' : 'Cosine similarity of every pair'}
              </caption>
              <thead>
                <tr>
                  <td />
                  {ANIMALS.map((a, c) => (
                    <th
                      key={a.name}
                      scope="col"
                      className={`py-1 ${c === i || c === j ? 'font-bold' : 'font-normal text-muted'}`}
                    >
                      <Name k={c} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ANIMALS.map((a, r) => (
                  <tr key={a.name}>
                    <th
                      scope="row"
                      className={`pr-2 text-left whitespace-nowrap ${r === i || r === j ? 'font-bold' : 'font-normal text-muted'}`}
                    >
                      <Name k={r} />
                    </th>
                    {ANIMALS.map((b, c) => {
                      const value = byDot ? fmt(dots[r][c]) : cos3(cos[r][c])
                      const tint = top > 0 ? Math.round((28 * Math.max(0, shown[r][c])) / top) : 0
                      const background = `color-mix(in srgb, var(--accent) ${tint}%, transparent)`
                      if (r === c) {
                        return (
                          <td
                            key={b.name}
                            className="rounded-lg border-2 border-transparent px-2 py-2 text-center font-mono text-muted"
                            style={{ background }}
                          >
                            {value}
                          </td>
                        )
                      }
                      const selected = (r === i && c === j) || (r === j && c === i)
                      return (
                        <td key={b.name} className="p-0">
                          <button
                            type="button"
                            aria-pressed={selected}
                            aria-label={`${a.name} and ${b.name}: ${byDot ? 'dot product' : 'cosine'} ${value}`}
                            onClick={() => setPair(r < c ? [r, c] : [c, r])}
                            className={`w-full cursor-pointer rounded-lg border-2 px-2 py-2 text-center font-mono ${
                              selected ? 'border-accent font-bold' : 'border-line hover:border-accent'
                            }`}
                            style={{ background }}
                          >
                            {value}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-lg border border-line bg-surface px-4 py-3">
            <p className="m-0 text-xs font-semibold tracking-widest text-muted uppercase">
              Live calculation
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-sm">
              <span>
                <Name k={i} /> · <Name k={j} /> =
              </span>
              {terms.map((_, k) => (
                <Fragment key={names[k]}>
                  {k > 0 && <span>+</span>}
                  <span className="inline-flex flex-col items-center rounded-md border border-line px-2 py-1">
                    <span>
                      <Tag color={ANIMALS[i].color}>{vectors[i][k]}</Tag> ×{' '}
                      <Tag color={ANIMALS[j].color}>{vectors[j][k]}</Tag>
                    </span>
                    <span className="font-sans text-xs text-muted">{names[k]}</span>
                  </span>
                </Fragment>
              ))}
              <span>
                = <strong className="text-base">{fmt(dots[i][j])}</strong>
              </span>
            </div>
            <p className="mt-2 mb-0 font-mono text-sm">
              cosine = {fmt(dots[i][j])} ÷ ({fmt(norm(vectors[i]), 3)} × {fmt(norm(vectors[j]), 3)}) ={' '}
              <strong className="text-base">{cos3(cos[i][j])}</strong>
            </p>
            <p className="mt-1 mb-0 text-xs text-muted">
              {fmt(norm(vectors[i]), 3)} and {fmt(norm(vectors[j]), 3)} are the lengths of the two
              vectors.
            </p>
          </div>

          <Readout>
            <Name k={i} /> = {fmtVec(vectors[i])} and <Name k={j} /> = {fmtVec(vectors[j])}: dot
            product {fmt(dots[i][j])}, cosine similarity {cos3(cos[i][j])}, {grade(cos[i][j])}.
            {dots[i][j] > 0 && (
              <>
                {' '}
                The biggest share of the dot product comes from {names[biggest]} ({fmt(terms[biggest])}{' '}
                of {fmt(dots[i][j])}).
              </>
            )}
            {extremes && (
              <>
                {' '}
                Of the three pairs, the closest is {pairText(extremes.closest)} (
                {cos3(cos[extremes.closest[0]][extremes.closest[1]])}) and the least alike is{' '}
                {pairText(extremes.farthest)} ({cos3(cos[extremes.farthest[0]][extremes.farthest[1]])}).
              </>
            )}
            {refused && (
              <strong className="block">
                That change was refused: it would leave one of them with every number at 0, and a
                vector of all zeros has no direction to compare.
              </strong>
            )}
          </Readout>

          <div className="mt-3">
            <Plane
              x={[-1.4, 6.2]}
              y={[-1, 6]}
              height={340}
              label="The cat, the tiger and the car as draggable arrows; furry is the horizontal axis and big is the vertical axis"
            >
              <PlaneLabel x={5.6} y={0} attach="s" distance={24} size={13}>
                furry →
              </PlaneLabel>
              <PlaneLabel x={0} y={5.7} attach="w" distance={12} size={13}>
                big ↑
              </PlaneLabel>
              {!wheels && flatAngle !== null && (
                <AngleArc
                  a={planePoint(features[i])}
                  b={planePoint(features[j])}
                  label={`${fmt(flatAngle, 0)}°`}
                  color="var(--accent)"
                />
              )}
              {ANIMALS.map((animal, k) => (
                <DraggableArrow
                  key={animal.name}
                  value={planePoint(features[k])}
                  onChange={(p) =>
                    apply(
                      features.map((row, r) => (r === k ? [p[0], p[1], row[2]] : row)),
                      wheels,
                    )
                  }
                  color={animal.color}
                  label={`${animal.emoji} ${animal.name}`}
                  snap={snapFeature}
                />
              ))}
            </Plane>
            <p className="mt-2 mb-0 text-sm text-muted">
              {wheels
                ? 'This flat picture can only show furry and big. Wheels is a third direction, straight out of the screen, so the angles you see here are no longer the real ones. The numbers above use all three features.'
                : 'Each arrow is the same pair of numbers as its sliders. Drag a tip, or focus it and use the arrow keys. The arc marks the angle between the selected pair: a small angle means a cosine close to 1.'}
            </p>
          </div>

          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        You know a tiger is more like a cat than like a car. A program does not, until each
        thing is turned into numbers. Here every number answers one question on a scale from 0
        to {FEATURE_MAX}: how <strong>furry</strong> is it, and how <strong>big</strong>? The
        list of answers is a vector, a tiny hand-made <strong>embedding</strong>: <Name k={CAT} />{' '}
        = {fmtVec(START[CAT].slice(0, 2))}, <Name k={TIGER} /> = {fmtVec(START[TIGER].slice(0, 2))},{' '}
        <Name k={CAR} /> = {fmtVec(START[CAR].slice(0, 2))}.
      </p>
      <p>
        Now &ldquo;how alike are they?&rdquo; is a dot product. Look at the live calculation:
        each term is one feature. A term is large only when <em>both</em> things score high on
        that feature, so the sum counts how much they have in common. Cat and tiger are both
        furry, and that one term gives most of their {START_DOTS[CAT][TIGER]}. Cat and car share
        only a little bigness: {START_DOTS[CAT][CAR]}.
      </p>
      <p>
        The table holds the cosine similarity of every pair. Choose a cell to see where its
        number comes from, and move the sliders or drag the arrows to change the animals
        themselves.
      </p>

      <div className="my-5">
      <Predict
        question={
          <>
            With the starting numbers, cat = {fmtVec(START[CAT].slice(0, 2))}, tiger ={' '}
            {fmtVec(START[TIGER].slice(0, 2))}, car = {fmtVec(START[CAR].slice(0, 2))}: which
            vector has the largest <em>raw dot product</em> with the cat?
          </>
        }
        onReveal={() => {
          setFeatures(START)
          setRefused(false)
          setPair([CAT, TIGER])
          setRevealed(true)
          setByDot(true)
        }}
        onRetry={() => {
          setRevealed(false)
          setByDot(false)
        }}
        options={[
          {
            id: 'cat',
            label: 'The cat itself: nothing is more like a cat than a cat',
            correct: false,
            explain: (
              <p className="m-0">
                True for cosine similarity, which is exactly 1 for a vector with itself. The raw
                dot product is different: cat · cat = {sumText(START[CAT].slice(0, 2), START[CAT].slice(0, 2))}{' '}
                = {START_DOTS[CAT][CAT]}, but cat · tiger ={' '}
                {sumText(START[CAT].slice(0, 2), START[TIGER].slice(0, 2))} = {START_DOTS[CAT][TIGER]}.
                The tiger&rsquo;s vector is longer, and length inflates a dot product.
              </p>
            ),
          },
          {
            id: 'tiger',
            label: 'The tiger',
            correct: true,
            explain: (
              <p className="m-0">
                cat · tiger = {sumText(START[CAT].slice(0, 2), START[TIGER].slice(0, 2))} ={' '}
                {START_DOTS[CAT][TIGER]}, which beats cat · cat = {START_DOTS[CAT][CAT]}. By raw
                dot product a cat is more like a tiger than like itself, only because the tiger
                has bigger numbers. Dividing by the two lengths removes that: the table now shows
                the raw dot products, and you can switch back to cosine to compare.
              </p>
            ),
          },
          {
            id: 'car',
            label: 'The car',
            correct: false,
            explain: (
              <p className="m-0">
                cat · car = {sumText(START[CAT].slice(0, 2), START[CAR].slice(0, 2))} ={' '}
                {START_DOTS[CAT][CAR]}, the smallest of the three. The car is not furry, so the
                furry term is 0, and the cat is small, so the big term is small too.
              </p>
            ),
          },
        ]}
      />
      </div>

      <p>
        <strong>Two features are not enough.</strong> With only furry and big, the tiger and the
        car score {cos3(START_COS_2[TIGER][CAR])}: they look fairly alike, because both are big
        and nothing in the numbers says what makes a car a car. Press Reset, then switch on{' '}
        <strong>wheels</strong>. The same pair drops to {cos3(START_COS_3[TIGER][CAR])}, while cat
        and tiger stay at {cos3(START_COS_3[CAT][TIGER])}. Every extra feature is one more way to
        tell things apart.
      </p>

      <div className="my-5">
        <Challenges items={ITEMS} done={done} />
      </div>

      <p>
        In the code, each thing is one row of <code>X</code>. <code>X.T</code> is X with rows and
        columns swapped, and <code>X @ X.T</code> works out the dot product of every row with
        every other row in one go: the same table as above. <code>np.outer(lengths, lengths)</code>{' '}
        is a table of every length times every other length, so the division gives all the
        cosines at once.
      </p>
      <p className="text-sm text-muted">
        What this leaves out: nobody writes the features of a real embedding by hand. A model
        learns hundreds or thousands of them from text, and they have no tidy names like
        &ldquo;furry&rdquo;. The comparison is still this dot product. The next section uses it
        to search documents.
      </p>
    </Step>
  )
}
