import { Line, Plot } from 'mafs'
import { useState } from 'react'
import { LessonHeader } from '../../components/LessonHeader'
import { NumberField } from '../../components/NumberField'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec, isInteger, numpyPrint } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import type { Vec2 } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { FunctionMachine } from './FunctionMachine'
import { PracticeStep } from './PracticeStep'
import { RULE_2X_PLUS_1, apply, extentFor, feed, numpyExpr, points, range, ruleTex, ruleText } from './fn'
import type { Rule } from './fn'

/** Inputs can be fed in from −3 to 3, in steps of 0.5. */
const LIMIT = 3
const snapToAxis = ([x]: Vec2): Vec2 => [Math.max(-LIMIT, Math.min(LIMIT, Math.round(x * 2) / 2)), 0]

const PREDICT_XS = range(-2, 2)
const PREDICT_AFTER: Rule = { m: 3, b: 1 }

const UNDERSTAND_XS = range(-3, 3)

export function Lesson() {
  const [input, setInput] = useState(3)
  const [fed, setFed] = useState<number[]>([])
  const [showLine, setShowLine] = useState(false)
  const [rule, setRule] = useState<Rule>(RULE_2X_PLUS_1)
  const reveal = useTween(1400)

  const f = RULE_2X_PLUS_1
  const fedPts = points(f, fed)
  const preview: Vec2 = [input, apply(f, input)]

  const predictRule: Rule = { m: 2 + (PREDICT_AFTER.m - 2) * reveal.t, b: 1 }
  const predictPts = points(predictRule, PREDICT_XS)

  const ruleXs = UNDERSTAND_XS
  const rulePts = points(rule, ruleXs)
  const extent4 = extentFor(rulePts)
  const ys = rulePts.map((q) => q[1])

  const numpyCode = [
    'import numpy as np',
    '',
    '# the inputs -3, -2, ..., 3',
    'x = np.arange(-3, 4)',
    '# the rule, run on every input at once',
    `y = ${numpyExpr(rule)}`,
    '',
    'print(x)',
    'print(y)',
  ].join('\n')
  const numpyOut = `${numpyPrint(ruleXs, true)}\n${numpyPrint(ys, isInteger(rule.m, rule.b))}`

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="functions">
        A function is a rule that turns each input into exactly one output. By the end of this
        lesson you will be able to run a rule by hand, see it as a line of points, apply it to a
        whole array at once in NumPy, and say why every AI model is one.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="A machine that turns numbers into numbers"
        visual={
          <>
            <FunctionMachine rule={RULE_2X_PLUS_1} input={3} />
            <Readout>
              Input 3 goes in. The machine multiplies by 2 (giving 6), then adds 1. Output: 7.
            </Readout>
          </>
        }
      >
        <p>
          Picture a machine with a slot on each side. You drop a number in on the left. Inside, the
          machine does the same two things every time: multiply by 2, then add 1. A new number
          comes out on the right.
        </p>
        <p>
          That machine is a <strong>function</strong>. Mathematicians give it a name, usually{' '}
          <em>f</em>, and write its rule like this:
        </p>
        <Tex block>{String.raw`f(x) = 2x + 1`}</Tex>
        <p>
          Read it as &ldquo;f of x is two x plus one&rdquo;. The <em>x</em> is the input (a
          variable, as in the last lesson) and <em>f(x)</em> is the output. Feed in 3 and you get{' '}
          <em>f</em>(3) = 7.
        </p>
        <p>
          You already know this idea from code: <code>def f(x): return 2 * x + 1</code>. Same
          input, same output, every time.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Every input drops a point"
        visual={
          <>
            <FunctionMachine rule={f} input={input} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                Input x
                <NumberField label="Input x" value={input} onChange={setInput} min={-LIMIT} max={LIMIT} />
              </label>
              <Button onClick={() => setFed(feed(fed, input))}>Feed {fmt(input)} into f</Button>
              <Button variant="secondary" onClick={() => setFed(range(-LIMIT, LIMIT))}>
                Feed in −3 to 3
              </Button>
              <Button variant="secondary" disabled={fed.length === 0} onClick={() => setFed([])}>
                Clear points
              </Button>
            </div>
            <div className="mt-3">
              <Plane label="Points (x, f(x)) for every input fed into f" extent={8} height={420}>
                {showLine && <Plot.OfX y={(x) => apply(f, x)} color={COLOR.ghost} opacity={0.7} weight={2} />}
                {fedPts.map((q) => (
                  <CoordPoint key={q[0]} at={q} color={COLOR.v} />
                ))}
                <Line.Segment point1={[input, 0]} point2={preview} color={COLOR.result} style="dashed" weight={2} />
                <CoordPoint at={preview} color={COLOR.result} opacity={0.6} />
                <DraggablePoint value={[input, 0]} onChange={(q) => setInput(q[0])} color={COLOR.ghost} snap={snapToAxis} />
              </Plane>
            </div>
            <div className="mt-3">
              <Toggle checked={showLine} onChange={setShowLine}>
                Show every possible input at once
              </Toggle>
            </div>
            <Readout>
              Input {fmt(input)} gives f({fmt(input)}) = {fmt(apply(f, input))}: the{' '}
              <Tag color={COLOR.result}>green</Tag> point at {fmtVec(preview)}.{' '}
              {fed.length === 0
                ? 'No points dropped yet.'
                : `${fed.length} point${fed.length === 1 ? '' : 's'} dropped: ${fedPts.map((q) => fmtVec(q)).join(', ')}.`}
              {showLine && ' The grey line shows the output for every input, including fractions.'}
            </Readout>
            {fed.length > 0 && <InOutTable pts={fedPts} />}
          </>
        }
      >
        <p>
          Choose an input, either by typing it or by dragging the grey point along the x-axis (or
          focusing it and pressing the arrow keys). The machine shows the working, and the{' '}
          <Tag color={COLOR.result}>green</Tag> point sits above your input at the height of the
          output.
        </p>
        <p>
          Press <strong>Feed into f</strong> to drop a <Tag color={COLOR.v}>purple</Tag> point there
          for good. Every point is a pair (input, output), so its coordinates are (x, f(x)). Feed in
          a few different numbers. What shape are the points making?
        </p>
        <p>
          Now try a fraction such as 0.5. Where does its point land? Then switch on the line, which
          is every possible input fed in at once.
        </p>
        <p>
          Feeding 3 in twice gives the same point twice. That is what makes it a function: one
          input, one output, always.
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you look: change the rule"
        visual={
          <>
            <Plane label="Points for x from −2 to 2 under the rule in the question" extent={8}>
              {PREDICT_XS.map((x) => (
                <CoordPoint key={`g${x}`} at={[x, apply(RULE_2X_PLUS_1, x)]} color={COLOR.ghost} opacity={reveal.t > 0 ? 0.6 : 1} />
              ))}
              {reveal.t > 0 && (
                <>
                  <Plot.OfX y={(x) => apply(predictRule, x)} color={COLOR.v} opacity={0.5} weight={2} />
                  {predictPts.map((q) => (
                    <CoordPoint key={`p${q[0]}`} at={q} color={COLOR.v} />
                  ))}
                </>
              )}
            </Plane>
            <Readout>
              {reveal.t === 0
                ? `Showing f(x) = 2x + 1 at x = −2 … 2: ${points(RULE_2X_PLUS_1, PREDICT_XS).map((q) => fmtVec(q)).join(', ')}. Lock in a prediction to change the rule.`
                : `Grey: 2x + 1. Purple: ${ruleText(predictRule)}, at ${predictPts.map((q) => fmtVec(q)).join(', ')}. The point at x = 0 has not moved.`}
            </Readout>
          </>
        }
      >
        <p>
          The grey points are f(x) = 2x + 1 for the inputs −2, −1, 0, 1 and 2. Now change the
          machine&rsquo;s first box from &ldquo;× 2&rdquo; to &ldquo;× 3&rdquo;:
        </p>
        <Tex block>{String.raw`f(x) = 2x + 1 \;\longrightarrow\; f(x) = 3x + 1`}</Tex>
        <Predict
          question="What happens to the five points?"
          onReveal={reveal.play}
          onRetry={() => reveal.reset(0)}
          options={[
            {
              id: 'up1',
              label: 'Every point moves up by 1.',
              correct: false,
              explain: (
                <p className="m-0">
                  The 2 became a 3, but that number <em>multiplies</em> x. Each output grows by 1 ×
                  x, so the change depends on the input: +2 at x = 2, −2 at x = −2, nothing at x =
                  0. Only a change to the +1 would move every point by the same amount.
                </p>
              ),
            },
            {
              id: 'pivot',
              label: 'The line gets steeper, pivoting around the point (0, 1), which stays put.',
              correct: true,
              explain: (
                <p className="m-0">
                  At x = 0 the multiplier does nothing: 3 × 0 + 1 = 2 × 0 + 1 = 1. Further from 0,
                  the bigger multiplier matters more, so points to the right rise and points to the
                  left fall. The number that multiplies x sets how steep the line is.
                </p>
              ),
            },
            {
              id: 'shift',
              label: 'The line moves up, keeping the same slant.',
              correct: false,
              explain: (
                <p className="m-0">
                  That is what changing the <em>+ 1</em> does: it adds the same amount to every
                  output. Changing the multiplier changes the slant itself.
                </p>
              ),
            },
            {
              id: 'triple',
              label: 'Every output becomes 1.5 times as big (3 instead of 2).',
              correct: false,
              explain: (
                <p className="m-0">
                  Only the multiplication step changed, not the +1 after it. At x = 1 the output
                  goes from 3 to 4, not to 4.5. And at x = 0 the output stays 1 whatever the
                  multiplier is.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="The rule, the table and the line are the same thing"
        visual={
          <>
            <FunctionMachine rule={rule} input={3} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-display text-xl italic">
                f(x) =
              </span>
              <NumberField label="multiply by m" value={rule.m} onChange={(m) => setRule({ ...rule, m })} accent={COLOR.v} />
              <span className="font-display text-xl italic">x +</span>
              <NumberField label="then add b" value={rule.b} onChange={(b) => setRule({ ...rule, b })} accent={COLOR.v} />
              <Button variant="secondary" onClick={() => setRule(RULE_2X_PLUS_1)}>
                Back to 2x + 1
              </Button>
            </div>
            <div className="mt-3">
              <Plane label="The rule as points for x from −3 to 3 and as a line" extent={extent4} height={420}>
                <Plot.OfX y={(x) => apply(rule, x)} color={COLOR.ghost} opacity={0.6} weight={2} />
                {rulePts.map((q) => (
                  <CoordPoint key={q[0]} at={q} color={COLOR.v} />
                ))}
              </Plane>
            </div>
            <Readout>
              f(x) = {ruleText(rule)}. Points: {rulePts.map((q) => fmtVec(q)).join(', ')}.
            </Readout>
            <InOutTable pts={rulePts} />
            <div className="mt-4">
              <NumpySnippet code={numpyCode} output={numpyOut} />
            </div>
          </>
        }
      >
        <p>
          The machine had two numbers inside: what to multiply by and what to add. Call them{' '}
          <em>m</em> and <em>b</em>, and every machine of this kind has the rule
        </p>
        <Tex block>{String.raw`f(x) = m\,x + b \qquad\text{here}\qquad f(x) = ${ruleTex(rule)}`}</Tex>
        <p>
          Edit m and b. The same rule appears three ways at once: as a{' '}
          <strong>formula</strong>, as a <strong>table</strong> of inputs and outputs, and as{' '}
          <strong>points on the plane</strong>. They always agree, because they are one thing seen
          three ways. For example
        </p>
        <Tex block>{String.raw`f(3) = ${fmt(rule.m)} \cdot 3 ${rule.b < 0 ? '-' : '+'} ${fmt(Math.abs(rule.b))} = ${fmt(apply(rule, 3))}`}</Tex>
        <p>
          A rule of the form m x + b always gives a straight line, which is why these are called{' '}
          <em>linear</em> functions. The next lesson is all about m and b.
        </p>
        <p>
          In NumPy you never loop over inputs. <code>np.arange(-3, 4)</code> makes the array of
          whole numbers from −3 up to <em>but not including</em> 4. Writing{' '}
          <code>{numpyExpr(rule)}</code> on an array runs the rule on every element at once and
          returns an array of outputs. This is called <em>vectorising</em>, and it is how all model
          code is written.
        </p>
      </Step>

      <ApplyStep />
      <PracticeStep />
    </article>
  )
}

/** Inputs and outputs side by side. */
function InOutTable({ pts }: { pts: Vec2[] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="border-collapse text-sm">
        <caption className="sr-only">Inputs and outputs</caption>
        <tbody>
          <tr>
            <th scope="row" className="border border-line bg-surface px-2 py-1 text-left font-semibold">
              x
            </th>
            {pts.map((q) => (
              <td key={q[0]} className="border border-line px-2 py-1 text-center font-mono">
                {fmt(q[0])}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="border border-line bg-surface px-2 py-1 text-left font-semibold">
              f(x)
            </th>
            {pts.map((q) => (
              <td key={q[0]} className="border border-line px-2 py-1 text-center font-mono" style={{ color: COLOR.v }}>
                {fmt(q[1])}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
