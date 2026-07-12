import { createContext, useContext, useState, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Auth de CLIENTE (gate de UX). Guarda la sesión en localStorage y protege las
 * rutas. IMPORTANTE: esto NO es seguridad real — solo evita que el cliente vea
 * la app sin loguearse en la demo. La seguridad de verdad va en el backend:
 *   - Validación de credenciales en el servidor.
 *   - Cookie httpOnly + SameSite (no token en localStorage).
 *   - CORS estricto: Access-Control-Allow-Origin a tu dominio, credentials true.
 * Cuando exista el backend, login() debe hacer fetch(`${VITE_API_URL}/login`,
 * { method:'POST', credentials:'include' }) y dejar la sesión en la cookie.
 */

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const KEY = 'mayia_auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
  })

  const login = useCallback((email) => {
    const u = { email, ts: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, isAuthed: !!user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

// Envuelve las rutas privadas. Sin sesión → siempre manda a /login.
export function RequireAuth({ children }) {
  const { isAuthed } = useAuth()
  const loc = useLocation()
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}
