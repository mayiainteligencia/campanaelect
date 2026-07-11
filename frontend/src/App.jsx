import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Reportes from '@/pages/Reportes'
import Alertas from '@/pages/Alertas'
import Configuracion from '@/pages/Configuracion'

// Registro de rutas. Nueva página = nuevo <Route> + entrada en Sidebar.jsx.
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="reportes"      element={<Reportes />} />
        <Route path="alertas"       element={<Alertas />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  )
}
