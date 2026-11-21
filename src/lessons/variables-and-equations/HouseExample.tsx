import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { Button, Readout } from '../../components/ui'
import { HOUSES } from '../../data/houses'
import { fmt } from '../../lib/format'
import { npRound } from '../../lib/numpy'
import { guess, miss, weightCode, weightFrom, weightOutput } from './houseWeight'

const signed = (x: number) => (x > 0 ? `+${x}` : x < 0 ? `−${-x}` : '0')

/** Running example: one house gives one equation, enough to solve for one weight. */
export function HouseExample() {
  const [id, setId] = useState('B')
  const house = HOUSES.find((h) => h.id === id) ?? HOUSES[1]
  const w = weightFrom(house)
  const misses = HOUSES.filter((h) => h.id !== id).map((h) => Math.abs(miss(w, h)))
  const worst = HOUSES.reduce((a, h) => (Math.abs(miss(w, h)) > Math.abs(miss(w, a)) ? h : a))

  return (
    <RunningExample title="One house, one unknown">
      <p>
        Try the smallest model on the course&rsquo;s eight houses: <em>price = w × sqft</em>, one
        weight w: the price of one square foot, in $k. One house gives one equation, and one
        equation is enough to find one unknown. House {house.id} sold for {house.priceK} ($k) at{' '}
        {house.sqft} sqft:
      </p>
      <Tex block>
        {String.raw`${house.sqft}\,w = ${house.priceK} \quad\Longrightarrow\quad w = \frac{${house.priceK}}{${house.sqft}} \approx ${fmt(w, 3)}`}
      </Tex>
      <div className="my-3 flex flex-wrap items-center gap-2" role="group" aria-label="Solve for w from house">
        <span className="text-sm text-muted">Solve from house:</span>
        {HOUSES.map((h) => (
          <Button
            key={h.id}
            variant={h.id === id ? 'primary' : 'secondary'}
            aria-pressed={h.id === id}
            aria-label={`Solve from house ${h.id}`}
            onClick={() => setId(h.id)}
          >
            {h.id}
          </Button>
        ))}
      </div>
      <HouseTable
        columns={['sqft', 'priceK']}
        highlight={[house.id]}
        extra={[
          { heading: 'w × sqft', cell: (h) => fmt(npRound(guess(w, h), 0)) },
          { heading: 'miss ($k)', cell: (h) => signed(miss(w, h)) },
        ]}
        caption={`w = ${fmt(w, 3)}, solved from house ${house.id}, tried on every house`}
      />
      <Readout>
        With w = {fmt(w, 3)} from house {house.id}, the model is exact for {house.id} but misses
        every other house, by up to {Math.max(...misses)} ($k) for house {worst.id}.
      </Readout>
      <p style={{ marginTop: '1rem' }}>
        So each square foot is worth about ${fmt(w * 1000, 0)}. Pick another house and you get a different w: from {fmt(weightFrom(HOUSES[7]), 3)} (house
        H) to {fmt(weightFrom(HOUSES[2]), 3)} (house C). Eight houses give eight equations, and no
        single w satisfies them all. That is why real models have more than one number (an added
        bias, a weight for bedrooms, one for distance) and why training settles for the best
        compromise instead of an exact answer.
      </p>
      <NumpySnippet code={weightCode(house)} output={weightOutput(house)} />
    </RunningExample>
  )
}
