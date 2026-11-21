import { useCallback, useEffect, useRef, useState } from 'react'

const MS_PER_STEP = 1300
const PAUSE_MS = 450

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/**
 * A position in [0, 3] through the three SVD steps, animated towards a target
 * one whole step at a time with a short pause between steps. With reduced
 * motion it jumps.
 */
export function useStage(initial = 0) {
  const [stage, setStage] = useState(initial)
  const [running, setRunning] = useState(false)
  const frame = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    setRunning(false)
  }, [])

  const animate = useCallback(
    (from: number, to: number) => {
      stop()
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || from === to) {
        setStage(to)
        return
      }
      setRunning(true)
      // Split the journey at whole steps: e.g. 0 → 3 is 0→1, 1→2, 2→3.
      const legs: [number, number][] = []
      let at = from
      while (at < to) {
        const next = Math.min(to, Math.floor(at) + 1)
        legs.push([at, next])
        at = next
      }
      let leg = 0
      let legStart = performance.now()
      const tick = (now: number) => {
        const [a, b] = legs[leg]
        const raw = Math.min(1, (now - legStart) / (MS_PER_STEP * (b - a)))
        setStage(a + (b - a) * ease(Math.max(0, raw)))
        if (raw >= 1) {
          leg++
          if (leg >= legs.length) {
            frame.current = null
            setRunning(false)
            return
          }
          legStart = now + PAUSE_MS
        }
        frame.current = requestAnimationFrame(tick)
      }
      frame.current = requestAnimationFrame(tick)
    },
    [stop],
  )

  const set = useCallback(
    (value: number) => {
      stop()
      setStage(value)
    },
    [stop],
  )

  useEffect(() => stop, [stop])

  return { stage, running, animate, set, stop }
}
