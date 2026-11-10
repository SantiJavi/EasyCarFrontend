import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificacionesProvider } from './context/NotificacionesContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { router } from './router/router.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <NotificacionesProvider>
          <RouterProvider router={router} />
        </NotificacionesProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
