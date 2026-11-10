import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { VehiculoCard } from '../components/vehiculos/VehiculoCard.jsx'
import { EmptyState, ErrorAlert, SkeletonCard } from '../components/ui/Feedback.jsx'
import { CarIcon, PlusIcon } from '../components/icons/Icons.jsx'
import { buttonClasses } from '../lib/buttonStyles.js'
import { useAuth } from '../hooks/useAuth.js'
import { useApiResource } from '../hooks/useApiResource.js'
import { userVehiculoApi } from '../api/userVehiculo.js'
import { vehiculosApi } from '../api/vehiculos.js'

export function DashboardPage() {
  const { session } = useAuth()
  const asociaciones = useApiResource(() => userVehiculoApi.porUsuario(session.usuarioId), [session.usuarioId])
  const vehiculos = useApiResource(() => vehiculosApi.listar(), [])

  const loading = asociaciones.loading || vehiculos.loading
  const error = asociaciones.error ?? vehiculos.error

  const misVehiculos = useMemo(() => {
    const ids = new Set((asociaciones.data ?? []).map((asociacion) => asociacion.vehiculoId))
    return (vehiculos.data ?? []).filter((vehiculo) => ids.has(vehiculo.id))
  }, [asociaciones.data, vehiculos.data])

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
            User
            <span className="h-1 w-1 rounded-full bg-indigo-300" aria-hidden="true" />
            <span className="text-[13px] font-medium normal-case tracking-normal text-slate-500">
              {session?.usuario}
            </span>
          </p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[30px]">
            Tus vehiculos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kilometraje actual y el mantenimiento que toca primero.
          </p>
        </div>
        <Link to="/vehiculos/nuevo" className={buttonClasses({ size: 'lg', className: 'w-full sm:w-auto' })}>
          <PlusIcon className="h-4 w-4" />
          Agregar vehiculo
        </Link>
      </header>

      {error ? <ErrorAlert error={error} className="mb-5" /> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : null}

      {!loading && !error && misVehiculos.length === 0 ? (
        <EmptyState
          icono={<CarIcon className="h-6 w-6" />}
          titulo="Aun no tienes vehiculos"
          descripcion="Agrega tu primer vehiculo para llevar el kilometraje y programar sus mantenimientos."
          accion={
            <Link to="/vehiculos/nuevo" className={buttonClasses({})}>
              <PlusIcon className="h-4 w-4" />
              Agregar vehiculo
            </Link>
          }
        />
      ) : null}

      {!loading && misVehiculos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {misVehiculos.map((vehiculo) => (
            <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
          ))}
          {misVehiculos.length < 4 ? (
            <Link
              to="/vehiculos/nuevo"
              className="hidden min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/50 p-5 text-sm font-medium text-slate-500 transition hover:border-indigo-300 hover:bg-white hover:text-indigo-600 sm:flex"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
                <PlusIcon className="h-4 w-4" />
              </span>
              Agregar otro vehiculo
            </Link>
          ) : null}
        </div>
      ) : null}

      {!loading && misVehiculos.length > 0 ? (
        <p className="mt-6 text-center text-xs text-slate-400 sm:hidden">
          Toca un vehiculo para ver su detalle.
        </p>
      ) : null}
    </div>
  )
}
