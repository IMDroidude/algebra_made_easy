import { Line, Text } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, numpyPrint } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import type { Vec2 } from '../../linalg'
import { lineEquation, lineY, pyFloat } from './lineMath'
import { SliderField } from './SliderField'

/** A batch of inputs, fed through the neuron all at once in the NumPy code. */
const BATCH = [-2, -1, 0, 1, 2]

const snapHalf = snapTo(0.5)
/** The input point lives on the x-axis. */
const onXAxis = (q: Vec2): Vec2 => [snapHalf(q)[0], 0]

/** Turns a number into a Python float literal: 2 → "2.0". */
const lit = (x: number) => pyFloat(Number(fmt(x)))

export function ApplyStep() {
  const [w, setW] = useState(1.5)
  const [b, setB] = useState(0.5)
  const [input, setInput] = useState<Vec2>([2, 0])

  const x = input[0]
  const y = lineY(w, b, x)
  const wx = lineY(w, 0, x)
  const ys = BATCH.map((xi) => lineY(w, b, xi))

  const code = [
    'import numpy as np',
    '',
    `w = ${lit(w)}   # weight (the slope)`,
    `b = ${lit(b)}   # bias (the intercept)`,
    '',
    `x = ${lit(x)}`,
    'print(w * x + b)',
    '',
    `xs = np.array([${BATCH.join(', ')}])   # five inputs at once`,
    'print(w * xs + b)',
  ].join('\n')

  const box = 'rounded-lg border border-line bg-surface px-3 py-2 text-center font-mono text-sm'

  return (
    <Step
      n={5}
      kind="Apply"
      title="A single neuron is y = wx + b"
      visual={
        <>
          <Plane label="A neuron's input on the x-axis and its output on the line y = wx + b">
            <Line.ThroughPoints point1={[0, b]} point2={[1, lineY(w, b, 1)]} color={COLOR.v} />
            <Line.Segment point1={input} point2={[x, y]} color={COLOR.ghost} style="dashed" weight={1.5} />
            <CoordPoint at={[x, y]} color={COLOR.result} />
            <Text x={x} y={y} attach={w >= 0 ? 'w' : 'e'} attachDistance={14} size={15} color={COLOR.result}>
              output y
            </Text>
            <DraggablePoint value={input} onChange={setInput} color={COLOR.i} snap={onXAxis} />
            <Text x={x} y={0} attach="n" attachDistance={32} size={15} color={COLOR.i}>
              input x
            </Text>
          </Plane>
          <div
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
            aria-label="The neuron's calculation, step by step"
            role="group"
          >
            <span className={box} style={{ borderColor: COLOR.i }}>
              x = {fmt(x)}
            </span>
            <span aria-hidden="true">→</span>
            <span className={box}>
              × w ({fmt(w)}) = {fmt(wx)}
            </span>
            <span aria-hidden="true">→</span>
            <span className={box}>
              + b ({fmt(b)}) = {fmt(y)}
            </span>
            <span aria-hidden="true">→</span>
            <span className={box} style={{ borderColor: COLOR.result }}>
              y = {fmt(y)}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            <SliderField
              symbol="w"
              label="weight w"
              value={w}
              onChange={setW}
              min={-3}
              max={3}
              step={0.25}
              accent={COLOR.j}
            />
            <SliderField
              symbol="b"
              label="bias b"
              value={b}
              onChange={setB}
              min={-3}
              max={3}
              step={0.25}
              accent={COLOR.result}
            />
          </div>
          <Readout>
            The neuron computes <Tag color={COLOR.v}>{lineEquation(w, b)}</Tag>.{' '}
            <Tag color={COLOR.i}>Input x = {fmt(x)}</Tag> gives {fmt(w)} × {fmt(x)} + {fmt(b)} ={' '}
            <Tag color={COLOR.result}>output {fmt(y)}</Tag>.
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code} output={`${pyFloat(y)}\n${numpyPrint(ys, false)}`} />
          </div>
        </>
      }
    >
      <p>
        The basic unit of a neural network is a <strong>neuron</strong>. With one input, here is
        everything it does before its final squashing step:
      </p>
      <Tex block>{String.raw`y = w\,x + b`}</Tex>
      <p>
        That is <em>y = mx + b</em> with new names. The slope is called the <strong>weight</strong>{' '}
        <em>w</em>: how strongly the output responds to the input. The intercept is called the{' '}
        <strong>bias</strong> <em>b</em>: the output when the input is 0, a baseline the neuron
        starts from.
      </p>
      <p>
        Drag the <Tag color={COLOR.i}>input x</Tag> along the axis and watch the{' '}
        <Tag color={COLOR.result}>output</Tag> ride up and down the line. Then change w and b:
        that is what &ldquo;training&rdquo; changes. A model learns by nudging its weights and
        biases until its outputs land close to the right answers. In step 6 you will do that
        nudging by hand. First, the same line has a second job, just below.
      </p>
      <p>
        In the code, <code>w * xs + b</code> works on a whole array at once: NumPy multiplies every
        entry by w and adds b to each. That is how a model handles a batch of inputs in one go.
      </p>
      <p>
        <strong>Where this goes next.</strong> Real data has many features, not one. Then x becomes
        a vector, the single weight becomes a matrix <strong>W</strong>, and the line becomes{' '}
        <Tex>{String.raw`\mathbf{y} = W\mathbf{x} + \mathbf{b}`}</Tex>. Same shape of idea, more
        dimensions. That is lesson 4.1,{' '}
        <Link to="/lessons/matrices-as-transformations">Matrices as transformations</Link>.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: a real neuron takes many inputs (one weight for each), and
        passes <em>wx + b</em> through a non-linear &ldquo;activation&rdquo; function at the end.
        The straight line is the part that every neuron shares.
      </p>
    </Step>
  )
}
