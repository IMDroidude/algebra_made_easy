import { useEffect, useState } from 'react'

/** Label every unit when there is room for "−10" at 13 px, otherwise every second unit. */
export const labelEvery = (pxPerUnit: number) => (pxPerUnit >= 27 ? 1 : 2)

/** Plane heights by screen width: big on desktop, still sensible on a phone. */
export const HEIGHTS = {
  big: { phone: 400, tablet: 540, desktop: 620 },
  medium: { phone: 380, tablet: 460, desktop: 600 },
  line: { phone: 120, tablet: 140, desktop: 150 },
} as const

export function usePlaneHeight(size: keyof typeof HEIGHTS): number {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))
  useEffect(() => {
    const onResize = () => setW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const h = HEIGHTS[size]
  return w < 640 ? h.phone : w < 1024 ? h.tablet : h.desktop
}
