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

  // ─── Modo Institucional PAN — Azul y Blanco ────────────────────
  // Fondo blanco/crema limpio. Azul PAN es el acento principal.
  // Texto oscuro para máxima legibilidad. Decoraciones sutiles en gris.
  colors: {
    // ── Azul PAN (acento principal) ──────────────────────────────
    primary:       '#0055A5',
    primaryDark:   '#003D7A',
    primarySoft:   'rgba(0, 85, 165, 0.08)',
    primaryGlow:   'rgba(0, 85, 165, 0.20)',
    // ── Azul claro PAN (positivo / estados activos) ─────────────
    accent:        '#1B3A6B',   // azul oscuro PAN institucional
    accentSoft:    'rgba(27, 58, 107, 0.08)',
    accentGlow:    'rgba(27, 58, 107, 0.18)',
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
    borderGlow:    'rgba(0, 85, 165, 0.30)',
    sidebarBg:     'rgba(255, 255, 255, 0.95)',
    headerBg:      'transparent',   // el header sigue siendo flotante
    // ── Semánticos (PAN institucional) ────────────────────────────
    green:         '#0E7C3A',
    greenGlow:     'rgba(14, 124, 58, 0.20)',
    red:           '#DC2626',
    redGlow:       'rgba(220, 38, 38, 0.20)',
    blue:          '#0055A5',
    blueGlow:      'rgba(0, 85, 165, 0.18)',
    yellow:        '#B45309',
    yellowGlow:    'rgba(180, 83, 9, 0.18)',
    // ── Grid y decoración HUD (versión clara) ────────────────────
    gridLine:      'rgba(0, 0, 0, 0.04)',
    hudAccent:     '#0055A5',   // azul PAN como acento HUD
    hudAccentGlow: 'rgba(0, 85, 165, 0.15)',
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
