import { Text } from 'mafs'
import type { CardinalDirection } from 'mafs'
import type { ReactNode } from 'react'

const flipVertical = (d: CardinalDirection): CardinalDirection =>
  d.replace(/[ns]/, (c) => (c === 'n' ? 's' : 'n')) as CardinalDirection

/**
 * Text placed next to a point on a plane. Use this instead of Mafs `Text`
 * whenever `attach` contains "n" or "s".
 *
 * Mafs 0.21 moves the text the wrong way vertically: "n" shifts it down the
 * screen while aligning it as if it were above, so the label ends up on top of
 * the point. Here the offset direction is flipped and the alignment set to
 * match, so "n" really means above and "s" really means below.
 */
export function PlaneLabel({
  x,
  y,
  attach,
  distance = 12,
  size = 14,
  color,
  children,
}: {
  x: number
  y: number
  attach?: CardinalDirection
  distance?: number
  size?: number
  color?: string
  children: ReactNode
}) {
  const vertical = attach?.match(/[ns]/)?.[0]
  return (
    <Text
      x={x}
      y={y}
      attach={vertical ? flipVertical(attach!) : attach}
      attachDistance={distance}
      size={size}
      color={color}
      svgTextProps={
        vertical ? { dominantBaseline: vertical === 'n' ? 'auto' : 'hanging' } : undefined
      }
    >
      {children}
    </Text>
  )
}
