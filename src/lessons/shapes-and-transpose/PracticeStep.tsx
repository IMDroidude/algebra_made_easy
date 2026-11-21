import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { Step } from '../../components/ui'
import { ShapePicker } from './ShapePicker'
import { PRACTICE_CHECKS } from './practice'
import type { PickerState } from './shapes'

const ITEMS: Challenge[] = [
  {
    id: 'number',
    title: 'One number out',
    task: (
      <p className="m-0">
        Make <code>A @ B</code> come out as a single number, shape (1, 1), with an inner size of at
        least 3.
      </p>
    ),
    insight: (
      <p className="m-0">
        A is one row and B is one column of the same length: (1, n) @ (n, 1). The single entry is
        a row times a column, multiplied entry by entry and summed. That is the dot product,
        written as a matrix product.
      </p>
    ),
  },
  {
    id: 'oneway',
    title: 'Only one order works',
    task: (
      <p className="m-0">
        Pick shapes where <code>A @ B</code> works but <code>B @ A</code> would fail.
      </p>
    ),
    insight: (
      <p className="m-0">
        For A @ B the columns of A must match the rows of B; for B @ A, the columns of B must match
        the rows of A. Those are different conditions, so swapping the order can break a product
        that worked.
      </p>
    ),
  },
  {
    id: 'both',
    title: 'Both orders, different answers',
    task: (
      <p className="m-0">
        Pick non-square A and B where both <code>A @ B</code> and <code>B @ A</code> work, but give
        results of different shapes.
      </p>
    ),
    insight: (
      <p className="m-0">
        For example (2, 3) @ (3, 2) gives (2, 2), while (3, 2) @ (2, 3) gives (3, 3). Even when
        both orders are allowed, they are different operations.
      </p>
    ),
  },
  {
    id: 'outer',
    title: 'More out than in',
    task: (
      <p className="m-0">
        Make the result have more entries than A and B have together.
      </p>
    ),
    insight: (
      <p className="m-0">
        The trick is an inner size of 1: (m, 1) @ (1, p) gives an m × p table of every entry of A
        times every entry of B. This is called an <em>outer product</em>, and the attention
        mechanism builds its score table in a similar way.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [state, setState] = useState<PickerState>({ a: [3, 2], b: [3, 2], transposeB: false })
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const update = (next: PickerState) => {
    setState(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }

  return (
    <Step
      n={6}
      kind="Practice"
      title="Four shape puzzles"
      visual={<ShapePicker state={state} onChange={update} />}
    >
      <p>
        No answers are shown. Choose the shapes of A and B (and whether to use <code>B.T</code>)
        until each goal is met. A goal is ticked as soon as your current shapes satisfy it; when
        the B.T switch is on, &ldquo;B&rdquo; in the goals means B.T.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
