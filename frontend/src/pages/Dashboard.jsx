import { useEffect, useState } from 'react'
import { getDashboardMetrics, getAlerts, getMapData, getRecentActivity } from '@/data/dataSource'
import { MX_STATES, MX_VIEWBOX } from '@/data/mexicoStates'
import { JarvisPanel } from '@/components/ui/Jarvis'
import { MayiaPanel } from '@/components/ui/Mayia'

/* ── Helpers de color — Modo Claro Institucional PRI ─────────────── */
const levelColor = {
  low:      'rgba(0,122,51,0.45)',      /* verde PRI */
  medium:   'rgba(217,119,6,0.55)',     /* ámbar */
  high:     'rgba(234,88,12,0.68)',     /* naranja */
  critical: 'rgba(225,37,27,0.78)',     /* rojo PRI */
}
const levelStroke = {
  low:      '#007A33',   /* verde PRI */
  medium:   '#B45309',   /* ámbar */
  high:     '#C2410C',   /* naranja oscuro */
  critical: '#E1251B',   /* rojo PRI */
}
const severityConfig = {
  high:    { color: '#E1251B', bg: 'rgba(225,37,27,0.08)',  dot: '#E1251B', label: 'Alta'   },
  medium:  { color: '#B45309', bg: 'rgba(180,83,9,0.08)',   dot: '#B45309', label: 'Media'  },
  info:    { color: '#1D4ED8', bg: 'rgba(29,78,216,0.08)',  dot: '#1D4ED8', label: 'Info'   },
  success: { color: '#007A33', bg: 'rgba(0,122,51,0.08)',   dot: '#007A33', label: 'OK'     },
}
const metricColor = {
  blue:   { bg: 'rgba(29,78,216,0.06)',  accent: '#1D4ED8',  glow: 'rgba(29,78,216,0.15)'  },
  green:  { bg: 'rgba(0,122,51,0.06)',   accent: '#007A33',  glow: 'rgba(0,122,51,0.15)'   },
  yellow: { bg: 'rgba(180,83,9,0.06)',   accent: '#B45309',  glow: 'rgba(180,83,9,0.15)'   },
  red:    { bg: 'rgba(225,37,27,0.06)',  accent: '#E1251B',  glow: 'rgba(225,37,27,0.15)'  },
}

/* ── Mapa SVG de México ────────────────────────────────────────────
   Paths reales de los 32 estados en @/data/mexicoStates.js            */

// Centroide aproximado: recorre el path (comandos M/m/l/z, relativos) acumulando
// puntos absolutos y promediándolos. Suficiente para posicionar un punto.
function pathCentroid(d) {
  const toks = d.match(/[MmLlZz]|-?\d*\.?\d+/g) ?? []
  let cx = 0, cy = 0, rel = false, sx = 0, sy = 0, first = true
  const pts = []
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]
    if (/[MmLlZz]/.test(t)) { rel = t === 'm' || t === 'l'; if (first && t === 'm') rel = false; continue }
    // t es un número → es el primer valor de un par (x,y)
    const dx = parseFloat(t), dy = parseFloat(toks[++i])
    sx = rel ? sx + dx : dx
    sy = rel ? sy + dy : dy
    rel = true // tras el primer par, los siguientes son líneas relativas
    first = false
    pts.push([sx, sy])
  }
  pts.forEach(([x, y]) => { cx += x; cy += y })
  return [cx / pts.length, cy / pts.length]
}

function MexicoMap({ data, onStateHover, hoveredState }) {
  const dataMap = {}
  data.forEach(d => { dataMap[d.id] = d })

  return (
    <svg
      viewBox={MX_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', maxHeight: '100%' }}
      aria-label="Mapa de México"
    >
      {/* Fondo del mapa */}
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(225,37,27,0.07)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="stateGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Fondo radial */}
      <ellipse cx="396" cy="249" rx="380" ry="250" fill="url(#mapGlow)" />

      {/* Grid sutil */}
      {[...Array(14)].map((_, i) => (
        <line key={`v${i}`} x1={i*60+20} y1={10} x2={i*60+20} y2={488}
          stroke="rgba(120,130,140,0.14)" strokeWidth="0.5" strokeDasharray="2,4" />
      ))}
      {[...Array(9)].map((_, i) => (
        <line key={`h${i}`} x1={10} y1={i*60+15} x2={783} y2={i*60+15}
          stroke="rgba(120,130,140,0.14)" strokeWidth="0.5" strokeDasharray="2,4" />
      ))}

      {/* Estados */}
      {MX_STATES.map(({ id, d }) => {
        const stateData = dataMap[id]
        const level = stateData?.level ?? 'low'
        const isHovered = hoveredState === id
        return (
          <path
            key={id}
            d={d}
            fill={isHovered ? levelStroke[level] : levelColor[level]}
            stroke={isHovered ? levelStroke[level] : 'var(--color-border)'}
            strokeWidth={isHovered ? 2.2 : 1}
            style={{
              cursor: 'pointer',
              transition: 'fill 0.2s, stroke 0.2s',
              filter: isHovered ? 'url(#stateGlow)' : 'none',
            }}
            onMouseEnter={() => onStateHover(id)}
            onMouseLeave={() => onStateHover(null)}
          >
            <title>{stateData ? `${stateData.name}: ${stateData.value} registros` : id}</title>
          </path>
        )
      })}

      {/* Puntos de capital / hotspot para estados críticos */}
      {data.filter(d => d.level === 'critical').map(d => {
        const state = MX_STATES.find(s => s.id === d.id)
        if (!state) return null
        const [cx, cy] = pathCentroid(state.d)
        return (
          <g key={d.id}>
            <circle cx={cx} cy={cy} r={10} fill="rgba(225,37,27,0.18)" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            <circle cx={cx} cy={cy} r={4}  fill="#E1251B" filter="url(#glow)" />
          </g>
        )
      })}

      {/* Texto "México" sutil */}
      <text x="396" y="492" textAnchor="middle" fill="rgba(139,148,158,0.4)" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="4">
        MÉXICO
      </text>
    </svg>
  )
}

/* ── Sparkline mini chart ───────────────────────────────────────── */
function Sparkline({ color, values = [30,45,28,60,42,55,70] }) {
  const w = 80, h = 30
  const max = Math.max(...values)
  const min = Math.min(...values)
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(' ').at(-1).split(',')[0]} cy={pts.split(' ').at(-1).split(',')[1]} r="2.5" fill={color} />
    </svg>
  )
}

/* ── Componente de Alerta ──────────────────────────────────────── */
function AlertItem({ alert, index }) {
  const cfg = severityConfig[alert.severity] ?? severityConfig.info
  return (
    <div style={{
      ...sa.alertItem,
      background: cfg.bg,
      borderLeft: `3px solid ${cfg.dot}`,
      animationDelay: `${index * 80}ms`,
    }}>
      <div style={sa.alertTop}>
        <span style={{ ...sa.alertDot, background: cfg.dot, animation: alert.severity === 'high' ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
        <span style={{ ...sa.alertLabel, color: cfg.color }}>{cfg.label}</span>
        <span style={sa.alertTime}>{alert.time}</span>
      </div>
      <p style={sa.alertTitle}>{alert.title}</p>
      <div style={sa.alertMeta}>
        <span style={sa.alertTag}>{alert.category}</span>
        <span style={sa.alertRegion}>{alert.region}</span>
      </div>
    </div>
  )
}

const sa = {
  alertItem: {
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 8,
    animation: 'slideInLeft 0.4s ease both',
    border: '1px solid var(--color-border)',
    cursor: 'default',
    transition: 'transform 0.15s',
  },
  alertTop: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  alertDot: { width: 7, height: 7, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
  alertLabel: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' },
  alertTime: { fontSize: 10, color: 'var(--color-text-dim)', marginLeft: 'auto' },
  alertTitle: { fontSize: 12.5, color: 'var(--color-text)', fontWeight: 500, lineHeight: 1.4, marginBottom: 6 },
  alertMeta: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  alertTag:  { fontSize: 10, background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '1px 6px', color: 'var(--color-text-muted)' },
  alertRegion: { fontSize: 10, color: 'var(--color-text-dim)' },
}

/* ── KPI Card ───────────────────────────────────────────────────── */
function KpiCard({ metric, index }) {
  const clr = metricColor[metric.color] ?? metricColor.blue
  return (
    <div style={{
      ...sk.card,
      background: clr.bg,
      border: `1px solid ${clr.accent}33`,
      animationDelay: `${index * 80}ms`,
    }}>
      <span style={{ ...sk.label }}>{metric.label}</span>
      <div style={sk.row}>
        <span style={{ ...sk.value, color: clr.accent }}>{metric.value}</span>
        <span style={{ ...sk.change, color: metric.trend === 'up' ? 'var(--color-green)' : 'var(--color-red)' }}>
          {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
        </span>
      </div>
      <Sparkline color={clr.accent} values={[20,35,28,50,38,55,parseInt(metric.value.replace(/,/g,'')) % 80 + 10]} />
    </div>
  )
}
const sk = {
  card: {
    borderRadius: 10,
    padding: '12px 14px',
    animation: 'slideInRight 0.4s ease both',
    marginBottom: 8,
    cursor: 'default',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  label: { fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 },
  row: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 },
  value: { fontSize: 24, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' },
  change: { fontSize: 11, fontWeight: 600 },
}

/* ── Actividad reciente ─────────────────────────────────────────── */
function ActivityItem({ item, index }) {
  return (
    <div style={{ ...sac.row, animationDelay: `${index * 60}ms` }}>
      <div style={sac.dot} />
      <div style={sac.info}>
        <span style={sac.action}>{item.action}</span>
        <span style={sac.meta}>{item.state} · {item.user}</span>
      </div>
      <span style={sac.time}>{item.time}</span>
    </div>
  )
}
const sac = {
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--color-border)', animation: 'fadeIn 0.5s ease both' },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  action: { display: 'block', fontSize: 12.5, color: 'var(--color-text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { fontSize: 11, color: 'var(--color-text-muted)' },
  time: { fontSize: 11, color: 'var(--color-text-dim)', flexShrink: 0 },
}

/* ── Hook responsive ─────────────────────────────────────────────── */
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

/* ── Dashboard principal ────────────────────────────────────────── */
export default function Dashboard() {
  const [metrics,   setMetrics]   = useState([])
  const [alerts,    setAlerts]    = useState([])
  const [mapData,   setMapData]   = useState([])
  const [activity,  setActivity]  = useState([])
  const [hovered,   setHovered]   = useState(null)
  const [tooltip,   setTooltip]   = useState(null)
  const windowWidth = useWindowWidth()
  const isTablet = windowWidth <= 1100
  const isMobileView = windowWidth <= 768

  useEffect(() => {
    getDashboardMetrics().then(setMetrics)
    getAlerts().then(setAlerts)
    getMapData().then(setMapData)
    getRecentActivity().then(setActivity)
  }, [])

  const hoveredState = hovered ? mapData.find(d => d.id === hovered) : null

  return (
    <div style={{ ...sd.root, height: isTablet ? 'auto' : '100%' }}>

      {/* ── Grid HUD: 3 columnas ─────────────────────────────── */}
      <div style={{
          ...sd.mainGrid,
          gridTemplateColumns: isMobileView ? '1fr' : isTablet ? '1fr' : 'minmax(260px,1fr) 2.2fr minmax(260px,1fr)',
          flex: isTablet ? 'none' : 1,
        }}>

        {/* ══ Columna izquierda — Alertas HUD ══════════════════ */}
        <aside
          className="hud-panel hud-red"
          style={{
            ...sd.leftCol,
            maxHeight: isTablet ? 'none' : 'calc(100vh - 88px)',
            overflow: isTablet ? 'visible' : 'hidden',
          }}
        >
          {/* Esquinas decorativas HUD */}
          <span className="hud-corner tl" />
          <span className="hud-corner tr" />
          <span className="hud-corner bl" />
          <span className="hud-corner br" style={{ borderColor: 'var(--color-primary)' }} />

          <div style={sd.colHeader}>
            <span style={sd.colTitle}>Alertas del Sistema</span>
            <span style={sd.colBadge}>{alerts.length}</span>
          </div>
          <div style={{ ...sd.scrollArea, overflowY: isTablet ? 'visible' : 'auto' }}>
            {alerts.map((a, i) => <AlertItem key={a.id} alert={a} index={i} />)}
          </div>
        </aside>

        {/* ══ Columna central — Mapa México ════════════════════ */}
        <section style={sd.centerCol}>
          <div style={sd.mapHeader}>
            <div>
              <h2 style={sd.mapTitle}>Centro de Operaciones Nacional</h2>
              <p style={sd.mapSub}>Distribución de actividad por estado · Tiempo real</p>
            </div>
            <div style={sd.mapLegend}>
              {Object.entries(levelStroke).map(([lvl, clr]) => (
                <span key={lvl} style={sd.legendItem}>
                  <span style={{ ...sd.legendDot, background: clr, boxShadow: `0 0 5px ${clr}` }} />
                  <span style={sd.legendLabel}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Contenedor del mapa */}
          <div style={sd.mapWrap}>
            <div style={sd.mapGrid} aria-hidden="true" />
            <MexicoMap data={mapData} onStateHover={setHovered} hoveredState={hovered} />

            {/* Esquinas HUD del mapa */}
            <span className="hud-corner tl" style={{ '--hc-color': '#0ea5e9' }} />
            <span className="hud-corner tr" style={{ '--hc-color': '#0ea5e9' }} />
            <span className="hud-corner bl" style={{ '--hc-color': '#E1251B' }} />
            <span className="hud-corner br" style={{ '--hc-color': '#E1251B' }} />
          </div>

          {/* Tooltip estado */}
          {hoveredState && (
            <div style={sd.tooltip}>
              <span style={{ ...sd.tooltipDot, background: levelStroke[hoveredState.level], boxShadow: `0 0 8px ${levelStroke[hoveredState.level]}` }} />
              <strong style={{ color: '#ffffff', fontWeight: 800, fontSize: 14, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{hoveredState.name}</strong>
              <span style={sd.tooltipInfo}>
                {hoveredState.value.toLocaleString()} registros · Nivel {hoveredState.level}
              </span>
            </div>
          )}

          {/* Actividad reciente */}
          <div className="hud-panel" style={sd.activityBox}>
            <span className="hud-corner tl" />
            <span className="hud-corner br" />
            <div style={sd.colHeader}>
              <span style={sd.colTitle}>Actividad Reciente</span>
              <span style={sd.liveTag}>● LIVE</span>
            </div>
            {activity.map((a, i) => <ActivityItem key={a.id} item={a} index={i} />)}
          </div>
        </section>

        {/* ══ Columna derecha — IA + KPIs HUD ══════════════════ */}
        <aside
          className="hud-panel hud-green"
          style={{
            ...sd.rightCol,
            maxHeight: isTablet ? 'none' : 'calc(100vh - 88px)',
            overflowY: isTablet ? 'visible' : 'auto',
          }}
        >
          <span className="hud-corner tl" style={{ borderColor: '#00c857' }} />
          <span className="hud-corner tr" />
          <span className="hud-corner bl" />
          <span className="hud-corner br" />

          <JarvisPanel mapData={mapData} alerts={alerts} />

          <MayiaPanel section="dashboard" title="MAYIA" />

          <div style={sd.colHeader}>
            <span style={sd.colTitle}>Indicadores Clave</span>
            <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>Tiempo real</span>
          </div>
          {metrics.map((m, i) => <KpiCard key={m.id} metric={m} index={i} />)}

          {/* Cobertura nacional */}
          <div style={sd.statBar}>
            <div style={sd.colHeader}>
              <span style={sd.colTitle}>Cobertura nacional</span>
              <span style={{ fontSize: 12, color: '#00c857', fontWeight: 700 }}>74%</span>
            </div>
            <div style={sd.barTrack}>
              <div style={{ ...sd.barFill, width: '74%', background: 'linear-gradient(90deg, #00c857, #0ea5e9)' }} />
            </div>
            <div style={sd.barLabels}>
              <span>Activos</span><span>Pendientes: 26%</span>
            </div>
          </div>

          {/* Distribución por nivel */}
          <div style={sd.distBox}>
            <span style={sd.colTitle}>Por nivel de actividad</span>
            {[
              { label: 'Crítico', pct: 12, color: '#ff3b35' },
              { label: 'Alto',    pct: 38, color: '#fb923c' },
              { label: 'Medio',   pct: 32, color: '#f59e0b' },
              { label: 'Bajo',    pct: 18, color: '#00c857' },
            ].map(({ label, pct, color }) => (
              <div key={label} style={sd.distRow}>
                <span style={{ ...sd.distLabel }}>{label}</span>
                <div style={sd.distTrack}>
                  <div style={{ ...sd.distFill, width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}55` }} />
                </div>
                <span style={{ ...sd.distPct, color }}>{pct}%</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ── Estilos del Dashboard HUD ──────────────────────────────────── */
const sd = {
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minHeight: 0,
  },
  mainGrid: {
    display: 'grid',
    gap: 10,
    flex: 1,
    minHeight: 0,
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    padding: 14,
    animation: 'slideInLeft 0.5s ease both',
    maxHeight: 'calc(100vh - 88px)',
    overflow: 'hidden',
    position: 'relative',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    padding: 14,
    animation: 'slideInRight 0.5s ease both',
    maxHeight: 'calc(100vh - 88px)',
    overflowY: 'auto',
    position: 'relative',
  },
  centerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 0,
    animation: 'fadeIn 0.6s ease both',
  },
  colHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  colTitle: {
    fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.10em',
  },
  colBadge: {
    fontSize: 10, fontWeight: 700, color: '#fff',
    background: '#E1251B',
    borderRadius: 20, padding: '2px 8px',
    minWidth: 22, textAlign: 'center',
    boxShadow: '0 0 8px rgba(225,37,27,0.5)',
  },
  liveTag: {
    fontSize: 9, fontWeight: 700, color: '#00c857',
    letterSpacing: '0.1em', animation: 'blink 2s ease-in-out infinite',
  },
  scrollArea: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
  mapHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 8, flexWrap: 'wrap',
  },
  mapTitle: {
    fontSize: 13, fontWeight: 800, color: 'var(--color-text)',
    letterSpacing: '-0.01em',
    textShadow: '0 0 20px rgba(14,165,233,0.2)',
  },
  mapSub:   { fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3, letterSpacing: '0.03em' },
  mapLegend: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5 },
  legendDot:  { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500 },
  mapWrap: {
    background: 'radial-gradient(ellipse at 50% 38%, #ffffff 0%, #eef1f5 100%)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: '6px',
    aspectRatio: '16/9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05) inset',
  },
  mapGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    pointerEvents: 'none',
    borderRadius: 12,
  },
  backBtn: {
    position: 'absolute', top: 10, left: 10, zIndex: 3,
    fontSize: 12, fontWeight: 700, color: 'var(--color-text)',
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tooltip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(13,17,22,0.95)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 12,
    color: '#ffffff',
    animation: 'fadeIn 0.15s ease',
    backdropFilter: 'blur(12px)',
  },
  tooltipDot: {
    width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
  },
  tooltipInfo: {
    color: 'rgba(255,255,255,0.85)', fontSize: 11.5, fontWeight: 600,
  },
  activityBox: {
    borderRadius: 10,
    padding: '10px 12px',
    position: 'relative',
  },
  statBar: {
    marginTop: 8,
    background: 'rgba(0,200,87,0.06)',
    border: '1px solid rgba(0,200,87,0.15)',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 8,
  },
  barTrack: {
    height: 4,
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 3, margin: '8px 0 4px', overflow: 'hidden',
  },
  barFill:  { height: '100%', borderRadius: 3, transition: 'width 1.2s ease' },
  barLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-dim)' },
  distBox: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '10px 12px',
    marginTop: 4,
  },
  distRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
  distLabel: { fontSize: 10, color: 'var(--color-text-muted)', width: 44, flexShrink: 0 },
  distTrack: { flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
  distFill:  { height: '100%', borderRadius: 3, transition: 'width 1.4s ease' },
  distPct:   { fontSize: 10, width: 28, textAlign: 'right', flexShrink: 0, fontWeight: 600 },
}
