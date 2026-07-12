import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Reportes from '@/pages/Reportes'
import Alertas from '@/pages/Alertas'
import Datos from '@/pages/Datos'
import Configuracion from '@/pages/Configuracion'
import Login from '@/pages/Login'
import { RequireAuth } from '@/auth'
import { MayiaProvider } from '@/components/ui/Mayia'

// Registro de rutas. /login es público; todo lo demás exige sesión (RequireAuth).
// MayiaProvider solo envuelve la app privada → los toasts no corren en el login.
export default function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth>
            <MayiaProvider>
              <AppLayout />
            </MayiaProvider>
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="reportes"      element={<Reportes />} />
        <Route path="alertas"       element={<Alertas />} />
        <Route path="datos"         element={<Navigate to="/datos/CONCENTRADO" replace />} />
        <Route path="datos/:key"    element={<Datos />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>

      {/* Ruta desconocida → dashboard (y si no hay sesión, RequireAuth manda a /login) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
