import { useEffect, useState } from 'react'
import { getDashboardMetrics, getAlerts, getMapData, getRecentActivity } from '@/data/dataSource'
import { MX_STATES, MX_VIEWBOX } from '@/data/mexicoStates'
import { JarvisPanel } from '@/components/ui/Jarvis'

/* ── Helpers de color ───────────────────────────────────────────── */
// Rampa de intensidad sobre fondo claro: verde → amarillo → naranja → rojo PRI
const levelColor = {
  low:      'rgba(0,150,57,0.22)',
  medium:   'rgba(217,158,0,0.30)',
  high:     'rgba(234,88,12,0.35)',
  critical: 'rgba(225,37,27,0.45)',
}
const levelStroke = {
  low:      '#009639',
  medium:   '#d99e00',
  high:     '#ea580c',
  critical: '#E1251B',
}
const severityConfig = {
  high:    { color: 'var(--color-red)',    bg: 'rgba(225,37,27,0.10)',  dot: '#E1251B', label: 'Alta'   },
  medium:  { color: 'var(--color-yellow)', bg: 'rgba(217,158,0,0.12)',  dot: '#d99e00', label: 'Media'  },
  info:    { color: 'var(--color-blue)',   bg: 'rgba(37,99,235,0.10)',  dot: '#2563eb', label: 'Info'   },
  success: { color: 'var(--color-green)',  bg: 'rgba(0,150,57,0.12)',   dot: '#009639', label: 'OK'     },
}
const metricColor = {
  blue:   { bg: 'rgba(37,99,235,0.08)',  accent: '#2563eb',  glow: 'rgba(37,99,235,0.16)'  },
  green:  { bg: 'rgba(0,150,57,0.08)',   accent: '#009639',  glow: 'rgba(0,150,57,0.16)'   },
  yellow: { bg: 'rgba(217,158,0,0.10)',  accent: '#d99e00',  glow: 'rgba(217,158,0,0.16)'  },
  red:    { bg: 'rgba(225,37,27,0.08)',  accent: '#E1251B',  glow: 'rgba(225,37,27,0.16)'  },
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
            strokeWidth={isHovered ? 2 : 0.8}
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

      {/* ── Fila superior: 3 columnas ─────────────────────────── */}
      <div style={{
          ...sd.mainGrid,
          gridTemplateColumns: isTablet ? '1fr' : '220px 1fr 290px',
          gridTemplateRows: isTablet ? 'auto' : undefined,
          flex: isTablet ? 'none' : 1,
        }}>

        {/* Columna izquierda — Alertas */}
        <aside style={{
          ...sd.leftCol,
          maxHeight: isTablet ? 'none' : 'calc(100vh - 80px)',
          overflow: isTablet ? 'visible' : 'hidden',
        }}>
          <div style={sd.colHeader}>
            <span style={sd.colTitle}>Alertas del Sistema</span>
            <span style={sd.colBadge}>{alerts.length}</span>
          </div>
          <div style={{ ...sd.scrollArea, overflowY: isTablet ? 'visible' : 'auto' }}>
            {alerts.map((a, i) => <AlertItem key={a.id} alert={a} index={i} />)}
          </div>
        </aside>

        {/* Centro — Mapa */}
        <section style={sd.centerCol}>
          <div style={sd.mapHeader}>
            <div>
              <h2 style={sd.mapTitle}>Mapa Nacional</h2>
              <p style={sd.mapSub}>Distribución de registros por estado</p>
            </div>
            <div style={sd.mapLegend}>
              {Object.entries(levelStroke).map(([lvl, clr]) => (
                <span key={lvl} style={sd.legendItem}>
                  <span style={{ ...sd.legendDot, background: clr }} />
                  <span style={sd.legendLabel}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</span>
                </span>
              ))}
            </div>
          </div>

          <div style={sd.mapWrap}>
            <MexicoMap data={mapData} onStateHover={setHovered} hoveredState={hovered} />
          </div>

          {/* Tooltip estado hover */}
          {hoveredState && (
            <div style={sd.tooltip}>
              <strong style={{ color: levelStroke[hoveredState.level] }}>{hoveredState.name}</strong>
              <span style={{ marginLeft: 8, color: 'var(--color-text-muted)', fontSize: 12 }}>
                {hoveredState.value} registros · Nivel: {hoveredState.level}
              </span>
            </div>
          )}

          {/* Actividad reciente bajo el mapa */}
          <div style={sd.activityBox}>
            <span style={sd.colTitle}>Actividad Reciente</span>
            {activity.map((a, i) => <ActivityItem key={a.id} item={a} index={i} />)}
          </div>
        </section>

        {/* Columna derecha — Asistente IA + KPIs */}
        <aside style={{
          ...sd.rightCol,
          maxHeight: isTablet ? 'none' : 'calc(100vh - 80px)',
          overflowY: isTablet ? 'visible' : 'auto',
        }}>
          <JarvisPanel mapData={mapData} alerts={alerts} />

          <div style={sd.colHeader}>
            <span style={sd.colTitle}>Indicadores Clave</span>
            <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>En tiempo real</span>
          </div>
          {metrics.map((m, i) => <KpiCard key={m.id} metric={m} index={i} />)}

          {/* Mini stat bar */}
          <div style={sd.statBar}>
            <span style={sd.colTitle}>Cobertura nacional</span>
            <div style={sd.barTrack}>
              <div style={{ ...sd.barFill, width: '74%', background: 'var(--color-primary)' }} />
            </div>
            <div style={sd.barLabels}>
              <span>74% activos</span><span>26% pendientes</span>
            </div>
          </div>

          {/* Distribución por nivel */}
          <div style={sd.distBox}>
            <span style={sd.colTitle}>Por nivel de actividad</span>
            {[
              { label: 'Crítico', pct: 12, color: '#E1251B' },
              { label: 'Alto',    pct: 38, color: '#ea580c' },
              { label: 'Medio',   pct: 32, color: '#d99e00' },
              { label: 'Bajo',    pct: 18, color: '#009639' },
            ].map(({ label, pct, color }) => (
              <div key={label} style={sd.distRow}>
                <span style={{ ...sd.distLabel }}>{label}</span>
                <div style={sd.distTrack}>
                  <div style={{ ...sd.distFill, width: `${pct}%`, background: color }} />
                </div>
                <span style={sd.distPct}>{pct}%</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ── Estilos del Dashboard ──────────────────────────────────────── */
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
    gridTemplateColumns: '220px 1fr 290px',
    gap: 12,
    flex: 1,
    minHeight: 0,
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 12,
    animation: 'slideInLeft 0.4s ease both',
    maxHeight: 'calc(100vh - 80px)',
    overflow: 'hidden',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 12,
    animation: 'slideInRight 0.4s ease both',
    maxHeight: 'calc(100vh - 80px)',
    overflowY: 'auto',
  },
  centerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 0,
    animation: 'fadeIn 0.5s ease both',
  },
  colHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  colTitle: {
    fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.07em',
  },
  colBadge: {
    fontSize: 10, fontWeight: 700, color: '#fff',
    background: 'var(--color-primary)',
    borderRadius: 20, padding: '1px 7px',
    minWidth: 20, textAlign: 'center',
  },
  scrollArea: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
  mapHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 8, flexWrap: 'wrap',
  },
  mapTitle: { fontSize: 15, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' },
  mapSub:   { fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 },
  mapLegend: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4 },
  legendDot:  { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 10, color: 'var(--color-text-muted)' },
  mapWrap: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 8,
    aspectRatio: '16/9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  tooltip: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 12,
    color: 'var(--color-text)',
    animation: 'fadeIn 0.15s ease',
  },
  activityBox: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 12,
  },
  statBar: {
    marginTop: 8,
    background: 'rgba(225,37,27,0.05)',
    border: '1px solid var(--color-primary-glow)',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 8,
  },
  barTrack: { height: 6, background: 'var(--color-surface-hover)', borderRadius: 3, margin: '8px 0 4px', overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 3, transition: 'width 1s ease' },
  barLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-muted)' },
  distBox: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '10px 12px',
  },
  distRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
  distLabel: { fontSize: 11, color: 'var(--color-text-muted)', width: 46, flexShrink: 0 },
  distTrack: { flex: 1, height: 5, background: 'var(--color-surface-hover)', borderRadius: 3, overflow: 'hidden' },
  distFill:  { height: '100%', borderRadius: 3, transition: 'width 1.2s ease' },
  distPct:   { fontSize: 11, color: 'var(--color-text-muted)', width: 28, textAlign: 'right', flexShrink: 0 },
}
