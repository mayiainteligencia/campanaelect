import { useState } from 'react'

// Donut SVG interactivo. data: [{ label, value, color }]. Segmento resalta al
// hover y el centro muestra su valor; si nada está activo, muestra el total.
export default function Donut({ data, size = 180, thickness = 24, unit = '' }) {
  const [hover, setHover] = useState(null)
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const cx = size / 2

  let offset = 0
  const segments = data.map((d) => {
    const frac = d.value / total
    const seg = { ...d, frac, dash: frac * c, gap: c - frac * c, off: offset }
    offset += frac * c
    return seg
  })

  const center = hover != null ? data[hover] : null
  const centerVal = center ? center.value : total
  const centerLbl = center ? center.label : 'Total'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          {segments.map((seg, i) => (
            <circle
              key={seg.label}
              cx={cx} cy={cx} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={hover === i ? thickness + 5 : thickness}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.off}
              style={{ transition: 'stroke-width 0.15s ease', cursor: 'pointer',
                       opacity: hover == null || hover === i ? 1 : 0.4 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </g>
        <text x={cx} y={cx - 4} textAnchor="middle" style={{ fontSize: 24, fontWeight: 800, fill: 'var(--color-text)' }}>
          {centerVal}{unit}
        </text>
        <text x={cx} y={cx + 16} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--color-text-muted)' }}>
          {centerLbl}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map((seg, i) => (
          <div key={seg.label}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                     opacity: hover == null || hover === i ? 1 : 0.5, transition: 'opacity 0.15s' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: 'var(--color-text)', fontWeight: 600 }}>{seg.label}</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{seg.value} · {(seg.frac * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
