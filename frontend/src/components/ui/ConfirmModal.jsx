import { useState, useCallback, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'

/* ─── Íconos ──────────────────────────────────────────────────── */
const IconWarn = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

/* ─── Context ─────────────────────────────────────────────────── */
const ConfirmCtx = createContext(null)

export function useConfirm() {
  return useContext(ConfirmCtx)
}

/* ─── Modal visual ────────────────────────────────────────────── */
function ConfirmModal({ open, config, onAccept, onDiscard }) {
  if (!open) return null

  const {
    title = '¿Estás seguro?',
    description = 'Esta acción no se puede deshacer.',
    acceptLabel = 'Aceptar',
    discardLabel = 'Descartar',
    tone = 'danger',   /* 'danger' | 'info' | 'success' */
  } = config

  const toneMap = {
    danger:  { bg: 'rgba(225,37,27,0.08)',  icon: '#E1251B', accent: '#E1251B', IconEl: IconWarn },
    info:    { bg: 'rgba(29,78,216,0.08)',  icon: '#1D4ED8', accent: '#1D4ED8', IconEl: IconWarn },
    success: { bg: 'rgba(0,122,51,0.08)',   icon: '#007A33', accent: '#007A33', IconEl: IconCheck },
  }
  const t = toneMap[tone] ?? toneMap.danger

  return createPortal(
    <div style={m.overlay} onClick={onDiscard}>
      <div
        style={m.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        {/* Icono + Cierre */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ ...m.iconWrap, background: t.bg, color: t.icon }}>
            <t.IconEl />
          </div>
          <button style={m.closeBtn} onClick={onDiscard} aria-label="Cerrar">
            <IconX />
          </button>
        </div>

        {/* Texto */}
        <div style={{ marginTop: 14 }}>
          <h3 id="confirm-title" style={m.title}>{title}</h3>
          <p style={m.desc}>{description}</p>
        </div>

        {/* Botones */}
        <div style={m.actions}>
          <button
            id="confirm-discard-btn"
            style={m.discardBtn}
            onClick={onDiscard}
            className="tap"
          >
            {discardLabel}
          </button>
          <button
            id="confirm-accept-btn"
            style={{ ...m.acceptBtn, background: t.accent, boxShadow: `0 4px 14px ${t.accent}33` }}
            onClick={onAccept}
            className="tap"
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ─── Provider ────────────────────────────────────────────────── */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, config: {}, resolve: null })

  const confirm = useCallback((config = {}) => {
    return new Promise(resolve => {
      setState({ open: true, config, resolve })
    })
  }, [])

  const handleAccept = () => {
    state.resolve?.(true)
    setState(s => ({ ...s, open: false }))
  }

  const handleDiscard = () => {
    state.resolve?.(false)
    setState(s => ({ ...s, open: false }))
  }

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <ConfirmModal
        open={state.open}
        config={state.config}
        onAccept={handleAccept}
        onDiscard={handleDiscard}
      />
    </ConfirmCtx.Provider>
  )
}

/* ─── Hook conveniente (ya envuelto en el provider) ──────────── */
// Uso: const confirm = useConfirm()
//      const ok = await confirm({ title: '¿Confirmar?', description: '...', tone: 'danger' })
//      if (ok) { ... }

/* ─── Estilos ─────────────────────────────────────────────────── */
const m = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.30)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
    animation: 'fadeIn 0.15s ease',
  },
  modal: {
    background: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
    animation: 'slideInUp 0.2s cubic-bezier(0.34,1.56,0.64,1)',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  closeBtn: {
    width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 8,
    color: '#718096', cursor: 'pointer',
    transition: 'background 0.15s',
  },
  title: {
    fontSize: 16, fontWeight: 800, color: '#1A202C',
    letterSpacing: '-0.01em', marginBottom: 6,
  },
  desc: {
    fontSize: 13, color: '#718096', lineHeight: 1.6,
  },
  actions: {
    display: 'flex', gap: 8, marginTop: 20,
  },
  discardBtn: {
    flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
    background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.09)',
    color: '#4A5568', cursor: 'pointer', transition: 'all 0.15s',
  },
  acceptBtn: {
    flex: 1.4, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
    color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
  },
}
