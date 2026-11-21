import { useState } from 'react'
import { NumberField } from '../../components/NumberField'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { isZero } from '../../linalg'
import { BalanceScale } from './BalanceScale'
import { bestWeight, eq, pyFloat, trainFrom } from './equation'

/** One training example: input 4, correct answer 10. */
const X = 4
const Y = 10
/** Learning rate: how big each nudge is. */
const LR = 0.05
const W_START = 1

/** The second, disagreeing example mentioned in the text. */
const X2 = 2
const Y2 = 6

export function ApplyStep() {
  const [w0, setW0] = useState(W_START)
  const [steps, setSteps] = useState(0)

  const w = trainFrom(w0, steps, X, Y, LR)
  const prediction = w * X
  const error = prediction - Y

  const code = [
    `x, y = ${pyFloat(X)}, ${pyFloat(Y)}   # one training example`,
    `w = ${pyFloat(w0)}`.padEnd(19) + '# starting guess',
    '',
    `for step in range(${steps}):`,
    '    error = w * x - y',
    `    w = w - ${LR} * error * x   # nudge w to shrink the error`,
    '',
    'print(w)',
  ].join('\n')

  return (
    <Step
      n={5}
      kind="Apply"
      title="Training a model is solving for its weights"
      visual={
        <>
          <BalanceScale
            equation={eq(X, 0, 0, Y)}
            xTrue={w}
            v="w"
            proportional
            label={`Balance scale for ${X}w = ${Y}, with each w box weighing the current guess ${fmt(w, 4)}`}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              Starting guess for <Tag color={COLOR.v}>w</Tag>
              <NumberField
                label="Starting guess for w"
                value={w0}
                onChange={(n) => {
                  setW0(n)
                  setSteps(0)
                }}
                accent={COLOR.v}
              />
            </label>
            <Button onClick={() => setSteps(steps + 1)}>Take a training step</Button>
            <Button variant="secondary" disabled={steps === 0} onClick={() => setSteps(0)}>
              Back to the start
            </Button>
          </div>
          <Readout>
            After {steps} training step{steps === 1 ? '' : 's'}: <Tag color={COLOR.v}>w</Tag> ={' '}
            {fmt(w, 4)}. Prediction {X} × {fmt(w, 4)} = {fmt(prediction, 4)}, correct answer {Y}
            , error {fmt(error, 4)}.{' '}
            {isZero(error)
              ? 'The scale is level: w solves the equation.'
              : Math.abs(error) < 0.01
                ? 'Close enough that the scale looks level; training usually stops about here.'
                : `The ${error > 0 ? 'prediction is too big' : 'prediction is too small'}, so the scale tips.`}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code} output={pyFloat(w)} />
          </div>
        </>
      }
    >
      <p>
        A machine-learning model is a calculation with some numbers left blank. Those blanks are
        called <strong>weights</strong>, and they are variables in exactly this lesson&rsquo;s
        sense: unknowns you have to find.
      </p>
      <p>
        Take the smallest possible model, with one weight: <em>prediction = w × input</em>. You
        have one training example: for input {X} the correct answer is {Y}. Asking &ldquo;which w
        makes the model right?&rdquo; is asking you to solve an equation:
      </p>
      <Tex block>{String.raw`${X}\,w = ${Y} \quad\Longrightarrow\quad w = \frac{${Y}}{${X}} = ${fmt(Y / X)}`}</Tex>
      <p>
        Training does not divide. It guesses, measures the error, and nudges w a little in the
        direction that shrinks it, over and over. Press <strong>Take a training step</strong> a few
        times and watch the scale settle towards level as w creeps towards {fmt(Y / X)}.
      </p>
      <p>
        Why not just divide? Because real data disagrees with itself. Add a second example, input{' '}
        {X2} with answer {Y2}: it wants w = {fmt(Y2 / X2)}, while the first wants{' '}
        {fmt(Y / X)}. No single w satisfies both, so there is no exact solution. Training finds the
        best compromise instead (here w = {fmt(bestWeight([X, X2], [Y, Y2]))}, the value with the
        smallest total squared error). That is why training is <em>approximately</em> solving for
        the weights.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real models have millions or billions of weights, all solved
        for together, and the nudging rule (gradient descent) comes from calculus. The idea is the
        same: the weights are the unknowns, and the training data supplies the equations.
      </p>
    </Step>
  )
}
