// src/pages/Configuracion.jsx
const IconSettingsLarge = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 8s linear infinite' }}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

export default function Configuracion() {
  return (
    <div style={s.root}>
      <div style={s.badge}>src/pages/Configuracion.jsx</div>
      <h2 style={s.title}>Configuración</h2>
      <p style={s.desc}>Módulo en construcción — gestión de usuarios, permisos, conexión al backend y configuración de la marca.</p>
      <div style={s.placeholder}>
        <IconSettingsLarge />
        <span style={s.phText}>Próximamente</span>
      </div>
    </div>
  )
}

const s = {
  root: { padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
  badge: { fontSize: 11, fontFamily: 'Menlo, Consolas, monospace', color: 'var(--color-text-dim)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 10px' },
  title: { fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' },
  desc:  { fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 400, lineHeight: 1.6 },
  placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 16, padding: 32, background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 12 },
  icon: { fontSize: 40, animation: 'spin 6s linear infinite' },
  phText: { fontSize: 13, color: 'var(--color-text-muted)' },
}
