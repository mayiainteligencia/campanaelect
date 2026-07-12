import { useAuth } from '@/auth'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { useMayia } from '@/components/ui/Mayia'

/* ─── Íconos ──────────────────────────────────────────────────── */
const IconUser   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconShield = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconBell   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconLogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

/* ─── Toggle Switch ───────────────────────────────────────────── */
function Toggle({ on, onChange, id }) {
  return (
    <button id={id} role="switch" aria-checked={on} onClick={() => onChange(!on)}
      style={{
        width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: on ? '#007A33' : 'rgba(0,0,0,0.14)',
        transition: 'background 0.2s', position: 'relative', flexShrink: 0, padding: 0,
      }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.20)',
        transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function Configuracion() {
  const { user, logout } = useAuth()
  const confirm = useConfirm()
  const mayia = useMayia()
  const notifOn = mayia?.enabled ?? true

  async function handleLogout() {
    const ok = await confirm({
      title: '¿Cerrar sesión?',
      description: 'Se cerrará tu sesión activa. Tendrás que volver a iniciar sesión para acceder al sistema.',
      acceptLabel: 'Cerrar sesión',
      discardLabel: 'Cancelar',
      tone: 'danger',
    })
    if (ok) logout()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Encabezado */}
      <div>
        <p style={sc.kicker}>Panel de Control</p>
        <h2 style={sc.title}>Configuración</h2>
        <p style={sc.sub}>Acceso y notificaciones del sistema</p>
      </div>

      <div style={sc.grid}>
        {/* ── Sesión activa ── */}
        <div className="lift" style={sc.cell}>
          <div style={sc.cellHead}>
            <div style={{ ...sc.iconWrap, background: 'rgba(225,37,27,0.08)', color: '#E1251B' }}><IconUser /></div>
            <div style={{ flex: 1 }}>
              <div style={sc.cellTitle}>Sesión Activa</div>
              <div style={sc.cellSub}>Usuario autenticado</div>
            </div>
            <span style={sc.onlineDot} />
          </div>

          <div style={sc.userCard}>
            <div style={sc.avatar}>{(user?.email?.[0] ?? 'U').toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A202C', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email ?? '—'}
              </div>
              <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>Administrador del sistema</div>
            </div>
            <span style={sc.roleBadge}><IconShield /> Admin</span>
          </div>

          <button style={sc.logoutBtn} className="tap" onClick={handleLogout}>
            <IconLogOut /> Cerrar sesión
          </button>
        </div>

        {/* ── Notificaciones ── */}
        <div className="lift" style={sc.cell}>
          <div style={sc.cellHead}>
            <div style={{ ...sc.iconWrap, background: 'rgba(0,122,51,0.08)', color: '#007A33' }}><IconBell /></div>
            <div>
              <div style={sc.cellTitle}>Notificaciones</div>
              <div style={sc.cellSub}>Alertas de MAYIA</div>
            </div>
          </div>

          <div style={sc.sRow}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C' }}>Notificaciones de MAYIA</div>
              <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                Recibir alertas, sugerencias y predicciones en tiempo real
              </div>
            </div>
            <Toggle id="toggle-mayia" on={notifOn} onChange={(v) => mayia?.setEnabled(v)} />
          </div>

          <div style={sc.statusPill}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: notifOn ? '#007A33' : '#A0AEC0', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: notifOn ? '#007A33' : '#718096' }}>
              {notifOn ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Estilos ─────────────────────────────────────────────────── */
const sc = {
  kicker:  { fontSize: 10, fontWeight: 700, color: '#E1251B', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 2 },
  title:   { fontSize: 22, fontWeight: 800, color: '#1A202C', letterSpacing: '-0.02em' },
  sub:     { fontSize: 13, color: '#718096', marginTop: 2 },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 },
  cell: {
    background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14,
    padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cellHead:  { display: 'flex', alignItems: 'center', gap: 12 },
  cellTitle: { fontSize: 13, fontWeight: 800, color: '#1A202C' },
  cellSub:   { fontSize: 11, color: '#718096', marginTop: 1 },
  iconWrap:  { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  onlineDot: { width: 9, height: 9, borderRadius: '50%', background: '#007A33', boxShadow: '0 0 6px rgba(0,122,51,0.5)', animation: 'pulse 2s ease-in-out infinite' },
  userCard:  { display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.025)', borderRadius: 12, padding: '12px 14px' },
  avatar: {
    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #E1251B, #B01A12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 800, color: '#fff', boxShadow: '0 4px 12px rgba(225,37,27,0.25)',
  },
  roleBadge: {
    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
    fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
    background: 'rgba(225,37,27,0.08)', color: '#E1251B',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px 0', borderRadius: 10, border: '1px solid rgba(225,37,27,0.20)',
    background: 'rgba(225,37,27,0.06)', color: '#E1251B',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
  },
  sRow: { display: 'flex', alignItems: 'center', gap: 14 },
  statusPill: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(0,0,0,0.025)', borderRadius: 10, padding: '10px 14px',
  },
}
