// MAYIA — motor de inteligencia. Genera alertas, predicciones, sugerencias y
// análisis a partir de los datos electorales reales (nada inventado: todo sale
// de electoral.js). Cada insight puede traer un "plan" que el usuario acepta o
// descarta. Se consume en toasts emergentes y en el panel MAYIA de cada sección.

import {
  DEFAULT_YEAR, ESTADO, yearSummary, municipiosWon, oportunidades,
  priTrend, representantesResumen, topMunicipios, fmt, fmtPct, fmtMoney,
} from './electoral'

// kind → etiqueta y tono de color (sin emojis; el color/etiqueta comunica).
export const KIND = {
  alerta:     { label: 'Alerta',     tone: 'red' },
  prediccion: { label: 'Predicción', tone: 'blue' },
  sugerencia: { label: 'Sugerencia', tone: 'green' },
  analisis:   { label: 'Análisis',   tone: 'gray' },
}

// Proyección simple del PRI a partir de la tendencia histórica (1998→último).
function proyeccionPRI() {
  const t = priTrend()
  if (t.length < 2) return null
  const a = t[0], b = t[t.length - 1]
  const años = b.year - a.year || 1
  const pendiente = (b.share - a.share) / años
  const proj = Math.max(0, b.share + pendiente * 6)   // ~una elección adelante
  return { desde: a.year, hasta: b.year, actual: b.share, proj, delta: b.share - a.share }
}

// Genera todos los insights de la plataforma, etiquetados por sección.
export function mayiaInsights() {
  const s = yearSummary(DEFAULT_YEAR)
  const won = municipiosWon(DEFAULT_YEAR)
  const seg = Object.entries(won).filter(([k]) => k !== 'PRI').sort((a, b) => b[1] - a[1])[0]
  const cerrados = oportunidades(DEFAULT_YEAR, 60).filter(m => m.margen <= 5)
  const topPri = topMunicipios(DEFAULT_YEAR, 'PRI', 1)[0]
  const reps = representantesResumen()
  const proj = proyeccionPRI()

  const list = [
    {
      id: 'ana-dominio', section: 'dashboard', kind: 'analisis',
      title: `PRI gobierna ${fmt(won.PRI)} de ${fmt(s.municipios)} municipios`,
      detail: `En ${DEFAULT_YEAR} el PRI ganó el ${((won.PRI / s.municipios) * 100).toFixed(0)}% de los municipios de ${ESTADO} con ${fmtPct(s.priShare)} de la votación.`,
    },
    proj && {
      id: 'pred-tendencia', section: 'resultados', kind: 'prediccion',
      title: `Proyección PRI: ~${fmtPct(proj.proj)} próxima elección`,
      detail: `La votación PRI pasó de ${fmtPct(yearSummary(proj.desde).priShare)} (${proj.desde}) a ${fmtPct(proj.actual)} (${proj.hasta}). MAYIA proyecta ~${fmtPct(proj.proj)} si la tendencia se mantiene.`,
    },
    cerrados.length && {
      id: 'sug-movilizacion', section: 'focos', kind: 'sugerencia',
      title: `${cerrados.length} municipios perdidos por 5 votos o menos`,
      detail: `MAYIA detectó ${cerrados.length} municipios donde el PRI quedó a ≤5 votos de ganar. Un plan de movilización focalizada podría voltearlos.`,
      plan: { label: `Activar movilización en ${cerrados.length} municipios`, ok: 'Aceptar plan' },
    },
    {
      id: 'ale-abstencion', section: 'focos', kind: 'alerta',
      title: `Abstención ${fmtPct(s.abstencion)} en ${ESTADO}`,
      detail: `La abstención promedio de ${DEFAULT_YEAR} es ${fmtPct(s.abstencion)}. MAYIA recomienda reforzar la estructura territorial en las plazas de mayor abstención.`,
      plan: { label: 'Priorizar plazas de alta abstención', ok: 'Aceptar plan' },
    },
    seg && {
      id: 'ana-competencia', section: 'resultados', kind: 'analisis',
      title: `${seg[0]} es la 2ª fuerza (${fmt(seg[1])} municipios)`,
      detail: `Tras el PRI, ${seg[0]} concentra ${fmt(seg[1])} municipios. Vigilar su avance en la próxima elección.`,
    },
    topPri && {
      id: 'ana-plaza', section: 'dashboard', kind: 'analisis',
      title: `Plaza fuerte: ${topPri.municipio}`,
      detail: `${topPri.municipio} aporta la mayor votación PRI (${fmt(topPri.votos)} votos). Núcleo a proteger.`,
    },
    {
      id: 'sug-representantes', section: 'dashboard', kind: 'sugerencia',
      title: `Presupuesto de representantes: ${fmtMoney(reps.presupuesto)}`,
      detail: `${fmt(reps.municipios)} municipios con representantes de casilla y generales. MAYIA puede optimizar el despliegue por rendimiento electoral.`,
      plan: { label: 'Optimizar despliegue de representantes', ok: 'Aceptar plan' },
    },
    {
      id: 'ale-datos-faltantes', section: 'global', kind: 'alerta',
      title: 'Faltan datos de 2 elecciones',
      detail: 'Las elecciones 2004 y 2016 llegaron casi vacías en el Excel. MAYIA recomienda solicitar la base completa al cliente para proyecciones más precisas.',
    },
  ].filter(Boolean)

  return list
}

// Insights de una sección (o todos si section = 'global').
export function mayiaFor(section) {
  return mayiaInsights().filter(i => i.section === section || section === 'todos')
}
