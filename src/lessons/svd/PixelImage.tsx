import { useEffect, useRef } from 'react'
import type { Matrix } from '../../linalg'

/**
 * Draws a matrix of brightness values (0 = black, 1 = white) as a greyscale
 * picture, one cell per pixel, scaled up with hard edges.
 */
export function PixelImage({ values, label, caption }: { values: Matrix; label: string; caption: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const rows = values.length
  const cols = values[0]?.length ?? 0

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    const data = ctx.createImageData(cols, rows)
    values.forEach((row, i) =>
      row.forEach((v, j) => {
        // Values outside [0, 1] can appear in an approximation; clip only for display.
        const g = Math.round(255 * Math.min(1, Math.max(0, v)))
        const k = 4 * (i * cols + j)
        data.data[k] = g
        data.data[k + 1] = g
        data.data[k + 2] = g
        data.data[k + 3] = 255
      }),
    )
    ctx.putImageData(data, 0, 0)
  }, [values, rows, cols])

  return (
    <figure className="m-0">
      <canvas
        ref={ref}
        width={cols}
        height={rows}
        role="img"
        aria-label={label}
        className="block aspect-square w-full rounded-lg border border-line"
        style={{ imageRendering: 'pixelated' }}
      />
      <figcaption className="mt-1 text-center text-sm text-muted">{caption}</figcaption>
    </figure>
  )
}
