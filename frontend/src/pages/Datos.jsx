import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { MayiaPanel } from '@/components/ui/Mayia'
import { SHEETS, sheetByKey, completitud, sheetInsights } from '@/data/datasets'
import { fmt } from '@/data/electoral'

/* ─── Íconos ──────────────────────────────────────────────────── */
const IconImport  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IconExport  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
const IconRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
const IconTable   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
const IconWarning = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

/* ─── Aro de progreso mini ────────────────────────────────────── */
function MiniRing({ pct, color, size = 52, label }) {
  const stroke = 5
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color }}>{Math.round(pct)}%</span>
        </div>
      </div>
      {label && <span style={{ fontSize: 10, color: '#718096', textAlign: 'center', maxWidth: 60 }}>{label}</span>}
    </div>
  )
}

/* ─── Barra de columna individual ────────────────────────────── */
function ColRow({ c, i }) {
  const dangerLevel = c.pct_nulos >= 50 ? '#E1251B' : c.pct_nulos >= 20 ? '#B45309' : '#007A33'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      <span style={{ width: 20, fontSize: 10, fontWeight: 800, color: '#A0AEC0', flexShrink: 0 }}>{i + 1}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1A202C' }}>{c.nombre}</span>
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#A0AEC0', background: 'rgba(0,0,0,0.04)', borderRadius: 4, padding: '1px 5px' }}>{c.tipo}</span>
          {c.notas.map(n => (
            <span key={n} style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
              background: n === 'PII' ? 'rgba(225,37,27,0.08)' : n === 'llave' ? 'rgba(0,122,51,0.08)' : 'rgba(0,0,0,0.05)',
              color: n === 'PII' ? '#E1251B' : n === 'llave' ? '#007A33' : '#718096',
            }}>{n}</span>
          ))}
        </div>
        {c.pct_nulos > 0 && (
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 3, background: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden', maxWidth: 120 }}>
              <div style={{ width: `${c.pct_nulos}%`, height: '100%', background: dangerLevel, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 10, color: dangerLevel, fontWeight: 700 }}>{c.pct_nulos}% vacíos</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Vista previa de datos ───────────────────────────────────── */
function DataPreview({ rows }) {
  if (!rows?.length) return <div style={{ fontSize: 13, color: '#A0AEC0', textAlign: 'center', padding: 24 }}>Sin datos de preview</div>
  const cols = Object.keys(rows[0])
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, whiteSpace: 'nowrap' }}>
        <thead>
          <tr style={{ background: 'rgba(0,0,0,0.025)' }}>
            {cols.map(c => (
              <th key={c} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700,
                color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              {cols.map(c => (
                <td key={c} style={{ padding: '7px 12px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis',
                  color: r[c] == null ? '#A0AEC0' : '#1A202C', fontStyle: r[c] == null ? 'italic' : 'normal' }}>
                  {r[c] == null ? 'null' : String(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function Datos() {
  const { key } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const sheet = sheetByKey(key)
  if (!sheet) return <Navigate to={`/datos/${SHEETS[0].key}`} replace />

  const { perfil } = sheet
  const comp = completitud(perfil)
  const conNulos = perfil ? perfil.columnas.filter(c => c.pct_nulos > 0).length : 0
  const importable = perfil?.veredicto.includes('importable')
  const conPII = perfil ? perfil.columnas.filter(c => c.notas.includes('PII')).length : 0

  /* ─── Manejadores con confirmación ─── */
  async function handleImportar() {
    const ok = await confirm({
      title: `¿Importar "${sheet.hoja}" a la base de datos?`,
      description: `Se importarán ${fmt(perfil?.filas ?? 0)} filas con ${perfil?.columnas_n ?? 0} columnas. Esta acción sobreescribirá los datos existentes.`,
      acceptLabel: 'Importar datos',
      discardLabel: 'Cancelar',
      tone: importable ? 'success' : 'danger',
    })
    if (ok) console.log('Importando:', sheet.key)
  }

  async function handleActualizar() {
    const ok = await confirm({
      title: '¿Sincronizar datos desde la fuente?',
      description: `Se actualizarán los datos de "${sheet.hoja}" desde el archivo fuente. Los cambios no guardados se perderán.`,
      acceptLabel: 'Sincronizar',
      discardLabel: 'Cancelar',
      tone: 'info',
    })
    if (ok) console.log('Actualizando:', sheet.key)
  }

  async function handleExportar() {
    const ok = await confirm({
      title: '¿Exportar datos a JSON?',
      description: `Se exportarán ${fmt(sheet.rows.length)} filas de "${sheet.hoja}" como archivo JSON.`,
      acceptLabel: 'Exportar JSON',
      discardLabel: 'Cancelar',
      tone: 'info',
    })
    if (ok) console.log('Exportando:', sheet.key)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Encabezado ─────────────────────────────────────────── */}
      <div style={sd.head}>
        <div>
          <p style={sd.kicker}>Fuente de Datos</p>
          <h2 style={sd.title}>{sheet.hoja}</h2>
          <p style={sd.sub}>{sheet.desc}</p>
        </div>
        <span style={{ ...sd.verdict, ...(importable ? sd.verdictOk : sd.verdictWarn) }}>
          {importable ? '✓ Lista para importar' : '⚠ Requiere revisión'}
        </span>
      </div>

      {/* ── Tabs de hojas ─────────────────────────────────────── */}
      <div style={sd.tabsRow}>
        {SHEETS.map(s => (
          <button
            key={s.key}
            id={`tab-${s.key.toLowerCase()}`}
            onClick={() => navigate(`/datos/${s.key}`)}
            className="tap"
            style={{ ...sd.tab, ...(s.key === key ? sd.tabActive : {}) }}
          >
            <IconTable />
            {s.hoja}
          </button>
        ))}
      </div>

      {/* ── Botones de acción ─────────────────────────────────── */}
      <div style={sd.actions}>
        <button style={sd.actBtn} className="tap" onClick={handleImportar}>
          <IconImport /> Importar
        </button>
        <button style={{ ...sd.actBtn, ...sd.actGhost }} className="tap" onClick={handleActualizar}>
          <IconRefresh /> Sincronizar
        </button>
        <button style={{ ...sd.actBtn, ...sd.actGhost }} className="tap" onClick={handleExportar}>
          <IconExport /> Exportar JSON
        </button>
      </div>

      <MayiaPanel title={`MAYIA · ${sheet.hoja}`} items={sheetInsights(perfil)} />

      {/* ══ BENTO GRID ════════════════════════════════════════ */}
      <div className="bento-grid">

        {/* ── Celda A: Aros de calidad ────────────────────────── */}
        <div className="lift" style={{ ...sd.cell, ...sd.cellRings }}>
          <p style={sd.cellTitle}>Calidad de datos</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'space-around', flex: 1, alignItems: 'center' }}>
            <MiniRing pct={comp} color={comp >= 70 ? '#007A33' : '#E1251B'} label="Completitud" />
            <MiniRing pct={perfil ? (conNulos / perfil.columnas_n) * 100 : 0} color="#B45309" label="Con vacíos" />
            <MiniRing pct={perfil ? (conPII / perfil.columnas_n) * 100 : 0} color="#E1251B" label="Datos PII" />
          </div>
          <div style={sd.metricsRow}>
            {[
              { label: 'Filas',     val: fmt(perfil?.filas ?? 0) },
              { label: 'Columnas',  val: fmt(perfil?.columnas_n ?? 0) },
              { label: 'Con vacíos', val: fmt(conNulos) },
              { label: 'PII',       val: fmt(conPII) },
            ].map(m => (
              <div key={m.label} style={sd.metricItem}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#1A202C' }}>{m.val}</span>
                <span style={{ fontSize: 9, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Celda B: Alerta de PII ──────────────────────────── */}
        {conPII > 0 && (
          <div className="lift" style={{ ...sd.cell, ...sd.cellPii }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'rgba(225,37,27,0.10)', borderRadius: 8, padding: 8, color: '#E1251B' }}>
                <IconWarning />
              </div>
              <p style={{ ...sd.cellTitle, color: '#E1251B' }}>Datos personales detectados</p>
            </div>
            <p style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.6, margin: 0 }}>
              {conPII} {conPII === 1 ? 'columna contiene' : 'columnas contienen'} información
              identificable (PII). Asegúrate de protegerlas antes de compartir el dataset.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {perfil?.columnas.filter(c => c.notas.includes('PII')).map(c => (
                <span key={c.nombre} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
                  background: 'rgba(225,37,27,0.08)', color: '#E1251B', border: '1px solid rgba(225,37,27,0.20)' }}>
                  {c.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Celda C: Perfilado de columnas ──────────────────── */}
        <div className="lift" style={{ ...sd.cell, ...sd.cellProfile, gridColumn: conPII > 0 ? '1 / 3' : '2 / 3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={sd.cellTitle}>Perfilado · {perfil?.filas ?? 0} filas</p>
            <span style={sd.countBadge}>{perfil?.columnas_n ?? 0} cols</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 280 }}>
            {perfil?.columnas.map((c, i) => <ColRow key={c.nombre} c={c} i={i} />) ?? (
              <p style={{ fontSize: 13, color: '#A0AEC0', textAlign: 'center', padding: 24 }}>Sin perfilado disponible</p>
            )}
          </div>
        </div>

        {/* ── Celda D: Vista previa de datos ──────────────────── */}
        <div className="lift" style={{ ...sd.cell, ...sd.cellPreview }}>
          <p style={sd.cellTitle}>Vista previa · primeras 10 filas</p>
          <DataPreview rows={sheet.rows} />
        </div>

      </div>
    </div>
  )
}

/* ─── Estilos ─────────────────────────────────────────────────── */
const sd = {
  head:   { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  kicker: { fontSize: 10, fontWeight: 700, color: '#E1251B', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 2 },
  title:  { fontSize: 22, fontWeight: 800, color: '#1A202C', letterSpacing: '-0.02em' },
  sub:    { fontSize: 13, color: '#718096', marginTop: 2 },
  verdict: { fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 20, flexShrink: 0, alignSelf: 'flex-start', marginTop: 4 },
  verdictOk:   { color: '#007A33', background: 'rgba(0,122,51,0.08)', border: '1px solid rgba(0,122,51,0.20)' },
  verdictWarn: { color: '#E1251B', background: 'rgba(225,37,27,0.08)', border: '1px solid rgba(225,37,27,0.20)' },

  /* Tabs de hojas */
  tabsRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 20,
    border: '1px solid rgba(0,0,0,0.10)', background: '#fff',
    color: '#4A5568', cursor: 'pointer', transition: 'all 0.15s',
  },
  tabActive: {
    background: '#E1251B', color: '#fff', borderColor: '#E1251B',
    boxShadow: '0 4px 12px rgba(225,37,27,0.25)',
  },

  /* Acciones */
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  actBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 10,
    background: '#E1251B', color: '#fff', border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(225,37,27,0.20)', transition: 'all 0.15s',
  },
  actGhost: {
    background: '#fff', color: '#4A5568', boxShadow: 'none',
    border: '1px solid rgba(0,0,0,0.10)',
  },

  /* Bento */
  bento: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  cell: {
    background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14,
    padding: 18, display: 'flex', flexDirection: 'column', gap: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cellTitle:   { fontSize: 11, fontWeight: 700, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 },
  cellRings:   { gridColumn: '1 / 2' },
  cellPii:     { gridColumn: '2 / 3' },
  cellProfile: { gridColumn: '1 / 3' },
  cellPreview: { gridColumn: '1 / 3', overflow: 'hidden' },

  metricsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
    background: 'rgba(0,0,0,0.025)', borderRadius: 10, overflow: 'hidden',
  },
  metricItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    padding: '10px 6px', background: '#fff',
    borderRight: '1px solid rgba(0,0,0,0.04)',
  },
  countBadge: {
    fontSize: 10, fontWeight: 700, padding: '3px 9px',
    background: 'rgba(0,0,0,0.05)', color: '#718096', borderRadius: 20,
  },
}
