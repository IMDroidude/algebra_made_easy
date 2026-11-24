/**
 * The cross product of two 3D vectors: a new vector at right angles to both.
 * Only defined for vectors with three entries.
 */
import type { Vec3 } from './project3d'

/**
 * a × b = (a₂b₃ − a₃b₂, a₃b₁ − a₁b₃, a₁b₂ − a₂b₁).
 * Its length is the area of the parallelogram spanned by a and b; swapping the
 * inputs flips its direction; parallel inputs give the zero vector.
 * Entries are computed in the same order NumPy's `np.cross` uses.
 */
export function cross3(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}
