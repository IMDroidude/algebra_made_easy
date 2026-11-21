import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, CoordPoint, Plane } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { Readout, Tag } from '../../components/ui'
import type { CardinalDirection } from 'mafs'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { scale } from '../../linalg'
import { HOUSE_CODE, HOUSE_COV, HOUSE_IDS, HOUSE_OUTPUT, HOUSE_PC1_SHARE, HOUSE_PCS, HOUSE_POINTS } from './houses'

const [pc1, pc2] = HOUSE_PCS

/** Where each house's label sits, chosen so labels do not collide with each other or PC1. */
const LABEL_AT: Record<string, CardinalDirection> = { A: 's', B: 'nw', C: 'w', D: 'nw', E: 'n', F: 'se', G: 'se', H: 'w' }
const arrowTip = (q: { value: number; vector: [number, number] }) => scale(q.vector, 2 * Math.sqrt(q.value))

export function HouseExample() {
  return (
    <RunningExample title="The main direction of the houses: overall size">
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div>
          <Plane label="The eight houses as standardised size and bedrooms, with their two principal directions" extent={3}>
            {HOUSE_POINTS.map((p, k) => (
              <g key={HOUSE_IDS[k]}>
                <CoordPoint at={p} color={COLOR.v} />
                <PlaneLabel x={p[0]} y={p[1]} attach={LABEL_AT[HOUSE_IDS[k]]} distance={8} size={13} color={COLOR.v}>
                  {HOUSE_IDS[k]}
                </PlaneLabel>
              </g>
            ))}
            <Arrow tip={arrowTip(pc1)} color={COLOR.i} label="PC1" />
          </Plane>
          <Readout>
            x-axis: size, y-axis: bedrooms, both standardised. The houses lie close to a diagonal.{' '}
            <Tag color={COLOR.i}>PC1</Tag> points along {fmtVec(pc1.vector)} with variance{' '}
            {fmt(pc1.value, 3)}; PC2, across the diagonal, points along {fmtVec(pc2.vector)}{' '}
            with variance only {fmt(pc2.value, 3)}.
          </Readout>
        </div>
        <div>
          <p>
            Take two features, size and bedrooms, and run PCA. First standardise each one: subtract
            its mean and divide by its standard deviation. Without that, sqft (in the thousands)
            would dominate any spread you measure.
          </p>
          <p>The covariance matrix of the standardised pair is</p>
          <Tex block>{String.raw`C = \begin{bmatrix} ${fmt(HOUSE_COV[0][0], 3)} & ${fmt(HOUSE_COV[0][1], 3)} \\ ${fmt(HOUSE_COV[1][0], 3)} & ${fmt(HOUSE_COV[1][1], 3)} \end{bmatrix}`}</Tex>
          <p>
            Its eigenvalues are {fmt(pc1.value, 3)} and {fmt(pc2.value, 3)}. The first eigenvector,
            {' '}{fmtVec(pc1.vector)}, mixes both features equally: it means &ldquo;bigger house, more
            bedrooms&rdquo;, or simply <strong>overall size</strong>. It carries{' '}
            {fmt(100 * HOUSE_PC1_SHARE, 1)}% of the spread, so one number per house, its position
            along PC1, describes these two features almost completely.
          </p>
        </div>
      </div>
      <div className="my-5">
        <NumpySnippet code={HOUSE_CODE} output={HOUSE_OUTPUT} />
      </div>
      <p className="text-sm text-muted">
        NumPy may return either sign of an eigenvector, (0.71, 0.71) or (−0.71, −0.71); both describe
        the same line, so the snippet prints only the eigenvalues.
      </p>
    </RunningExample>
  )
}
