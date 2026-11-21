import { Line, Text } from 'mafs'
import { useState } from 'react'
import { MatrixInput } from '../../components/MatrixInput'
import { NumberField } from '../../components/NumberField'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { det2, inverse2 } from '../../linalg'
import { closestOnLine, nullSpace2, rank2, rowLine, solve2 } from '../../linalg/systems'
import type { Line2 } from '../../linalg/systems'
import type { Mat2, Vec2 } from '../../linalg'
import { SYSTEM_A, SYSTEM_B, SYSTEM_PRESETS, systemSnippet } from './data'
import { RANK_SHAPE, linearEqText, texMat2, texVec2 } from './text'

const ROW_COLORS = [COLOR.v, COLOR.j] as const
/** Where each row's label sits: the point of its line nearest to these spots. */
const LABEL_ANCHORS: Vec2[] = [
  [-3.2, 3.8],
  [3.2, -3.8],
]
const clampView = (p: Vec2): Vec2 => [Math.max(-4.4, Math.min(4.4, p[0])), Math.max(-4.6, Math.min(4.6, p[1]))]

const through = (l: Line2): [Vec2, Vec2] => [l.point, [l.point[0] + l.direction[0], l.point[1] + l.direction[1]]]

export function SystemsStep() {
  const [A, setA] = useState<Mat2>(SYSTEM_A)
  const [b, setB] = useState<Vec2>(SYSTEM_B)

  const rows = [rowLine(A[0], b[0]), rowLine(A[1], b[1])] as const
  const sol = solve2(A, b)
  const rank = rank2(A)
  const det = det2(A)
  const inv = inverse2(A)
  const ns = nullSpace2(A)
  const snippet = systemSnippet(A, b)
  const eq = [linearEqText(A[0], b[0]), linearEqText(A[1], b[1])]

  const outcome =
    sol.kind === 'unique'
      ? `The lines cross once, at x = ${fmt(sol.x[0])}, y = ${fmt(sol.x[1])}: exactly one solution.`
      : sol.kind === 'none'
        ? rank === 0
          ? 'A is the zero matrix, so the equations read 0 = something non-zero: no solution.'
          : 'The lines are parallel and never meet: no solution.'
        : sol.kind === 'line'
          ? 'Both equations describe the same line: every point on it is a solution, infinitely many.'
          : 'A and b are all zero: every point in the plane is a solution.'

  return (
    <Step
      n={4}
      kind="Understand"
      title="Ax = b: two lines, and the three things that can happen"
      visual={
        <>
          <Plane label="Each equation of the system drawn as a line; the solution is where they meet">
            {ns.dim === 1 && (
              <Line.ThroughPoints point1={[0, 0]} point2={ns.direction} color={COLOR.ghost} style="dashed" weight={1.5} />
            )}
            {rows.map((l, k) =>
              typeof l === 'string' ? null : (
                <g key={k}>
                  <Line.ThroughPoints
                    point1={through(l)[0]}
                    point2={through(l)[1]}
                    color={ROW_COLORS[k]}
                    weight={sol.kind === 'line' ? 5 - 2 * k : 3}
                  />
                  <Text
                    x={clampView(closestOnLine(l, LABEL_ANCHORS[k]))[0]}
                    y={clampView(closestOnLine(l, LABEL_ANCHORS[k]))[1]}
                    attach={k === 0 ? 'ne' : 'sw'}
                    attachDistance={10}
                    size={14}
                    color={ROW_COLORS[k]}
                  >
                    {`row ${k + 1}`}
                  </Text>
                </g>
              ),
            )}
            {sol.kind === 'unique' && <CoordPoint at={sol.x} color={COLOR.result} />}
          </Plane>
          <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-4">
            <MatrixInput value={A} onChange={setA} columnLabels={['times x', 'times y']} />
            <div className="flex items-end gap-2">
              <span className="pb-3 font-display text-2xl italic" aria-hidden="true">
                b =
              </span>
              <div className="grid gap-2 rounded-sm border-x-2 border-ink px-3 py-2">
                <NumberField label="b, row 1" value={b[0]} onChange={(n) => setB([n, b[1]])} accent={ROW_COLORS[0]} />
                <NumberField label="b, row 2" value={b[1]} onChange={(n) => setB([b[0], n])} accent={ROW_COLORS[1]} />
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SYSTEM_PRESETS.map((p) => (
              <Button
                key={p.id}
                variant="secondary"
                onClick={() => {
                  setA(p.A)
                  setB(p.b)
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <Readout>
            <span className="block">
              <Tag color={ROW_COLORS[0]}>Row 1</Tag>: {eq[0]}
              {rows[0] === 'nowhere' && ' (true for no point)'}
              {rows[0] === 'everywhere' && ' (true for every point)'}.{' '}
              <Tag color={ROW_COLORS[1]}>Row 2</Tag>: {eq[1]}
              {rows[1] === 'nowhere' && ' (true for no point)'}
              {rows[1] === 'everywhere' && ' (true for every point)'}.
            </span>
            <span className="mt-1 block font-semibold">{outcome}</span>
            <span className="mt-1 block">
              Rank {rank}: the outputs of A fill {RANK_SHAPE[rank]}.
              {ns.dim === 1 &&
                ` Null space (dashed grey): the line through the origin along ${fmtVec(ns.direction)}; A sends every point on it to (0, 0).`}
              {ns.dim === 2 && ' Null space: the whole plane.'}
            </span>
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        A system of two equations is a matrix question in disguise. &ldquo;Find x and y with{' '}
        {eq[0]} and {eq[1]}&rdquo; is
      </p>
      <Tex block>{String.raw`${texMat2(A)} \begin{bmatrix} x \\ y \end{bmatrix} = ${texVec2(b)} \qquad\text{or}\qquad A\mathbf{x} = \mathbf{b}`}</Tex>
      <p>
        Read it two ways. As a <em>transformation</em>: which input x does A send to b? If A has an
        undo, apply it to b:
      </p>
      <Tex block>
        {inv
          ? String.raw`\mathbf{x} = A^{-1}\mathbf{b} = \frac{1}{${fmt(det)}}\begin{bmatrix} ${fmt(A[1][1])} & ${fmt(-A[0][1])} \\ ${fmt(-A[1][0])} & ${fmt(A[0][0])} \end{bmatrix} ${texVec2(b)} = ${texVec2(sol.kind === 'unique' ? sol.x : [0, 0])}`
          : String.raw`\det A = ad - bc ${det === 0 ? '=' : '\\approx'} 0 \;\Rightarrow\; \frac{1}{\det A}\ \text{is undefined: no } A^{-1}`}
      </Tex>
      <p>
        That fraction is why the inverse blew up in step 2: a 2×2 inverse is &ldquo;swap a and d,
        negate b and c, divide by the determinant&rdquo;. As the determinant heads to 0, you divide
        by something tiny.
      </p>
      <p>
        As a <em>row picture</em>: each equation is a line on the plane, and a solution is a point on
        both. Two lines can do three things:
      </p>
      <ul className="mt-0 mb-4 list-disc pl-6">
        <li>
          <strong>cross once</strong>: one solution. A has rank 2 (its outputs fill the plane) and
          an inverse;
        </li>
        <li>
          <strong>be parallel</strong>: no solution. The rows are multiples of each other, so A has{' '}
          <strong>rank 1</strong>: its outputs all lie on one line, and b is off that line;
        </li>
        <li>
          <strong>be the same line</strong>: infinitely many. Still rank 1, but b is on the output
          line. Any solution plus any point of the <strong>null space</strong> is another solution,
          because A sends the null-space part to zero.
        </li>
      </ul>
      <p>
        The <strong>rank</strong> is the dimension of everything A can output: 2 for a plane, 1 for
        a line, 0 for the single point you get from the zero matrix. The 2 input dimensions are
        split between them: whatever the output loses, the null space gains (rank + null-space
        dimension = 2).
      </p>
      <p>
        Try the presets, then type your own. In the code, <code>np.linalg.solve(A, b)</code> finds x
        without building A⁻¹ (faster and more accurate), and <code>matrix_rank</code> counts the
        output dimensions. The last line rounds away float noise such as 1.9999999999999998.
      </p>
    </Step>
  )
}
