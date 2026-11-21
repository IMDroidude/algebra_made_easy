import { Line, Text } from 'mafs'
import { useState } from 'react'
import { MatrixInput } from '../../components/MatrixInput'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmtVec, isInteger, numpyMat2, numpyPrint, numpyVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { apply2, det2 } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'
import { APPLY_W, APPLY_X } from './data'
import { asShown, collapseKind, imageDirection, sameOutputPartner, detText } from './determinant'

export function ApplyStep() {
  const [wRaw, setW] = useState<Mat2>(APPLY_W)
  const [x, setX] = useState<Vec2>(APPLY_X)
  const [showImage, setShowImage] = useState(false)

  const W = asShown(wRaw)
  const kind = collapseKind(W)
  const Wx = apply2(W, x)
  const x2 = sameOutputPartner(W, x)
  const image = imageDirection(W)
  const integer = isInteger(...W.flat(), ...x, ...(x2 ?? []))

  const code = [
    'import numpy as np',
    '',
    numpyMat2('W', W),
    numpyVec('x1', x),
    ...(x2 ? [numpyVec('x2', x2)] : []),
    '',
    'print(W @ x1)',
    ...(x2 ? ['print(W @ x2)'] : []),
  ].join('\n')
  const out = numpyPrint(Wx, integer)

  return (
    <Step
      n={5}
      kind="Apply"
      title="A zero determinant loses information"
      visual={
        <>
          <Plane label="A draggable input x, a second input x′ that lands on the same output, and the output Wx">
            {showImage && image && (
              <Line.ThroughPoints point1={[0, 0]} point2={image} color={COLOR.result} opacity={0.5} weight={2} />
            )}
            {x2 && kind === 'line' && (
              <Line.ThroughPoints point1={x} point2={x2} color={COLOR.ghost} style="dashed" weight={1.5} />
            )}
            {x2 && (
              <>
                <CoordPoint at={x2} color={COLOR.j} />
                <Text x={x2[0]} y={x2[1]} attach="se" attachDistance={14} size={15} color={COLOR.j}>
                  x′
                </Text>
              </>
            )}
            <CoordPoint at={Wx} color={COLOR.result} />
            <Text x={Wx[0]} y={Wx[1]} attach="se" attachDistance={14} size={15} color={COLOR.result}>
              Wx
            </Text>
            <DraggablePoint value={x} onChange={setX} color={COLOR.v} />
            <Text x={x[0]} y={x[1]} attach="sw" attachDistance={22} size={15} color={COLOR.v}>
              x
            </Text>
          </Plane>
          <div className="mt-3">
            <Toggle checked={showImage} onChange={setShowImage}>
              Show the line every output lands on
            </Toggle>
          </div>
          <div className="mt-4">
            <MatrixInput value={wRaw} onChange={setW} name="W" />
          </div>
          <Readout>
            <span className="block">
              Determinant {detText(det2(W))}. <Tag color={COLOR.v}>x</Tag> = {fmtVec(x)} goes to{' '}
              <Tag color={COLOR.result}>Wx</Tag> = {fmtVec(Wx)}.
            </span>
            <span className="mt-1 block">
              {kind === 'line' && x2 && (
                <>
                  <Tag color={COLOR.j}>x′</Tag> = {fmtVec(x2)} lands on the same output, and so does
                  every point on the dashed line through them. From Wx alone you cannot tell which
                  of them went in.
                </>
              )}
              {kind === 'point' && x2 && (
                <>
                  W is all zeros: <Tag color={COLOR.j}>x′</Tag> = {fmtVec(x2)} and every other input
                  land on (0, 0). Nothing about the input survives.
                </>
              )}
              {kind === 'none' && (
                <>
                  No other input lands on {fmtVec(Wx)}. Different inputs stay different, so the
                  layer could in principle be undone.
                </>
              )}
            </span>
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code} output={x2 ? `${out}\n${out}` : out} />
          </div>
        </>
      }
    >
      <p>
        A layer of a neural network applies a weight matrix W to its input. Suppose W has
        determinant 0:
      </p>
      <Tex block>{String.raw`W = \begin{bmatrix} 1 & 2 \\ 0.5 & 1 \end{bmatrix}, \qquad \det(W) = 1\cdot1 - 2\cdot0.5 = 0`}</Tex>
      <p>
        The whole plane collapses onto one line, so the layer&rsquo;s outputs have only one degree of
        freedom left, even though they are written with two numbers. Drag{' '}
        <Tag color={COLOR.v}>x</Tag>: there is always a second input{' '}
        <Tag color={COLOR.j}>x′</Tag> with exactly the same output, in fact a whole line of them.
      </p>
      <p>
        That is <strong>information loss</strong>. If two different inputs produce the same output,
        nothing that comes after this layer can tell them apart, however clever it is. In the
        snippet, <code>x1</code> and <code>x2</code> are different, yet both print the same thing.
      </p>
      <p>
        Now change one entry of W so the determinant is no longer 0. The partner disappears: every
        output comes from exactly one input, and no information is lost.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real layers have hundreds of dimensions, and a weight matrix
        that is nearly singular, or not square at all (768 → 256), merges many directions at once.
        The determinant only exists for square matrices; the general tool for counting how many
        directions survive is <em>rank</em>, in the next lesson.
      </p>
    </Step>
  )
}
