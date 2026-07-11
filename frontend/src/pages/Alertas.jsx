import StatCard from '@/components/ui/StatCard'
import {
  oportunidades, mayorAbstencion, municipiosWon, yearSummary,
  DEFAULT_YEAR, ESTADO, partyColor, fmt, fmtPct,
} from '@/data/electoral'

export default function Alertas() {
  const year = DEFAULT_YEAR
  const oport = oportunidades(year, 6)
  const abst = mayorAbstencion(year, 6)
  const won = municipiosWon(year)
  const s = yearSummary(year)
  const seg = Object.entries(won).filter(([k]) => k !== 'PRI').sort((a, b) => b[1] - a[1])[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={st.title}>Focos de Atención</h2>
        <p style={st.sub}>{ESTADO} · {year} · prioridades detectadas por el sistema</p>
      </div>

      {/* Resumen interactivo */}
      <div className="stagger" style={st.kpiRow}>
        <StatCard i={0} tone="green" label="Municipios PRI" value={fmt(won.PRI)} sub="ganados" />
        <StatCard i={1} tone="red"   label="2ª fuerza"      value={seg[0]} sub={`${fmt(seg[1])} municipios`} />
        <StatCard i={2} tone="gray"  label="Abstención"     value={fmtPct(s.abstencion)} sub="promedio" />
        <StatCard i={3} tone="red"   label="Oportunidades"  value={fmt(oport.length)} sub="a pocos votos" />
      </div>

      {/* Oportunidad: PRI cerca de ganar */}
      <div className="lift" style={st.card}>
        <div style={st.cardHead}>
          <span style={{ ...st.dot, background: 'var(--color-primary)' }} />
          <h3 style={st.cardTitle}>Oportunidad — municipios donde el PRI quedó cerca</h3>
        </div>
        {oport.map(m => (
          <div key={m.municipio} className="barrow" style={st.row}>
            <span style={st.rowMun}>{m.municipio}</span>
            <span style={st.rowMeta}>
              PRI <b style={{ color: 'var(--color-text)' }}>{fmt(m.pri)}</b> · perdió por{' '}
              <b style={{ color: 'var(--color-primary)' }}>{fmt(m.margen)}</b> vs
              <span style={{ ...st.chip, background: partyColor(m.ganador) }}>{m.ganador}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Abstención */}
      <div className="lift" style={st.card}>
        <div style={st.cardHead}>
          <span style={{ ...st.dot, background: 'var(--color-graphite)' }} />
          <h3 style={st.cardTitle}>Riesgo de movilización — mayor abstención</h3>
        </div>
        {abst.map(m => {
          const pct = Math.min(m.abst, 100)
          return (
            <div key={m.municipio} className="barrow" style={{ ...st.row, flexDirection: 'column', alignItems: 'stretch', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={st.rowMun}>{m.municipio}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)' }}>{fmtPct(m.abst)}</span>
              </div>
              <div style={st.track}>
                <div className="bar-grow" style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 5 }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Competencia */}
      <div className="lift" style={{ ...st.card, background: 'var(--color-accent-soft)' }}>
        <div style={st.cardHead}>
          <span style={{ ...st.dot, background: 'var(--color-accent)' }} />
          <h3 style={st.cardTitle}>Competencia</h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>
          La segunda fuerza en {year} es <b style={{ color: partyColor(seg[0]) }}>{seg[0]}</b> con{' '}
          <b>{fmt(seg[1])}</b> municipios ganados, frente a los{' '}
          <b style={{ color: 'var(--color-primary)' }}>{fmt(won.PRI)}</b> del PRI.
        </p>
      </div>
    </div>
  )
}

const st = {
  title: { fontSize: 21, fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em' },
  sub: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 },
  kpiRow: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' },
  card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 18 },
  cardHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  dot: { width: 9, height: 9, borderRadius: '50%', flexShrink: 0 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' },
  rowMun: { fontSize: 13, fontWeight: 600, color: 'var(--color-text)' },
  rowMeta: { fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 },
  track: { height: 8, background: 'var(--color-gray-soft)', borderRadius: 5, overflow: 'hidden' },
  chip: { fontSize: 10, fontWeight: 700, color: '#fff', padding: '2px 8px', borderRadius: 5 },
}
