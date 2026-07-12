import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { KIND, mayiaInsights, mayiaFor } from '@/data/mayia'

/* Tonos por tipo de insight (mismos tokens del sistema). */
const TONE = {
  red:   { color: 'var(--color-primary)', soft: 'var(--color-primary-soft)' },
  green: { color: 'var(--color-accent)',  soft: 'var(--color-accent-soft)' },
  blue:  { color: 'var(--color-blue)',    soft: 'rgba(37,99,235,0.08)' },
  gray:  { color: 'var(--color-graphite)', soft: 'var(--color-gray-soft)' },
}
const toneOf = (kind) => TONE[KIND[kind]?.tone] ?? TONE.gray

/* Marca MAYIA (glifo SVG, sin emoji). */
export function MayiaMark({ size = 16, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  )
}

const VISIBLE = 3          // toasts visibles en la pila (colapsada)
const GAP = 10
const TTL = 6500           // vida de un toast normal (ms)
const TTL_PLAN = 13000     // los que traen plan viven más

/* ── Contexto / Provider ──────────────────────────────────────────── */
const MayiaCtx = createContext(null)
export const useMayia = () => useContext(MayiaCtx)

export function MayiaProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [archive, setArchive] = useState([])   // notificaciones "terminadas" → campana
  // Interruptor de notificaciones (persistido). Controla toasts y autopiloto.
  const [enabled, setEnabledState] = useState(() => localStorage.getItem('mayia_notif') !== 'off')
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled
  const setEnabled = useCallback((v) => {
    localStorage.setItem('mayia_notif', v ? 'on' : 'off')
    setEnabledState(v)
  }, [])
  const seq = useRef(0)
  const timers = useRef({})   // tid → { timer, remaining, start }

  // Manda un toast al archivo (campana) y lo saca de la pila.
  const dismiss = useCallback((tid, toBell = true) => {
    setToasts(ts => {
      const t = ts.find(x => x.tid === tid)
      if (t && toBell) {
        setArchive(a => [{ id: t.id, kind: t.kind, title: t.title, detail: t.detail, ts: Date.now() }, ...a].slice(0, 30))
      }
      return ts.filter(x => x.tid !== tid)
    })
    const info = timers.current[tid]
    if (info) { clearTimeout(info.timer); delete timers.current[tid] }
  }, [])

  const arm = useCallback((tid, ms) => {
    const start = Date.now()
    const timer = setTimeout(() => dismiss(tid, true), ms)
    timers.current[tid] = { timer, remaining: ms, start }
  }, [dismiss])

  const notify = useCallback((insight, ttl) => {
    if (!insight || !enabledRef.current) return
    const tid = ++seq.current
    setToasts(ts => [...ts, { ...insight, tid }].slice(-6))   // más nuevo al final
    arm(tid, ttl ?? (insight.plan ? TTL_PLAN : TTL))
    return tid
  }, [arm])

  const accept = useCallback((insight, tid) => {
    if (tid) dismiss(tid, true)
    notify({
      id: 'ok-' + insight.id, kind: 'sugerencia',
      title: 'Plan aceptado', detail: `${insight.plan?.label ?? insight.title}. MAYIA lo dejó en marcha.`,
    }, 5000)
  }, [dismiss, notify])

  // Pausar/reanudar timers al pasar el mouse por la pila.
  const pauseAll = useCallback(() => {
    Object.values(timers.current).forEach(info => {
      clearTimeout(info.timer)
      info.remaining -= Date.now() - info.start
    })
  }, [])
  const resumeAll = useCallback(() => {
    Object.entries(timers.current).forEach(([tid, info]) => {
      info.start = Date.now()
      info.timer = setTimeout(() => dismiss(Number(tid), true), Math.max(info.remaining, 400))
    })
  }, [dismiss])

  const clearArchive = useCallback(() => setArchive([]), [])

  /* Autopiloto de MAYIA:
     - un toast cada 30 s
     - cada 60 s, una ráfaga de 3 (uno por segundo) */
  useEffect(() => {
    if (!enabled) return   // notificaciones desactivadas → sin autopiloto
    const feed = mayiaInsights()
    let idx = 0
    const uno = () => notify(feed[idx++ % feed.length])
    const rafaga = () => {
      let k = 0
      const b = setInterval(() => { notify(feed[idx++ % feed.length]); if (++k >= 3) clearInterval(b) }, 1000)
    }
    const t0 = setTimeout(uno, 2000)
    const i30 = setInterval(uno, 30000)
    const i60 = setInterval(rafaga, 60000)
    return () => { clearTimeout(t0); clearInterval(i30); clearInterval(i60) }
  }, [notify, enabled])

  return (
    <MayiaCtx.Provider value={{ notify, accept, dismiss, toasts, archive, clearArchive, enabled, setEnabled }}>
      {children}
      <ToastStack toasts={toasts} onAccept={accept} onDismiss={dismiss} onHover={pauseAll} onLeave={resumeAll} />
    </MayiaCtx.Provider>
  )
}

/* ── Pila de toasts apilada (estilo Geist) ────────────────────────── */
function ToastStack({ toasts, onAccept, onDismiss, onHover, onLeave }) {
  const [hovered, setHovered] = useState(false)
  const [shown, setShown] = useState([])          // ids ya animados (entrada)
  const [heights, setHeights] = useState({})      // tid → alto medido
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const nuevos = toasts.filter(t => !shown.includes(t.tid)).map(t => t.tid)
    if (nuevos.length) requestAnimationFrame(() => setShown(p => [...p, ...nuevos]))
  }, [toasts]) // eslint-disable-line

  const measure = (tid) => (node) => {
    if (node) {
      const h = node.getBoundingClientRect().height
      if (heights[tid] !== h) setHeights(prev => ({ ...prev, [tid]: h }))
    }
  }

  const n = toasts.length
  const h = (tid) => heights[tid] ?? 66
  const front = n ? h(toasts[n - 1].tid) : 66

  // Altura del contenedor (área sensible al hover).
  const vis = toasts.slice(-VISIBLE)
  const contH = hovered
    ? vis.reduce((a, t) => a + h(t.tid) + GAP, 0)
    : front + 16

  const transformFor = (i) => {
    const sign = isMobile ? 1 : -1
    if (!shown.includes(toasts[i].tid)) return { transform: `translate3d(0,${sign * -120}%,0) scale(1)`, opacity: 0 }
    const offset = n - 1 - i
    if (offset > VISIBLE - 1) return { transform: `translate3d(0,${sign * offset * 6}px,0) scale(0.9)`, opacity: 0, pointerEvents: 'none' }
    if (offset === 0) return { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, zIndex: 50 }
    let y
    if (hovered) {
      let sum = 0
      for (let j = i + 1; j < n; j++) sum += h(toasts[j].tid) + GAP
      y = sign * sum
    } else {
      y = sign * (offset * 12)
    }
    const scale = hovered ? 1 : 1 - 0.05 * offset
    return { transform: `translate3d(0,${y}px,0) scale(${scale})`, opacity: 1, zIndex: 50 - offset }
  }

  return (
    <div className="mayia-stack" style={{ ...stackWrap, height: contH }} aria-live="polite" role="status">
      <div
        style={{ position: 'relative', width: '100%', height: contH, pointerEvents: 'auto' }}
        onMouseEnter={() => { setHovered(true); onHover?.() }}
        onMouseLeave={() => { setHovered(false); onLeave?.() }}
        onClick={() => setHovered(v => !v)}
      >
        {toasts.map((t, i) => {
          const tone = toneOf(t.kind)
          const tf = transformFor(i)
          return (
            <div
              key={t.tid} ref={measure(t.tid)}
              style={{
                ...toast, borderLeft: `4px solid ${tone.color}`,
                bottom: isMobile ? 'auto' : 0,
                top: isMobile ? 0 : 'auto',
                transform: tf.transform, opacity: tf.opacity, zIndex: tf.zIndex ?? 1,
                pointerEvents: tf.pointerEvents ?? 'auto',
              }}
            >
              <div style={toastHead}>
                <span style={{ ...kindChip, color: tone.color, background: tone.soft }}>
                  <MayiaMark size={12} color={tone.color} /> MAYIA · {KIND[t.kind]?.label}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onDismiss(t.tid, true) }} style={closeBtn} aria-label="Cerrar">✕</button>
              </div>
              <p style={toastTitle}>{t.title}</p>
              <p style={toastDetail}>{t.detail}</p>
              {t.plan && (
                <div style={toastActions}>
                  <button onClick={(e) => { e.stopPropagation(); onAccept(t, t.tid) }} className="tap" style={{ ...btn, ...btnOk }}>{t.plan.ok ?? 'Aceptar'}</button>
                  <button onClick={(e) => { e.stopPropagation(); onDismiss(t.tid, true) }} className="tap" style={{ ...btn, ...btnGhost }}>Ahora no</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Panel MAYIA para cada sección ────────────────────────────────── */
export function MayiaPanel({ section = 'global', title = 'MAYIA', items }) {
  const mayia = useMayia()
  const [hechos, setHechos] = useState({})
  const insights = items ?? mayiaFor(section)
  if (!insights.length) return null

  const marcar = (ins, estado) => {
    setHechos(h => ({ ...h, [ins.id]: estado }))
    if (estado === 'ok' && mayia) mayia.accept(ins)
  }

  return (
    <div style={panelWrap}>
      <div style={panelHead}>
        <span style={panelBrand}><MayiaMark size={16} /> {title}</span>
        <span style={panelSub}>análisis en vivo</span>
      </div>
      <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {insights.map((ins, idx) => {
          const tone = toneOf(ins.kind)
          const estado = hechos[ins.id]
          return (
            <div key={ins.id} className="lift" style={{ ...insightCard, '--i': idx, background: tone.soft }}>
              <div style={insightTop}>
                <span style={{ ...kindChip, color: tone.color, background: 'var(--color-surface)' }}>{KIND[ins.kind]?.label}</span>
                {estado && <span style={{ ...stateTag, color: estado === 'ok' ? 'var(--color-accent)' : 'var(--color-text-dim)' }}>
                  {estado === 'ok' ? 'Aceptado' : 'Descartado'}
                </span>}
              </div>
              <p style={insightTitle}>{ins.title}</p>
              <p style={insightDetail}>{ins.detail}</p>
              {ins.plan && !estado && (
                <div style={toastActions}>
                  <button onClick={() => marcar(ins, 'ok')} className="tap" style={{ ...btn, ...btnOk }}>{ins.plan.ok ?? 'Aceptar'}</button>
                  <button onClick={() => marcar(ins, 'no')} className="tap" style={{ ...btn, ...btnGhost }}>Descartar</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Estilos ──────────────────────────────────────────────────────── */
const stackWrap = { position: 'fixed', zIndex: 400, pointerEvents: 'none' }
const toast = {
  position: 'absolute', right: 0, bottom: 0, width: '100%',
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 12, padding: '12px 14px',
  boxShadow: '0 12px 32px rgba(14,17,22,0.14)',
  transition: 'transform 0.35s cubic-bezier(.25,.75,.6,.98), opacity 0.3s ease',
}
const toastHead = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }
const kindChip = { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999 }
const closeBtn = { background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 2 }
const toastTitle = { fontSize: 13.5, fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.3 }
const toastDetail = { fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.45, marginTop: 3 }
const toastActions = { display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }
const btn = { fontSize: 12, fontWeight: 700, padding: '7px 12px', borderRadius: 8, cursor: 'pointer', border: 'none' }
const btnOk = { background: 'var(--color-primary)', color: '#fff' }
const btnGhost = { background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }

const panelWrap = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 12 }
const panelHead = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }
const panelBrand = { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.01em' }
const panelSub = { fontSize: 11, color: 'var(--color-text-muted)' }
const insightCard = { border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 14px', animation: 'slideInUp 0.4s ease both', animationDelay: 'calc(var(--i) * 60ms)' }
const insightTop = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }
const stateTag = { fontSize: 11, fontWeight: 700 }
const insightTitle = { fontSize: 13.5, fontWeight: 700, color: 'var(--color-ink)', marginTop: 6, lineHeight: 1.3 }
const insightDetail = { fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.45, marginTop: 3 }
