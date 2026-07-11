// Card KPI interactiva: tint de color + barra de acento + hover lift.
// tone define el color; usa los tokens del sistema (rojo/verde/gris/azul).

const TONES = {
  red:    { bg: 'var(--color-primary-soft)', accent: 'var(--color-primary)' },
  green:  { bg: 'var(--color-accent-soft)',  accent: 'var(--color-accent)' },
  gray:   { bg: 'var(--color-gray-soft)',    accent: 'var(--color-graphite)' },
  blue:   { bg: 'rgba(37,99,235,0.08)',      accent: 'var(--color-blue)' },
  yellow: { bg: 'rgba(201,138,0,0.10)',      accent: 'var(--color-yellow)' },
}

export default function StatCard({ label, value, sub, tone = 'gray', icon, delta, i = 0 }) {
  const t = TONES[tone] ?? TONES.gray
  const up = typeof delta === 'string' ? !delta.startsWith('-') : true
  return (
    <div className="lift" style={{ ...s.card, background: t.bg, '--i': i }}>
      <span style={{ ...s.accentBar, background: t.accent }} />
      <div style={s.top}>
        <span style={s.label}>{label}</span>
        {icon && <span style={{ ...s.icon, color: t.accent }}>{icon}</span>}
      </div>
      <div style={{ ...s.value, color: t.accent }}>{value}</div>
      {(sub || delta) && (
        <div style={s.foot}>
          {delta && (
            <span style={{ ...s.delta, color: up ? 'var(--color-accent)' : 'var(--color-primary)' }}>
              {up ? '▲' : '▼'} {delta}
            </span>
          )}
          {sub && <span style={s.sub}>{sub}</span>}
        </div>
      )}
    </div>
  )
}

const s = {
  card: {
    position: 'relative',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    padding: '16px 18px 16px 20px',
    overflow: 'hidden',
    animation: 'slideInUp 0.45s ease both',
    animationDelay: 'calc(var(--i) * 60ms)',
  },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '4px 0 0 4px' },
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  icon: { display: 'flex', flexShrink: 0 },
  value: { fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 6, fontVariantNumeric: 'tabular-nums' },
  foot: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  delta: { fontSize: 12, fontWeight: 700 },
  sub: { fontSize: 12, color: 'var(--color-text-muted)' },
}
