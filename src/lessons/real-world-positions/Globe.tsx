import { COLOR } from '../../lib/palette'

/**
 * A sketch of the Earth with curved latitude and longitude lines, and the
 * latitude angle measured at the centre. Decorative; the text says the same.
 */
export function Globe() {
  const r = 70
  const cx = 90
  const cy = 85
  // Latitude lines are horizontal slices; drawn as flattened ellipses.
  const lats = [-50, -25, 25, 50].map((deg) => {
    const rad = (deg * Math.PI) / 180
    return { y: cy - r * Math.sin(rad), rx: r * Math.cos(rad) }
  })
  const lons = [25, 55].map((deg) => r * Math.sin((deg * Math.PI) / 180))
  // The marked place sits on the outline, 49° north of the equator's right-hand end.
  const lat = (49 * Math.PI) / 180
  const px = cx + r * Math.cos(lat)
  const py = cy - r * Math.sin(lat)
  const arc = 24
  return (
    <svg
      viewBox="0 0 180 175"
      role="img"
      aria-label="A globe with curved latitude and longitude lines. A place in the north is marked; its latitude is the angle between the equator and the line from the Earth's centre to the place."
      className="mx-auto mt-2 block h-auto w-full max-w-[200px]"
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--muted)" strokeWidth={1.5} />
      {lats.map((l) => (
        <ellipse key={l.y} cx={cx} cy={l.y} rx={l.rx} ry={l.rx * 0.18} fill="none" stroke="var(--line)" strokeWidth={1} />
      ))}
      {lons.map((rx) => (
        <ellipse key={rx} cx={cx} cy={cy} rx={rx} ry={r} fill="none" stroke="var(--line)" strokeWidth={1} />
      ))}
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="var(--line)" strokeWidth={1} />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.18} fill="none" stroke={COLOR.i} strokeWidth={2} />
      {/* Lines from the centre to the equator and to the place, and the angle between them. */}
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={COLOR.i} strokeWidth={1.5} strokeDasharray="3 3" />
      <line x1={cx} y1={cy} x2={px} y2={py} stroke={COLOR.v} strokeWidth={2} />
      <circle cx={px} cy={py} r={4.5} fill={COLOR.v} />
      <path
        d={`M ${cx + arc} ${cy} A ${arc} ${arc} 0 0 0 ${cx + arc * Math.cos(lat)} ${cy - arc * Math.sin(lat)}`}
        fill="none"
        stroke={COLOR.v}
        strokeWidth={1.5}
      />
      <text x={cx + 34} y={cy - 18} fontSize={11} fill={COLOR.v} fontWeight={600}>
        latitude
      </text>
      <text x={cx - r + 6} y={cy + 24} fontSize={10} fill={COLOR.i} fontWeight={600}>
        equator
      </text>
      <text x={cx} y={172} fontSize={10} textAnchor="middle" fill="var(--muted)">
        angles, not flat distances
      </text>
    </svg>
  )
}
