import logoPRI from '@/assets/logoPRI.png'

/**
 * FUENTE ÚNICA DE VERDAD del sistema.
 * Cambia aquí marca, colores, tipografía y logos. NO hardcodees estos
 * valores en componentes: usa las variables CSS (var(--color-primary), etc.)
 * que theme.js genera a partir de este archivo.
 */
export const config = {
  brand: {
    name: 'Centro de Comando PRI',
    shortName: 'PRI',
    logo: logoPRI,       // logo principal (sidebar / header)
    logoAlt: logoPRI,    // variante (login, fondos claros/oscuros)
    favicon: logoPRI,
  },

  // Tipografía. Inter desde Google Fonts (link en index.html).
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    baseSize: '15px',
  },

  // Sistema de color: blanco · rojo · verde · gris · negro.
  // Regla anti-fatiga: base neutra (blanco/gris), texto casi-negro, y el
  // color (rojo PRI / verde) como ACENTO, más tints suaves para las cards.
  // Se inyecta como variables CSS: --color-primary, etc.
  colors: {
    // Rojo (marca / énfasis)
    primary:       '#E1251B',   // rojo PRI
    primaryDark:   '#B01A12',   // rojo oscuro (hover/gradientes)
    primarySoft:   '#fdecea',   // tint rojo para fondos de card
    primaryGlow:   'rgba(225, 37, 27, 0.20)',
    // Verde (positivo / éxito)
    accent:        '#0b8a43',   // verde institucional legible sobre blanco
    accentSoft:    '#e7f4ec',   // tint verde para fondos de card
    accentGlow:    'rgba(11, 138, 67, 0.18)',
    // Neutros (blanco / gris / negro)
    bg:            '#f5f6f8',   // fondo general
    surface:       '#ffffff',   // superficie de cards
    surfaceHover:  '#eef0f3',   // hover neutro
    surfaceGlass:  'rgba(255, 255, 255, 0.72)',
    ink:           '#0e1116',   // negro suave (títulos)
    graphite:      '#242a32',   // gris oscuro (chips)
    graySoft:      '#f0f2f5',   // tint gris para fondos
    text:          '#15191f',   // texto principal (casi negro)
    textMuted:     '#5b636e',   // texto secundario
    textDim:       '#98a0ab',   // texto muy apagado
    border:        '#e5e8ec',   // bordes
    borderGlow:    'rgba(225, 37, 27, 0.32)',
    sidebarBg:     '#ffffff',
    headerBg:      '#ffffff',
    // Semánticos de dato (charts / estados)
    green:         '#0b8a43',
    greenGlow:     'rgba(11, 138, 67, 0.18)',
    red:           '#E1251B',
    redGlow:       'rgba(225, 37, 27, 0.18)',
    blue:          '#2563eb',
    blueGlow:      'rgba(37, 99, 235, 0.16)',
    yellow:        '#c98a00',
    yellowGlow:    'rgba(201, 138, 0, 0.18)',
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
