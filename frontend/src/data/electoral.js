// Capa de cómputo electoral. Toma los datos reales extraídos del Excel
// (compilado.json = Oaxaca, municipios × año, votos por partido) y expone
// funciones ya digeridas para el dashboard, la página de resultados y Jarvis.
//
// El ganador NO viene dado en los datos, se calcula: partido con más votos
// en cada municipio-año. Los nulos (partido que no compitió) cuentan como 0.

import compilado from './compilado.json'
import representantes from './representantes.json'

export const ESTADO = 'Oaxaca'

// Partidos presentes en los datos, en orden y con color de marca.
export const PARTIES = [
  { key: 'PRI',    name: 'PRI',    color: '#E1251B' },
  { key: 'PAN',    name: 'PAN',    color: '#0a4a9e' },
  { key: 'PRD',    name: 'PRD',    color: '#f2c200' },
  { key: 'PT',     name: 'PT',     color: '#c0161c' },
  { key: 'CONVER', name: 'CONVER', color: '#f58220' },
  { key: 'PVEM',   name: 'PVEM',   color: '#3fae49' },
  { key: 'PUP',    name: 'PUP',    color: '#8b5cf6' },
  { key: 'PNA',    name: 'PNA',    color: '#00a0b0' },
  { key: 'PARMEO', name: 'PARMEO', color: '#9aa0a8' },
]
const PARTY_KEYS = PARTIES.map(p => p.key)
export const partyColor = (k) => (PARTIES.find(p => p.key === k)?.color) ?? '#9aa0a8'

const num = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0)

// Años disponibles, ascendente.
export const YEARS = [...new Set(compilado.map(r => r['AÑO ELECCIÓN']).filter(Boolean))].sort()

// Ganador (key de partido) de una fila; null si no hay votos.
export function winnerOf(row) {
  let best = null, bestV = 0
  for (const k of PARTY_KEYS) {
    const v = num(row[k])
    if (v > bestV) { bestV = v; best = k }
  }
  return best
}

const rowsOf = (year) => compilado.filter(r => r['AÑO ELECCIÓN'] === year)

// Años con datos reales (muchos municipios con ganador). 2004 y 2016 vienen
// casi vacíos en el Excel, así que no los ofrecemos para no mostrar huecos.
export const YEARS_WITH_DATA = YEARS.filter(
  y => rowsOf(y).filter(r => winnerOf(r)).length > 50,
)
export const DEFAULT_YEAR = YEARS_WITH_DATA[YEARS_WITH_DATA.length - 1]

// Votos totales por partido en un año.
export function partyVotes(year) {
  const rows = rowsOf(year)
  const out = Object.fromEntries(PARTY_KEYS.map(k => [k, 0]))
  for (const r of rows) for (const k of PARTY_KEYS) out[k] += num(r[k])
  return out
}

// Municipios ganados por cada partido en un año.
export function municipiosWon(year) {
  const rows = rowsOf(year)
  const out = Object.fromEntries(PARTY_KEYS.map(k => [k, 0]))
  for (const r of rows) {
    const w = winnerOf(r)
    if (w) out[w]++
  }
  return out
}

// Resumen agregado de un año: casillas, lista nominal, votos, abstención.
export function yearSummary(year) {
  const rows = rowsOf(year)
  const votes = partyVotes(year)
  const totalVotos = Object.values(votes).reduce((a, b) => a + b, 0)
  const casillas = rows.reduce((a, r) => a + num(r['TOTAL DE CASILLAS']), 0)
  const listaNominal = rows.reduce((a, r) => a + num(r['Lista Nominal']), 0)
  const validos = rows.reduce((a, r) => a + num(r['T.Votos Válidos']), 0)
  const abstProm = rows.length
    ? rows.reduce((a, r) => a + num(r['% Abst.']), 0) / rows.length
    : 0
  const won = municipiosWon(year)
  return {
    year,
    municipios: rows.length,
    casillas,
    listaNominal,
    totalVotos,
    validos,
    abstencion: abstProm,
    votes,
    won,
    priVotos: votes.PRI,
    priShare: totalVotos ? (votes.PRI / totalVotos) * 100 : 0,
    priMunicipios: won.PRI,
  }
}

// Tendencia del PRI por año (share de voto y municipios ganados).
export function priTrend() {
  return YEARS_WITH_DATA.map(y => {
    const s = yearSummary(y)
    return { year: y, share: s.priShare, municipios: s.priMunicipios, votos: s.priVotos }
  })
}

// Top municipios por votos de un partido en un año.
export function topMunicipios(year, party = 'PRI', n = 8) {
  return rowsOf(year)
    .map(r => ({ municipio: r.Municipio, votos: num(r[party]), ganador: winnerOf(r) }))
    .filter(m => m.municipio)
    .sort((a, b) => b.votos - a.votos)
    .slice(0, n)
}

// Municipios de OPORTUNIDAD: donde el PRI NO ganó pero tiene votación fuerte.
export function oportunidades(year, n = 6) {
  return rowsOf(year)
    .filter(r => r.Municipio && winnerOf(r) && winnerOf(r) !== 'PRI')
    .map(r => ({ municipio: r.Municipio, ganador: winnerOf(r), pri: num(r.PRI), ganadorVotos: num(r[winnerOf(r)]) }))
    .filter(m => m.pri > 0)
    .map(m => ({ ...m, margen: m.ganadorVotos - m.pri }))
    .sort((a, b) => a.margen - b.margen)   // más cerca de ganar primero
    .slice(0, n)
}

// Municipios con mayor abstención (riesgo de movilización).
export function mayorAbstencion(year, n = 6) {
  return rowsOf(year)
    .filter(r => r.Municipio && typeof r['% Abst.'] === 'number')
    .map(r => ({ municipio: r.Municipio, abst: r['% Abst.'], ganador: winnerOf(r) }))
    .sort((a, b) => b.abst - a.abst)
    .slice(0, n)
}

// Presupuesto y representantes (de COMITÉ). Totales.
export function representantesResumen() {
  const totalCasilla = representantes.reduce((a, r) => a + num(r.rep_casilla), 0)
  const totalGenerales = representantes.reduce((a, r) => a + num(r.rep_generales), 0)
  const presupuesto = representantes.reduce(
    (a, r) => a + num(r.importe_casilla) + num(r.importe_generales), 0)
  return { municipios: representantes.length, totalCasilla, totalGenerales, presupuesto }
}

// Formateadores.
export const fmt = (n) => new Intl.NumberFormat('es-MX').format(Math.round(n))
export const fmtPct = (n) => `${n.toFixed(1)}%`
export const fmtMoney = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
