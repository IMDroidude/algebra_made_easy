import { Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { eigen2, lineTest, unitAt } from '../../linalg/eigen'
import { svd2 } from '../../linalg/svd'
import type { Mat2 } from '../../linalg'

/** How far the plane reaches: enough for the longest Av, within limits. */
export function extentFor(m: Mat2): number {
  return Math.min(10, Math.max(2.5, Math.ceil(svd2(m).sigma[0] + 0.6)))
}

/** One line of text describing what A does to the current v. */
export function describeV(m: Mat2, angle: number) {
  const v = unitAt(angle)
  const t = lineTest(m, v)
  if (t.collapsed) {
    return (
      <>
        <Tag color={COLOR.result}>Av</Tag> = (0, 0): v is squashed to the origin. It still counts
        as staying on its line: <strong>v is an eigenvector with eigenvalue 0</strong>.
      </>
    )
  }
  if (t.kept && t.factor !== null) {
    const k = fmt(t.factor)
    return (
      <>
        <Tag color={COLOR.result}>Av</Tag> = {fmtVec(t.Av)} = {k} × v.{' '}
        <strong>
          v is an eigenvector, eigenvalue {k}
          {t.factor < 0 ? ': flipped to point the other way along the same line' : ''}.
        </strong>
      </>
    )
  }
  return (
    <>
      <Tag color={COLOR.result}>Av</Tag> = {fmtVec(t.Av)}, knocked {fmt(t.offLineDeg, 0)}° off
      v&rsquo;s line. Not an eigenvector.
    </>
  )
}

/** A sentence about the matrix as a whole: how many lines it keeps. */
export function describeMatrix(m: Mat2) {
  const e = eigen2(m)
  switch (e.kind) {
    case 'distinct':
      return `Two eigen directions: along ${fmtVec(e.pairs[0].vector)} with eigenvalue ${fmt(e.pairs[0].value)}, and along ${fmtVec(e.pairs[1].vector)} with eigenvalue ${fmt(e.pairs[1].value)}.`
    case 'scalar':
      return `Every direction is an eigen direction: this matrix scales every vector by ${fmt(e.value)}.`
    case 'defective':
      return `Only one eigen direction, along ${fmtVec(e.vector)}, with eigenvalue ${fmt(e.value)} (repeated). Every other vector gets pushed sideways along that line.`
    case 'complex':
      return `No real eigen directions: this matrix turns every vector off its line. The maths gives complex eigenvalues ${fmt(e.re)} ± ${fmt(e.im)}i.`
  }
}
