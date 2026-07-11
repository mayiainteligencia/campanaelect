import config from './config'

/**
 * Vuelca config.colors / typography / layout a variables CSS en :root.
 * Llamar una vez al arrancar (main.jsx). Los estilos usan var(--...).
 */
export function applyTheme() {
  const root = document.documentElement
  const { colors, typography, layout, brand } = config

  Object.entries(colors).forEach(([k, v]) =>
    root.style.setProperty(`--color-${kebab(k)}`, v),
  )
  root.style.setProperty('--font-family', typography.fontFamily)
  root.style.setProperty('--font-size-base', typography.baseSize)
  root.style.setProperty('--sidebar-width', layout.sidebarWidth)
  root.style.setProperty('--sidebar-width-collapsed', layout.sidebarWidthCollapsed)
  root.style.setProperty('--header-height', layout.headerHeight)
  root.style.setProperty('--radius', layout.radius)
  root.style.setProperty('--radius-lg', layout.radiusLg)

  document.title = brand.name
  const link =
    document.querySelector("link[rel='icon']") ||
    document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }))
  link.href = brand.favicon
}

const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
