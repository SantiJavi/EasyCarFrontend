import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell.jsx'
import { ProtectedRoute } from '../components/layout/ProtectedRoute.jsx'
import { DashboardPage } from '../pages/DashboardPage.jsx'
import { LoginPage } from '../pages/LoginPage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'
import { NuevoVehiculoPage } from '../pages/NuevoVehiculoPage.jsx'
import { RegisterPage } from '../pages/RegisterPage.jsx'
import { VehiculoPage } from '../pages/VehiculoPage.jsx'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  // Alta de usuarios restringida: la ruta publica /registro se retiro.
  // El formulario queda en una ruta no enlazada y ademas exige el codigo del servidor.
  { path: '/registro-easycar', element: <RegisterPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'vehiculos/nuevo', element: <NuevoVehiculoPage /> },
      { path: 'vehiculos/:id', element: <VehiculoPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
