import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import config from '@/config/config'
import BrainCanvas from './BrainCanvas'
import {
  DEFAULT_YEAR, ESTADO, yearSummary, municipiosWon, topMunicipios,
  fmt, fmtPct,
} from '@/data/electoral'

/* ── Comandos de voz → rutas ──────────────────────────────────────────
   Agrega secciones aquí; el matching es por inclusión de palabra clave. */
const COMMANDS = [
  { to: '/',              label: 'Comando Central', keys: ['comando central', 'inicio', 'tablero', 'principal'] },
  { to: '/reportes',      label: 'Resultados',      keys: ['resultado', 'reporte'] },
  { to: '/alertas',       label: 'Alertas',         keys: ['alerta'] },
  { to: '/configuracion', label: 'Configuración',   keys: ['config', 'ajuste', 'preferencia'] },
]

/* Preguntas de datos que Jarvis responde con los datos reales de Oaxaca. */
function responderDato(said, pathname) {
  const s = yearSummary(DEFAULT_YEAR)
  const has = (...ws) => ws.some(w => said.includes(w))
  if (has('cuánto', 'cuanto', 'cuántos', 'cuantos', 'ganó', 'gano', 'ganad')) {
    return `El PRI ganó ${fmt(s.priMunicipios)} de ${fmt(s.municipios)} municipios en ${DEFAULT_YEAR}.`
  }
  if (has('votación', 'votacion', 'porcentaje', 'voto')) {
    return `El PRI obtuvo ${fmtPct(s.priShare)} de la votación en ${DEFAULT_YEAR}, ${fmt(s.priVotos)} votos.`
  }
  if (has('abstenc')) {
    return `La abstención promedio en ${DEFAULT_YEAR} fue ${fmtPct(s.abstencion)}.`
  }
  if (has('plaza', 'mayor', 'más votos', 'mas votos', 'fuerte')) {
    const t = topMunicipios(DEFAULT_YEAR, 'PRI', 1)[0]
    return `La mayor plaza del PRI es ${t.municipio} con ${fmt(t.votos)} votos.`
  }
  if (has('segunda', '2da', 'oposición', 'oposicion', 'contendiente')) {
    const won = municipiosWon(DEFAULT_YEAR)
    const seg = Object.entries(won).filter(([k]) => k !== 'PRI').sort((a, b) => b[1] - a[1])[0]
    return `La segunda fuerza es ${seg[0]} con ${fmt(seg[1])} municipios.`
  }
  if (has('municipio', 'padrón', 'padron', 'lista nominal', 'casilla')) {
    return `${ESTADO} tiene ${fmt(s.municipios)} municipios, ${fmt(s.casillas)} casillas y ${fmt(s.listaNominal)} en lista nominal.`
  }
  if (has('dónde estoy', 'donde estoy', 'qué sección', 'que seccion', 'dónde me encuentro', 'donde me encuentro')) {
    if (pathname === '/') return 'Estás en el Comando Central, la vista principal.'
    if (pathname.includes('/reportes')) return 'Estás en la sección de Resultados.'
    if (pathname.includes('/alertas')) return 'Estás revisando las Alertas.'
    if (pathname.includes('/configuracion')) return 'Estás en Ajustes y Configuración.'
    if (pathname.includes('/datos')) return 'Estás explorando las Fuentes de Datos.'
    return 'Estás explorando el sistema.'
  }
  return null
}

const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-MX'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch { /* speechSynthesis no disponible */ }
}

/* Hook de asistente de voz. Devuelve estado + start(). */
export function useVoiceAssistant({ onNavigate } = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [reply, setReply] = useState('')
  const recRef = useRef(null)

  const stop = useCallback(() => {
    if (recRef.current) {
      recRef.current.stop()
      recRef.current = null
      setListening(false)
    }
  }, [])

  const start = useCallback(() => {
    if (!SR) { setReply('Tu navegador no soporta reconocimiento de voz.'); return }
    if (recRef.current) { recRef.current.stop(); return }

    const rec = new SR()
    rec.lang = 'es-MX'
    rec.interimResults = false
    rec.maxAlternatives = 1
    recRef.current = rec
    setTranscript(''); setReply(''); setListening(true)

    rec.onresult = (e) => {
      const said = e.results[0][0].transcript.toLowerCase().trim()
      setTranscript(said)
      const cmd = COMMANDS.find(c => c.keys.some(k => said.includes(k)))
      const dato = responderDato(said, location.pathname)
      if (cmd) {
        setReply(`Abriendo ${cmd.label}`); speak(`Abriendo ${cmd.label}`)
        navigate(cmd.to)
        stop() // Detener la escucha
        if (onNavigate) setTimeout(onNavigate, 800) // Cerrar overlay con leve retraso
      } else if (dato) {
        setReply(dato); speak(dato)
      } else {
        setReply('Prueba: "¿cuántos municipios ganó el PRI?", "¿dónde estoy?" o "abre resultados".')
        speak('No entendí, intenta preguntar por municipios o tu ubicación en el sistema.')
      }
    }
    rec.onerror = () => setReply('No se pudo escuchar. Revisa el micrófono.')
    rec.onend = () => { setListening(false); recRef.current = null }
    rec.start()
  }, [navigate, location.pathname, onNavigate, stop])

  return { supported: !!SR, listening, transcript, reply, start, stop }
}

/* ── Botón compacto para el Header ───────────────────────────────── */
export function JarvisButton() {
  const [hover, setHover] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleClose = useCallback(() => {
    setExpanded(false)
  }, [])

  const { listening, transcript, reply, start, stop } = useVoiceAssistant({
    onNavigate: handleClose
  })

  const handleOpen = () => {
    setExpanded(true)
    start()
  }

  const handleCloseClick = () => {
    stop()
    handleClose()
  }

  return (
    <>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={handleOpen}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          title="MAYIA — haz clic y habla"
          aria-label="MAYIA asistente de voz"
          style={{
            width: 46, height: 46, borderRadius: '50%', cursor: 'pointer',
            border: 'none', padding: 0, position: 'relative',
            background: 'radial-gradient(circle at 50% 45%, var(--color-primary-glow), transparent 72%)',
            transform: hover ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.18s ease',
            display: 'grid', placeItems: 'center',
          }}
        >
          {/* Ring que pulsa al escuchar en el minireproductor */}
          <span style={{
            position: 'absolute', inset: 3, borderRadius: '50%',
            border: `1.5px solid var(--color-primary)`,
            opacity: listening && !expanded ? 0.9 : 0.25,
            animation: listening && !expanded ? 'pulse 1.4s ease-in-out infinite' : 'none',
            transition: 'opacity 0.2s',
          }} />
          <div style={{ width: 42, height: 42 }}>
            <BrainCanvas height={42} active={listening} compact />
          </div>
        </button>
      </div>

      {/* Overlay a pantalla completa via Portal */}
      {expanded && typeof document !== 'undefined' && createPortal(
        <div style={s.immersiveOverlay}>
          {/* Botón Cerrar */}
          <button onClick={handleCloseClick} style={s.closeOverlayBtn} aria-label="Cerrar MAYIA">✕</button>
          
          <div style={s.immersiveContent}>
            {/* Núcleo Gigante */}
            <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto' }}>
               <span style={{
                 position: 'absolute', inset: -15, borderRadius: '50%',
                 border: `2px solid var(--color-primary)`,
                 opacity: listening ? 0.8 : 0.1,
                 animation: listening ? 'pulse 1.4s ease-in-out infinite' : 'none',
                 transition: 'opacity 0.2s',
               }} />
               <BrainCanvas height={280} active={listening} compact={false} />
            </div>

            {/* Conversación */}
            <div style={s.immersiveTextWrap}>
              {transcript ? (
                <p style={s.immersiveTranscript}>"{transcript}"</p>
              ) : (
                <p style={s.immersiveHint}>{listening ? 'Escuchando...' : 'Dime, ¿en qué te puedo ayudar?'}</p>
              )}
              {reply && <p style={s.immersiveReply}>{reply}</p>}
            </div>

            {/* Controles */}
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={listening ? stop : start} 
                style={s.immersiveTalkBtn}
                className="tap"
              >
                {listening ? 'Detener' : 'Hablar con MAYIA'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

/* ── Panel grande para el Comando Central ────────────────────────── */
export function JarvisPanel() {
  const { supported, listening, transcript, reply, start } = useVoiceAssistant()

  // Sugerencias derivadas de los datos REALES (Oaxaca).
  const s = yearSummary(DEFAULT_YEAR)
  const won = municipiosWon(DEFAULT_YEAR)
  const seg = Object.entries(won).filter(([k]) => k !== 'PRI').sort((a, b) => b[1] - a[1])[0]
  const topPri = topMunicipios(DEFAULT_YEAR, 'PRI', 1)[0]
  const suggestions = [
    { tone: 'info', text: `PRI ganó ${fmt(s.priMunicipios)} de ${fmt(s.municipios)} municipios en ${DEFAULT_YEAR} (${fmtPct(s.priShare)} de votación).` },
    { tone: 'high', text: `Vigila a ${seg[0]}: 2ª fuerza con ${fmt(seg[1])} municipios.` },
    { tone: 'critical', text: s.abstencion > 45
        ? `Abstención alta (${fmtPct(s.abstencion)}). Reforzar movilización.`
        : `Plaza fuerte: ${topPri.municipio} (${fmt(topPri.votos)} votos PRI).` },
  ]

  const toneColor = { critical: 'var(--color-red)', high: '#ea580c', info: 'var(--color-blue)' }

  return (
    <div style={panel.root}>
      <div style={panel.brainBox}>
        <BrainCanvas height={150} active={listening} />
      </div>

      <div style={panel.head}>
        <div>
          <h3 style={panel.title}>MAYIA</h3>
          <p style={panel.sub}>{listening ? 'Escuchando…' : 'Sugerencias en tiempo real'}</p>
        </div>
        <button onClick={start} disabled={!supported} style={panel.talkBtn} title="Hablar con el asistente">
          {listening ? 'Detener' : 'Hablar'}
        </button>
      </div>

      {(transcript || reply) && (
        <div style={panel.voiceLine}>
          {transcript && <span style={{ color: 'var(--color-text)' }}>“{transcript}” </span>}
          {reply && <span style={{ color: 'var(--color-text-muted)' }}>· {reply}</span>}
        </div>
      )}

      <div style={panel.list}>
        {suggestions.map((s, i) => (
          <div key={i} style={panel.item}>
            <span style={{ ...panel.itemDot, background: toneColor[s.tone] }} />
            <span style={panel.itemText}>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Estilos ──────────────────────────────────────────────────────── */
const popover = {
  position: 'absolute', top: 52, right: 0, width: 220, maxWidth: 'calc(100vw - 24px)', zIndex: 300,
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 10, padding: '8px 10px', fontSize: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
}
const panel = {
  root: {
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 12,
    animation: 'slideInUp 0.4s ease both',
  },
  brainBox: {
    height: 150, borderRadius: 'var(--radius)', overflow: 'hidden',
    background: 'radial-gradient(circle at 50% 40%, var(--color-primary-glow), transparent 70%)',
  },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  title: { fontSize: 15, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' },
  sub: { fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 },
  talkBtn: {
    fontSize: 12, fontWeight: 600, color: '#fff', background: 'var(--color-primary)',
    border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
  },
  voiceLine: { fontSize: 12, marginTop: 8, padding: '6px 8px', background: 'var(--color-surface-hover)', borderRadius: 8 },
  list: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 },
  item: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  itemDot: { width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0 },
  itemText: { fontSize: 12.5, color: 'var(--color-text-muted)', lineHeight: 1.4 },
}

const s = {
  immersiveOverlay: {
    position: 'fixed', inset: 0, zIndex: 99999,
    background: 'rgba(10, 15, 20, 0.55)', /* Más translúcido para dejar ver el fondo */
    backdropFilter: 'blur(12px)',         /* Menos difuminado */
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    animation: 'fadeIn 0.3s ease',
  },
  closeOverlayBtn: {
    position: 'absolute', top: 24, right: 24,
    background: 'rgba(255,255,255,0.1)', color: '#fff',
    border: 'none', borderRadius: '50%', width: 44, height: 44,
    fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s',
  },
  immersiveContent: {
    textAlign: 'center', width: '100%', maxWidth: 700, padding: '0 20px',
  },
  immersiveTextWrap: {
    marginTop: 60, minHeight: 120,
  },
  immersiveTranscript: {
    fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#fff',
    lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16,
    textShadow: '0 4px 16px rgba(0,0,0,0.5)',
  },
  immersiveReply: {
    fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 500, color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.4, maxWidth: 580, margin: '0 auto',
  },
  immersiveHint: {
    fontSize: 20, fontWeight: 500, color: 'rgba(255,255,255,0.4)',
  },
  immersiveTalkBtn: {
    background: 'var(--color-primary)', color: '#fff', border: 'none',
    padding: '12px 28px', fontSize: 16, fontWeight: 700, borderRadius: 30,
    cursor: 'pointer', boxShadow: '0 8px 24px rgba(225,37,27,0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
}
