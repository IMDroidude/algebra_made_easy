import { Line, Text } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec, numpyPrint } from '../../lib/format'
import { WORDS, X, xLiteral } from './data'
import { COLOR } from '../../lib/palette'
import { matMul, transpose } from '../../linalg'
import type { Matrix } from '../../linalg'
import { GridInput } from './GridInput'
import { asShown, numpyMat, pyShape, shapeOf } from './shapes'

const SHAPES: [string, string, string][] = [
  ['X: the batch', '(4, 2)', '(32, 768)'],
  ['W: the weights (out, in)', '(1, 2)', '(256, 768)'],
  ['W.T', '(2, 1)', '(768, 256)'],
  ['X @ W.T: the outputs', '(4, 1)', '(32, 256)'],
]

export function ApplyStep() {
  const [wRaw, setW] = useState<Matrix>([[1, 1]])
  const W = asShown(wRaw)
  const Y = matMul(X, transpose(W))
  const ys = Y.map((r) => r[0])

  // Neighbouring outputs on the line get their labels at alternating depths so they do not overlap.
  const order = ys.map((y, k) => [y, k] as const).sort((p, q) => p[0] - q[0])
  const depth = new Map(order.map(([, k], rank) => [k, rank % 2]))

  const code = [
    'import numpy as np',
    '',
    '# a batch of 4 embeddings, one per row: shape (4, 2)',
    xLiteral(),
    '# weights, stored as (outputs, inputs): shape (1, 2)',
    numpyMat('W', W),
    '',
    'Y = X @ W.T   # (4, 2) @ (2, 1) -> (4, 1)',
    'print(Y.shape)',
    'print(Y)',
  ].join('\n')

  return (
    <Step
      n={5}
      kind="Apply"
      title="A batch of embeddings through a projection layer"
      visual={
        <>
          <Plane label="Four word embeddings in the plane and their projected values on the number line along the x-axis">
            <Line.Segment point1={[-8, 0]} point2={[8, 0]} color={COLOR.result} weight={4} opacity={0.8} />
            {X.map((q, k) => (
              <Line.Segment
                key={`s${k}`}
                point1={[q[0], q[1]]}
                point2={[ys[k], 0]}
                color={COLOR.ghost}
                style="dashed"
                weight={1.5}
              />
            ))}
            {X.map((q, k) => (
              <g key={`x${k}`}>
                <CoordPoint at={[q[0], q[1]]} color={COLOR.v} />
                <Text
                  x={q[0]}
                  y={q[1]}
                  attach={q[1] >= 0 ? 's' : 'n'}
                  attachDistance={18}
                  size={14}
                  color={COLOR.v}
                >
                  {WORDS[k]}
                </Text>
              </g>
            ))}
            {ys.map((y, k) =>
              Math.abs(y) <= 5.2 ? (
                <g key={`y${k}`}>
                  <CoordPoint at={[y, 0]} color={COLOR.result} />
                  <Text
                    x={y}
                    y={0}
                    attach="n"
                    attachDistance={30 + 16 * (depth.get(k) ?? 0)}
                    size={13}
                    color={COLOR.result}
                  >
                    {WORDS[k]}
                  </Text>
                </g>
              ) : null,
            )}
          </Plane>
          <div className="mt-4">
            <GridInput
              value={wRaw}
              onChange={setW}
              name="W"
              columnLabels={['× feature 1', '× feature 2']}
              colors={[COLOR.i, COLOR.j]}
            />
          </div>
          <Readout>
            {X.map((q, k) => (
              <span key={k} className="block">
                <Tag color={COLOR.v}>{WORDS[k]}</Tag> {fmtVec(q)} →{' '}
                <Tag color={COLOR.result}>{fmt(ys[k])}</Tag>
                {Math.abs(ys[k]) > 5.2 && ' (off the drawn part of the line)'}
              </span>
            ))}
            <span className="mt-1 block font-semibold">
              Shapes: X {pyShape(shapeOf(X))} @ W.T {pyShape(shapeOf(transpose(W)))} →{' '}
              {pyShape(shapeOf(Y))}: 4 words in, 4 words out, 2 numbers each became 1.
            </span>
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code} output={`${pyShape(shapeOf(Y))}\n${numpyPrint(Y, false)}`} />
          </div>
        </>
      }
    >
      <p>
        Language models turn each word (or token) into an <strong>embedding</strong>: a vector of
        numbers. Data is stored <strong>one example per row</strong>, so a batch of 4 embeddings
        with 2 numbers each is a matrix X of shape (4, 2).
      </p>
      <p>
        A projection layer turns each embedding into a shorter one. Here W has shape (1, 2): it
        takes 2 numbers and gives 1, exactly the squash from steps 3 and 4. Libraries such as
        PyTorch store a layer&rsquo;s weights as (outputs, inputs), the same way we write matrices.
      </p>
      <p>
        But the data has examples in rows, not columns, so you cannot write <code>W @ X</code>:
        (1, <strong>2</strong>) @ (<strong>4</strong>, 2) fails. Transposing W fixes the inner sizes
        and applies W to every row at once:
      </p>
      <Tex block>
        {String.raw`\underbrace{X}_{(4,\,\textcolor{${COLOR.v}}{2})}\;\underbrace{W^{\mathsf T}}_{(\textcolor{${COLOR.v}}{2},\,1)} = \underbrace{Y}_{(4,\,1)}`}
      </Tex>
      <p>
        Edit <strong>W</strong> and watch the four words slide along the number line. Each weight
        says how much of each feature counts in the single number that comes out. Try to make two
        words land on the same spot: the layer can no longer tell them apart.
      </p>
      <p>Real models do the same with bigger numbers. The shape rule does not change:</p>
      <div className="overflow-x-auto">
        <table className="mb-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-1 pr-3 font-semibold">Matrix</th>
              <th className="py-1 pr-3 font-semibold">Here</th>
              <th className="py-1 font-semibold">A real layer</th>
            </tr>
          </thead>
          <tbody>
            {SHAPES.map(([name, toy, real]) => (
              <tr key={name} className="border-b border-line">
                <td className="py-1 pr-3">{name}</td>
                <td className="py-1 pr-3 font-mono">{toy}</td>
                <td className="py-1 font-mono">{real}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted">
        What this picture leaves out: real embeddings have hundreds of numbers, such as 768, and a
        projection might map them to 256. Nobody can draw 768 dimensions; 2 → 1 is the smallest
        version of the same thing. A batch of 32 vectors of length 768 times W.T of shape (768, 256)
        gives 32 vectors of length 256. Like the squash you saw, 768 → 256 has to merge some
        different inputs into the same output; training chooses W so that what is merged is what
        the model can afford to lose.
      </p>
    </Step>
  )
}
