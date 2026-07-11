// Contenedor base reutilizable. Soporta glassmorphism, bordes glow y animaciones.
export default function Card({ title, subtitle, children, style, glass = false, glow, animDelay = 0 }) {
  return (
    <div
      className={glass ? 'glass' : ''}
      style={{
        ...s.card,
        ...(glass ? s.glass : {}),
        ...(glow ? { boxShadow: `0 0 20px var(--color-${glow}-glow)` } : {}),
        animationDelay: `${animDelay}ms`,
        ...style,
      }}
    >
      {title && (
        <div style={s.titleRow}>
          <span style={s.title}>{title}</span>
          {subtitle && <span style={s.subtitle}>{subtitle}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

const s = {
  card: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: 16,
    animation: 'slideInUp 0.4s ease both',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  glass: {
    background: 'var(--color-surface-glass)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  title: { fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  subtitle: { fontSize: 11, color: 'var(--color-text-dim)' },
}
