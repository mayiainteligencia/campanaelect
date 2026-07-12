import { NavLink } from 'react-router-dom'
import config from '@/config/config'
import { useVoiceAssistant } from '@/components/ui/Jarvis'

/* Floating bottom nav para móvil. Centro = logo PRI → Comando Central.
   A los lados, las secciones. Último ícono: asistente de voz. */

const IconReportes = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)
const IconAlertas = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconDatos = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>
  </svg>
)
const IconMic = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
  </svg>
)

const items = [
  { to: '/reportes',      label: 'Resultados',      Icon: IconReportes },
  { to: '/alertas',       label: 'Alertas',         Icon: IconAlertas },
  { to: '/datos/CONCENTRADO', label: 'Datos', Icon: IconDatos },
]

export default function MobileNav() {
  const { listening, start } = useVoiceAssistant()

  return (
    <nav style={s.bar} aria-label="Navegación móvil">
      {/* Secciones (2 a la izquierda del logo) */}
      {items.slice(0, 2).map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} title={label} style={linkStyle}>
          {({ isActive }) => <span style={iconWrap(isActive)}><Icon /></span>}
        </NavLink>
      ))}

      {/* Centro: logo PRI → Comando Central */}
      <NavLink to="/" end title="Comando Central" style={s.logoLink}>
        {({ isActive }) => (
          <span style={{ ...s.logoBtn, boxShadow: isActive ? '0 6px 18px var(--color-primary-glow)' : '0 4px 14px rgba(0,0,0,0.18)' }}>
            <img src={config.brand.logo} alt="Comando Central" style={s.logoImg} />
          </span>
        )}
      </NavLink>

      {/* Configuración */}
      {items.slice(2).map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} title={label} style={linkStyle}>
          {({ isActive }) => <span style={iconWrap(isActive)}><Icon /></span>}
        </NavLink>
      ))}

      {/* Asistente de voz */}
      <button onClick={start} title="Asistente de voz" aria-label="Asistente de voz" style={s.micBtn}>
        <span style={iconWrap(listening)}><IconMic /></span>
      </button>
    </nav>
  )
}

const linkStyle = { display: 'flex', textDecoration: 'none' }
const iconWrap = (active) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 44, height: 44, borderRadius: 14,
  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
  background: active ? 'var(--color-primary-glow)' : 'transparent',
  transition: 'color 0.15s, background 0.15s',
})

const s = {
  bar: {
    position: 'fixed',
    left: '50%', bottom: 14, transform: 'translateX(-50%)',
    zIndex: 200,
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '6px 10px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    boxShadow: '0 8px 30px rgba(0,0,0,0.16)',
  },
  logoLink: { display: 'flex', margin: '0 2px', textDecoration: 'none' },
  logoBtn: {
    width: 58, height: 58, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    marginTop: -22, // se eleva sobre la barra
  },
  logoImg: { width: 46, height: 46, objectFit: 'contain' },
  micBtn: { background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' },
}
