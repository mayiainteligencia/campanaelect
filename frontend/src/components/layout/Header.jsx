import { useState } from 'react'
import { JarvisButton } from '@/components/ui/Jarvis'
import { useMayia, MayiaMark } from '@/components/ui/Mayia'
import config from '@/config/config'

/* ── Íconos minimalistas ──────────────────────────────────────── */
const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconBell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

/* ── Component ──────────────────────────────────────────────────── */
export default function Header({ title, crumbs = [], collapsed, isMobile, onToggle }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchFocus, setSearchFocus] = useState(false)
  const mayia = useMayia()
  const archive = mayia?.archive ?? []

  return (
    <header className="header">
      {/* ── Decoración: líneas de circuito laterales (Rojo + Verde PRI) ── */}
      <div style={s.circuitLeft} aria-hidden="true">
        <div style={{ ...s.circuitLine, background: 'linear-gradient(90deg, rgba(225,37,27,0.5), transparent)' }} />
        <div style={{ ...s.circuitLine, background: 'linear-gradient(90deg, rgba(0,122,51,0.35), transparent)', marginTop: 4, opacity: 0.7 }} />
      </div>

      {/* Toggle sidebar (visible en desktop) */}
      {!isMobile && (
        <button
          id="sidebar-toggle-btn"
          onClick={onToggle}
          style={s.toggleBtn}
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </button>
      )}

      {/* ── Logo / Breadcrumb ─────────────────────────── */}
      <div style={s.brand}>
        {config.brand.logo && (
          <img src={config.brand.logo} alt={config.brand.shortName} style={s.logo} />
        )}
        <div style={s.breadcrumb}>
          <span style={s.crumbSection}>{crumbs[0]}</span>
          <span style={s.crumbSep}> / </span>
          <span style={s.crumbTitle}>{title}</span>
        </div>
      </div>

      {/* ── Spacer ───────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }} />

      {/* ── Search pill ─────────────────────────────── */}
      <div
        style={{
          ...s.searchPill,
          borderColor: searchFocus ? 'rgba(225,37,27,0.4)' : 'rgba(0,0,0,0.10)',
          boxShadow: searchFocus ? '0 0 0 2px rgba(225,37,27,0.08)' : 'none',
        }}
        className="header-search"
      >
        <IconSearch />
        <input
          id="header-search-input"
          type="text"
          placeholder="Buscar…"
          style={s.searchInput}
          aria-label="Buscar"
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
        />
        <span style={s.searchShortcut}>⌘K</span>
      </div>

      {/* ── Divisor ─────────────────────────────────── */}
      <div style={s.divider} />

      {/* ── Status dot verde PRI ────────────────────── */}
      <div style={s.statusChip} className="header-status" title="Sistema activo">
        <span style={s.statusDot} />
        <span style={s.statusText}>En vivo</span>
      </div>

      {/* ── Jarvis ──────────────────────────────────── */}
      <JarvisButton />

      {/* ── Notificaciones MAYIA ────────────────────── */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          id="header-notif-btn"
          style={s.iconBtn}
          onClick={() => setNotifOpen(o => !o)}
          aria-label="Notificaciones de MAYIA"
        >
          <IconBell />
          {archive.length > 0 && (
            <span style={s.badge}>{archive.length > 9 ? '9+' : archive.length}</span>
          )}
        </button>

        {notifOpen && (
          <div style={s.notifPanel}>
            <div style={s.notifHead}>
              <span style={s.notifTitle}><MayiaMark size={13} /> MAYIA</span>
              {archive.length > 0 && (
                <button onClick={() => mayia?.clearArchive()} style={s.notifClear}>Limpiar</button>
              )}
            </div>
            <div style={s.notifList}>
              {archive.length === 0 && (
                <p style={s.notifEmpty}>Sin notificaciones.</p>
              )}
              {archive.map((a, i) => (
                <div key={a.ts + '-' + i} style={s.notifItem}>
                  <p style={s.notifItemTitle}>{a.title}</p>
                  <p style={s.notifItemDetail}>{a.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Avatar con rojo PRI ─────────────────────── */}
      <div style={s.avatar} title="Usuario">
        <IconUser />
      </div>

      {/* ── Decoración: circuito derecho ────────────── */}
      <div style={s.circuitRight} aria-hidden="true">
        <div style={{ ...s.circuitLine, background: 'linear-gradient(270deg, rgba(225,37,27,0.5), transparent)' }} />
        <div style={{ ...s.circuitLine, background: 'linear-gradient(270deg, rgba(0,122,51,0.35), transparent)', marginTop: 4, opacity: 0.7 }} />
      </div>
    </header>
  )
}

/* ── Styles (Tema Claro Institucional PRI) ─────────────────────── */
const s = {
  circuitLeft: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'absolute',
    right: 'calc(100% + 8px)',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 48,
  },
  circuitRight: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'absolute',
    left: 'calc(100% + 8px)',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 48,
  },
  circuitLine: {
    height: 1,
    borderRadius: 1,
  },
  toggleBtn: {
    width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
    color: '#4A5568',
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.08)',
    transition: 'all 0.15s ease',
    flexShrink: 0,
    cursor: 'pointer',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 220,
  },
  logo: {
    height: 22,
    width: 'auto',
    objectFit: 'contain',
    /* Logo original sin efectos en modo claro */
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    gap: 4,
    flex: 1,
    minWidth: 0, /* permite truncar hijos */
  },
  crumbSection: {
    color: '#718096',
    fontWeight: 500,
    flexShrink: 0,
  },
  crumbSep: {
    color: '#A0AEC0',
    fontSize: 10,
    flexShrink: 0,
  },
  crumbTitle: {
    color: '#1A202C',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 1,
  },
  divider: {
    width: 1,
    height: 18,
    background: 'rgba(0,0,0,0.10)',
    flexShrink: 0,
  },
  searchPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: 16,
    padding: '4px 10px',
    color: '#718096',
    minWidth: 130,
    maxWidth: 200,
    cursor: 'text',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#1A202C',
    fontSize: 12,
    flex: 1,
    width: '100%',
  },
  searchShortcut: {
    fontSize: 9,
    color: '#A0AEC0',
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 4,
    padding: '1px 4px',
    flexShrink: 0,
  },
  statusChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  statusDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: '#007A33',   /* Verde PRI */
    display: 'inline-block',
    boxShadow: '0 0 6px rgba(0,122,51,0.5)',
    animation: 'dotPulse 2s ease-in-out infinite',
  },
  statusText: {
    fontSize: 11,
    color: '#007A33',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  iconBtn: {
    width: 30, height: 30,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 50,
    color: '#4A5568',
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.08)',
    transition: 'all 0.15s ease',
    position: 'relative',
    flexShrink: 0,
    cursor: 'pointer',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    width: 15, height: 15,
    background: '#E1251B',    /* Rojo PRI */
    borderRadius: '50%',
    fontSize: 8,
    fontWeight: 700,
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1.5px solid rgba(255,255,255,0.95)',
    boxShadow: '0 0 6px rgba(225,37,27,0.35)',
  },
  notifPanel: {
    position: 'absolute', top: 40, right: 0, width: 300, maxWidth: 'calc(100vw - 24px)',
    background: 'rgba(255,255,255,0.98)',
    border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: 14,
    boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
    zIndex: 500,
    overflow: 'hidden',
    animation: 'slideInUp 0.2s ease both',
    backdropFilter: 'blur(20px)',
  },
  notifHead: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  },
  notifTitle: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 12, fontWeight: 800, color: '#1A202C',
  },
  notifClear: {
    background: 'none', border: 'none',
    color: '#E1251B', fontSize: 11, fontWeight: 700, cursor: 'pointer',
  },
  notifList: { maxHeight: 340, overflowY: 'auto' },
  notifEmpty: {
    fontSize: 12, color: '#718096',
    padding: '18px 14px', textAlign: 'center',
  },
  notifItem: { padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' },
  notifItemTitle: { fontSize: 12, fontWeight: 700, color: '#1A202C', lineHeight: 1.3 },
  notifItemDetail: { fontSize: 11, color: '#718096', lineHeight: 1.4, marginTop: 2 },
  avatar: {
    width: 30, height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #E1251B, #B01A12)',   /* Rojo PRI */
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(225,37,27,0.25)',
  },
}
