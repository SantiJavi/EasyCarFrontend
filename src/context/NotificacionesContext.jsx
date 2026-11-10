import { useCallback, useEffect, useMemo, useState } from 'react'
import { NotificacionesContext } from './notificacionesContext.js'
import { useAuth } from '../hooks/useAuth.js'
import { userVehiculoApi } from '../api/userVehiculo.js'
import { vehiculosApi } from '../api/vehiculos.js'
import { calcularAlertas } from '../lib/vehiculo.js'

// Referencia estable para cuando no hay sesion: evita re-renders infinitos en el useMemo.
const SIN_VEHICULOS = []

/**
 * Alimenta la campanita con los mantenimientos vencidos o proximos de todos
 * los vehiculos del usuario. `refrescar()` se llama despues de cada cambio
 * (nuevo vehiculo, nuevo mantenimiento, actualizacion de kilometraje).
 */
export function NotificacionesProvider({ children }) {
  const { session, isAuthenticated } = useAuth()
  const [cargado, setCargado] = useState({ usuarioId: null, vehiculos: [] })
  const [vistas, setVistas] = useState(() => new Set())
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !session?.usuarioId) return undefined

    let activo = true
    Promise.all([userVehiculoApi.porUsuario(session.usuarioId), vehiculosApi.listar()])
      .then(([asociaciones, todos]) => {
        if (!activo) return
        const ids = new Set((asociaciones ?? []).map((asociacion) => asociacion.vehiculoId))
        setCargado({
          usuarioId: session.usuarioId,
          vehiculos: (todos ?? []).filter((vehiculo) => ids.has(vehiculo.id)),
        })
      })
      .catch(() => {
        if (activo) setCargado({ usuarioId: session.usuarioId, vehiculos: [] })
      })

    return () => {
      activo = false
    }
  }, [isAuthenticated, session?.usuarioId, version])

  // Al cerrar sesion no hace falta limpiar estado: la lista se ignora por usuarioId.
  const vehiculos = cargado.usuarioId === session?.usuarioId ? cargado.vehiculos : SIN_VEHICULOS

  const alertas = useMemo(() => calcularAlertas(vehiculos), [vehiculos])

  const noLeidas = useMemo(
    () => alertas.filter((alerta) => !vistas.has(alerta.clave)).length,
    [alertas, vistas],
  )

  const marcarVistas = useCallback(() => {
    setVistas(new Set(alertas.map((alerta) => alerta.clave)))
  }, [alertas])

  const refrescar = useCallback(() => setVersion((valor) => valor + 1), [])

  const value = useMemo(
    () => ({ alertas, noLeidas, marcarVistas, refrescar }),
    [alertas, noLeidas, marcarVistas, refrescar],
  )

  return <NotificacionesContext.Provider value={value}>{children}</NotificacionesContext.Provider>
}
