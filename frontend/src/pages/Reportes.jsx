import { useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import Donut from '@/components/ui/Donut'
import { MayiaPanel } from '@/components/ui/Mayia'
import {
  getPartyResults, yearSummary, topMunicipios, priTrend,
  YEARS_WITH_DATA, DEFAULT_YEAR, ESTADO, partyColor, fmt, fmtPct,
} from '@/data/dataSource'

/* ─── Aro de progreso circular SVG ─────────────────────────────── */
function CircularRing({ pct, size = 80, stroke = 7, color, label, value, sub }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Pista */}
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
          {/* Progreso */}
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        {/* Valor central */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: size * 0.18, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
          {sub && <span style={{ fontSize: size * 0.11, color: '#718096', marginTop: 1 }}>{sub}</span>}
        </div>
      </div>
      {label && <span style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>{label}</span>}
    </div>
  )
}

/* ─── Sparkline de área (tendencia de votación) ─────────────────── */
function AreaChart({ trend }) {
  const w = 400, h = 110, px = 30, py = 18
  const max = Math.max(...trend.map(t => t.share), 50)
  const xs = trend.map((_, i) => px + (i / Math.max(trend.length - 1, 1)) * (w - px * 2))
  const yv = v => h - py - ((v / max) * (h - py * 2))
  const pts = trend.map((t, i) => `${xs[i]},${yv(t.share)}`).join(' ')
  const area = [`${xs[0]},${h - py}`, pts, `${xs[xs.length - 1]},${h - py}`].join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="priAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E1251B" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#E1251B" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 25, 50].map(g => (
        <g key={g}>
          <line x1={px} x2={w - px} y1={yv(g)} y2={yv(g)}
            stroke="rgba(0,0,0,0.06)" strokeWidth={0.8} strokeDasharray="3,4" />
          <text x={4} y={yv(g) + 4} fontSize="8" fill="#A0AEC0">{g}%</text>
        </g>
      ))}
      {/* Área rellena */}
      <polygon points={area} fill="url(#priAreaGrad)" />
      {/* Línea principal */}
      <polyline className="draw-line" points={pts} fill="none"
        stroke="#E1251B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Nodos y etiquetas */}
      {trend.map((t, i) => (
        <g key={t.year}>
          <circle cx={xs[i]} cy={yv(t.share)} r={4.5}
            fill="#fff" stroke="#E1251B" strokeWidth={2.5} />
          <text x={xs[i]} y={h - 5} fontSize="9" fill="#718096" textAnchor="middle">{t.year}</text>
          <text x={xs[i]} y={yv(t.share) - 9} fontSize="10" fontWeight="800"
            fill="#E1251B" textAnchor="middle">{fmtPct(t.share)}</text>
        </g>
      ))}
    </svg>
  )
}

/* ─── Barras horizontales premium ───────────────────────────────── */
function BarsPartidos({ data }) {
  const max = Math.max(...data.map(d => d.votos), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((p, i) => (
        <div key={p.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1A202C' }}>{p.name}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: p.color, fontVariantNumeric: 'tabular-nums' }}>
              {fmt(p.votos)} · <span style={{ fontWeight: 600, color: '#718096' }}>{fmtPct(p.share)}</span>
            </span>
          </div>
          <div style={{ height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 6, overflow: 'hidden' }}>
            <div className="bar-grow" style={{
              width: `${(p.votos / max) * 100}%`, height: '100%',
              background: p.color, borderRadius: 6,
              animationDelay: `${i * 80}ms`,
              boxShadow: `0 0 8px ${p.color}55`,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Fila de municipio top (mini-tarjeta compacta) ─────────────── */
function TopMunRow({ m, rank, year }) {
  return (
    <div style={sRow.row}>
      <div style={{ ...sRow.rank, background: rank <= 3 ? 'rgba(225,37,27,0.08)' : 'rgba(0,0,0,0.04)', color: rank <= 3 ? '#E1251B' : '#718096' }}>
        {rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {m.municipio}
        </div>
        <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>
          {fmt(m.votos)} votos PRI
        </div>
      </div>
      <span style={{ ...sRow.chip, background: partyColor(m.ganador) }}>
        {m.ganador ?? '—'}
      </span>
    </div>
  )
}
const sRow = {
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' },
  rank: { width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 },
  chip: { fontSize: 10, fontWeight: 700, color: '#fff', padding: '3px 9px', borderRadius: 20, flexShrink: 0 },
}

/* ══════════════════════════════════════════════════════════════════ */
export default function Reportes() {
  const [year, setYear] = useState(DEFAULT_YEAR)
  const s = yearSummary(year)
  const partidos = getPartyResults(year)
  const top = topMunicipios(year, 'PRI', 8)
  const trend = priTrend()
  const donutData = partidos.filter(p => p.municipios > 0)
    .map(p => ({ label: p.name, value: p.municipios, color: p.color }))

  const priPct = ((s.priMunicipios / s.municipios) * 100) || 0
  const partPct = 100 - (s.abstencion || 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div style={sr.head}>
        <div>
          <p style={sr.kicker}>Análisis Electoral</p>
          <h2 style={sr.title}>Resultados Electorales</h2>
          <p style={sr.sub}>{ESTADO} · elecciones municipales</p>
        </div>
        {/* Selector de año tipo píldora */}
        <div style={sr.yearRow}>
          {YEARS_WITH_DATA.map(y => (
            <button key={y} onClick={() => setYear(y)} className="tap"
              style={{ ...sr.yearBtn, ...(y === year ? sr.yearBtnActive : {}) }}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <MayiaPanel section="resultados" title="MAYIA · Resultados" />

      {/* ══ BENTO GRID PRINCIPAL ════════════════════════════════════ */}
      <div className="bento-grid">

        {/* ── Celda A: Aros de métricas clave (span 1 col, 1 row) ── */}
        <div className="lift" style={{ ...sr.cell, ...sr.cellRings }}>
          <p style={sr.cellTitle}>Indicadores Clave · {year}</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', alignItems: 'center', flex: 1 }}>
            <CircularRing
              pct={priPct}
              size={96}
              color="#E1251B"
              value={`${priPct.toFixed(0)}%`}
              sub="municipios"
              label="Alcance PRI"
            />
            <CircularRing
              pct={partPct}
              size={96}
              color="#007A33"
              value={`${partPct.toFixed(0)}%`}
              sub="participación"
              label="Movilización"
            />
            <CircularRing
              pct={Math.min((s.priMunicipios / 570) * 100, 100)}
              size={96}
              color="#1D4ED8"
              value={fmt(s.priMunicipios)}
              sub="mun."
              label="Ganados PRI"
            />
          </div>
          {/* Mini stats debajo */}
          <div style={sr.miniStats}>
            <div style={sr.miniStat}>
              <span style={sr.miniVal}>{fmt(s.totalVotos)}</span>
              <span style={sr.miniLab}>Votos totales</span>
            </div>
            <div style={sr.miniDivider} />
            <div style={sr.miniStat}>
              <span style={sr.miniVal}>{fmt(s.municipios)}</span>
              <span style={sr.miniLab}>Municipios</span>
            </div>
            <div style={sr.miniDivider} />
            <div style={sr.miniStat}>
              <span style={sr.miniVal}>{fmtPct(s.priShare)}</span>
              <span style={sr.miniLab}>Share PRI</span>
            </div>
          </div>
        </div>

        {/* ── Celda B: Municipios ganados por partido (donut) ─────── */}
        <div className="lift" style={{ ...sr.cell, ...sr.cellDonut }}>
          <p style={sr.cellTitle}>Municipios ganados</p>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Donut data={donutData} />
          </div>
        </div>

        {/* ── Celda C: Tendencia PRI histórica (span 2 cols) ──────── */}
        <div className="lift" style={{ ...sr.cell, ...sr.cellTrend }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={sr.cellTitle}>Tendencia histórica PRI</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {trend.map(t => (
                <div key={t.year} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#E1251B' }}>{fmt(t.municipios)}</div>
                  <div style={{ fontSize: 9, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.year}</div>
                </div>
              ))}
            </div>
          </div>
          <AreaChart trend={trend} />
        </div>

        {/* ── Celda D: Votos por partido (barras) ─────────────────── */}
        <div className="lift" style={{ ...sr.cell, ...sr.cellBars }}>
          <p style={sr.cellTitle}>Votos por partido · {year}</p>
          <BarsPartidos data={partidos} />
        </div>

        {/* ── Celda E: Top municipios PRI ─────────────────────────── */}
        <div className="lift" style={{ ...sr.cell, ...sr.cellTop }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={sr.cellTitle}>Top municipios PRI · {year}</p>
            <span style={sr.badge}>{top.length} registros</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {top.map((m, i) => (
              <TopMunRow key={m.municipio} m={m} rank={i + 1} year={year} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ─── Estilos del Bento de Resultados ───────────────────────────── */
const sr = {
  head: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
  },
  kicker: {
    fontSize: 10, fontWeight: 700, color: '#E1251B',
    textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 2,
  },
  title: { fontSize: 22, fontWeight: 800, color: '#1A202C', letterSpacing: '-0.02em' },
  sub: { fontSize: 13, color: '#718096', marginTop: 2 },
  yearRow: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  yearBtn: {
    fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 20,
    border: '1px solid rgba(0,0,0,0.10)', background: '#fff',
    color: '#4A5568', cursor: 'pointer', transition: 'all 0.15s ease',
  },
  yearBtnActive: {
    background: '#E1251B', color: '#fff',
    borderColor: '#E1251B', boxShadow: '0 4px 12px rgba(225,37,27,0.25)',
  },

  /* ── Bento Grid ── */
  bento: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'auto auto auto',
    gap: 12,
  },
  cell: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 14,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cellTitle: {
    fontSize: 11, fontWeight: 700, color: '#4A5568',
    textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
  },

  /* Celdas específicas con diferentes tamaños */
  cellRings: {
    gridColumn: '1 / 3',   /* Ocupa 2 columnas */
    minHeight: 200,
  },
  cellDonut: {
    gridColumn: '3 / 4',   /* 1 columna */
    minHeight: 200,
  },
  cellTrend: {
    gridColumn: '1 / 3',   /* Ocupa 2 columnas */
  },
  cellBars: {
    gridColumn: '3 / 4',   /* 1 columna derecha */
    gridRow: '2 / 4',      /* Ocupa 2 filas */
  },
  cellTop: {
    gridColumn: '1 / 3',   /* Ocupa 2 columnas */
    maxHeight: 320,
    overflow: 'hidden',
  },

  /* Mini stats dentro de la celda de aros */
  miniStats: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 0, background: 'rgba(0,0,0,0.025)', borderRadius: 10, padding: '10px 16px',
  },
  miniStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' },
  miniVal: { fontSize: 16, fontWeight: 800, color: '#1A202C' },
  miniLab: { fontSize: 10, color: '#718096', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.06em' },
  miniDivider: { width: 1, height: 28, background: 'rgba(0,0,0,0.08)' },

  badge: {
    fontSize: 10, fontWeight: 700, padding: '3px 10px',
    background: 'rgba(225,37,27,0.08)', color: '#E1251B', borderRadius: 20,
  },
}
