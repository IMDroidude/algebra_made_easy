import { Polygon } from 'mafs'
import { TransformedGrid } from '../../components/Plane'
import { COLOR } from '../../lib/palette'
import { apply2 } from '../../linalg'
import type { Mat2 } from '../../linalg'
import { F_SHAPE } from './data'

/** The F before (dashed outline) and after a matrix, on its warped grid. */
export function FShape({ matrix }: { matrix: Mat2 }) {
  return (
    <>
      <TransformedGrid matrix={matrix} color={COLOR.grid} />
      <Polygon points={F_SHAPE} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" weight={1.5} />
      <Polygon points={F_SHAPE.map((q) => apply2(matrix, q))} color={COLOR.v} fillOpacity={0.3} />
    </>
  )
}
