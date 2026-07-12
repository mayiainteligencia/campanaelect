import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from '@/auth'
import { applyTheme } from '@/config/theme'
import { ConfirmProvider } from '@/components/ui/ConfirmModal'
import '@/styles/global.css'
import '@/styles/dashboard.css'
import '@/styles/login.css'

applyTheme() // inyecta colores/tipografía desde config antes de renderizar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
