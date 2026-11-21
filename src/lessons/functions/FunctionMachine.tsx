import { useId } from 'react'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { apply } from './fn'
import type { Rule } from './fn'

const minus = (s: string) => s.replace('-', '−')
/** Negative numbers in brackets, so products read correctly: 2 × (−3). */
const paren = (x: number) => (x < 0 ? `(${minus(fmt(x))})` : fmt(x))

/**
 * The input → output machine: a number goes in on the left, is multiplied by m,
 * has b added, and comes out on the right. Purely a picture of `apply(rule, x)`.
 */
export function FunctionMachine({ rule, input, name = 'f' }: { rule: Rule; input: number; name?: string }) {
  const arrowId = `fm-arrow-${useId().replaceAll(':', '')}`
  const mid = apply({ m: rule.m, b: 0 }, input)
  const out = apply(rule, input)
  const add = rule.b < 0 ? `− ${fmt(-rule.b)}` : `+ ${fmt(rule.b)}`
  return (
    <svg
      viewBox="0 0 480 130"
      role="img"
      aria-label={`Function machine ${name}: input ${fmt(input)}, times ${fmt(rule.m)} gives ${fmt(mid)}, ${add} gives output ${fmt(out)}`}
      className="block h-auto w-full"
    >
      <defs>
        <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
        </marker>
      </defs>
      {/* input */}
      <text x={40} y={22} textAnchor="middle" fontSize={15} fill="var(--muted)">
        input x
      </text>
      <rect x={6} y={36} width={68} height={44} rx={8} fill="var(--surface)" stroke={COLOR.ghost} strokeWidth={2} />
      <text x={40} y={58} textAnchor="middle" dominantBaseline="central" fontSize={20} fill="var(--ink)">
        {minus(fmt(input))}
      </text>
      <line x1={76} y1={58} x2={112} y2={58} stroke="var(--muted)" strokeWidth={2} markerEnd={`url(#${arrowId})`} />
      {/* the machine */}
      <rect x={114} y={20} width={252} height={78} rx={12} fill={COLOR.v} fillOpacity={0.12} stroke={COLOR.v} strokeWidth={2} />
      <text x={240} y={14} textAnchor="middle" fontSize={15} fontWeight={600} fill={COLOR.v}>
        {name}
      </text>
      <rect x={128} y={36} width={92} height={44} rx={8} fill={COLOR.v} />
      <text x={174} y={58} textAnchor="middle" dominantBaseline="central" fontSize={20} fill="#fff">
        × {minus(fmt(rule.m))}
      </text>
      <line x1={222} y1={58} x2={258} y2={58} stroke={COLOR.v} strokeWidth={2} />
      <text x={240} y={49} textAnchor="middle" fontSize={14} fill="var(--ink)">
        {minus(fmt(mid))}
      </text>
      <rect x={260} y={36} width={92} height={44} rx={8} fill={COLOR.v} />
      <text x={306} y={58} textAnchor="middle" dominantBaseline="central" fontSize={20} fill="#fff">
        {add}
      </text>
      <line x1={368} y1={58} x2={404} y2={58} stroke="var(--muted)" strokeWidth={2} markerEnd={`url(#${arrowId})`} />
      {/* output */}
      <text x={440} y={22} textAnchor="middle" fontSize={15} fill="var(--muted)">
        output {name}(x)
      </text>
      <rect x={406} y={36} width={68} height={44} rx={8} fill="var(--surface)" stroke={COLOR.result} strokeWidth={2} />
      <text x={440} y={58} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={600} fill={COLOR.result}>
        {minus(fmt(out))}
      </text>
      <text x={240} y={121} textAnchor="middle" fontSize={17} fontStyle="italic" fill="var(--ink)">
        {name}({minus(fmt(input))}) = {minus(fmt(rule.m))} × {paren(input)} {add} = {minus(fmt(out))}
      </text>
    </svg>
  )
}
