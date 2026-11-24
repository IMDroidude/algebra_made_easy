import { Polygon } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NumpySnippet } from '../../components/NumpySnippet'
import { DraggableArrow, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { add, dot, isZero } from '../../linalg'
import { cross3 } from '../../linalg/cross'
import { cleanZero2 } from '../../linalg/span'
import type { Vec, Vec2 } from '../../linalg'
import { Section } from './Section'
import {
  BILL,
  BILL_LINES,
  EX_A,
  EX_B,
  EX_CROSS,
  SHOP,
  crossDirection,
  lift,
  productsCode,
  productsOutput,
} from './products'

const row = (v: Vec) => `(${v.map((x) => fmt(x)).join(', ')})`
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

/** Side view of the floor with the cross product standing on it, pointing up or down. */
function CrossGauge({ z }: { z: number }) {
  const direction = crossDirection(z)
  // Arrow length in pixels: grows with |z| and stops at the edge of the picture.
  const length = direction === 'none' ? 0 : 20 + Math.min(Math.abs(z), 25) * 2
  const tipY = direction === 'up' ? 80 - length : 80 + length
  const head = direction === 'up' ? 9 : -9
  return (
    <svg viewBox="0 0 220 160" role="img" className="h-40 w-full max-w-[220px] shrink-0" aria-label={
      direction === 'none'
        ? 'Side view of the floor: the cross product is the zero vector, so there is no arrow'
        : `Side view of the floor: the cross product points straight ${direction}, length ${fmt(Math.abs(z))}`
    }>
      <line x1="20" y1="80" x2="200" y2="80" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
      <text x="20" y="97" fontSize="11" fill="currentColor" opacity="0.7">
        the floor, from the side
      </text>
      {direction === 'none' ? (
        <circle cx="160" cy="80" r="5" fill={COLOR.result} />
      ) : (
        <>
          <line x1="160" y1="80" x2="160" y2={tipY + head} stroke={COLOR.result} strokeWidth="4" />
          <polygon
            points={`160,${tipY} ${160 - 7},${tipY + head} ${160 + 7},${tipY + head}`}
            fill={COLOR.result}
          />
        </>
      )}
      <text x="172" y={direction === 'down' ? 112 : 60} fontSize="13" fontWeight="600" fill={COLOR.result}>
        a × b
      </text>
    </svg>
  )
}

/** Going further: the two ways to multiply a vector by a vector. */
export function ProductsSection() {
  const [a, setA] = useState<Vec2>([3, 0])
  const [b, setB] = useState<Vec2>([1, 2])

  const [a3, b3] = [lift(a), lift(b)]
  const d = dot(a3, b3)
  const c = cross3(a3, b3)
  const z = c[2]
  const direction = crossDirection(z)

  return (
    <Section
      id="dot-and-cross"
      title="Dot and cross products"
      visual={
        <>
          <Plane label="The floor seen from above, with two draggable vectors a and b and the parallelogram they span">
            <Polygon points={[[0, 0], a, add(a, b), b]} color={COLOR.result} fillOpacity={0.15} strokeOpacity={0.4} />
            <DraggableArrow value={a} onChange={(q) => setA(cleanZero2(q))} color={COLOR.i} label="a" />
            <DraggableArrow value={b} onChange={(q) => setB(cleanZero2(q))} color={COLOR.j} label="b" />
          </Plane>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <CrossGauge z={z} />
            <p className="m-0 min-w-0 flex-1 basis-48 text-sm text-muted">
              The plane above is a floor seen from above, so both arrows have a third entry of 0.
              The cross product leaves the floor: this side view shows it standing straight up or
              hanging straight down.
            </p>
          </div>
          <Readout>
            <Tag color={COLOR.i}>a</Tag> = {row(a3)}, <Tag color={COLOR.j}>b</Tag> = {row(b3)}.{' '}
            <strong>Dot product:</strong> a · b = {p(a[0])} · {p(b[0])} + {p(a[1])} · {p(b[1])} + 0 · 0
            = {fmt(d)}, a number{isZero(d) ? ' (zero: a and b are at right angles, or one of them is the zero vector)' : ''}.{' '}
            <strong>Cross product:</strong> <Tag color={COLOR.result}>a × b</Tag> = {row(c)},{' '}
            {direction === 'none' ? (
              <>
                the zero vector: a and b lie along one line, so the parallelogram is flat and has
                no area.
              </>
            ) : (
              <>
                a vector pointing straight {direction === 'up' ? 'up out of the floor' : 'down into the floor'}{' '}
                because b is {direction === 'up' ? 'counter-clockwise' : 'clockwise'} from a. Its
                length, {fmt(Math.abs(z))}, is the area of the shaded parallelogram.
              </>
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={productsCode(a, b)} output={productsOutput(a, b)} />
          </div>
        </>
      }
    >
      <p>
        In step 2 you multiplied a vector by a number. There are also two ways to multiply a vector
        by a vector, and they give different kinds of answer.
      </p>
      <p>
        <strong>The dot product gives a number.</strong> Take two vectors of the same length,
        multiply the matching entries, and add the results. A shopping bill is a dot product:{' '}
        {SHOP.items.map((item, i) => `${fmt(SHOP.quantity[i])} ${item}`).join(', ')} at prices of{' '}
        {SHOP.price.map((x) => fmt(x)).join(', ')} each.
      </p>
      <Tex block>
        {String.raw`${row(SHOP.quantity)} \cdot ${row(SHOP.price)} = ${SHOP.quantity.map((q, i) => String.raw`${fmt(q)} \cdot ${fmt(SHOP.price[i])}`).join(' + ')} = ${BILL_LINES.map((x) => fmt(x)).join(' + ')} = ${fmt(BILL)}`}
      </Tex>
      <p>
        It is also called the scalar product or inner product. Beyond adding up bills, it measures
        how far two arrows point the same way. When they are at right angles the dot product is
        exactly 0; such vectors are called <strong>orthogonal</strong>. Drag{' '}
        <Tag color={COLOR.j}>b</Tag> until the dot product reads 0 and look at the angle. The shadows
        in the projection above were dot products too. The dot product has{' '}
        <Link to="/lessons/dot-product">a lesson of its own</Link>.
      </p>
      <p>
        <strong>The cross product gives a vector.</strong> It needs two vectors with three entries,
        and the answer <Tag color={COLOR.result}>a × b</Tag> (read &ldquo;a cross b&rdquo;) is a
        new vector at right angles to both:
      </p>
      <Tex block>
        {String.raw`\mathbf{a} \times \mathbf{b} = \begin{bmatrix} a_2 b_3 - a_3 b_2 \\ a_3 b_1 - a_1 b_3 \\ a_1 b_2 - a_2 b_1 \end{bmatrix} \qquad ${row(EX_A)} \times ${row(EX_B)} = ${row(EX_CROSS)}`}
      </Tex>
      <p>
        Check the right angles with the dot product: {row(EX_CROSS)} · {row(EX_A)} ={' '}
        {fmt(dot(EX_CROSS, EX_A))} and {row(EX_CROSS)} · {row(EX_B)} = {fmt(dot(EX_CROSS, EX_B))}.
        Three more facts, all visible on the plane:
      </p>
      <ul className="mt-0 mb-4 list-disc pl-6">
        <li>its length is the area of the parallelogram that a and b span;</li>
        <li>swapping the order flips it: b × a = −(a × b);</li>
        <li>if a and b lie along the same line, it is the zero vector.</li>
      </ul>
      <p>
        Real examples: a spanner turning a bolt. The spanner is one vector and your push is
        another; the bolt travels along the cross product of the two, in or out, at right angles
        to both. And a 3D game takes the cross product of two edges of a triangle to find the
        direction its surface faces, which decides how brightly to light it.
      </p>
      <p className="text-sm text-muted">
        In machine learning you will use the dot product constantly and the cross product almost
        never: it exists only for three entries, and AI vectors have hundreds. It belongs to 3D
        graphics, robotics and physics.
      </p>
    </Section>
  )
}
