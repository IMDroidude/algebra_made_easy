import { Circle } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, DraggableArrow, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Tag } from '../../components/ui'
import { HOUSES, featureVector } from '../../data/houses'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { norm } from '../../linalg'
import { cleanZero2, isZeroVec } from '../../linalg/span'
import type { Vec, Vec2 } from '../../linalg'
import { Section } from './Section'
import {
  EMPTY_BASKET,
  SHELF,
  START_BASKET,
  SUPERMARKET,
  density,
  kindsCode,
  kindsOutput,
  nonZeroCount,
  sparsePairs,
  unitOf,
  zeroShare,
} from './kinds'

const HOUSE = featureVector(HOUSES[0])

/** Going further: row and column, zero, unit, sparse and dense vectors. */
export function KindsSection() {
  const [v, setV] = useState<Vec2>([3, 4])
  const [basket, setBasket] = useState<Vec>(START_BASKET)

  const zero = isZeroVec(v)
  const length = norm(v)
  const unit = zero ? null : unitOf(v)
  const kind = density(basket)
  const filled = nonZeroCount(basket)
  const pairs = sparsePairs(basket)

  return (
    <Section
      id="kinds-of-vector"
      title="Kinds of vector"
      visual={
        <>
          <Plane label="A draggable vector v, the circle of radius 1, and the unit vector that points the same way as v">
            <Circle center={[0, 0]} radius={1} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
            <DraggableArrow value={v} onChange={(q) => setV(cleanZero2(q))} color={COLOR.v} label="v" />
            {unit && <Arrow tip={unit} color={COLOR.result} label="û" labelDistance={10} showCoords={false} />}
          </Plane>
          <Readout>
            {unit ? (
              <>
                <Tag color={COLOR.v}>v</Tag> = {fmtVec(v)} has length {fmt(length)}. Divide each
                entry by {fmt(length)}: the unit vector <Tag color={COLOR.result}>û</Tag> ={' '}
                {fmtVec(unit)} points the same way and has length 1, so its tip sits on the dashed
                circle.
              </>
            ) : (
              <>
                <Tag color={COLOR.v}>v</Tag> = (0, 0) is the zero vector: length 0 and no
                direction. It has no unit vector, because that would mean dividing by 0.
              </>
            )}
          </Readout>

          <p className="mt-6 mb-2 text-sm font-semibold">
            Your shopping basket as a vector: one entry per product. Press a product to add one.
          </p>
          <div role="group" aria-label="Products on the shelf" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {SHELF.map((name, i) => (
              <button
                key={name}
                type="button"
                aria-label={`${name}: ${basket[i]} in the basket. Add one.`}
                onClick={() => setBasket(basket.map((x, j) => (j === i ? x + 1 : x)))}
                className={`cursor-pointer rounded-lg border-2 px-2 py-1.5 text-left text-sm ${
                  basket[i] === 0 ? 'border-line text-muted' : 'border-accent font-semibold'
                }`}
              >
                <span className="block text-xs">{name}</span>
                <span className="font-mono text-base">{basket[i]}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setBasket(EMPTY_BASKET)}>
              Empty the basket
            </Button>
            <Button variant="secondary" onClick={() => setBasket(START_BASKET)}>
              Reset
            </Button>
          </div>
          <Readout>
            basket = [{basket.join(', ')}].{' '}
            {kind === 'zero' ? (
              <>
                Every entry is 0: an empty basket is the <strong>zero vector</strong> of this shop.
              </>
            ) : (
              <>
                {filled} of {basket.length} entries {filled === 1 ? 'is' : 'are'} non-zero, so{' '}
                {fmt(zeroShare(basket) * 100, 0)}% are zeros: a <strong>{kind}</strong> vector.{' '}
                {kind === 'sparse'
                  ? `Sparse storage keeps only ${pairs.map(([i, x]) => `${SHELF[i]}: ${x}`).join(', ')}.`
                  : 'With so few zeros there is nothing to gain from skipping them, so all 12 numbers are stored.'}
              </>
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={kindsCode(v)} output={kindsOutput(v)} />
            {zero && (
              <p className="mt-2 text-sm text-muted">
                NumPy prints <code>nan</code> (&ldquo;not a number&rdquo;) and warns about an invalid
                value: 0 divided by 0 has no answer.
              </p>
            )}
          </div>
        </>
      }
    >
      <p>
        Every vector obeys the arithmetic you have just practised. A few kinds come up so often
        that they have names. The name tells you how the vector is written, or what is inside it.
      </p>
      <p>
        <strong>Row and column vectors.</strong> The same list can be written across, as a row, or
        down, as a column:
      </p>
      <Tex block>
        {String.raw`\begin{bmatrix} ${fmt(v[0])} & ${fmt(v[1])} \end{bmatrix} \qquad \begin{bmatrix} ${fmt(v[0])} \\ ${fmt(v[1])} \end{bmatrix}`}
      </Tex>
      <p>
        A row is how one record sits in a spreadsheet: one house, one customer, one line of the
        table. A column is how this course writes vectors in equations. The numbers are the same;
        only the shape differs, and shape starts to matter when matrices arrive (
        <Link to="/lessons/shapes-and-transpose">shapes and the transpose</Link>). A plain NumPy
        array is neither until you <code>reshape</code> it, as the code shows.
      </p>
      <p>
        <strong>Zero vector.</strong> Every entry is 0. It is the arrow with no length, sitting on
        the origin, and adding it changes nothing: v + 0 = v. Real examples: the velocity of a
        parked car, an empty shopping basket, or a − a, the difference between two identical rows.
        When a model is trained, a vector called the gradient says which way to adjust the
        model&rsquo;s numbers; when the gradient is the zero vector, there is no direction left to
        move in and the model stops changing. Drag <Tag color={COLOR.v}>v</Tag> onto the origin to meet it.
      </p>
      <p>
        <strong>Unit vector.</strong> A vector of length 1. It carries a direction and nothing
        else. You get one by dividing a vector by its own length:
      </p>
      <Tex block>{String.raw`\hat{\mathbf{u}} = \frac{\mathbf{v}}{\lVert \mathbf{v} \rVert}`}</Tex>
      <p>
        Think of wind. Let <Tag color={COLOR.v}>v</Tag> be its velocity in metres per second
        {unit ? (
          <>
            : the speed is the length, {fmt(length)} m/s, which is a scalar; the direction is the
            unit vector <Tag color={COLOR.result}>û</Tag> = {fmtVec(unit)}. Speed times direction
            gives the velocity back: {fmt(length)} × {fmtVec(unit)} = {fmtVec(v)}.
          </>
        ) : (
          <>. Right now v is the zero vector: no wind, so no direction to report.</>
        )}{' '}
        Unit vectors return in <Link to="/lessons/dot-product">the dot product lesson</Link>, where
        two texts are compared by direction alone.
      </p>
      <p>
        <strong>Sparse and dense vectors.</strong> A <strong>sparse</strong> vector is mostly
        zeros. Your basket has one entry per product in the shop, and you buy only a few of them.
        A real supermarket stocks about {SUPERMARKET.products.toLocaleString('en-US')} products
        and a basket holds about {SUPERMARKET.inBasket}, so over 99.9% of that vector is zeros.
        Word counts for a document (one entry per word in the dictionary) and a person&rsquo;s film
        ratings (one entry per film) look the same, which is why text analysis and recommendation
        systems use sparse vectors. Software stores only the non-zero entries and their positions.
      </p>
      <p>
        A <strong>dense</strong> vector has few or no zeros, so every entry is stored. The Garden
        flat from the house dataset, [{HOUSE.join(', ')}], is dense. So are the pixel brightnesses
        of a photo and the word embeddings from step 5, which is why image processing and deep
        learning work with dense vectors. Fill the basket until it turns dense, then empty it.
      </p>
    </Section>
  )
}
