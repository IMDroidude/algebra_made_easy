import { Line, Polyline, Text } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MatrixInput } from '../../components/MatrixInput'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { approxEqualVec } from '../../linalg'
import type { Mat2 } from '../../linalg'
import { LAYER_X, START_W1, START_W2, layerSnippet, network, networkGrid, texMat } from './content'

export function ApplyStep() {
  const [W1, setW1] = useState<Mat2>(START_W1)
  const [W2, setW2] = useState<Mat2>(START_W2)
  const [withRelu, setWithRelu] = useState(false)

  const snippet = layerSnippet(W1, W2, withRelu)
  const { Y, W, collapsed, same } = snippet
  const hidden = LAYER_X.map((x) => network(W1, W2, x, withRelu).h)
  const grid = networkGrid(W1, W2, withRelu)
  const differs = Y.map((y, k) => !approxEqualVec(y, collapsed[k]))

  return (
    <Step
      n={5}
      kind="Apply"
      title="Stacking layers, and why networks need a kink"
      visual={
        <>
          <Plane label="Four data points passed through two layers; the grid shows how the whole network bends the plane">
            {grid.map((pts, k) => (
              <Polyline key={k} points={pts} color={COLOR.grid} weight={1} strokeOpacity={0.45} fillOpacity={0} />
            ))}
            {withRelu &&
              collapsed.map((q, k) =>
                differs[k] ? (
                  <g key={`w${k}`}>
                    <Line.Segment point1={q} point2={Y[k]} color={COLOR.i} style="dashed" weight={1.5} />
                    <CoordPoint at={q} color={COLOR.i} />
                    <Text x={q[0]} y={q[1]} attach="s" attachDistance={14} size={13} color={COLOR.i}>
                      Wx{k + 1}
                    </Text>
                  </g>
                ) : null,
              )}
            {LAYER_X.map((q, k) => (
              <g key={`x${k}`}>
                <CoordPoint at={q} color={COLOR.ghost} />
                <Text x={q[0]} y={q[1]} attach="s" attachDistance={14} size={13} color={COLOR.ghost}>
                  x{k + 1}
                </Text>
              </g>
            ))}
            {Y.map((q, k) => (
              <g key={`y${k}`}>
                <CoordPoint at={q} color={COLOR.v} />
                <Text x={q[0]} y={q[1]} attach="n" attachDistance={14} size={14} color={COLOR.v}>
                  y{k + 1}
                </Text>
              </g>
            ))}
          </Plane>
          <div className="mt-3">
            <Toggle checked={withRelu} onChange={setWithRelu}>
              Put a ReLU between the two layers
            </Toggle>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
            <MatrixInput value={W1} onChange={setW1} name="W1" />
            <MatrixInput value={W2} onChange={setW2} name="W2" />
          </div>
          <Readout>
            {LAYER_X.map((x, k) => (
              <span key={k} className="block">
                x{k + 1} = {fmtVec(x)} → hidden {fmtVec(hidden[k])} → <Tag color={COLOR.v}>y{k + 1}</Tag>{' '}
                = {fmtVec(Y[k])}
                {differs[k] && (
                  <>
                    , but <Tag color={COLOR.i}>Wx{k + 1}</Tag> = {fmtVec(collapsed[k])}
                  </>
                )}
              </span>
            ))}
            <span className="mt-1 block font-semibold">
              {same
                ? `Every output equals W x with the single matrix W = W2 W1, rows ${fmtVec(W[0])} and ${fmtVec(W[1])}. The two layers are really one.`
                : `${differs.filter(Boolean).length} of ${LAYER_X.length} outputs differ from W x: no single matrix can replace these two layers any more.`}
            </span>
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        A neural network is layers stacked on top of each other: the output of one layer is the
        input of the next. With two linear layers (leaving out the bias for now):
      </p>
      <Tex block>{String.raw`\mathbf{y} = W_2(W_1\mathbf{x})`}</Tex>
      <p>
        That is &ldquo;W1 first, then W2&rdquo;, which you now know is a single matrix:
      </p>
      <Tex block>{String.raw`W_2(W_1\mathbf{x}) = (W_2 W_1)\,\mathbf{x} = W\mathbf{x}`}</Tex>
      <p>With your W1 and W2 (edit them next to the plane):</p>
      <Tex block>{String.raw`W = W_2W_1 = ${texMat(W2)}${texMat(W1)} = ${texMat(W)}`}</Tex>
      <p>
        So two linear layers can always be squashed into one. So can a hundred: a deep stack of
        linear layers can only do what one matrix does. Edit <strong>W1</strong> and{' '}
        <strong>W2</strong> and look at the grid: it always stays a straight, evenly spaced grid.
      </p>
      <p>
        Real networks put an <strong>activation function</strong> between the layers. The most
        common is <strong>ReLU</strong>, which replaces every negative number with 0:
      </p>
      <Tex block>{String.raw`\mathbf{y} = W_2\,\mathrm{ReLU}(W_1\mathbf{x}), \qquad \mathrm{ReLU}(z) = \max(0, z)`}</Tex>
      <p>
        Switch it on. The grid lines now <em>bend</em> wherever a hidden value crosses 0, and the
        outputs no longer match <Tag color={COLOR.i}>Wx</Tag>, what the single matrix would
        give. That kink is the whole point: it lets each extra layer add something new, so deep
        networks can draw curved boundaries that no single matrix can.
      </p>
      <p>
        In the code, <code>np.maximum(0, …)</code> is ReLU applied to every entry, and{' '}
        <code>np.allclose</code> checks whether two arrays are equal up to rounding.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real layers have hundreds of dimensions and a bias, and
        their weight matrices are usually not square. The argument is the same in any size:
        without an activation, any stack of layers multiplies out to one matrix.
      </p>
      <p>
        <strong>Explore further:</strong> in the Playground&rsquo;s{' '}
        <Link to="/playground?lab=network">neural network lab</Link> you can watch a small network
        learn to tell cats from tigers. Load experiment 4, which sets the activation to
        &ldquo;Linear&rdquo;, and see it fail: the same collapse into one matrix shown here.{' '}
        <a href="https://playground.tensorflow.org" target="_blank" rel="noopener noreferrer">
          TensorFlow Playground
        </a>{' '}
        is the larger tool the lab is modelled on.
      </p>
    </Step>
  )
}
