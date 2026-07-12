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

  // ─── Modo Institucional PRI — Blanco, Verde y Rojo ───────────────
  // Fondo blanco/crema limpio. Verde y Rojo PRI son los acentos.
  // Texto oscuro para máxima legibilidad. Decoraciones sutiles en gris.
  colors: {
    // ── Rojo PRI (acento principal / alertas) ────────────────────
    primary:       '#E1251B',
    primaryDark:   '#B01A12',
    primarySoft:   'rgba(225, 37, 27, 0.08)',
    primaryGlow:   'rgba(225, 37, 27, 0.20)',
    // ── Verde PRI (positivo / estados activos) ───────────────────
    accent:        '#007A33',   // verde PRI institucional
    accentSoft:    'rgba(0, 122, 51, 0.08)',
    accentGlow:    'rgba(0, 122, 51, 0.18)',
    // ── Fondos (Blanco / Crema institucional) ────────────────────
    bg:            '#F4F6F8',   // fondo general — gris muy claro
    surface:       'rgba(255, 255, 255, 0.92)',  // superficie de paneles
    surfaceHover:  'rgba(0, 0, 0, 0.04)',
    surfaceGlass:  'rgba(255, 255, 255, 0.80)',  // glassmorphism claro
    surfaceDeep:   '#EAECF0',   // fondo extra profundo para header, sidebar
    // ── Texto ────────────────────────────────────────────────────
    ink:           '#0D1117',   // negro puro (títulos)
    graphite:      '#2D3748',   // gris oscuro
    graySoft:      'rgba(0,0,0,0.03)',
    text:          '#1A202C',   // texto principal — casi negro
    textMuted:     '#4A5568',   // texto secundario — gris medio
    textDim:       '#A0AEC0',   // texto muy apagado
    // ── Bordes ───────────────────────────────────────────────────
    border:        'rgba(0, 0, 0, 0.10)',
    borderGlow:    'rgba(225, 37, 27, 0.30)',
    sidebarBg:     'rgba(255, 255, 255, 0.95)',
    headerBg:      'transparent',   // el header sigue siendo flotante
    // ── Semánticos (PRI institucional) ───────────────────────────
    green:         '#007A33',
    greenGlow:     'rgba(0, 122, 51, 0.20)',
    red:           '#E1251B',
    redGlow:       'rgba(225, 37, 27, 0.20)',
    blue:          '#1D4ED8',
    blueGlow:      'rgba(29, 78, 216, 0.18)',
    yellow:        '#B45309',
    yellowGlow:    'rgba(180, 83, 9, 0.18)',
    // ── Grid y decoración HUD (versión clara) ────────────────────
    gridLine:      'rgba(0, 0, 0, 0.04)',
    hudAccent:     '#E1251B',   // el rojo PRI como acento HUD en tema claro
    hudAccentGlow: 'rgba(225, 37, 27, 0.15)',
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
