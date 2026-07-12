// Catálogo de las hojas del Excel: perfilado (de perfilar.py --json) + preview
// de datos (primeras filas). Alimenta la sección "Fuentes de Datos".

import perfiles from './perfiles.json'
import CONCENTRADO from './sheets/CONCENTRADO.json'
import MOVILIZACION from './sheets/MOVILIZACION.json'
import COMPILADO from './sheets/COMPILADO.json'
import REPRESENTANTES from './sheets/REPRESENTANTES.json'
import COMITE from './sheets/COMITE.json'

const rowsByKey = { CONCENTRADO, MOVILIZACION, COMPILADO, REPRESENTANTES, COMITE }
const perfilByHoja = Object.fromEntries(perfiles.map(p => [p.hoja, p]))

// Las 5 hojas solicitadas, en orden. hoja = nombre real (con acento).
export const SHEETS = [
  { key: 'CONCENTRADO',    hoja: 'CONCENTRADO',    desc: 'Concentrado general' },
  { key: 'MOVILIZACION',   hoja: 'MOVILIZACION',   desc: 'Movilización territorial' },
  { key: 'COMPILADO',      hoja: 'COMPILADO',      desc: 'Resultados por municipio' },
  { key: 'REPRESENTANTES', hoja: 'REPRESENTANTES', desc: 'Representantes' },
  { key: 'COMITE',         hoja: 'COMITÉ',         desc: 'Comité directivo estatal' },
].map(s => ({ ...s, perfil: perfilByHoja[s.hoja] ?? null, rows: rowsByKey[s.key] ?? [] }))

export const sheetByKey = (key) => SHEETS.find(s => s.key === key)

// Completitud promedio de una hoja (100 - promedio de % de nulos).
export function completitud(perfil) {
  if (!perfil?.columnas?.length) return 0
  const prom = perfil.columnas.reduce((a, c) => a + c.pct_nulos, 0) / perfil.columnas.length
  return Math.max(0, 100 - prom)
}

// Insights de calidad de datos (alertas / sugerencias / predicciones) por hoja.
export function sheetInsights(perfil) {
  if (!perfil) return []
  const out = []
  const importable = perfil.veredicto.includes('importable')

  out.push({
    id: 'estado', kind: importable ? 'sugerencia' : 'analisis',
    title: importable ? 'Hoja lista para importar' : 'Revisar antes de importar',
    detail: `${perfil.veredicto}. ${perfil.filas} filas × ${perfil.columnas_n} columnas.`,
    plan: importable ? { label: 'Importar a la base', ok: 'Importar' } : null,
  })

  const altos = perfil.columnas.filter(c => c.pct_nulos >= 30)
  if (altos.length) out.push({
    id: 'nulos', kind: 'alerta',
    title: `${altos.length} columnas con muchos vacíos`,
    detail: altos.slice(0, 3).map(c => `${c.nombre} ${c.pct_nulos}%`).join(', ') + (altos.length > 3 ? '…' : ''),
    plan: { label: 'Solicitar datos faltantes al cliente', ok: 'Aceptar' },
  })

  const llaves = perfil.columnas.filter(c => c.notas.includes('llave'))
  if (llaves.length) out.push({
    id: 'llave', kind: 'prediccion',
    title: `Identificador probable: ${llaves[0].nombre}`,
    detail: 'Columna con valores únicos, candidata a llave primaria al importar.',
  })

  const casing = perfil.columnas.filter(c => c.notas.includes('casing'))
  if (casing.length) out.push({
    id: 'casing', kind: 'sugerencia',
    title: 'Inconsistencias de mayúsculas',
    detail: `En ${casing.map(c => c.nombre).join(', ')}. Normalizar antes de cruzar datos.`,
    plan: { label: 'Normalizar mayúsculas', ok: 'Aplicar' },
  })

  const pii = perfil.columnas.filter(c => c.notas.includes('PII'))
  if (pii.length) out.push({
    id: 'pii', kind: 'alerta',
    title: 'Datos personales (PII) detectados',
    detail: `${pii.map(c => c.nombre).join(', ')} — proteger, no exponer.`,
  })

  return out
}
