/**
 * CAPA DE DATOS. Único punto por donde entran los datos a la app.
 * Ahora conectada a datos REALES (Oaxaca, elecciones municipales) procesados
 * en electoral.js. Las firmas se mantienen para no romper las páginas.
 */

import {
  ESTADO, DEFAULT_YEAR, PARTIES, partyColor,
  yearSummary, municipiosWon, topMunicipios, priTrend,
  representantesResumen, fmt, fmtPct, fmtMoney,
} from './electoral'

/* ── Métricas del Dashboard (KPIs reales del año por defecto) ─────── */
export async function getDashboardMetrics() {
  const s = yearSummary(DEFAULT_YEAR)
  const reps = representantesResumen()
  const t = priTrend()
  const prev = t.length > 1 ? t[t.length - 2] : null
  const deltaMun = prev ? s.priMunicipios - prev.municipios : 0
  return [
    { id: 'municipios', label: `Municipios ${DEFAULT_YEAR}`, value: fmt(s.municipios),  change: ESTADO,               trend: 'up',   color: 'blue'  },
    { id: 'priMun',     label: 'Municipios ganados PRI',      value: fmt(s.priMunicipios), change: (deltaMun >= 0 ? '+' : '') + deltaMun, trend: deltaMun >= 0 ? 'up' : 'down', color: 'green' },
    { id: 'priShare',   label: 'Votación PRI',                value: fmtPct(s.priShare),  change: fmt(s.priVotos) + ' votos', trend: 'up', color: 'red' },
    { id: 'reps',       label: 'Representantes',              value: fmt(reps.totalCasilla + reps.totalGenerales), change: fmtMoney(reps.presupuesto), trend: 'up', color: 'yellow' },
  ]
}

/* ── Alertas = focos de atención derivados de los datos ───────────── */
export async function getAlerts() {
  const s = yearSummary(DEFAULT_YEAR)
  const won = municipiosWon(DEFAULT_YEAR)
  const topPri = topMunicipios(DEFAULT_YEAR, 'PRI', 1)[0]
  const contendiente = Object.entries(won).filter(([k]) => k !== 'PRI').sort((a, b) => b[1] - a[1])[0]
  const alerts = [
    { id: 1, severity: 'success', category: 'Resultados', region: ESTADO,
      title: `PRI ganó ${fmt(won.PRI)} de ${fmt(s.municipios)} municipios en ${DEFAULT_YEAR}`, time: DEFAULT_YEAR },
    { id: 2, severity: 'high', category: 'Competencia', region: ESTADO,
      title: `${contendiente[0]} es 2ª fuerza con ${fmt(contendiente[1])} municipios`, time: 'análisis' },
    { id: 3, severity: 'info', category: 'Plaza fuerte', region: topPri?.municipio ?? '—',
      title: `Mayor votación PRI: ${topPri?.municipio} (${fmt(topPri?.votos ?? 0)})`, time: DEFAULT_YEAR },
    { id: 4, severity: s.abstencion > 45 ? 'high' : 'medium', category: 'Participación', region: ESTADO,
      title: `Abstención promedio ${fmtPct(s.abstencion)}`, time: DEFAULT_YEAR },
    { id: 5, severity: 'info', category: 'Padrón', region: ESTADO,
      title: `Lista nominal ${fmt(s.listaNominal)} · ${fmt(s.casillas)} casillas`, time: DEFAULT_YEAR },
  ]
  return alerts
}

/* ── Datos por estado para el mapa. Oaxaca real; resto sin datos ──── */
export async function getMapData() {
  const s = yearSummary(DEFAULT_YEAR)
  const base = [
    'AGU','BCN','BCS','CAM','CHH','CHP','CMX','COA','COL','DUR','GRO','GUA','HID','JAL',
    'MEX','MIC','MOR','NAY','NLE','OAX','PUE','QUE','ROO','SIN','SLP','SON','TAB','TAM',
    'TLA','VER','YUC','ZAC',
  ]
  const nombres = { OAX: 'Oaxaca' }
  return base.map(code => code === 'OAX'
    ? { id: 'MX-OAX', name: 'Oaxaca', value: s.priMunicipios, level: 'critical', activo: true }
    : { id: `MX-${code}`, name: nombres[code] ?? code, value: 0, level: 'low', activo: false },
  )
}

/* ── "Actividad reciente" = trazas de ingesta de datos ────────────── */
export async function getRecentActivity() {
  return [
    { id: 1, action: 'COMPILADO.xlsx procesado',      user: 'datalab', time: 'hoy',  state: `${fmt(yearSummary(DEFAULT_YEAR).municipios)} municipios` },
    { id: 2, action: 'Representantes extraídos',       user: 'datalab', time: 'hoy',  state: `${representantesResumen().municipios} registros` },
    { id: 3, action: 'Cómputo de ganadores',           user: 'sistema', time: 'hoy',  state: ESTADO },
    { id: 4, action: 'Perfilado de calidad',           user: 'datalab', time: 'hoy',  state: 'NULLs conservados' },
  ]
}

/* ── Extras para la página de Resultados Electorales ──────────────── */
export function getPartyResults(year = DEFAULT_YEAR) {
  const s = yearSummary(year)
  const total = s.totalVotos || 1
  return PARTIES
    .map(p => ({ ...p, votos: s.votes[p.key], municipios: s.won[p.key], share: (s.votes[p.key] / total) * 100 }))
    .filter(p => p.votos > 0)
    .sort((a, b) => b.votos - a.votos)
}
export { yearSummary, topMunicipios, priTrend, representantesResumen, PARTIES, partyColor, DEFAULT_YEAR, ESTADO, fmt, fmtPct, fmtMoney }
export { YEARS_WITH_DATA } from './electoral'
