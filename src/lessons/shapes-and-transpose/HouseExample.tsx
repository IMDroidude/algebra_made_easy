import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Button, Readout } from '../../components/ui'
import { CHOICES, houseSnippet, priceText, shapeCheck } from './runningExample'
import type { Choice } from './runningExample'

/** The running example: X is 8 × 3; multiply it by w, by W.T, or (wrongly) by W. */
export function HouseExample() {
  const [choice, setChoice] = useState<Choice>('w')
  const snippet = houseSnippet(choice)
  const { text } = shapeCheck(choice)
  const right = CHOICES.find((c) => c.id === choice)!

  return (
    <RunningExample title="Eight houses, three features: X is 8 × 3">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div>
          <p>
            Stack the houses as rows and you get the data matrix <strong>X</strong>, shape (8, 3):
            8 houses, 3 features (sqft, bedrooms, km).
          </p>
          <p>
            A weight vector <strong>w</strong> = (0.2, 15, −6) has shape (3,): $k per sqft, per
            bedroom and per km. <code>X @ w</code> has shape (8,), one number per house. Add a
            base of $60k and you get a predicted price for every house in one line (the table).
          </p>
          <p>
            A layer <strong>W</strong> with 2 outputs is stored as (outputs, inputs) = (2, 3).
            To feed the houses through it you need <code>X @ W.T</code>: (8, 3) @ (3, 2) gives
            (8, 2), two numbers per house. Try <code>X @ W</code> to see what goes wrong.
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Product to check">
            {CHOICES.map((c) => (
              <Button
                key={c.id}
                variant={c.id === choice ? 'primary' : 'secondary'}
                aria-pressed={c.id === choice}
                onClick={() => setChoice(c.id)}
              >
                {c.label}
              </Button>
            ))}
          </div>
          <Readout>
            <span data-testid="house-shape-check">
              {right.expr}: {text}
            </span>
          </Readout>
        </div>
        <div>
          <HouseTable
            caption="Predicted price: X @ w + 60"
            extra={[{ heading: 'predicted ($k)', cell: priceText }]}
          />
          <NumpySnippet code={snippet.code} output={snippet.output} />
        </div>
      </div>
    </RunningExample>
  )
}
