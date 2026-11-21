import { Line } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, CoordPoint, DraggableArrow, DraggablePoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { dot, sub } from '../../linalg'
import { fitLine, normalEquations, project2, sumSquaredResiduals, xtResiduals } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'
import { DATA, PROJ_X, PROJ_Y, normalSnippet, tidy } from './data'
import { FitDrawing } from './FitDrawing'
import { lineText } from './text'

const tex2 = (m: number[][]) =>
  String.raw`\begin{bmatrix} ${m.map((r) => r.map((x) => fmt(x)).join(' & ')).join(String.raw` \\ `)} \end{bmatrix}`

function ProjectionPicture() {
  const [y, setY] = useState<Vec2>(PROJ_Y)
  const p = project2(y, PROJ_X)
  const r = sub(y, p)
  const w = dot(y, PROJ_X) / dot(PROJ_X, PROJ_X)
  return (
    <div className="mt-4">
      <Plane label="Projection of the y column onto the line of the x column, in the space of two data points">
        <Line.ThroughPoints point1={[0, 0]} point2={PROJ_X} color={COLOR.ghost} style="dashed" weight={1.5} />
        <Arrow tip={p} color={COLOR.result} label="w·x" />
        <Arrow tip={PROJ_X} color={COLOR.i} label="x" labelAt="middle" />
        <Arrow tail={p} tip={y} color={COLOR.ghost} label="r" labelAt="middle" dashed />
        <DraggableArrow value={y} onChange={(q) => setY(tidy(q))} color={COLOR.v} label="y" />
      </Plane>
      <Readout>
        Two data points, (x₁, y₁) = ({fmt(PROJ_X[0])}, {fmt(y[0])}) and (x₂, y₂) = ({fmt(PROJ_X[1])},{' '}
        {fmt(y[1])}), fitted by y = w·x with no intercept. <Tag color={COLOR.v}>y</Tag> = {fmtVec(y)}{' '}
        projects onto the line of <Tag color={COLOR.i}>x</Tag> at <Tag color={COLOR.result}>w·x</Tag> ={' '}
        {fmtVec(p)}, so w = {fmt(w)}. Residual r = {fmtVec(r)}, and r · x = {fmt(dot(r, PROJ_X))}: they are
        at right angles.
      </Readout>
    </div>
  )
}

export function UnderstandStep() {
  const [points, setPoints] = useState<Vec2[]>(DATA)
  const [showProjection, setShowProjection] = useState(false)

  const fit = fitLine(points)
  const { XtX, Xty } = normalEquations(points)
  const check = fit ? xtResiduals(points, fit) : null
  const snippet = normalSnippet(points)
  const move = (k: number) => (q: Vec2) => setPoints(points.map((p, i) => (i === k ? tidy(q) : p)))

  return (
    <Step
      n={4}
      kind="Understand"
      title="The normal equations: least squares is a projection"
      visual={
        <>
          <Plane label="Draggable data points with the best-fit line and residual squares">
            {fit && <FitDrawing points={points} line={fit} color={COLOR.result} squares />}
            {points.map((p, k) => (
              <DraggablePoint key={k} value={p} onChange={move(k)} color={COLOR.v} />
            ))}
            {!fit && points.map((p, k) => <CoordPoint key={`c${k}`} at={p} color={COLOR.v} />)}
          </Plane>
          <Readout>
            {fit && check ? (
              <>
                <Tag color={COLOR.result}>Best line</Tag>: {lineText(fit)}. Sum of squared residuals{' '}
                {fmt(sumSquaredResiduals(points, fit))}. Check: residuals add up to{' '}
                {fmt(check[1])}, and x · residuals = {fmt(check[0])}.
              </>
            ) : (
              'Every point has the same x. A vertical stack has no single best line: XᵀX is singular.'
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
          <div className="mt-4">
            <Toggle checked={showProjection} onChange={setShowProjection}>
              Show the projection picture (two data points)
            </Toggle>
          </div>
          {showProjection && <ProjectionPicture />}
        </>
      }
    >
      <p>
        Now the data is yours: drag any point and the best line follows instantly. How does the
        computer find it without trying every line?
      </p>
      <p>
        Write the model for all points at once. Each data point gives a row [x, 1], stacked into a
        matrix X, and the unknowns are w = [slope, intercept]. The predictions are Xw, and you want
        Xw as close as possible to the column of actual values y.
      </p>
      <p>
        Here is the geometric idea. Put all six y-values into one vector: a single point in
        6-dimensional space. As w changes, the predictions Xw = slope·(x column) + intercept·(ones
        column) can only reach a flat plane inside that space, the <strong>column space</strong> of
        X. The closest point of that plane to y is found by dropping a perpendicular: a{' '}
        <strong>projection</strong>. The leftover, the residual r = y − Xw, is then at right angles
        to both columns:
      </p>
      <Tex block>{String.raw`X^{\mathsf T}(\mathbf{y} - X\mathbf{w}) = \mathbf{0} \quad\Longrightarrow\quad (X^{\mathsf T}X)\,\mathbf{w} = X^{\mathsf T}\mathbf{y}`}</Tex>
      <p>
        Those are the <strong>normal equations</strong> (&ldquo;normal&rdquo; means
        perpendicular). The readout checks them live: the residuals add up to 0 (at right angles
        to the ones column) and x · residuals = 0 (at right angles to the x column). For your
        points they are a plain 2×2 system, exactly like lesson 4.5:
      </p>
      <Tex block>
        {fit
          ? String.raw`${tex2(XtX)} \begin{bmatrix} m \\ b \end{bmatrix} = ${tex2(Xty.map((v) => [v]))} \;\Longrightarrow\; \begin{bmatrix} m \\ b \end{bmatrix} = \begin{bmatrix} ${fmt(fit.slope)} \\ ${fmt(fit.intercept)} \end{bmatrix}`
          : String.raw`${tex2(XtX)}\ \text{is singular: no unique } \mathbf{w}`}
      </Tex>
      <p>
        You cannot draw 6 dimensions, but you can draw 2: the toggle under the code shows the same
        projection for a dataset of just two points and a line through the origin. In the code,{' '}
        <code>X.T</code> is X transposed and <code>np.column_stack</code> glues x and a column of
        ones side by side.
      </p>
    </Step>
  )
}
