/**
 * Shared representations. Conventions used everywhere in the app:
 *  - vectors are column vectors, transforms are written y = A x
 *  - a Matrix is stored row by row: m[row][col]
 *  - the columns of a matrix are where the basis vectors land
 *  - the y-axis points up (screen conversion happens only in the renderer)
 */
export type Vec = number[]
export type Vec2 = [x: number, y: number]
export type Matrix = number[][]
export type Mat2 = [[number, number], [number, number]]
