import { Line, Text } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import { useTween } from '../../lib/useTween'
import { scale } from '../../linalg'
import { makeCloud, pca2, projectOnto } from '../../linalg/eigen'
import type { Vec2 } from '../../linalg'
import { pcaCode, pcaOutput } from './snippets'

const snapRaw = snapTo(0.25, 4.75)

type Stage = 1 | 2 | 3

const STAGES: { n: Stage; label: string }[] = [
  { n: 1, label: '1 · Raw data' },
  { n: 2, label: '2 · Centre it' },
  { n: 3, label: '3 · Principal directions' },
]

export function ApplyStep() {
  const [seed, setSeed] = useState(3)
  const [points, setPoints] = useState<Vec2[]>(() => makeCloud(3))
  const [stage, setStage] = useState<Stage>(1)
  const [project, setProject] = useState(false)
  const centring = useTween(900)

  const pca = pca2(points)
  const [pc1, pc2] = pca.components
  const total = pc1.value + pc2.value
  const share = total > 0 ? (100 * pc1.value) / total : 50
  const C = pca.covariance

  const shift = stage === 1 ? 0 : centring.t
  const offset: Vec2 = [pca.mean[0] * shift, pca.mean[1] * shift]
  const shown = points.map(([x, y]) => [x - offset[0], y - offset[1]] as Vec2)

  const goTo = (next: Stage) => {
    if (next === 1) centring.reset(0)
    else if (stage === 1) centring.play()
    if (next !== 3) setProject(false)
    setStage(next)
  }

  const move = (k: number) => (p: Vec2) => {
    const raw = snapRaw([p[0] + offset[0], p[1] + offset[1]])
    setPoints(points.map((q, i) => (i === k ? raw : q)))
  }
  const snapShown = (p: Vec2): Vec2 => {
    const raw = snapRaw([p[0] + offset[0], p[1] + offset[1]])
    return [raw[0] - offset[0], raw[1] - offset[1]]
  }

  const regenerate = () => {
    const next = seed + 1
    setSeed(next)
    setPoints(makeCloud(next))
  }

  const arrow = (q: { value: number; vector: Vec2 }) => scale(q.vector, 2 * Math.sqrt(q.value))

  return (
    <Step
      n={5}
      kind="Apply"
      title="PCA: the eigenvectors of a cloud of data"
      visual={
        <>
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="PCA stages">
            {STAGES.map((s) => (
              <Button
                key={s.n}
                variant={stage === s.n ? 'primary' : 'secondary'}
                aria-pressed={stage === s.n}
                onClick={() => goTo(s.n)}
              >
                {s.label}
              </Button>
            ))}
          </div>
          <Plane label="A cloud of 16 data points, its mean and its principal directions" extent={5}>
            {stage === 3 && (
              <>
                <Line.ThroughPoints point1={[0, 0]} point2={pc1.vector} color={COLOR.i} opacity={0.5} style="dashed" />
                <Line.ThroughPoints point1={[0, 0]} point2={pc2.vector} color={COLOR.j} opacity={0.35} style="dashed" />
              </>
            )}
            {project &&
              shown.map((q, k) => {
                const onto = projectOnto(q, pc1.vector)
                return (
                  <g key={`p${k}`}>
                    <Line.Segment point1={q} point2={onto} color={COLOR.ghost} style="dashed" weight={1} />
                    <CoordPoint at={onto} color={COLOR.i} />
                  </g>
                )
              })}
            {shown.map((q, k) => (
              <DraggablePoint key={k} value={q} onChange={move(k)} color={COLOR.v} snap={snapShown} />
            ))}
            <CoordPoint at={[pca.mean[0] - offset[0], pca.mean[1] - offset[1]]} color={COLOR.result} />
            <Text
              x={pca.mean[0] - offset[0]}
              y={pca.mean[1] - offset[1]}
              attach="se"
              attachDistance={12}
              size={14}
              color={COLOR.result}
            >
              mean
            </Text>
            {stage === 3 && !pca.isotropic && (
              <>
                <Arrow tip={arrow(pc1)} color={COLOR.i} label="PC1" />
                {pc2.value > 0 && <Arrow tip={arrow(pc2)} color={COLOR.j} label="PC2" />}
              </>
            )}
          </Plane>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Button variant="secondary" onClick={regenerate}>
              New random cloud
            </Button>
            {stage === 3 && (
              <Toggle checked={project} onChange={setProject}>
                Keep only PC1 (project onto it)
              </Toggle>
            )}
          </div>
          <Readout>
            <span className="block">
              <Tag color={COLOR.result}>Mean</Tag> = {fmtVec(pca.mean)}.{' '}
              {stage === 1
                ? 'The cloud is wherever the data happens to sit.'
                : 'Every point has had the mean subtracted, so the cloud now sits around the origin.'}
            </span>
            {stage >= 2 && (
              <span className="mt-1 block">
                Spread: variance of x {fmt(C[0][0])}, variance of y {fmt(C[1][1])}, covariance{' '}
                {fmt(C[0][1])}.
              </span>
            )}
            {stage === 3 &&
              (pca.isotropic ? (
                <span className="mt-1 block font-semibold">
                  The cloud spreads equally in every direction (both eigenvalues {fmt(pc1.value)}), so
                  no direction is principal. Drag a point to break the tie.
                </span>
              ) : (
                <span className="mt-1 block">
                  <Tag color={COLOR.i}>PC1</Tag> points along {fmtVec(pc1.vector)} with variance{' '}
                  {fmt(pc1.value)} ({fmt(share, 0)}% of the total).{' '}
                  <Tag color={COLOR.j}>PC2</Tag> points along {fmtVec(pc2.vector)} with variance{' '}
                  {fmt(pc2.value)}. Each arrow is 2 × √variance long, roughly where the cloud thins
                  out.
                  {project &&
                    ` Keeping only PC1 stores one number per point instead of two and keeps ${fmt(share, 0)}% of the spread.`}
                </span>
              ))}
            <span className="mt-1 block text-muted">
              Drag any point (or focus it and use the arrow keys); everything updates.
            </span>
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={pcaCode(points)} output={pcaOutput(points, [pc2.value, pc1.value])} />
          </div>
        </>
      }
    >
      <p>
        Principal component analysis (PCA) asks: in which direction does this data spread out the
        most? Each purple dot is one data example with two features. Real datasets have hundreds,
        and PCA is how you squeeze them down to the few directions that matter.
      </p>
      <p>
        It is three steps. Click through them on the right.
      </p>
      <p>
        <strong>1. Centre the data.</strong> Subtract the mean from every point, so the cloud sits
        around the origin. Without this, step 2 would measure distance from (0, 0), which has
        nothing to do with the shape of the cloud.
      </p>
      <p>
        <strong>2. Build the covariance matrix.</strong> With the centred points as the rows of a
        matrix <Tex>{String.raw`X_c`}</Tex> and n = {points.length} points:
      </p>
      <Tex block>
        {String.raw`C = \frac{X_c^{\mathsf T} X_c}{n - 1} = \begin{bmatrix} ${fmt(C[0][0])} & ${fmt(C[0][1])} \\ ${fmt(C[1][0])} & ${fmt(C[1][1])} \end{bmatrix}`}
      </Tex>
      <p>
        The diagonal holds the variance (average squared distance from the mean) along x and along
        y. The off-diagonal entry, the covariance, says whether x and y rise together (positive),
        move oppositely (negative) or not at all (zero). C is symmetric, which guarantees real
        eigenvalues and perpendicular eigenvectors.
      </p>
      <p>
        <strong>3. Take the eigenvectors of C.</strong> They are the principal directions, and
        each eigenvalue is the variance of the data along its eigenvector:
      </p>
      <Tex block>
        {String.raw`C\,\mathbf{v}_1 = ${fmt(pc1.value)}\,\mathbf{v}_1, \qquad C\,\mathbf{v}_2 = ${fmt(pc2.value)}\,\mathbf{v}_2`}
      </Tex>
      <p>
        Be clear about what is going on: <strong>eigenvectors belong to a matrix</strong>. The
        cloud of points does not have eigenvectors. PCA applies the eigenvector idea to one
        particular matrix, the covariance of the centred data, and that matrix&rsquo;s eigenvectors
        happen to be the directions of greatest and least spread.
      </p>
      <p>
        Switch on <em>Keep only PC1</em> to see dimensionality reduction: each point is replaced
        by its shadow on PC1, one number instead of two. Drag the points into a thin line and the
        variance along PC2 drops towards 0: almost nothing is lost by throwing it away.
      </p>
      <p>
        In the code, <code>X.mean(axis=0)</code> takes the mean of each column, <code>.T</code> is
        the transpose and <code>np.linalg.eigh</code> is the eigen-solver for symmetric matrices.
        It lists the eigenvalues smallest first, so PC1 is the <em>last</em> one.
      </p>
      <p className="text-sm text-muted">
        What the picture leaves out: with d features, C is a d×d matrix and has d principal
        directions. Keeping the top 50 of 768, say, is the same move as keeping PC1 here, just in
        a space you cannot draw.
      </p>
    </Step>
  )
}
