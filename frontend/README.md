# PRIBrain — Frontend

Dashboard en **React + Vite**. Vive solo, sin backend (`npm run dev`). Cuando
haya datos reales (Excel, API, etc.), se enchufan en **un solo lugar**:
`src/data/`. Ninguna página cambia por eso.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist
```

## Estructura

```
src/
├── config/           ← FUENTE ÚNICA de marca. Empieza aquí.
│   ├── config.js     ← nombre, logos, colores, tipografía, medidas
│   └── theme.js      ← vuelca config → variables CSS (:root)
├── assets/           ← imágenes (logos, iconos). Se importan, no se hardcodea la ruta.
├── components/
│   ├── layout/       ← Sidebar, Header, AppLayout (el "marco" de la app)
│   └── ui/           ← piezas reutilizables (Card, Button, …). Sin lógica de negocio.
├── pages/            ← una pantalla por archivo (Dashboard, Reportes, …)
├── data/             ← ÚNICA puerta de entrada de datos (mock hoy, API/Excel mañana)
├── styles/           ← CSS global + tokens
├── App.jsx           ← rutas
└── main.jsx          ← arranque (aplica theme + router)
```

## Reglas del juego

1. **Marca y estilo solo en `config/config.js`.** Colores, tipografía, logo,
   nombre de empresa: se cambian ahí y se propagan a todo. Nunca escribas un
   color o fuente a mano en un componente — usa `var(--color-primary)`,
   `var(--font-family)`, etc.

2. **Los datos entran solo por `src/data/`.** Las páginas piden datos a esa
   capa; no saben de dónde vienen. Hoy es mock; para conectar backend/Excel,
   cambias el cuerpo de las funciones ahí y mantienes la misma firma.

3. **`ui/` es tonto y reutilizable.** Componentes de `ui/` no conocen rutas ni
   datos: reciben props y pintan. Si necesitas algo específico de una pantalla,
   va en `pages/`, no en `ui/`.

4. **Una página = un archivo en `pages/`.** Para agregarla: crea el archivo,
   registra la ruta en `App.jsx` y el link en `components/layout/Sidebar.jsx`.

5. **Imports con `@/`** = `src/` (configurado en `vite.config.js`). Evita
   `../../..`.

6. **No dupliques.** Si copias un bloque dos veces, súbelo a `ui/`. Pero no
   abstraigas antes de que se repita — código simple repetido > abstracción
   prematura.

## Cambiar la marca (caso típico)

Abre `src/config/config.js` y edita `brand`, `colors`, `typography`. Para una
tipografía de Google Fonts, agrega su `<link>` en `index.html` y pon el nombre
en `typography.fontFamily`. Para un logo nuevo, ponlo en `src/assets/` e
impórtalo en `config.js`.

## Backend

Va aparte en `../backend`. El front no lo necesita para desarrollar. La URL de
la API se leerá de `VITE_API_URL` (archivo `.env`) desde `src/data/`.

---

## Changelog — Rediseño UI v1.1 (2026-07-10)

### Diseño dark premium

Se realizó un rediseño completo del frontend pasando de un tema claro básico a
un **dark dashboard premium** inspirado en dashboards analíticos modernos.

#### `src/config/config.js`
- Nueva paleta oscura: fondo `#0d1117`, superficie `#161b22`, texto `#e6edf3`
- Colores de acento: violeta `#7c3aed` + ámbar `#f59e0b`
- Variables de glow (`primaryGlow`, `greenGlow`, etc.) para efectos luminosos
- `sidebarBg` y `headerBg` igual al fondo general → fusión visual total
- Añadidos: `sidebarWidthCollapsed`, `radiusLg`

#### `src/config/theme.js`
- Exporta nuevas variables CSS: `--sidebar-width-collapsed`, `--radius-lg`
- Exporta todas las nuevas vars de color y glow al `:root`

#### `src/styles/global.css`
- Reset completo + scrollbar dark personalizado
- Clases utilitarias: `.glass` (glassmorphism), `.glow-*`
- Keyframes: `slideInLeft`, `slideInRight`, `slideInUp`, `fadeIn`, `pulse`,
  `blink`, `float`, `gradientShift`, `spin`, `shimmer`
- **Responsive completo**: tablet (≤1024px) y mobile (≤768px)

#### `src/styles/dashboard.css` _(nuevo)_
- Overrides responsive del grid del dashboard
- Hover effects para sidebar links, toggle, botones de header
- Oculta elementos del header en pantallas pequeñas

#### `src/components/layout/AppLayout.jsx`
- Gestión centralizada del estado `collapsed` del sidebar
- Detección automática de tablet/mobile con `resize` listener
- Overlay oscuro en mobile cuando el sidebar está abierto
- Pasa `collapsed`, `isMobile`, `onToggle` a Sidebar y Header

#### `src/components/layout/Sidebar.jsx`
- **Sidebar colapsable**: 240px ↔ 64px con transición CSS suave
- Iconos SVG inline para cada sección (sin dependencias externas)
- Labels con `opacity:0 width:0` al colapsar → transición limpia
- Punto indicador activo animado
- Secciones: Dashboard, Reportes, Alertas, Configuración
- Sin emojis — solo iconos SVG

#### `src/components/layout/Header.jsx`
- `background` igual al fondo general → desaparece visualmente (sin borde)
- **Breadcrumb monospace**: `src/pages/Dashboard.jsx → Dashboard`
- Botón toggle ←/→ para colapsar/expandir sidebar
- Buscador pill con atajo `⌘K`
- Chip de estado del sistema con dot parpadeante
- Badge de notificaciones sobre el ícono de campana
- Avatar con gradiente violeta

#### `src/components/ui/Card.jsx`
- Soporte para `glass` (glassmorphism), `glow`, `animDelay`, `subtitle`
- Animación `slideInUp` por defecto

#### `src/data/dataSource.js`
- `getAlerts()` — alertas con severidad, región, tiempo y categoría
- `getMapData()` — datos por estado con niveles: low/medium/high/critical
- `getRecentActivity()` — actividad reciente del sistema
- `getDashboardMetrics()` actualizado con `change`, `trend`, `color`

#### `src/pages/Dashboard.jsx`
- Layout 3 columnas: **alertas ← | mapa México ↑ | KPIs →**
- Mapa SVG de México con paths reales (jqvmap `viewBox="0 0 959 593"`)
- 32 estados con colores por nivel de actividad y hover glow
- Puntos pulsantes en estados críticos
- Panel izquierdo: alertas emergentes con animación `slideInLeft`
- Panel derecho: KPI cards con sparklines SVG + barras de distribución
- Actividad reciente bajo el mapa
- Hook `useWindowWidth` → grid responsive (3 cols → 1 col en tablet)
- Sin emojis — solo iconos SVG inline

#### `src/pages/Alertas.jsx` _(nuevo)_
- Página placeholder con icono SVG animado (`float`)

#### `src/pages/Configuracion.jsx` _(nuevo)_
- Página placeholder con icono SVG animado (`spin`)

#### `src/pages/Reportes.jsx`
- Actualizado al dark theme con icono SVG animado

#### `src/App.jsx`
- Nuevas rutas: `/alertas` y `/configuracion`

#### `index.html`
- Google Fonts Inter (300–800) para tipografía premium
- Meta description para SEO

### Notas de responsive

| Breakpoint | Comportamiento |
|---|---|
| > 1024px | Layout completo, sidebar expandido/colapsable |
| ≤ 1024px | Sidebar auto-colapsado (solo iconos) |
| ≤ 768px | Sidebar overlay, header simplificado |
| ≤ 480px | Padding reducido, layout apilado |
