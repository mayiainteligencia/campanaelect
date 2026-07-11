import { useState } from 'react'
import { JarvisButton } from '@/components/ui/Jarvis'

/* ── Íconos ────────────────────────────────────────────────────── */
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconDot = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
)

/* ── Component ──────────────────────────────────────────────────── */
export default function Header({ title, crumbs = [], collapsed, isMobile, onToggle }) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="header" style={s.header}>
      {/* Toggle button — solo desktop (en móvil la nav es el bottom nav) */}
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

      {/* Breadcrumb de navegación (se oculta en mobile muy pequeño) */}
      <div style={s.breadcrumb} className="header-breadcrumb">
        <span style={s.crumbFolder}>{crumbs[0]}</span>
        <span style={s.crumbSep}>/</span>
        <span style={s.crumbTitle}>{title}</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search pill — se oculta en mobile */}
      <div style={s.searchPill} className="header-search">
        <IconSearch />
        <input
          id="header-search-input"
          type="text"
          placeholder="Buscar…"
          style={s.searchInput}
          aria-label="Buscar"
        />
        <span style={s.searchShortcut}>⌘K</span>
      </div>

      {/* Asistente de voz (Jarvis) */}
      <JarvisButton />

      {/* Status chip */}
      <div style={s.statusChip} className="header-status">
        <span style={{ ...s.dot, background: 'var(--color-green)' }} />
        <span style={s.statusText}>Sistema activo</span>
      </div>

      {/* Notification bell */}
      <button
        id="header-notif-btn"
        style={s.iconBtn}
        onClick={() => setNotifOpen(o => !o)}
        aria-label="Notificaciones"
      >
        <IconBell />
        <span style={s.badge}>3</span>
      </button>

      {/* Avatar */}
      <div style={s.avatar} title="Usuario">
        <IconUser />
      </div>
    </header>
  )
}

/* ── Styles ─────────────────────────────────────────────────────── */
const s = {
  header: {
    background: 'var(--color-header-bg)',
    /* Sin border-bottom → se fusiona con el fondo */
    gap: 10,
    flexWrap: 'wrap',
  },
  toggleBtn: {
    width: 32, height: 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
    color: 'var(--color-text-muted)',
    background: 'var(--color-surface-hover)',
    transition: 'background 0.15s, color 0.15s',
    flexShrink: 0,
    cursor: 'pointer',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
  },
  crumbFolder: { color: 'var(--color-text-muted)' },
  crumbSep:    { color: 'var(--color-text-dim)' },
  crumbTitle:  { color: 'var(--color-primary)', fontWeight: 600 },
  searchPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--color-surface-hover)',
    border: '1px solid var(--color-border)',
    borderRadius: 20,
    padding: '5px 12px',
    color: 'var(--color-text-muted)',
    minWidth: 160,
    maxWidth: 240,
    cursor: 'text',
    transition: 'border-color 0.15s',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--color-text)',
    fontSize: 13,
    flex: 1,
    width: '100%',
  },
  searchShortcut: {
    fontSize: 10,
    color: 'var(--color-text-dim)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    padding: '1px 4px',
    flexShrink: 0,
  },
  statusChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(63,185,80,0.1)',
    border: '1px solid rgba(63,185,80,0.25)',
    borderRadius: 20,
    padding: '4px 10px',
    flexShrink: 0,
  },
  dot: {
    width: 7, height: 7,
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'blink 2s ease-in-out infinite',
  },
  statusText: { fontSize: 12, color: 'var(--color-green)', fontWeight: 500, whiteSpace: 'nowrap' },
  iconBtn: {
    width: 34, height: 34,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
    color: 'var(--color-text-muted)',
    background: 'var(--color-surface-hover)',
    border: '1px solid var(--color-border)',
    transition: 'background 0.15s, color 0.15s',
    position: 'relative',
    flexShrink: 0,
    cursor: 'pointer',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16,
    background: 'var(--color-primary)',
    borderRadius: '50%',
    fontSize: 9,
    fontWeight: 700,
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid var(--color-bg)',
  },
  avatar: {
    width: 34, height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    cursor: 'pointer',
    boxShadow: '0 0 12px var(--color-primary-glow)',
  },
}
