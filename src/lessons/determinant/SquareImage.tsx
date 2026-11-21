import { Polygon } from 'mafs'
import { COLOR } from '../../lib/palette'
import { apply2 } from '../../linalg'
import type { Mat2 } from '../../linalg'
import { F_SHAPE, UNIT_SQUARE } from './data'

/** The unit square and the F inside it, after the matrix. `ghost` draws the untouched originals. */
export function SquareImage({ m, ghost = false }: { m: Mat2; ghost?: boolean }) {
  return (
    <>
      {ghost && (
        <>
          <Polygon points={UNIT_SQUARE} color={COLOR.ghost} fillOpacity={0.08} strokeStyle="dashed" />
          <Polygon points={F_SHAPE} color={COLOR.ghost} fillOpacity={0.15} weight={1} />
        </>
      )}
      <Polygon points={UNIT_SQUARE.map((q) => apply2(m, q))} color={COLOR.result} fillOpacity={0.2} />
      <Polygon points={F_SHAPE.map((q) => apply2(m, q))} color={COLOR.v} fillOpacity={0.55} weight={1.5} />
    </>
  )
}
