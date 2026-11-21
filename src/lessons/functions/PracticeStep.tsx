import { Plot } from 'mafs'
import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { NumberField } from '../../components/NumberField'
import { CoordPoint, Plane } from '../../components/Plane'
import { Button, Readout, Step } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { FunctionMachine } from './FunctionMachine'
import { apply, points, range, ruleText, solvedChecks } from './fn'
import type { Rule } from './fn'

const START: Rule = { m: 1, b: 0 }
/** Inputs whose outputs the tasks talk about. */
const PROBES = [0, 1, 2, 4, 7]

const ITEMS: Challenge[] = [
  {
    id: 'pair',
    title: 'Two given outputs',
    task: <p className="m-0">Build a machine with f(2) = 7 and f(4) = 11.</p>,
    insight: (
      <p className="m-0">
        Going from input 2 to 4 (up 2) made the output go from 7 to 11 (up 4): 2 more output per 1
        more input, so m = 2. Then b = 3 makes f(2) = 4 + 3 = 7.
      </p>
    ),
  },
  {
    id: 'start',
    title: 'Start low, climb fast',
    task: <p className="m-0">Build a machine with f(0) = −2 and f(1) = 1.</p>,
    insight: (
      <p className="m-0">
        f(0) is always just b, because m × 0 = 0. So b = −2, and stepping from 0 to 1 adds m, which
        must be 3. The output for 0 is where the line crosses the vertical axis.
      </p>
    ),
  },
  {
    id: 'flat',
    title: 'A machine that ignores you',
    task: <p className="m-0">Build a machine that outputs 4 whatever you feed in.</p>,
    insight: (
      <p className="m-0">
        m = 0 throws the input away, leaving f(x) = 4: a flat line. Still a function (each input
        has exactly one output), just a dull one. A model stuck like this has learned nothing from
        its input.
      </p>
    ),
  },
  {
    id: 'undo',
    title: 'Undo 2x + 1',
    task: (
      <p className="m-0">
        Build the machine that reverses f(x) = 2x + 1: feeding it 7 gives back 3, and feeding it 1
        gives back 0.
      </p>
    ),
    insight: (
      <p className="m-0">
        Undo the steps in reverse order, as with equations: subtract 1, then halve. That is x / 2 −
        0.5, so m = 0.5 and b = −0.5. This undo machine is called the <em>inverse</em> function.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [rule, setRuleState] = useState<Rule>(START)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const setRule = (next: Rule) => {
    setRuleState(next)
    const solved = solvedChecks(next)
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  const pts = points(rule, range(-3, 3))

  return (
    <Step
      n={6}
      kind="Practice"
      title="Build these machines"
      visual={
        <>
          <FunctionMachine rule={rule} input={2} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-display text-xl italic">f(x) =</span>
            <NumberField label="Practice: multiply by m" value={rule.m} onChange={(m) => setRule({ ...rule, m })} accent={COLOR.v} />
            <span className="font-display text-xl italic">x +</span>
            <NumberField label="Practice: then add b" value={rule.b} onChange={(b) => setRule({ ...rule, b })} accent={COLOR.v} />
            <Button variant="secondary" onClick={() => setRule(START)}>
              Reset
            </Button>
          </div>
          <div className="mt-3">
            <Plane label="Practice plane: the current rule as a line and points" extent={8}>
              <Plot.OfX y={(x) => apply(rule, x)} color={COLOR.ghost} opacity={0.6} weight={2} />
              {pts.map((q) => (
                <CoordPoint key={q[0]} at={q} color={COLOR.v} />
              ))}
            </Plane>
          </div>
          <Readout>
            f(x) = {ruleText(rule)}.{' '}
            {PROBES.map((x) => `f(${x}) = ${fmt(apply(rule, x)).replace('-', '−')}`).join(', ')}.
          </Readout>
        </>
      }
    >
      <p>
        No answers are shown. Set m and b until the machine does what each task asks; a task ticks
        itself as soon as your rule does it. The readout lists the outputs the tasks mention.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
