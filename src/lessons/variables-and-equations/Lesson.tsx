import { useState } from 'react'
import { LessonHeader } from '../../components/LessonHeader'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, numpyPrint } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { approxEqual, isZero } from '../../linalg'
import { ApplyStep } from './ApplyStep'
import { BalanceScale } from './BalanceScale'
import { EquationSolver } from './EquationSolver'
import { PracticeStep } from './PracticeStep'
import { applyOp, eq, equationTex, isBalanced, equationText, opLabel, pyFloat, recipe, replay, solve } from './equation'
import type { Equation, Move } from './equation'

/** The equations explored in step 2. */
const EXAMPLES: Equation[] = [eq(1, 5, 0, 12), eq(3, 0, 0, 15), eq(2, 3, 0, 11)]

const PREDICT_START = eq(3, 0, 0, 15)
const PREDICT_AFTER = applyOp(PREDICT_START, 'sub', 3, 'both')

/** Wraps negative numbers in brackets so products read correctly. */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

const lowerFirst = (s: string) => s[0].toLowerCase() + s.slice(1)

export function Lesson() {
  const [pick, setPick] = useState(0)
  const [moves, setMoves] = useState<Move[]>([])
  const [revealed, setRevealed] = useState(false)

  const start = EXAMPLES[pick]
  const xTrue = solve(start) ?? 0
  const chain = replay(start, moves)
  const a = start.left.x
  const b = start.left.k
  const c = start.right.k
  const plan = recipe(start)

  const choose = (k: number) => {
    setPick(k)
    setMoves([])
  }

  const chainTex = [
    String.raw`&${equationTex(chain[0])}`,
    ...moves.map(
      (m, k) =>
        String.raw`\;\Rightarrow\;\; &${equationTex(chain[k + 1])} &&\text{${lowerFirst(opLabel(m.op, m.n, m.target)).replaceAll('−', '-')}${isBalanced(chain[k + 1], xTrue) ? '' : ' (tipped: no longer true)'}}`,
    ),
  ].join(String.raw`\\`)

  const checkTex = [
    approxEqual(a, 1) ? '' : String.raw`${fmt(a)} \cdot `,
    fmt(xTrue),
    isZero(b) ? '' : ` ${b < 0 ? '-' : '+'} ${fmt(Math.abs(b))}`,
    ` = ${fmt(a * xTrue + b)}`,
  ].join('')

  const numpyCode = [
    'import numpy as np',
    '',
    `# ${equationText(start).replaceAll('−', '-')}  is  a*x + b = c  with`,
    `a, b, c = ${fmt(a)}, ${fmt(b)}, ${fmt(c)}`,
    '',
    '# undo "+ b", then undo "times a"',
    'print((c - b) / a)',
    'print(np.linalg.solve([[a]], [c - b]))',
  ].join('\n')
  const numpyOut = `${pyFloat(xTrue)}\n${numpyPrint([xTrue], false)}`

  return (
    <article className="mx-auto max-w-6xl px-4 pb-10">
      <LessonHeader slug="variables-and-equations">
        A variable is a number you do not know yet. An equation says two things weigh the same. By
        the end of this lesson you will be able to find the unknown by doing the same thing to both
        sides, and you will know why that is the first idea behind training a model.
      </LessonHeader>

      <Step
        n={1}
        kind="See"
        title="An equation is a balanced scale"
        visual={
          <>
            <BalanceScale
              equation={EXAMPLES[0]}
              xTrue={7}
              label="A level balance scale: one box marked x and 5 one-unit weights on the left, 12 one-unit weights on the right"
            />
            <Readout>
              Left pan: one <Tag color={COLOR.v}>x</Tag> box and 5 unit weights. Right pan: 12 unit
              weights. The scale is level, so both pans weigh the same: x + 5 = 12.
            </Readout>
          </>
        }
      >
        <p>
          On the left pan sits a box marked <Tag color={COLOR.v}>x</Tag>. You do not know what it
          weighs. Next to it are 5 one-kilo weights. On the right pan are 12 one-kilo weights.
        </p>
        <p>The scale is level. Written down, that fact is an equation:</p>
        <Tex block>{String.raw`x + 5 = 12`}</Tex>
        <p>
          The letter <em>x</em> is a <strong>variable</strong>: a name for a number you have not
          found yet, the same as a variable in code that has not been assigned. Solving the
          equation means finding the one value of x that keeps the scale level.
        </p>
        <p>
          You can probably see the answer already. The point of this lesson is the{' '}
          <em>method</em>, because the method still works when the answer is not obvious.
        </p>
      </Step>

      <Step
        n={2}
        kind="Manipulate"
        title="Do the same thing to both sides"
        visual={
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Choose an equation">
              <span className="text-sm text-muted">Equation:</span>
              {EXAMPLES.map((e, k) => (
                <Button
                  key={k}
                  variant={k === pick ? 'primary' : 'secondary'}
                  aria-pressed={k === pick}
                  onClick={() => choose(k)}
                >
                  {equationText(e)}
                </Button>
              ))}
            </div>
            <EquationSolver start={start} moves={moves} onMovesChange={setMoves} idPrefix="Step 2" />
          </>
        }
      >
        <p>
          Your job is to get <Tag color={COLOR.v}>x</Tag> alone on one pan. Whatever is left on the
          other pan is what x weighs.
        </p>
        <p>
          The one rule: <strong>whatever you do to one side, do to the other.</strong> Take 5 kilos
          off the left and the scale tips, unless you also take 5 off the right. Then it stays
          level, and the equation is still true.
        </p>
        <p>Pick an operation and a number, then apply it. Try to:</p>
        <ul className="mt-0 mb-4 list-disc pl-6">
          <li>
            solve <strong>x + 5 = 12</strong> in one move,
          </li>
          <li>
            solve <strong>3x = 15</strong> (three identical boxes: what one move leaves just one?),
          </li>
          <li>
            apply a move to <em>one side only</em> and watch the scale tip. Then undo it.
          </li>
        </ul>
        <p>
          <strong>2x + 3 = 11</strong> needs two moves. Which one comes first?
        </p>
      </Step>

      <Step
        n={3}
        kind="Predict"
        title="Before you press it: what does this move do?"
        visual={
          <>
            <BalanceScale
              equation={revealed ? PREDICT_AFTER : PREDICT_START}
              xTrue={5}
              label={`Balance scale showing ${equationText(revealed ? PREDICT_AFTER : PREDICT_START)}`}
            />
            <Readout>
              {revealed
                ? `After subtracting 3 from both sides: ${equationText(PREDICT_AFTER)}. The scale is still level, and there are still three x boxes.`
                : `Showing ${equationText(PREDICT_START)}. Lock in a prediction to apply the move.`}
            </Readout>
          </>
        }
      >
        <p>
          Start from <strong>3x = 15</strong>. Someone wants x alone and reasons: &ldquo;there is a
          3 in the way, so take 3 away.&rdquo; They subtract 3 from both sides.
        </p>
        <Predict
          question="What is on the scale after subtracting 3 from both sides?"
          onReveal={() => setRevealed(true)}
          onRetry={() => setRevealed(false)}
          options={[
            {
              id: 'x12',
              label: 'x = 12. The 3 is gone.',
              correct: false,
              explain: (
                <p className="m-0">
                  The 3 in <em>3x</em> is not something added to x; it means three boxes, 3 × x.
                  Subtracting 3 takes 3 kilos off each pan, but all three boxes are still sitting
                  there. To undo &ldquo;times 3&rdquo; you need its opposite: divide by 3.
                </p>
              ),
            },
            {
              id: 'level',
              label: '3x − 3 = 12. Still level, but x is not alone yet.',
              correct: true,
              explain: (
                <p className="m-0">
                  Both sides lost 3, so the scale stays level and the equation is still true. But
                  you have made it worse: there is now a −3 to clean up as well. Each move should
                  undo something that was done <em>to</em> x. Here that is &ldquo;times 3&rdquo;,
                  so divide both sides by 3 and get x = 5.
                </p>
              ),
            },
            {
              id: 'tip',
              label: 'The scale tips, because the move was wrong.',
              correct: false,
              explain: (
                <p className="m-0">
                  A move done to <em>both</em> sides can never tip the scale: both pans lose the
                  same weight. Only one-sided moves tip it. This move is legal, just unhelpful: it
                  keeps the equation true without getting x any closer to alone.
                </p>
              ),
            },
            {
              id: 'x5',
              label: 'x = 5.',
              correct: false,
              explain: (
                <p className="m-0">
                  5 is the right value of x, but subtracting 3 does not get you there. x = 5 comes
                  from <em>dividing</em> both sides by 3. Subtracting and dividing are different
                  moves, even when the same number appears in both.
                </p>
              ),
            },
          ]}
        />
      </Step>

      <Step
        n={4}
        kind="Understand"
        title="Undo what was done to x, in reverse order"
        visual={
          <>
            <Readout>
              Your moves from step 2 on <strong>{equationText(start)}</strong>
              {moves.length === 0 ? ' (none yet: go back and make some)' : ''}:
            </Readout>
            <Tex block>{String.raw`\begin{aligned}${chainTex}\end{aligned}`}</Tex>
            <p className="text-sm">
              Check by putting x = {fmt(xTrue)} back in:{' '}
              <Tex>{checkTex}</Tex>
              , which is the right side, {fmt(c)}. ✓
            </p>
            <div className="mt-4">
              <NumpySnippet code={numpyCode} output={numpyOut} />
            </div>
          </>
        }
      >
        <p>
          Every move you made is an <strong>inverse operation</strong>: it undoes something. Adding
          undoes subtracting, dividing undoes multiplying. The equation{' '}
          <strong>{equationText(start)}</strong> says: &ldquo;take x
          {!approxEqual(a, 1) && <>, multiply by {fmt(a)}</>}
          {!isZero(b) && <>, add {fmt(b)}</>}, and you get {fmt(c)}.&rdquo; To get back to x, undo
          those steps last-first, like taking off socks and shoes:
        </p>
        <Tex block>
          {String.raw`a\,x + b = c \quad\Longrightarrow\quad x = \frac{c - b}{a} = \frac{${fmt(c)} - ${p(b)}}{${fmt(a)}} = ${fmt(xTrue)}`}
        </Tex>
        <p>
          For this equation the recipe is:{' '}
          {plan.map((m, k) => (
            <span key={k}>
              {k > 0 && ', then '}
              {lowerFirst(opLabel(m.op, m.n, 'both'))}
            </span>
          ))}
          {plan.length === 0 && 'nothing, x is already alone'}. Other orders can work too, but
          they make messier numbers on the way.
        </p>
        <p>
          The code does the same thing twice. The first line is the formula above.
          The second uses <code>np.linalg.solve</code>, NumPy&rsquo;s equation solver. With one
          unknown it is overkill, but the same call solves thousands of equations with thousands of
          unknowns at once (lesson 4.5). It returns an array, which is why its answer prints in
          brackets.
        </p>
      </Step>

      <ApplyStep />
      <PracticeStep />
    </article>
  )
}
