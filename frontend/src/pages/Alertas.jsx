import StatCard from '@/components/ui/StatCard'
import { MayiaPanel } from '@/components/ui/Mayia'
import { useConfirm } from '@/components/ui/ConfirmModal'
import {
  oportunidades, mayorAbstencion, municipiosWon, yearSummary,
  DEFAULT_YEAR, ESTADO, partyColor, fmt, fmtPct,
} from '@/data/electoral'

/* ─── Ícono de estado ─────────────────────────────────────────── */
const Dot = ({ color, size = 10, pulse = false }) => (
  <span style={{
    display: 'inline-block', width: size, height: size, borderRadius: '50%',
    background: color, flexShrink: 0,
    animation: pulse ? 'dotPulse 2s ease-in-out infinite' : 'none',
  }} />
)

/* ─── Medidor tipo termómetro horizontal ─────────────────────── */
function Termometro({ pct, color, label, value }) {
  const pctSafe = Math.min(Math.max(pct, 0), 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1A202C' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}</span>
      </div>
      <div style={{ height: 7, background: 'rgba(0,0,0,0.06)', borderRadius: 8, overflow: 'hidden' }}>
        <div className="bar-grow" style={{
          width: `${pctSafe}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 8,
        }} />
      </div>
    </div>
  )
}

/* ─── Fila de oportunidad ────────────────────────────────────── */
function OportunidadRow({ m, onAccion }) {
  const margenPct = Math.min((m.margen / m.pri) * 100, 100)
  return (
    <div style={sa.oRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A202C' }}>{m.municipio}</span>
          <span style={{ ...sa.chip, background: partyColor(m.ganador) }}>{m.ganador}</span>
        </div>
        <div style={sa.oMeta}>
          PRI: <b style={{ color: '#E1251B' }}>{fmt(m.pri)}</b>
          &nbsp;· Ganó por <b style={{ color: '#B45309' }}>{fmt(m.margen)}</b> votos
        </div>
        {/* Barra de margen — qué tan cerca estuvo */}
        <div style={{ marginTop: 5, height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            width: `${margenPct}%`, height: '100%',
            background: 'linear-gradient(90deg, #007A33, #E1251B)',
            borderRadius: 4,
          }} />
        </div>
      </div>
      <button style={sa.accionBtn} className="tap" onClick={() => onAccion(m)}>
        Activar
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function Alertas() {
  const confirm = useConfirm()
  const year = DEFAULT_YEAR
  const oport = oportunidades(year, 8)
  const abst  = mayorAbstencion(year, 8)
  const won   = municipiosWon(year)
  const s     = yearSummary(year)
  const seg   = Object.entries(won).filter(([k]) => k !== 'PRI')
    .sort((a, b) => b[1] - a[1])[0]

  /* ─── Manejadores con confirmación ─── */
  async function handleActivar(m) {
    const ok = await confirm({
      title: `¿Activar operativo en ${m.municipio}?`,
      description: `El PRI perdió por ${fmt(m.margen)} votos. Se notificará al coordinador zonal y se asignarán recursos de movilización.`,
      acceptLabel: 'Activar plan',
      discardLabel: 'Descartar',
      tone: 'danger',
    })
    if (ok) console.log('Activado:', m.municipio)
  }

  async function handleExportarAlertas() {
    const ok = await confirm({
      title: '¿Exportar reporte de focos?',
      description: 'Se generará un PDF con todos los municipios en alerta y sus indicadores de riesgo.',
      acceptLabel: 'Exportar reporte',
      discardLabel: 'Cancelar',
      tone: 'info',
    })
    if (ok) console.log('Exportando…')
  }

  /* ─── Paleta de niveles de abstención ─── */
  const absTone = (v) => v > 60 ? '#E1251B' : v > 45 ? '#B45309' : '#007A33'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Encabezado ─────────────────────────────────────────── */}
      <div style={sa.head}>
        <div>
          <p style={sa.kicker}>Sistema de Alerta</p>
          <h2 style={sa.title}>Focos de Atención</h2>
          <p style={sa.sub}>{ESTADO} · {year} · prioridades detectadas</p>
        </div>
        <button style={sa.exportBtn} className="tap" onClick={handleExportarAlertas}>
          ↓ Exportar reporte
        </button>
      </div>

      <MayiaPanel section="focos" title="MAYIA · Focos" />

      {/* ── KPIs ────────────────────────────────────────────────── */}
      <div className="stagger" style={sa.kpiRow}>
        <StatCard i={0} tone="green" label="Municipios PRI"  value={fmt(won.PRI)}    sub="ganados" />
        <StatCard i={1} tone="red"   label="2ª fuerza"       value={seg[0]}           sub={`${fmt(seg[1])} municipios`} />
        <StatCard i={2} tone="gray"  label="Abstención"      value={fmtPct(s.abstencion)} sub="promedio estado" />
        <StatCard i={3} tone="red"   label="Oportunidades"   value={fmt(oport.length)} sub="municipios recuperables" />
      </div>

      {/* ══ BENTO GRID ══════════════════════════════════════════ */}
      <div className="bento-grid">

        {/* ── Celda A: Oportunidades (lista + botones de acción) ─ */}
        <div className="lift" style={{ ...sa.cell, ...sa.cellLeft }}>
          <div style={sa.cellHead}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Dot color="#E1251B" pulse />
              <p style={sa.cellTitle}>Municipios recuperables</p>
            </div>
            <span style={sa.countBadge}>{oport.length}</span>
          </div>
          <p style={sa.cellSub}>
            Municipios donde el PRI quedó a menos del <b style={{ color: '#E1251B' }}>10%</b> de diferencia.
            Activa un plan de movilización para cada uno.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', flex: 1 }}>
            {oport.map(m => (
              <OportunidadRow key={m.municipio} m={m} onAccion={handleActivar} />
            ))}
          </div>
        </div>

        {/* ── Celda B: Abstención (termómetros visuales) ─────── */}
        <div className="lift" style={{ ...sa.cell, ...sa.cellRight }}>
          <div style={sa.cellHead}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Dot color="#B45309" />
              <p style={sa.cellTitle}>Riesgo de baja participación</p>
            </div>
          </div>
          <p style={sa.cellSub}>
            Municipios con mayor abstención histórica. Foco de trabajo para movilización.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
            {abst.map(m => (
              <Termometro
                key={m.municipio}
                label={m.municipio}
                value={fmtPct(m.abst)}
                pct={m.abst}
                color={absTone(m.abst)}
              />
            ))}
          </div>
        </div>

        {/* ── Celda C: Competencia (análisis de segunda fuerza) ── */}
        <div className="lift" style={{ ...sa.cell, ...sa.cellBottom }}>
          <div style={sa.cellHead}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Dot color="#1D4ED8" />
              <p style={sa.cellTitle}>Análisis de competencia · {year}</p>
            </div>
          </div>
          <div style={sa.compGrid}>
            {/* Distribución visual */}
            <div style={sa.compBar}>
              <div style={{ ...sa.compFill, width: `${(won.PRI / s.municipios) * 100}%`, background: '#E1251B' }}>
                <span style={sa.compLabel}>PRI · {won.PRI}</span>
              </div>
              <div style={{ ...sa.compFill, width: `${(seg[1] / s.municipios) * 100}%`, background: partyColor(seg[0]), opacity: 0.8 }}>
                <span style={sa.compLabel}>{seg[0]} · {seg[1]}</span>
              </div>
            </div>
            {/* Descripción */}
            <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, margin: 0 }}>
              En {year}, el <b style={{ color: '#E1251B' }}>PRI</b> ganó{' '}
              <b>{fmt(won.PRI)}</b> municipios de {fmt(s.municipios)} totales.
              La segunda fuerza es <b style={{ color: partyColor(seg[0]) }}>{seg[0]}</b>{' '}
              con <b>{fmt(seg[1])}</b> municipios. Diferencia:{' '}
              <b style={{ color: '#E1251B' }}>{fmt(won.PRI - seg[1])}</b> plazas.
            </p>
            {/* Mini KPIs de la fila */}
            <div style={sa.compKpis}>
              {[
                { label: 'Municipios en disputa', val: fmt(s.municipios), color: '#4A5568' },
                { label: 'Ganados PRI',           val: fmt(won.PRI),      color: '#E1251B' },
                { label: `Ganados ${seg[0]}`,     val: fmt(seg[1]),       color: partyColor(seg[0]) },
                { label: 'Diferencia',            val: fmt(won.PRI - seg[1]), color: '#007A33' },
              ].map(k => (
                <div key={k.label} style={sa.compKpi}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{k.val}</span>
                  <span style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>{k.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ─── Estilos ─────────────────────────────────────────────────── */
const sa = {
  head:  { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  kicker: { fontSize: 10, fontWeight: 700, color: '#E1251B', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: 800, color: '#1A202C', letterSpacing: '-0.02em' },
  sub:   { fontSize: 13, color: '#718096', marginTop: 2 },
  exportBtn: {
    fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 20,
    background: '#fff', border: '1px solid rgba(0,0,0,0.10)',
    color: '#4A5568', cursor: 'pointer', transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  kpiRow: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' },

  /* Bento */
  bento: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto auto',
    gap: 12,
  },
  cell: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 14,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  cellLeft:   { gridColumn: '1 / 2', minHeight: 360 },
  cellRight:  { gridColumn: '2 / 3' },
  cellBottom: { gridColumn: '1 / 3' },      /* Ancho completo */

  cellHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cellTitle: { fontSize: 11, fontWeight: 700, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 },
  cellSub:   { fontSize: 12, color: '#718096', lineHeight: 1.6, margin: 0 },
  countBadge: {
    fontSize: 10, fontWeight: 700, padding: '3px 9px',
    background: 'rgba(225,37,27,0.08)', color: '#E1251B', borderRadius: 20,
  },

  /* Fila oportunidad */
  oRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  oMeta: { fontSize: 11, color: '#718096', marginTop: 3 },
  chip:  { fontSize: 10, fontWeight: 700, color: '#fff', padding: '2px 8px', borderRadius: 20 },
  accionBtn: {
    flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '7px 14px', borderRadius: 10,
    background: 'rgba(225,37,27,0.08)', color: '#E1251B',
    border: '1px solid rgba(225,37,27,0.20)', cursor: 'pointer', transition: 'all 0.15s',
  },

  /* Competencia */
  compGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  compBar:  { display: 'flex', height: 32, borderRadius: 8, overflow: 'hidden', gap: 2 },
  compFill: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 40, borderRadius: 6, transition: 'width 1s ease',
  },
  compLabel: { fontSize: 10, fontWeight: 800, color: '#fff' },
  compKpis: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
    background: 'rgba(0,0,0,0.04)', borderRadius: 10, overflow: 'hidden',
  },
  compKpi: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '12px 8px', background: '#fff',
  },
}
