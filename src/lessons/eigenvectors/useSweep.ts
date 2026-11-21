import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const DEG_PER_SECOND = 60
const PAUSE_MS = 1100

/**
 * Turns an angle once around the circle, pausing briefly at each of the
 * `stops` (eigen directions) so the learner can see them. With reduced motion
 * it jumps straight to the next stop instead of animating.
 */
export function useSweep(angle: number, setAngle: (deg: number) => void, stops: number[]) {
  const [running, setRunning] = useState(false)
  const frame = useRef<number | null>(null)
  const latest = useRef({ angle, setAngle, stops })
  useLayoutEffect(() => {
    latest.current = { angle, setAngle, stops }
  })

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    setRunning(false)
  }, [])

  const start = useCallback(() => {
    stop()
    const { angle: from, setAngle: set } = latest.current
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      const ahead = (a: number) => ((a - from + 360) % 360) || 360
      const next = [...latest.current.stops].sort((a, b) => ahead(a) - ahead(b))[0]
      if (next !== undefined) set(next)
      return
    }
    setRunning(true)
    let travelled = 0
    let last = performance.now()
    let pausedUntil = 0
    let current = from
    const tick = (now: number) => {
      const dt = now - last
      last = now
      if (now < pausedUntil) {
        frame.current = requestAnimationFrame(tick)
        return
      }
      const step = Math.min((DEG_PER_SECOND * dt) / 1000, 360 - travelled)
      // Did this step cross a stop? Then land exactly on it and pause.
      const crossed = latest.current.stops
        .map((s) => ({ s, d: (s - current + 360) % 360 }))
        .filter(({ d }) => d > 1e-9 && d <= step)
        .sort((a, b) => a.d - b.d)[0]
      if (crossed) {
        travelled += crossed.d
        current = crossed.s
        pausedUntil = now + PAUSE_MS
      } else {
        travelled += step
        current = (current + step) % 360
      }
      latest.current.setAngle(current)
      if (travelled >= 360 - 1e-9) {
        frame.current = null
        setRunning(false)
        return
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }, [stop])

  useEffect(() => stop, [stop])

  return { running, start, stop }
}
