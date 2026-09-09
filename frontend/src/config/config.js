import logoPAN from '@/assets/logoPan1.png'

/**
 * FUENTE ÚNICA DE VERDAD del sistema.
 * Cambia aquí marca, colores, tipografía y logos. NO hardcodees estos
 * valores en componentes: usa las variables CSS (var(--color-primary), etc.)
 * que theme.js genera a partir de este archivo.
 */
export const config = {
  brand: {
    name: 'Centro de Comando PAN',
    shortName: 'PAN',
    logo: logoPAN,       // logo principal (sidebar / header)
    logoAlt: logoPAN,    // variante (login, fondos claros/oscuros)
    favicon: logoPAN,
  },

  // Tipografía. Inter desde Google Fonts (link en index.html).
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    baseSize: '15px',
  },

  // ─── Modo Oscuro Institucional PAN — Azul y fondos oscuros ─────
  // Fondo negro/grafito profundo. Azul PAN brillante como acento.
  // Texto claro para máxima legibilidad sobre fondos oscuros.
  colors: {
    // ── Azul PAN (acento principal — se mantiene brillante) ──────
    primary:       '#2F81D0',     // azul PAN más brillante para dark mode
    primaryDark:   '#0055A5',     // azul original PAN para acentos fuertes
    primarySoft:   'rgba(47, 129, 208, 0.12)',
    primaryGlow:   'rgba(47, 129, 208, 0.25)',
    // ── Azul claro PAN (positivo / estados activos) ─────────────
    accent:        '#58A6FF',     // azul brillante tipo GitHub dark
    accentSoft:    'rgba(88, 166, 255, 0.10)',
    accentGlow:    'rgba(88, 166, 255, 0.20)',
    // ── Fondos (Oscuros) ─────────────────────────────────────────
    bg:            '#0D1117',     // fondo general — negro azulado (GitHub dark)
    surface:       'rgba(22, 27, 34, 0.95)',  // superficie de paneles
    surfaceHover:  'rgba(255, 255, 255, 0.06)',
    surfaceGlass:  'rgba(22, 27, 34, 0.80)',  // glassmorphism oscuro
    surfaceDeep:   '#010409',     // fondo extra profundo
    // ── Texto (claro sobre oscuro) ───────────────────────────────
    ink:           '#F0F6FC',     // blanco casi puro (títulos)
    graphite:      '#C9D1D9',     // gris claro
    graySoft:      'rgba(255,255,255,0.04)',
    text:          '#E6EDF3',     // texto principal — blanco
    textMuted:     '#8B949E',     // texto secundario — gris medio
    textDim:       '#484F58',     // texto muy apagado
    // ── Bordes ───────────────────────────────────────────────────
    border:        'rgba(255, 255, 255, 0.10)',
    borderGlow:    'rgba(47, 129, 208, 0.35)',
    sidebarBg:     'rgba(13, 17, 23, 0.97)',
    headerBg:      'transparent',
    // ── Semánticos (colores vivos para dark mode) ─────────────────
    green:         '#3FB950',
    greenGlow:     'rgba(63, 185, 80, 0.25)',
    red:           '#F85149',
    redGlow:       'rgba(248, 81, 73, 0.25)',
    blue:          '#58A6FF',
    blueGlow:      'rgba(88, 166, 255, 0.22)',
    yellow:        '#D29922',
    yellowGlow:    'rgba(210, 153, 34, 0.22)',
    // ── Grid y decoración HUD ────────────────────────────────────
    gridLine:      'rgba(255, 255, 255, 0.04)',
    hudAccent:     '#2F81D0',
    hudAccentGlow: 'rgba(47, 129, 208, 0.20)',
  },

  layout: {
    sidebarWidth:         '240px',
    sidebarWidthCollapsed:'64px',
    headerHeight:         '56px',
    radius:               '10px',
    radiusLg:             '16px',
  },
}

export default config
