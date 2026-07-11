import { NavLink } from 'react-router-dom'
import config from '@/config/config'

/* ── Íconos SVG inline ────────────────────────────────────────── */
const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)
const IconReportes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)
const IconAlertas = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconConfig = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

/* ── Nav items ─────────────────────────────────────────────────── */
const nav = [
  { to: '/',              label: 'Comando Central', Icon: IconDashboard, end: true },
  { to: '/reportes',      label: 'Resultados',   Icon: IconReportes },
  { to: '/alertas',       label: 'Alertas',      Icon: IconAlertas },
  { to: '/configuracion', label: 'Configuración',Icon: IconConfig },
]

/* ── Component ─────────────────────────────────────────────────── */
export default function Sidebar({ collapsed, mobileOpen, isMobile }) {
  const isCollapsed = !isMobile && collapsed

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile && mobileOpen ? 'mobile-open' : ''}`}
    >
      {/* Brand */}
      <div style={s.brand}>
        <div style={s.logoWrap}>
          <img src={config.brand.logo} alt={config.brand.name} style={s.logo} />
        </div>
        {!isCollapsed && (
          <span style={s.brandName}>{config.brand.name}</span>
        )}
      </div>

      {/* Divider */}
      <div style={s.divider} />

      {/* Section label */}
      {!isCollapsed && (
        <span style={s.sectionLabel}>MENÚ PRINCIPAL</span>
      )}

      {/* Nav links */}
      <nav style={s.nav}>
        {nav.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              ...s.link,
              ...(isActive ? s.linkActive : {}),
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            })}
            title={isCollapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <span style={{ ...s.iconWrap, color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  <Icon />
                </span>
                <span style={{ ...s.linkLabel, ...( isCollapsed ? s.hidden : {}) }}>
                  {label}
                </span>
                {isActive && !isCollapsed && <span style={s.activeDot} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto' }}>
        <div style={s.divider} />
        {!isCollapsed && (
          <div style={s.footer}>
            <span style={s.footerText}>v1.0 · {config.brand.name}</span>
          </div>
        )}
      </div>
    </aside>
  )
}

/* ── Styles ─────────────────────────────────────────────────────── */
const s = {
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 14px',
    flexShrink: 0,
  },
  logoWrap: {
    width: 40, height: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logo: { width: 40, height: 40, objectFit: 'contain' },
  brandName: {
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.15,
    color: 'var(--color-text)',
    letterSpacing: '-0.02em',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(to right, transparent, var(--color-border), transparent)',
    margin: '4px 12px',
  },
  sectionLabel: {
    display: 'block',
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--color-text-dim)',
    letterSpacing: '0.08em',
    padding: '10px 16px 6px',
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '4px 8px',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 8px',
    borderRadius: 'var(--radius)',
    color: 'var(--color-text-muted)',
    transition: 'background 0.15s, color 0.15s',
    position: 'relative',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  linkActive: {
    background: 'var(--color-primary-glow)',
    color: 'var(--color-text)',
  },
  iconWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    width: 20, height: 20,
    transition: 'color 0.15s',
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: 500,
    transition: 'opacity 0.2s',
    flex: 1,
  },
  activeDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: 'var(--color-primary)',
    flexShrink: 0,
    boxShadow: '0 0 8px var(--color-primary)',
  },
  hidden: { opacity: 0, width: 0, overflow: 'hidden', pointerEvents: 'none' },
  footer: { padding: '10px 16px' },
  footerText: { fontSize: 11, color: 'var(--color-text-dim)' },
}
