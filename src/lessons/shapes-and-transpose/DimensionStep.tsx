import { Line, Text } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec, isInteger, numpyPrint, numpyVec } from '../../lib/format'
import { snapTo } from '../../lib/snap'
import { COLOR } from '../../lib/palette'
import { add, isZero, transpose } from '../../linalg'
import type { Matrix, Vec2 } from '../../linalg'
import { GridInput } from './GridInput'
import { TransposeExplorer } from './TransposeExplorer'
import { asShown, lift, numpyMat, sameOutputDirection, squash } from './shapes'

type Mode = 'squash' | 'lift'

const snapPoint = snapTo(0.5)
/** The input of a 2×1 matrix is one number: a point that can only slide along the x-axis. */
const snapToAxis = (p: Vec2): Vec2 => [snapPoint(p)[0], 0]

/** Wraps negative numbers in brackets so products read correctly: 2 · (−1). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

const LIMIT = 5.2
const onPlane = (q: Vec2) => Math.abs(q[0]) <= LIMIT && Math.abs(q[1]) <= LIMIT

export function DimensionStep({ seeA }: { seeA: Matrix }) {
  const [mode, setMode] = useState<Mode>('squash')
  const [mRaw, setM] = useState<Matrix>([[1, 1]])
  const [v, setV] = useState<Vec2>([2, 1])
  const [nRaw, setN] = useState<Matrix>([[1], [1]])
  const [tPoint, setT] = useState<Vec2>([2, 0])

  const M = asShown(mRaw)
  const N = asShown(nRaw)
  const t = tPoint[0]
  const s = squash(M, v)
  const dir = sameOutputDirection(M)
  const Nt = lift(N, t)
  const col: Vec2 = [N[0][0], N[1][0]]
  const liftCollapsed = isZero(col[0]) && isZero(col[1])

  const [[a, b]] = M
  const [x, y] = v

  const squashCode = `import numpy as np\n\n${numpyMat('M', M)}\n${numpyVec('v', v)}\n\nprint(M @ v)`
  const liftCode = `import numpy as np\n\n${numpyMat('N', N)}\n${numpyVec('t', [t])}\n\nprint(N @ t)`

  return (
    <Step
      n={4}
      kind="Understand"
      title="Non-square matrices change the number of dimensions"
      visual={
        <>
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Which matrix to show">
            <Button
              variant={mode === 'squash' ? 'primary' : 'secondary'}
              aria-pressed={mode === 'squash'}
              onClick={() => setMode('squash')}
            >
              1×2: plane → line
            </Button>
            <Button
              variant={mode === 'lift' ? 'primary' : 'secondary'}
              aria-pressed={mode === 'lift'}
              onClick={() => setMode('lift')}
            >
              2×1: line → plane
            </Button>
          </div>

          {mode === 'squash' ? (
            <>
              <Plane label="A draggable point v in the plane and the single number Mv on the number line along the x-axis">
                <Line.Segment point1={[-8, 0]} point2={[8, 0]} color={COLOR.result} weight={4} opacity={0.8} />
                {dir && (
                  <Line.ThroughPoints
                    point1={v}
                    point2={add(v, dir)}
                    color={COLOR.ghost}
                    style="dashed"
                    weight={1.5}
                  />
                )}
                {onPlane([s, 0]) && (
                  <>
                    <Line.Segment point1={v} point2={[s, 0]} color={COLOR.v} opacity={0.4} style="dashed" />
                    <CoordPoint at={[s, 0]} color={COLOR.result} />
                    <Text x={s} y={0} attach="n" attachDistance={30} size={15} color={COLOR.result}>
                      {`Mv = ${fmt(s)}`}
                    </Text>
                  </>
                )}
                <DraggablePoint value={v} onChange={setV} color={COLOR.v} />
                <Text x={v[0]} y={v[1]} attach="se" attachDistance={16} size={16} color={COLOR.v}>
                  v
                </Text>
              </Plane>
              <div className="mt-4">
                <GridInput
                  value={mRaw}
                  onChange={setM}
                  name="M"
                  columnLabels={['× x', '× y']}
                  colors={[COLOR.i, COLOR.j]}
                />
              </div>
              <Readout>
                <Tag color={COLOR.v}>v</Tag> = {fmtVec(v)} goes in (2 numbers);{' '}
                <Tag color={COLOR.result}>Mv</Tag> = {fmt(a)}·{p(x)} + {fmt(b)}·{p(y)} = {fmt(s)}{' '}
                comes out (1 number)
                {!onPlane([s, 0]) && ', off the drawn part of the line'}.{' '}
                {dir
                  ? 'Every point on the dashed line gives the same number: they all land on the same spot.'
                  : 'M is all zeros, so every point lands on 0.'}
              </Readout>
              <div className="mt-4">
                <NumpySnippet code={squashCode} output={numpyPrint([s], isInteger(a, b, x, y))} />
              </div>
            </>
          ) : (
            <>
              <Plane label="A draggable number t on the number line along the x-axis, and the point Nt it is lifted to in the plane">
                <Line.Segment point1={[-8, 0]} point2={[8, 0]} color={COLOR.result} weight={4} opacity={0.8} />
                {!liftCollapsed && (
                  <Line.ThroughPoints point1={[0, 0]} point2={col} color={COLOR.v} style="dashed" weight={1.5} />
                )}
                <Arrow tip={col} color={COLOR.i} label="N·1" weight={2} />
                <Arrow tip={Nt} color={COLOR.v} label="Nt" />
                <DraggablePoint value={tPoint} onChange={setT} color={COLOR.result} snap={snapToAxis} />
                <Text x={t} y={0} attach="n" attachDistance={30} size={15} color={COLOR.result}>
                  {`t = ${fmt(t)}`}
                </Text>
              </Plane>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <GridInput value={nRaw} onChange={setN} name="N" columnLabels={['1 lands at']} colors={[COLOR.i]} />
                <Button variant="secondary" onClick={() => setN(transpose(mRaw))}>
                  Set N to M.T
                </Button>
              </div>
              <Readout>
                <Tag color={COLOR.result}>t</Tag> = {fmt(t)} goes in (1 number);{' '}
                <Tag color={COLOR.v}>Nt</Tag> = {fmtVec(Nt)} comes out (2 numbers)
                {!onPlane(Nt) && ', off the drawn part of the plane'}.{' '}
                {liftCollapsed
                  ? 'N is all zeros, so every number lands on the origin.'
                  : `The whole number line lands on the dashed line through ${fmtVec(col)}: the outputs live in the plane, but only on one line of it.`}
              </Readout>
              <div className="mt-4">
                <NumpySnippet code={liftCode} output={numpyPrint(Nt, isInteger(...col, t))} />
              </div>
            </>
          )}
        </>
      }
    >
      <p>
        Use the two buttons by the plane to switch between a 1×2 and a 2×1 matrix. In both, the number line is drawn along the x-axis
        to save space; it is really a separate, one-dimensional space.
      </p>
      <p>
        <strong>1×2, plane → line.</strong> M has 2 columns, so it takes 2 numbers. It has 1 row,
        so it gives 1 number back:
      </p>
      <Tex block>
        {String.raw`M\mathbf{v} = \begin{bmatrix} ${fmt(a)} & ${fmt(b)} \end{bmatrix} \begin{bmatrix} ${fmt(x)} \\ ${fmt(y)} \end{bmatrix} = ${p(a)}\cdot${p(x)} + ${p(b)}\cdot${p(y)} = ${fmt(s)}`}
      </Tex>
      <p>
        Drag <Tag color={COLOR.v}>v</Tag> along the dashed line: the output does not change. A whole
        line of inputs is squeezed into each output number. That information is gone.
      </p>
      <p>
        <strong>2×1, line → plane.</strong> N has 1 column, so it takes 1 number. Its column is
        where the number 1 lands, and every other number t lands t times as far:
      </p>
      <Tex block>
        {String.raw`N t = \begin{bmatrix} ${fmt(col[0])} \\ ${fmt(col[1])} \end{bmatrix} ${p(t)} = \begin{bmatrix} ${fmt(Nt[0])} \\ ${fmt(Nt[1])} \end{bmatrix}`}
      </Tex>
      <p>
        The outputs have 2 numbers, but they all sit on one line through the origin. Lifting into
        the plane does not fill the plane: one number of input can only describe one direction.
      </p>
      <h3 className="mt-6 mb-2 font-display text-xl">Transpose: rows become columns</h3>
      <p>
        The 2×1 matrix [[1], [1]] is the 1×2 matrix [[1, 1]] stood on end. That flip is the{' '}
        <strong>transpose</strong>, written Aᵀ or <code>A.T</code> in NumPy: row i of A becomes
        column i of Aᵀ, so the entry at row i, column j moves to row j, column i, and shape (m, n)
        becomes (n, m). Pick any entry:
      </p>
      <TransposeExplorer matrix={seeA} />
      <p>
        Careful: the transpose is <em>not</em> an undo. Press &ldquo;Set N to M.T&rdquo; and lift
        the number M gave you; you do not get v back, because the squash threw information away.
      </p>
      <h3 className="mt-6 mb-2 font-display text-xl">Identity and zero come in every size</h3>
      <p>
        The identity has to match the side it sits on. For A of shape (2, 3), the identity on the
        left is 2×2 (<code>np.eye(2)</code>) and on the right 3×3 (<code>np.eye(3)</code>):
      </p>
      <Tex block>{String.raw`I_2\,A = A = A\,I_3`}</Tex>
      <p>
        A zero matrix can have any shape too. <code>np.zeros((2, 3))</code> accepts vectors with 3
        numbers and sends every one of them to (0, 0): the most extreme squash there is.
      </p>
    </Step>
  )
}
