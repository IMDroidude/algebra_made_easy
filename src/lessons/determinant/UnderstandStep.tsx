import { Polygon, Text } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { DraggableArrow } from '../../components/Plane'
import { QuadrantPlane } from './QuadrantPlane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, numpyMat2 } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { columns2, det2, fromColumns2 } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'
import { NUMPY_DET_EXAMPLE, UNDERSTAND_START } from './data'
import { boxPictureFits, boxPieces, boxRegions, numpyDetFormula, detText } from './determinant'

/** Keeps the arrows in the top-right quarter, where the box picture works. */
const snapQuadrant = ([x, y]: Vec2): Vec2 => {
  const s = (t: number) => Math.max(0, Math.min(3, Math.round(t * 2) / 2))
  return [s(x), s(y)]
}

const centre = (pts: Vec2[]): Vec2 => [
  pts.reduce((sum, q) => sum + q[0], 0) / pts.length,
  pts.reduce((sum, q) => sum + q[1], 0) / pts.length,
]

/** Wraps negative numbers in brackets so products read correctly: 2 · (−1). */
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

export function UnderstandStep() {
  const [m, setM] = useState<Mat2>(UNDERSTAND_START)
  const [iHat, jHat] = columns2(m)
  const [[a, b], [c, d]] = m
  const det = det2(m)
  const fits = boxPictureFits(m)
  const pieces = boxPieces(m)
  const regions = boxRegions(m)
  const w = a + b
  const h = c + d

  const label = (pts: Vec2[], text: string, area: number, k: string) => {
    if (area < 0.6) return null
    const [x, y] = centre(pts)
    return (
      <Text key={k} x={x} y={y} size={12} color={COLOR.ghost}>
        {text}
      </Text>
    )
  }

  const code = [
    'import numpy as np',
    '',
    numpyMat2('A', m),
    '',
    '# ad - bc, written out',
    'print(A[0, 0] * A[1, 1] - A[0, 1] * A[1, 0])',
  ].join('\n')

  return (
    <Step
      n={4}
      kind="Understand"
      title="Where ad − bc comes from"
      visual={
        <>
          <QuadrantPlane label="The parallelogram spanned by î and ĵ inside the box they fit in, with the leftover pieces marked">
            {fits && (
              <>
                <Polygon
                  points={[[0, 0], [w, 0], [w, h], [0, h]]}
                  color={COLOR.ghost}
                  fillOpacity={0}
                  strokeStyle="dashed"
                  weight={1.5}
                />
                {regions.rects.map((r, k) => (
                  <Polygon key={`r${k}`} points={r} color={COLOR.ghost} fillOpacity={0.3} weight={1} />
                ))}
                {regions.triangles.map((t, k) => (
                  <Polygon key={`t${k}`} points={t} color={COLOR.ghost} fillOpacity={0.12} weight={1} />
                ))}
                {regions.rects.map((r, k) => label(r, 'bc', pieces.rect, `lr${k}`))}
                {regions.triangles.map((t, k) =>
                  k % 2 === 0
                    ? label(t, 'ac/2', pieces.triAC, `lt${k}`)
                    : label(t, 'bd/2', pieces.triBD, `lt${k}`),
                )}
              </>
            )}
            <Polygon
              points={[[0, 0], iHat, [a + b, c + d], jHat]}
              color={COLOR.result}
              fillOpacity={0.3}
            />
            <DraggableArrow value={iHat} onChange={(n) => setM(fromColumns2(n, jHat))} color={COLOR.i} label="î" snap={snapQuadrant} />
            <DraggableArrow value={jHat} onChange={(n) => setM(fromColumns2(iHat, n))} color={COLOR.j} label="ĵ" snap={snapQuadrant} />
          </QuadrantPlane>
          <Readout>
            <Tag color={COLOR.i}>î</Tag> = ({fmt(a)}, {fmt(c)}), <Tag color={COLOR.j}>ĵ</Tag> = (
            {fmt(b)}, {fmt(d)}).{' '}
            {fits ? (
              <>
                Box {fmt(w)} × {fmt(h)} = {fmt(pieces.box)}, minus two rectangles of{' '}
                {fmt(pieces.rect)}, two triangles of {fmt(pieces.triAC)} and two of{' '}
                {fmt(pieces.triBD)}, leaves the <Tag color={COLOR.result}>parallelogram</Tag>:{' '}
                {fmt(pieces.rest)}.
              </>
            ) : (
              <>
                Determinant {detText(det)}.{' '}
                {det < 0
                  ? 'ĵ is now clockwise of î, so the plane is flipped and ad − bc is negative. The box picture needs ĵ counter-clockwise of î; the formula still holds.'
                  : 'î and ĵ lie on one line: the parallelogram is flat and ad − bc is 0.'}
              </>
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code} output={numpyDetFormula(m)} />
          </div>
        </>
      }
    >
      <p>
        For a matrix with entries a, b, c, d, the determinant is
      </p>
      <Tex block>
        {String.raw`\det\begin{bmatrix} a & b \\ c & d \end{bmatrix} = ad - bc = ${p(a)}\cdot${p(d)} - ${p(b)}\cdot${p(c)} = ${fmt(det)}`}
      </Tex>
      <p>
        Here is why that is the area of the <Tag color={COLOR.result}>parallelogram</Tag>.{' '}
        <Tag color={COLOR.i}>î</Tag> lands at (a, c) and <Tag color={COLOR.j}>ĵ</Tag> at (b, d).
        The parallelogram fits inside a box (a + b) wide and (c + d) tall. Cut away the grey
        pieces around it: two rectangles b × c, two triangles with area ac/2, two with bd/2.
      </p>
      <Tex block>
        {String.raw`(a+b)(c+d) - 2bc - ac - bd = ad - bc`}
      </Tex>
      <p>
        Drag î and ĵ (they stay in the top-right quarter here) and check the readout: the pieces
        always leave exactly ad − bc.
      </p>
      <p>
        <strong>Where the sign comes from.</strong> Drag ĵ below î, so that going from î to ĵ turns
        clockwise. Now bc is bigger than ad and the result is negative: the formula records the
        flip automatically.
      </p>
      <p>
        In NumPy you would normally call <code>np.linalg.det(A)</code>. It does not use ad − bc but
        a general method that works for any square size, and its answer carries tiny rounding
        errors. For{' '}
        <code>
          [[{NUMPY_DET_EXAMPLE.matrix[0].join(', ')}], [{NUMPY_DET_EXAMPLE.matrix[1].join(', ')}]]
        </code>
        , whose determinant is exactly 5, it prints <code>{NUMPY_DET_EXAMPLE.printed}</code>. That is
        why you never test a determinant with <code>== 0</code>; check{' '}
        <code>np.isclose(det, 0)</code> instead, the same idea as this app&rsquo;s &ldquo;≈ 0,
        treated as singular&rdquo;.
      </p>
      <p className="text-sm text-muted">
        In 3D the determinant is the volume of the box spanned by three columns, and in n
        dimensions an n-dimensional volume. We can only draw the 2D case, but the meaning (size =
        volume factor, sign = flip, zero = flattened) carries over unchanged.
      </p>
    </Step>
  )
}
