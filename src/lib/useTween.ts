import { useCallback, useEffect, useRef, useState } from 'react'

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/**
 * A value that runs from 0 to 1 when `play()` is called. Respects the
 * reduced-motion preference by jumping straight to the end.
 */
export function useTween(durationMs = 1200, initial = 0) {
  const [t, setT] = useState(initial)
  const frame = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
  }, [])

  const play = useCallback(() => {
    stop()
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setT(1)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / durationMs)
      setT(easeInOut(raw))
      frame.current = raw < 1 ? requestAnimationFrame(tick) : null
    }
    setT(0)
    frame.current = requestAnimationFrame(tick)
  }, [durationMs, stop])

  const reset = useCallback(
    (value = 0) => {
      stop()
      setT(value)
    },
    [stop],
  )

  useEffect(() => stop, [stop])

  return { t, play, reset }
}
