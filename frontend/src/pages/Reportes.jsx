import { useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import Donut from '@/components/ui/Donut'
import {
  getPartyResults, yearSummary, topMunicipios, priTrend,
  YEARS_WITH_DATA, DEFAULT_YEAR, ESTADO, partyColor, fmt, fmtPct,
} from '@/data/dataSource'

/* ── Barras horizontales (votos por partido) con animación y hover ── */
function BarsPartidos({ data }) {
  const max = Math.max(...data.map(d => d.votos), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {data.map((p, i) => (
        <div key={p.key} className="barrow" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 58, fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{p.name}</span>
          <div style={{ flex: 1, height: 24, background: 'var(--color-gray-soft)', borderRadius: 7, overflow: 'hidden', position: 'relative' }}>
            <div className="bar-grow" style={{
              width: `${(p.votos / max) * 100}%`, height: '100%', background: p.color,
              borderRadius: 7, animationDelay: `${i * 70}ms`,
            }} />
            <span style={{ position: 'absolute', right: 9, top: 4, fontSize: 11, fontWeight: 800, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(p.votos)} · {fmtPct(p.share)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Línea de tendencia PRI (se dibuja al entrar) ─────────────────── */
function LineaPRI({ trend }) {
  const w = 320, h = 130, pad = 26
  const xs = trend.map((_, i) => pad + (i / Math.max(trend.length - 1, 1)) * (w - pad * 2))
  const max = Math.max(...trend.map(t => t.share), 50)
  const y = (v) => h - pad - (v / max) * (h - pad * 2)
  const pts = trend.map((t, i) => `${xs[i]},${y(t.share)}`).join(' ')
  const area = `${pad},${h - pad} ${pts} ${xs[xs.length - 1]},${h - pad}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="priArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50].map(g => (
        <g key={g}>
          <line x1={pad} x2={w - pad} y1={y(g)} y2={y(g)} stroke="var(--color-border)" strokeWidth="0.6" />
          <text x={4} y={y(g) + 3} fontSize="8" fill="var(--color-text-dim)">{g}%</text>
        </g>
      ))}
      <polygon points={area} fill="url(#priArea)" />
      <polyline className="draw-line" points={pts} fill="none" stroke="var(--color-primary)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {trend.map((t, i) => (
        <g key={t.year}>
          <circle cx={xs[i]} cy={y(t.share)} r="4.5" fill="#fff" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x={xs[i]} y={h - 7} fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">{t.year}</text>
          <text x={xs[i]} y={y(t.share) - 10} fontSize="10" fontWeight="800" fill="var(--color-primary)" textAnchor="middle">{fmtPct(t.share)}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Reportes() {
  const [year, setYear] = useState(DEFAULT_YEAR)
  const s = yearSummary(year)
  const partidos = getPartyResults(year)
  const top = topMunicipios(year, 'PRI', 8)
  const trend = priTrend()
  const donutData = partidos.filter(p => p.municipios > 0)
    .map(p => ({ label: p.name, value: p.municipios, color: p.color }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Encabezado + selector de año */}
      <div style={sr.head}>
        <div>
          <h2 style={sr.title}>Resultados Electorales</h2>
          <p style={sr.sub}>{ESTADO} · elecciones municipales</p>
        </div>
        <div style={sr.years}>
          {YEARS_WITH_DATA.map(y => (
            <button key={y} onClick={() => setYear(y)} className="tap"
              style={{ ...sr.yearBtn, ...(y === year ? sr.yearBtnActive : {}) }}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs interactivos (bento) */}
      <div className="stagger" style={sr.kpiRow}>
        <StatCard i={0} tone="gray"  label="Municipios"     value={fmt(s.municipios)} sub={ESTADO} />
        <StatCard i={1} tone="red"   label="Votación PRI"   value={fmtPct(s.priShare)} sub={`${fmt(s.priVotos)} votos`} />
        <StatCard i={2} tone="green" label="Municipios PRI" value={fmt(s.priMunicipios)} delta={`${((s.priMunicipios / s.municipios) * 100).toFixed(0)}%`} sub="del total" />
        <StatCard i={3} tone="gray"  label="Abstención"     value={fmtPct(s.abstencion)} sub="promedio" />
      </div>

      {/* Gráficas: bento 2 columnas */}
      <div style={sr.grid2}>
        <div className="lift" style={sr.card}>
          <h3 style={sr.cardTitle}>Votos por partido · {year}</h3>
          <BarsPartidos data={partidos} />
        </div>
        <div className="lift" style={sr.card}>
          <h3 style={sr.cardTitle}>Municipios ganados</h3>
          <Donut data={donutData} />
        </div>
      </div>

      {/* Tendencia (ancho completo) */}
      <div className="lift" style={sr.card}>
        <h3 style={sr.cardTitle}>Votación PRI por año</h3>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <LineaPRI trend={trend} />
        </div>
        <div style={sr.trendMeta}>
          {trend.map(t => (
            <span key={t.year} style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {t.year}: <b style={{ color: 'var(--color-primary)' }}>{fmt(t.municipios)}</b> municipios
            </span>
          ))}
        </div>
      </div>

      {/* Tabla top municipios */}
      <div className="lift" style={sr.card}>
        <h3 style={sr.cardTitle}>Top municipios por votación PRI · {year}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={sr.table}>
            <thead>
              <tr>
                <th style={sr.th}>#</th>
                <th style={{ ...sr.th, textAlign: 'left' }}>Municipio</th>
                <th style={sr.th}>Votos PRI</th>
                <th style={sr.th}>Ganador</th>
              </tr>
            </thead>
            <tbody>
              {top.map((m, i) => (
                <tr key={m.municipio} className="trow" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ ...sr.td, color: 'var(--color-text-dim)', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ ...sr.td, textAlign: 'left', fontWeight: 600 }}>{m.municipio}</td>
                  <td style={{ ...sr.td, fontVariantNumeric: 'tabular-nums' }}>{fmt(m.votos)}</td>
                  <td style={sr.td}>
                    <span style={{ ...sr.chip, background: partyColor(m.ganador) }}>{m.ganador ?? '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const sr = {
  head: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  title: { fontSize: 21, fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' },
  sub: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 },
  years: { display: 'flex', gap: 6 },
  yearBtn: {
    fontSize: 13, fontWeight: 700, padding: '7px 16px', borderRadius: 10,
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'all 0.15s ease',
  },
  yearBtnActive: { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)', boxShadow: '0 4px 12px var(--color-primary-glow)' },
  kpiRow: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' },
  grid2: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' },
  card: {
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)', padding: 18,
  },
  cardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 16 },
  trendMeta: { display: 'flex', justifyContent: 'center', gap: 18, marginTop: 10, flexWrap: 'wrap' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 10px', textAlign: 'center' },
  td: { padding: '9px 10px', textAlign: 'center', color: 'var(--color-text)' },
  chip: { fontSize: 11, fontWeight: 700, color: '#fff', padding: '2px 9px', borderRadius: 6 },
}
