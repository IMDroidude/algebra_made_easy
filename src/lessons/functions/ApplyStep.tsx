import { Line, Plot, Text } from 'mafs'
import { useState } from 'react'
import { NumberField } from '../../components/NumberField'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, isInteger, numpyPrint } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { isZero } from '../../linalg'
import { DataPlane } from './DataPlane'
import { apply, errors, numpyArray, numpyExpr, ruleTex } from './fn'
import type { Rule } from './fn'

/** Floor area (in 100 m²) and the price each house actually sold for (in $100k). */
const SIZES = [1, 1.5, 2, 3]
const PRICES = [3, 4, 5.5, 7]

const TRAINED: Rule = { m: 2, b: 1 }

export function ApplyStep() {
  const [model, setModel] = useState<Rule>(TRAINED)

  const preds = SIZES.map((x) => apply(model, x))
  const errs = errors(model, SIZES, PRICES)

  const code = [
    'import numpy as np',
    '',
    'def model(size):',
    `    # w = ${fmt(model.m)}, b = ${fmt(model.b)}`,
    `    return ${numpyExpr(model, 'size')}`,
    '',
    `sizes = ${numpyArray(SIZES)}`,
    'print(model(sizes))',
  ].join('\n')
  // 1.5 in the inputs makes the array float, whatever w and b are.
  const output = numpyPrint(preds, isInteger(model.m, model.b, ...SIZES))

  return (
    <Step
      n={5}
      kind="Apply"
      title="A model is a function: data in, prediction out"
      visual={
        <>
          <DataPlane
            label="House sizes against prices: actual prices and the model's predictions"
            x={[-0.4, 4.2]}
            y={[-0.6, 9.4]}
          >
            <Plot.OfX y={(x) => apply(model, x)} color={COLOR.v} opacity={0.5} weight={2} />
            {SIZES.map((x, k) => (
              <g key={x}>
                {!isZero(errs[k]) && (
                  <Line.Segment point1={[x, PRICES[k]]} point2={[x, preds[k]]} color={COLOR.i} style="dashed" weight={2} />
                )}
                <CoordPoint at={[x, PRICES[k]]} color={COLOR.ghost} />
                <CoordPoint at={[x, preds[k]]} color={COLOR.v} />
              </g>
            ))}
            <Text x={4.1} y={0.3} attach="nw" size={13} color={COLOR.ghost}>
              size →
            </Text>
            <Text x={0.35} y={9.2} attach="se" size={13} color={COLOR.ghost}>
              ↑ price
            </Text>
          </DataPlane>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-display text-xl italic">price =</span>
            <NumberField label="weight w" value={model.m} onChange={(m) => setModel({ ...model, m })} accent={COLOR.v} />
            <span className="font-display text-xl italic">× size +</span>
            <NumberField label="bias b" value={model.b} onChange={(b) => setModel({ ...model, b })} accent={COLOR.v} />
            <Button variant="secondary" onClick={() => setModel(TRAINED)}>
              Trained values
            </Button>
          </div>
          <Readout>
            {SIZES.map((x, k) => (
              <span key={x} className="block">
                Size {fmt(x)}: predicted <Tag color={COLOR.v}>{fmt(preds[k])}</Tag>, actual{' '}
                <Tag color={COLOR.ghost}>{fmt(PRICES[k])}</Tag>
                {isZero(errs[k])
                  ? ', spot on.'
                  : `, ${fmt(Math.abs(errs[k]))} too ${errs[k] > 0 ? 'high' : 'low'}.`}
              </span>
            ))}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code} output={output} />
          </div>
        </>
      }
    >
      <p>
        Strip away the hype and every AI model is a function. Data goes in, a prediction comes
        out, and the same input always gives the same output.
      </p>
      <p>
        Here is a real (if tiny) one: it predicts the price of a house from its floor area. Sizes
        are in hundreds of square metres, prices in hundreds of thousands of dollars, so the numbers
        stay small:
      </p>
      <Tex block>{String.raw`\text{price} = f(\text{size}) = ${ruleTex(model, String.raw`\,\text{size}`)}`}</Tex>
      <p>
        The <Tag color={COLOR.ghost}>grey</Tag> points are four houses that actually sold; the{' '}
        <Tag color={COLOR.v}>purple</Tag> points are what the model predicts for them, and the
        dashed lines are its mistakes. The two numbers in the rule have ML names: the multiplier is
        a <strong>weight</strong> (w) and the added number is a <strong>bias</strong> (b). Change
        them and watch every prediction move.
      </p>
      <p>
        Nobody types these numbers in by hand. <em>Training</em> picks the w and b that make the
        dashed lines as short as possible: the &ldquo;solving for the weights&rdquo; from the last
        lesson. After training, using the model is just calling the function, on a whole array of
        inputs at once, as the code shows.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real models take many numbers in (an image is millions of
        pixel values, a sentence is thousands of numbers) and have millions of weights, so you
        cannot draw them as one line. A language model is still a function: text in, a score for
        every possible next word out.
      </p>
    </Step>
  )
}
