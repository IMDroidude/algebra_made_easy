import { Line, Transform } from 'mafs'
import { useState } from 'react'
import { MatrixInput } from '../../components/MatrixInput'
import { PlaneLabel } from '../../components/PlaneLabel'
import { NumberField } from '../../components/NumberField'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, Plane, TransformedGrid } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec, isInteger, numpyMat2, numpyPrint, numpyVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { add, apply2 } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'

/** Four data points, one per row, as they would sit in a dataset. */
const X: Vec2[] = [
  [1, 1],
  [2, 0.5],
  [-1, 1.5],
  [-1.5, -1],
]

const X_LITERAL = [
  '# one data point per row',
  `X = np.array([${X.map((q) => `[${fmt(q[0])}, ${fmt(q[1])}]`).join(',\n              ')}])`,
].join('\n')

export function ApplyStep() {
  const [W, setW] = useState<Mat2>([
    [1.5, 0],
    [0.5, 1],
  ])
  const [useBias, setUseBias] = useState(false)
  const [b, setB] = useState<Vec2>([1.5, 1])

  const shift: Vec2 = useBias ? b : [0, 0]
  const Y = X.map((q) => add(apply2(W, q), shift))
  const integer = isInteger(...W.flat(), ...X.flat(), ...shift)

  const code = [
    'import numpy as np',
    '',
    numpyMat2('W', W),
    ...(useBias ? [numpyVec('b', b)] : []),
    X_LITERAL,
    '',
    useBias ? 'Y = X @ W.T + b' : 'Y = X @ W.T',
    'print(Y)',
  ].join('\n')

  return (
    <Step
      n={5}
      kind="Apply"
      title="This is what a neural network layer does"
      visual={
        <>
          <Plane label="Four data points before and after the layer">
            <Transform translate={shift}>
              <TransformedGrid matrix={W} color={COLOR.grid} />
            </Transform>
            {X.map((q, k) => (
              <Line.Segment
                key={`s${k}`}
                point1={q}
                point2={Y[k]}
                color={COLOR.ghost}
                style="dashed"
                weight={1.5}
              />
            ))}
            {X.map((q, k) => (
              <g key={`x${k}`}>
                <CoordPoint at={q} color={COLOR.ghost} />
                <PlaneLabel x={q[0]} y={q[1]} attach="s" size={13} color={COLOR.ghost}>
                  x{k + 1}
                </PlaneLabel>
              </g>
            ))}
            {Y.map((q, k) => (
              <g key={`y${k}`}>
                <CoordPoint at={q} color={COLOR.v} />
                <PlaneLabel x={q[0]} y={q[1]} attach="n" color={COLOR.v}>
                  y{k + 1}
                </PlaneLabel>
              </g>
            ))}
            {useBias && (
              <>
                <CoordPoint at={b} color={COLOR.result} />
                <PlaneLabel x={b[0]} y={b[1]} attach="e" distance={14} color={COLOR.result}>
                  origin lands here
                </PlaneLabel>
              </>
            )}
          </Plane>
          <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
            <MatrixInput value={W} onChange={setW} name="W" />
            <div>
              <Toggle checked={useBias} onChange={setUseBias}>
                Add a bias <strong>b</strong>
              </Toggle>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-display text-2xl italic" aria-hidden="true">
                  b =
                </span>
                <fieldset disabled={!useBias} className="m-0 flex gap-2 border-0 p-0 disabled:opacity-40">
                  <NumberField
                    label="b, x component"
                    value={b[0]}
                    onChange={(n) => setB([n, b[1]])}
                    accent={COLOR.result}
                  />
                  <NumberField
                    label="b, y component"
                    value={b[1]}
                    onChange={(n) => setB([b[0], n])}
                    accent={COLOR.result}
                  />
                </fieldset>
              </div>
            </div>
          </div>
          <Readout>
            {X.map((q, k) => (
              <span key={k} className="block">
                x{k + 1} = {fmtVec(q)} → <Tag color={COLOR.v}>y{k + 1}</Tag> = {fmtVec(Y[k])}
              </span>
            ))}
            <span className="mt-1 block font-semibold">
              {useBias
                ? `The origin (0, 0) is sent to ${fmtVec(b)}. It moved, so this map is affine, not linear.`
                : 'The origin (0, 0) stays at (0, 0), as it must for any linear map.'}
            </span>
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code} output={numpyPrint(Y, integer)} />
          </div>
        </>
      }
    >
      <p>
        A layer in a neural network (called <em>dense</em>, <em>fully connected</em> or{' '}
        <em>linear</em>) takes each input vector and multiplies it by a matrix of weights:
      </p>
      <Tex block>{String.raw`\mathbf{y} = W\mathbf{x}`}</Tex>
      <p>
        That is the transformation you have been dragging around. On the right, four data points{' '}
        <Tag color={COLOR.ghost}>x1…x4</Tag> go in and four points <Tag color={COLOR.v}>y1…y4</Tag>{' '}
        come out. Edit <strong>W</strong> and watch all four move together, because they all ride
        on the same warped grid. Training a network means nudging the numbers in W until the
        outputs land where you want them.
      </p>
      <p>
        Real layers have one more ingredient, the <strong>bias</strong>:
      </p>
      <Tex block>{String.raw`\mathbf{y} = W\mathbf{x} + \mathbf{b}`}</Tex>
      <p>
        Switch the bias on. <strong>W</strong> still stretches and tilts the space; <strong>b</strong>{' '}
        then slides everything by the same amount. Look at the origin: it no longer stays put. A
        linear map always keeps the origin fixed, so <em>Wx + b</em> is strictly an{' '}
        <strong>affine</strong> map: linear, plus a shift. The shift matters, because without it a
        layer could never move the origin, however it was trained.
      </p>
      <p>
        One coding detail: datasets store one point per row, so the code applies W to every row at
        once with <code>X @ W.T</code>. The <code>.T</code> is a transpose, covered in a later
        lesson; for now, read it as &ldquo;apply W to each row of X&rdquo;.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real layers work in hundreds or thousands of dimensions, and
        W is often not square (it might turn 768 numbers into 256). You cannot draw that, but the
        rule is the same one you see here: the columns of W say where each basis direction lands.
      </p>
    </Step>
  )
}
