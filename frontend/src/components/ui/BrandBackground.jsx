import { MeshGradient } from '@paper-design/shaders-react'
import config from '@/config/config'

// Fondo animado (MeshGradient shader) para toda la app. Los colores salen del
// branding: base blanca/crema + tintes suaves de azul PAN. Al cambiar
// la marca en config.js, el fondo se reajusta solo.

// Mezcla un hex hacia blanco (t=0 original, t=1 blanco).
function toward(hex, t) {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  const mix = (c) => Math.round(c + (255 - c) * t)
  const hx = (c) => mix(c).toString(16).padStart(2, '0')
  return `#${hx(r)}${hx(g)}${hx(b)}`
}

export default function BrandBackground({ speed = 0.25 }) {
  const { primary, accent, bg } = config.colors
  const reduce = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const spd = reduce ? 0 : speed
  const colors = [
    '#0D1117',
    bg.startsWith('#') ? bg : '#0D1117',
    toward(primary, 0.10),   // azul oscuro profundo
    toward(accent, 0.12),    // azul brillante muy oscuro
    toward(primary, 0.20),   // azul oscuro
    toward(accent, 0.22),    // azul brillante oscuro
  ]
  return (
    <div style={wrap} aria-hidden="true">
      <MeshGradient
        style={{ width: '100%', height: '100%' }}
        colors={colors}
        speed={spd}
        distortion={0.7}
        swirl={0.45}
        maxPixelCount={1280 * 720}
      />
    </div>
  )
}

const wrap = { position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }
