import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'

import config from '@/config/config'
import { sheetByKey } from '@/data/datasets'

// Mapa de rutas a títulos. El primer crumb es el nombre del sistema (config).
const routeMeta = {
  '/':             { title: 'Comando Central' },
  '/reportes':     { title: 'Resultados Electorales' },
  '/alertas':      { title: 'Alertas' },
  '/configuracion':{ title: 'Configuración' },
}

function metaFor(pathname) {
  if (routeMeta[pathname]) return routeMeta[pathname]
  if (pathname.startsWith('/datos/')) {
    const key = pathname.split('/')[2]
    return { title: sheetByKey(key)?.hoja ?? 'Fuentes de Datos' }
  }
  return { title: config.brand.name }
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const meta = metaFor(pathname)
  const crumbs = [config.brand.shortName || config.brand.name]

  // Estado collapsed del sidebar — se comparte con Header y Sidebar
  const [collapsed, setCollapsed] = useState(false)
  // En tablet se colapsa automáticamente
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth <= 768
      const tablet = window.innerWidth <= 1024 && window.innerWidth > 768
      setIsMobile(mobile)
      if (tablet && !collapsed) setCollapsed(true)
      if (window.innerWidth > 1024 && collapsed) setCollapsed(false)
    }
    window.addEventListener('resize', handler)
    // Inicializar en tablet
    if (window.innerWidth <= 1024) setCollapsed(true)
    return () => window.removeEventListener('resize', handler)
  }, [collapsed])

  const toggleSidebar = () => setCollapsed(c => !c)

  return (
    <div className="app-shell">
      {/* En móvil no hay sidebar: la navegación es el floating bottom nav */}
      {!isMobile && (
        <Sidebar collapsed={collapsed} mobileOpen={false} isMobile={false} />
      )}

      <div className="main-area">
        <Header
          title={meta.title}
          crumbs={crumbs}
          collapsed={collapsed}
          isMobile={isMobile}
          onToggle={toggleSidebar}
        />
        {/* El header es absoluto (Notch flotante) — el content arranca desde arriba */}
        <main className="content">
          <Outlet />
        </main>
      </div>

      {/* Floating bottom nav (solo móvil) */}
      {isMobile && <MobileNav />}
    </div>
  )
}
