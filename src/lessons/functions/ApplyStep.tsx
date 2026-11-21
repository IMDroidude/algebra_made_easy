import { Line, Plot, Text } from 'mafs'
import { useState } from 'react'
import { NumberField } from '../../components/NumberField'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint } from '../../components/Plane'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { HOUSES } from '../../data/houses'
import { fmt, isInteger, numpyPrint } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { isZero } from '../../linalg'
import { DataPlane } from './DataPlane'
import { apply, errors, numpyExpr, roundTo, ruleTex, ruleText } from './fn'
import type { Rule } from './fn'

/** The shared houses: floor area in sqft, price in $k. */
const SQFT = HOUSES.map((h) => h.sqft)
const PRICES = HOUSES.map((h) => h.priceK)

/** What training finds for these houses, rounded: price ≈ 0.22 × sqft + 30. */
const TRAINED: Rule = { m: 0.22, b: 30 }

const signed = (x: number) => (isZero(x) ? '0' : x > 0 ? `+${fmt(x)}` : `−${fmt(-x)}`)

export function ApplyStep() {
  const [model, setModel] = useState<Rule>(TRAINED)

  const preds = SQFT.map((x) => apply(model, x))
  const errs = errors(model, SQFT, PRICES)
  const integer = isInteger(model.m, model.b)

  const code = [
    'import numpy as np',
    '',
    'def model(sqft):',
    `    return ${numpyExpr(model, 'sqft')}`,
    '',
    `sqft = np.array([${SQFT.join(', ')}])`,
    'print(model(sqft))   # predicted prices in $k',
  ].join('\n')
  const output = numpyPrint(preds, integer)

  const errCode = [
    '# continuing the code in step 5',
    `y = np.array([${PRICES.join(', ')}])   # actual prices`,
    'print(model(sqft) - y)   # each prediction\'s miss',
  ].join('\n')
  const errOutput = numpyPrint(errs, integer)

  return (
    <>
      <Step
        n={5}
        kind="Apply"
        title="A model is a function: data in, prediction out"
        visual={
          <>
            <DataPlane
              label="Eight houses, size against price: actual prices and the model's predictions"
              x={[-250, 2700]}
              y={[-60, 680]}
              xLines={500}
              yLines={100}
            >
              <Plot.OfX y={(x) => apply(model, x)} color={COLOR.v} opacity={0.5} weight={2} />
              {SQFT.map((x, k) => (
                <g key={HOUSES[k].id}>
                  {!isZero(errs[k]) && (
                    <Line.Segment point1={[x, PRICES[k]]} point2={[x, preds[k]]} color={COLOR.i} style="dashed" weight={2} />
                  )}
                  <CoordPoint at={[x, PRICES[k]]} color={COLOR.ghost} />
                  <CoordPoint at={[x, preds[k]]} color={COLOR.v} />
                </g>
              ))}
              <Text x={2650} y={25} attach="nw" size={13} color={COLOR.ghost}>
                sqft →
              </Text>
              <Text x={60} y={645} attach="e" size={13} color={COLOR.ghost}>
                ↑ price ($k)
              </Text>
            </DataPlane>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-display text-xl italic">price =</span>
              <NumberField
                label="weight w"
                value={model.m}
                step={0.01}
                min={-1}
                max={1}
                onChange={(m) => setModel({ ...model, m: roundTo(m) })}
                accent={COLOR.v}
              />
              <span className="font-display text-xl italic">× sqft +</span>
              <NumberField
                label="bias b"
                value={model.b}
                step={5}
                min={-300}
                max={300}
                onChange={(b) => setModel({ ...model, b: roundTo(b) })}
                accent={COLOR.v}
              />
              <Button variant="secondary" onClick={() => setModel(TRAINED)}>
                Trained values
              </Button>
            </div>
            <Readout>
              The model price = {ruleText(model, ' × sqft')} predicts{' '}
              {HOUSES.map((h, k) => `${h.id} ${fmt(preds[k])}`).join(', ')} ($k). It is off by{' '}
              {fmt(Math.max(...errs.map(Math.abs)))} at most.
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
          Here is a real (if tiny) one: it predicts the price of a house (in $k) from its floor
          area (in square feet):
        </p>
        <Tex block>{String.raw`\text{price} = f(\text{sqft}) = ${ruleTex(model, String.raw`\,\text{sqft}`)}`}</Tex>
        <p>
          The <Tag color={COLOR.ghost}>grey</Tag> points are the course&rsquo;s eight houses at the
          prices they actually sold for; the <Tag color={COLOR.v}>purple</Tag> points are what the
          model predicts for them, and the dashed lines are its mistakes. The two numbers in the
          rule have ML names: the multiplier is a <strong>weight</strong> (w) and the added number
          is a <strong>bias</strong> (b). Change them and watch every prediction move.
        </p>
        <p>
          Nobody types these numbers in by hand. <em>Training</em> picks the w and b that make the
          dashed lines as short as possible: the &ldquo;solving for the weights&rdquo; from the
          last lesson. After training, using the model is just calling the function, on a whole
          array of inputs at once, as the code shows.
        </p>
        <p className="text-sm text-muted">
          What this picture leaves out: real models take many numbers in (an image is millions of
          pixel values, a sentence is thousands of numbers) and have millions of weights, so you
          cannot draw them as one line. A language model is still a function: text in, a score for
          every possible next word out.
        </p>
      </Step>

      <RunningExample title="The model as a table: f(sqft) for every house">
        <p>
          A function can also be read as a table: one row per input. Here is your model{' '}
          <Tex>{String.raw`f(\text{sqft}) = ${ruleTex(model, String.raw`\,\text{sqft}`)}`}</Tex>{' '}
          next to what each house really sold for. Change w and b above and the table follows.
        </p>
        <HouseTable
          columns={['sqft', 'priceK']}
          extra={[
            { heading: 'f(sqft)', cell: (h) => fmt(preds[HOUSES.indexOf(h)]) },
            { heading: 'miss ($k)', cell: (h) => signed(errs[HOUSES.indexOf(h)]) },
          ]}
          caption="Prediction f(sqft) against the actual price; miss = prediction − actual"
        />
        <p>
          With the trained values the model is close for most houses, but not exact: it prices
          the Country cottage (H) ${fmt(apply(TRAINED, HOUSES[7].sqft) - HOUSES[7].priceK)}k too
          high, because it only looks at size and that cottage is 15 km out of town. A function of
          one input cannot see the other features; later lessons give the model all three.
        </p>
        <NumpySnippet code={errCode} output={errOutput} />
      </RunningExample>
    </>
  )
}
