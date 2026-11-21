import { Line, Polygon } from 'mafs'
import { predict, residuals } from '../../linalg/systems'
import type { FitLine } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'

/**
 * A line with the vertical residual from each data point to it, and
 * optionally the square on each residual (side = |residual|, so its area is
 * the squared error). Squares open towards the middle of the plane.
 */
export function FitDrawing({
  points,
  line,
  color,
  squares = false,
  dashed = false,
}: {
  points: Vec2[]
  line: FitLine
  color: string
  squares?: boolean
  dashed?: boolean
}) {
  const res = residuals(points, line)
  return (
    <>
      <Line.ThroughPoints
        point1={[0, line.intercept]}
        point2={[1, line.intercept + line.slope]}
        color={color}
        style={dashed ? 'dashed' : 'solid'}
      />
      {points.map(([x, y], k) => {
        const yHat = predict(line, x)
        const side = Math.abs(res[k]) * (x > 0 ? -1 : 1)
        return (
          <g key={k}>
            {squares && (
              <Polygon
                points={[
                  [x, yHat],
                  [x, y],
                  [x + side, y],
                  [x + side, yHat],
                ]}
                color={color}
                fillOpacity={0.15}
                weight={1}
              />
            )}
            <Line.Segment point1={[x, yHat]} point2={[x, y]} color={color} weight={2} style="dashed" />
          </g>
        )
      })}
    </>
  )
}
