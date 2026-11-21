import { Coordinates, Line, Mafs, Point } from 'mafs'
import { NumpySnippet } from '../../components/NumpySnippet'
import { PlaneLabel } from '../../components/PlaneLabel'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { Button, Readout } from '../../components/ui'
import { HOUSES, housesNumpy } from '../../data/houses'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { HOUSE_OUTPUT, IN_M2, MATRIX_LITERAL, SIZE_BEDS, SQFT_TO_M2, housesAt } from './houseMath'

const CODE = [
  'import numpy as np',
  '',
  housesNumpy(),
  '',
  'S = X[:, :2]    # keep two columns: sqft, bedrooms',
  MATRIX_LITERAL,
  'print(S @ A.T)  # A applied to every house (row) at once',
].join('\n')

/** Running example for 4.1: one matrix moves all eight houses at once. */
export function HouseExample() {
  const move = useTween(1400)
  const now = housesAt(move.t)
  const done = move.t === 1

  return (
    <RunningExample title="One matrix moves every house">
      <p>
        Take two features of each house, (size in sqft, bedrooms), as a 2D vector. To switch the
        size to square metres, multiply sqft by {SQFT_TO_M2} and leave bedrooms alone. That is a
        matrix:
      </p>
      <Tex block>
        {String.raw`A = \begin{bmatrix} ${SQFT_TO_M2} & 0 \\ 0 & 1 \end{bmatrix}`}
      </Tex>
      <Tex block>
        {String.raw`A\begin{bmatrix} \text{sqft} \\ \text{bedrooms} \end{bmatrix} = \begin{bmatrix} ${SQFT_TO_M2}\cdot\text{sqft} \\ \text{bedrooms} \end{bmatrix}`}
      </Tex>
      <p>
        Read it by columns, as in this lesson: î lands on ({SQFT_TO_M2}, 0), a squash along the
        size axis, and ĵ stays put. Press the button to apply A to all eight houses together.
      </p>
      <div
        role="group"
        aria-label="The eight houses as points: size across, bedrooms up. Applying A slides every house toward the bedrooms axis"
        className="overflow-hidden rounded-xl border border-line"
      >
        <Mafs height={280} pan={false} zoom={false} viewBox={{ x: [-250, 2680], y: [-0.35, 4.6], padding: 0.3 }} preserveAspectRatio={false}>
          <Coordinates.Cartesian
            subdivisions={false}
            xAxis={{ lines: 500, labels: (n) => String(n) }}
            yAxis={{ lines: 1, labels: false }}
          />
          {/* Bedroom numbers drawn by hand, a little left of the axis, so the squashed houses do not cover them. */}
          {[1, 2, 3, 4].map((n) => (
            <PlaneLabel key={`y${n}`} x={0} y={n} attach="w" distance={8} size={13} color="var(--muted)">
              {String(n)}
            </PlaneLabel>
          ))}
          {move.t > 0 &&
            SIZE_BEDS.map((p, k) => (
              <g key={`g${k}`}>
                <Line.Segment point1={p} point2={now[k]} color={COLOR.ghost} style="dashed" weight={1.5} />
                <Point x={p[0]} y={p[1]} color={COLOR.ghost} opacity={0.5} />
              </g>
            ))}
          {SIZE_BEDS.map((p, k) => (
            <PlaneLabel key={`l${k}`} x={p[0]} y={p[1]} attach="n" size={13} color={COLOR.ghost}>
              {HOUSES[k].id}
            </PlaneLabel>
          ))}
          {now.map((p, k) => (
            <Point key={`p${k}`} x={p[0]} y={p[1]} color={COLOR.v} />
          ))}
        </Mafs>
      </div>
      <p className="mt-2 mb-0 text-sm text-muted">
        Across: size ({done ? 'm² after A' : 'sqft'}). Up: bedrooms.
      </p>
      <div className="mt-3">
        {done ? (
          <Button variant="secondary" onClick={() => move.reset(0)}>
            Back to sqft
          </Button>
        ) : (
          <Button onClick={move.play} disabled={move.t > 0}>
            Apply A to every house
          </Button>
        )}
      </div>
      <Readout>
        {done
          ? `After A, every house slid toward the bedrooms axis by the same factor, ${SQFT_TO_M2}, and no house changed height. The sizes now run from ${fmt(Math.min(...IN_M2.map((p) => p[0])))} to ${fmt(Math.max(...IN_M2.map((p) => p[0])))} m².`
          : `Before A: sizes run from ${fmt(Math.min(...SIZE_BEDS.map((p) => p[0])))} to ${fmt(Math.max(...SIZE_BEDS.map((p) => p[0])))} sqft, bedrooms from ${fmt(Math.min(...SIZE_BEDS.map((p) => p[1])))} to ${fmt(Math.max(...SIZE_BEDS.map((p) => p[1])))}.`}
      </Readout>
      <HouseTable
        columns={['sqft', 'bedrooms']}
        extra={[{ heading: 'm² (after A)', cell: (h) => fmt(IN_M2[HOUSES.indexOf(h)][0]) }]}
      />
      <NumpySnippet code={CODE} output={HOUSE_OUTPUT} />
      <p className="mt-3 text-sm text-muted">
        <code>X[:, :2]</code> keeps all rows and the first two columns. Each house is a{' '}
        <em>row</em> of <code>S</code>, not a column, so NumPy writes <code>S @ A.T</code>: the
        same as computing A × house for every house. A real network layer does the same thing
        with a matrix it has learned, mixing features instead of only rescaling one.
      </p>
    </RunningExample>
  )
}
