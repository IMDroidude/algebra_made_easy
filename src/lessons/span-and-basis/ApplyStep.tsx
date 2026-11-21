import { Line, Text } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, DraggablePoint, Plane, TransformedGrid } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { fromColumns2, scale } from '../../linalg'
import { cleanZero2 } from '../../linalg/span'
import type { Vec2 } from '../../linalg'
import { F1, F2_GOOD, F2_REDUNDANT, MOVIE_START, decompose, featureSnippet } from './features'

const col = (w: Vec2) => String.raw`\begin{bmatrix} ${fmt(w[0])} \\ ${fmt(w[1])} \end{bmatrix}`
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

export function ApplyStep() {
  const [x, setX] = useState<Vec2>(MOVIE_START)
  const [redundant, setRedundant] = useState(false)

  const f2 = redundant ? F2_REDUNDANT : F2_GOOD
  const d = decompose(x, F1, f2)
  const { code, output } = featureSnippet(x, f2)
  const c1f1 = d.ok ? scale(F1, d.c[0]) : null

  return (
    <Step
      n={5}
      kind="Apply"
      title="A feature vector is a mix of basis features"
      visual={
        <>
          <Plane label="A movie as a point with action and romance scores, and the grid built from two feature directions f1 and f2">
            <TransformedGrid matrix={fromColumns2(F1, f2)} color={COLOR.grid} />
            <Text x={4.6} y={0.45} size={13} color={COLOR.ghost}>
              action →
            </Text>
            <Text x={-0.3} y={4.7} attach="w" size={13} color={COLOR.ghost}>
              romance ↑
            </Text>
            {d.ok && c1f1 && (
              <>
                <Line.Segment point1={[0, 0]} point2={c1f1} color={COLOR.i} weight={8} opacity={0.35} />
                <Line.Segment point1={c1f1} point2={x} color={COLOR.j} weight={8} opacity={0.35} />
              </>
            )}
            <Arrow tip={F1} color={COLOR.i} label="f1" />
            <Arrow tip={f2} color={COLOR.j} label="f2" />
            <DraggablePoint value={x} onChange={(q) => setX(cleanZero2(q))} color={COLOR.v} />
            <Text x={x[0]} y={x[1]} attach="e" attachDistance={20} size={14} color={COLOR.v}>
              movie
            </Text>
          </Plane>
          <div className="mt-3">
            <Toggle checked={redundant} onChange={setRedundant}>
              Replace f2 with a redundant feature, (−1, −1)
            </Toggle>
          </div>
          <Readout>
            <Tag color={COLOR.v}>movie</Tag> x = {fmtVec(x)}: action {fmt(x[0])}, romance {fmt(x[1])}.{' '}
            {d.ok ? (
              <>
                As a mix of features: x = {fmt(d.c[0])}·<Tag color={COLOR.i}>f1</Tag> +{' '}
                {fmt(d.c[1])}·<Tag color={COLOR.j}>f2</Tag>.
              </>
            ) : (
              <>
                <strong>
                  f2 = −1 × f1, so both features lie on one line. Their mixes reach only that line,
                  and NumPy refuses to solve: the matrix is singular.
                </strong>
              </>
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code} output={output} />
          </div>
        </>
      }
    >
      <p>
        Suppose a recommender describes each movie with two scores, action and romance. The movie
        in the picture, <Tag color={COLOR.v}>x</Tag> = {fmtVec(x)}, is already a linear combination:{' '}
        {fmt(x[0])} × (1, 0) + {fmt(x[1])} × (0, 1). The standard axes are one basis, and the
        coordinates are how much of each axis you need.
      </p>
      <p>
        A trained model rarely uses those axes. It learns its own <strong>feature
        directions</strong>. Say it has learned
      </p>
      <ul className="mt-0 mb-4 list-disc pl-6">
        <li>
          <Tag color={COLOR.i}>f1</Tag> = (1, 1): &ldquo;has both action and romance&rdquo;,
        </li>
        <li>
          <Tag color={COLOR.j}>f2</Tag> = (1, −1): &ldquo;more action than romance&rdquo;.
        </li>
      </ul>
      <p>
        The same movie is now a different recipe: its address on the blue grid built from f1 and
        f2.
        {d.ok && ' Drag the movie and watch the recipe change:'}
      </p>
      {d.ok && (
        <Tex block>
          {String.raw`${col(x)} = ${p(d.c[0])}\,\textcolor{${COLOR.i}}{${col(F1)}} + ${p(d.c[1])}\,\textcolor{${COLOR.j}}{${col(f2)}}`}
        </Tex>
      )}
      <p>
        Finding the recipe means solving for the two numbers, which{' '}
        <code>np.linalg.solve(F, x)</code> does: it finds c with F @ c = x. This only works because
        f1 and f2 are independent, so they form a basis and every movie has exactly one recipe.
      </p>
      <p>
        Now switch on the redundant feature. f2 becomes −1 × f1, the grid collapses onto a line,
        and most movies can no longer be described at all. A model whose features are dependent
        is wasting capacity: two features, but only one direction of information.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real models have hundreds of dimensions, the learned
        directions are found by training rather than chosen, and they rarely have tidy names. The
        two scores and both features here are invented to show the arithmetic.
      </p>
    </Step>
  )
}
