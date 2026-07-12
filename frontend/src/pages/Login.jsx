import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import config from '@/config/config'
import { useAuth } from '@/auth'
import { MeshGradient } from '@paper-design/shaders-react'

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login, isAuthed } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.from || '/'

  if (isAuthed) return <Navigate to="/" replace />

  const submit = (e) => {
    e.preventDefault()
    setError('')
    const correo = email.trim()
    if (!correo || !pass) {
      setError('Por favor, completa todos los campos.')
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      setError('Formato de correo no válido.')
      return
    }
    setBusy(true)
    setTimeout(() => { login(correo); navigate(destino, { replace: true }) }, 600)
  }

  return (
    <div className="login-screen">
      
      {/* ── Panel Izquierdo (Branding / Visual) ────────────────────── */}
      <div className="login-left">
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <MeshGradient
            style={{ width: '100%', height: '100%' }}
            colors={['#000000', '#0a0a0a', '#2d0a0a', '#540d0d', '#092417', '#0f3b25']}
            speed={0.2}
            distortion={0.8}
            swirl={0.5}
            maxPixelCount={1280 * 720}
          />
        </div>
        
        {/* Capa de contraste sutil para empastar con el fondo negro */}
        <div className="login-left-overlay" />

        <div className="login-left-content">
          <img src={config.brand.logo} alt="Logo PRI" className="login-logo" />
          <h1 className="login-headline">
            Comando Central<br />Inteligente
          </h1>
          <p className="login-subhead">
            Sistema Nacional de Análisis Electoral, Territorio y Movilización Estratégica.
          </p>
        </div>
      </div>

      {/* ── Panel Derecho (Formulario) ───────────────────────────────── */}
      <div className="login-right">
        <div className="login-form-container">
          
          <div className="login-header">
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales institucionales para acceder al sistema.</p>
          </div>

          <form onSubmit={submit} className="login-form" noValidate>
            
            <div className="login-field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@pri.org.mx"
                autoComplete="email" autoFocus
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>
              <div className="login-pass-wrap">
                <input
                  id="password" type={showPass ? 'text' : 'password'}
                  value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                />
                <button
                  type="button" className="login-eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex="-1"
                >
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <span className="login-error-dot" /> {error}
              </div>
            )}

            <button type="submit" className="login-submit tap" disabled={busy}>
              {busy ? <span className="login-spinner" /> : 'Iniciar sesión'}
            </button>

          </form>
          
          <div className="login-footer">
            &copy; {new Date().getFullYear()} {config.brand.name}. Acceso restringido.
          </div>
        </div>
      </div>

    </div>
  )
}
