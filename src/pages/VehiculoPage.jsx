import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { EmptyState, ErrorAlert, SkeletonCard } from '../components/ui/Feedback.jsx'
import { MantenimientoCard } from '../components/mantenimiento/MantenimientoCard.jsx'
import { AgregarMantenimientoModal } from '../components/mantenimiento/AgregarMantenimientoModal.jsx'
import { ActualizarKilometrajeModal } from '../components/mantenimiento/ActualizarKilometrajeModal.jsx'
import { RegistrarMantenimientoModal } from '../components/mantenimiento/RegistrarMantenimientoModal.jsx'
import { ArrowLeftIcon, ClockIcon, GaugeIcon, PlusIcon, TrashIcon, WrenchIcon } from '../components/icons/Icons.jsx'
import { useToast } from '../hooks/useToast.js'
import { useNotificaciones } from '../hooks/useNotificaciones.js'
import { useApiResource } from '../hooks/useApiResource.js'
import { formatFecha, formatFechaCorta, formatKm } from '../lib/format.js'
import {
  historialDe,
  kmActual,
  ordenarPorVencimiento,
  ultimaActualizacion,
} from '../lib/vehiculo.js'
import { vehiculosApi } from '../api/vehiculos.js'
import { historialesApi } from '../api/historiales.js'
import { buttonClasses } from '../lib/buttonStyles.js'

export function VehiculoPage() {
  const { id } = useParams()
  const toast = useToast()
  const { refrescar } = useNotificaciones()
  const { data: vehiculo, loading, error, reload } = useApiResource(() => vehiculosApi.obtener(id), [id])

  const [modal, setModal] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)
  const [registrando, setRegistrando] = useState(null)

  // Recarga el vehiculo y recalcula las notificaciones de la campanita.
  function recargar() {
    reload()
    refrescar()
  }

  // Solo se muestra el skeleton en la primera carga: al recargar se mantiene la vista
  // (y los modales abiertos) para no perder el estado.
  if (loading && !vehiculo) {
    return (
      <div className="space-y-4">
        <div className="h-52 animate-pulse rounded-3xl bg-slate-200/70" />
        <div className="grid gap-3 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (error && !vehiculo) {
    return (
      <div className="space-y-4">
        <Link to="/" className={buttonClasses({ variant: 'secondary' })}>
          <ArrowLeftIcon className="h-4 w-4" />
          Tus vehiculos
        </Link>
        <ErrorAlert error={error} />
      </div>
    )
  }

  const km = kmActual(vehiculo)
  const ultima = ultimaActualizacion(vehiculo)
  const tipos = ordenarPorVencimiento(vehiculo.tiposMantenimiento ?? [], vehiculo)
  const historial = [...historialDe(vehiculo)].sort(
    (a, b) => new Date(b.fechaMantenimiento) - new Date(a.fechaMantenimiento) || (b.id ?? 0) - (a.id ?? 0),
  )
  const anio = vehiculo.fechaMatricula ? new Date(vehiculo.fechaMatricula).getFullYear() : null
  const tiposPorId = new Map(tipos.map((tipo) => [tipo.id, tipo]))

  async function eliminarRegistro() {
    await historialesApi.eliminar(aEliminar.id)
    toast.success('Registro eliminado')
    setAEliminar(null)
    recargar()
  }

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Tus vehiculos
      </Link>

      <section className="relative mt-4 overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-lift sm:p-8">
        <div className="grid-dots absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/20">
              {vehiculo.placa}
            </span>
            <span className="text-xs text-slate-300">
              {vehiculo.marca}
              {anio ? ` · ${anio}` : ''}
            </span>
          </div>

          <h1 className="mt-2.5 text-[24px] font-semibold tracking-tight sm:text-[30px]">
            {vehiculo.nombre || vehiculo.marca}
          </h1>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Kilometraje actual
              </p>
              <p className="tabular mt-1 text-[38px] font-semibold leading-none tracking-tight sm:text-[46px]">
                {km === null ? '—' : formatKm(km)}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
                <ClockIcon className="h-3.5 w-3.5" />
                Ultimo servicio: {formatFecha(ultima)}
              </p>
            </div>

            <Button variant="light" size="lg" className="w-full sm:w-auto" onClick={() => setModal('kilometraje')}>
              <GaugeIcon className="h-4 w-4" />
              Actualizar kilometraje
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
              Mantenimientos
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {tipos.length}
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Ordenados por lo que se vence primero (kilometraje o fecha).
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setModal('mantenimiento')}>
            <PlusIcon className="h-4 w-4" />
            Agregar
          </Button>
        </div>

        {tipos.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icono={<WrenchIcon className="h-6 w-6" />}
              titulo="Sin mantenimientos programados"
              descripcion="Agrega Aceite, Banda o Llantas con su frecuencia en kilometros y en meses."
              accion={
                <Button onClick={() => setModal('mantenimiento')}>
                  <PlusIcon className="h-4 w-4" />
                  Agregar mantenimiento
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tipos.map((tipo) => (
              <MantenimientoCard
                key={tipo.id}
                tipo={tipo}
                vehiculo={vehiculo}
                onRegistrar={(item) => setRegistrando(item)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">Historial</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Servicios registrados con su kilometraje y fecha.
            </p>
          </div>
          <Badge tono="slate">{historial.length} registros</Badge>
        </div>

        {historial.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icono={<GaugeIcon className="h-6 w-6" />}
              titulo="Sin servicios registrados"
              descripcion="Usa Registrar cambio en una tarjeta de mantenimiento y aparecera aqui."
            />
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 sm:text-[11px]">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">N</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">Mantenimiento</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">Km</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">Fecha</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold sm:px-4 sm:py-3">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historial.map((registro, index) => (
                  <tr key={registro.id} className="transition hover:bg-slate-50/60">
                    <td className="px-3 py-3 text-xs text-slate-400 sm:px-4">{historial.length - index}</td>
                    <td className="px-3 py-3 text-slate-700 sm:px-4">
                      <span className="block max-w-[8rem] truncate sm:max-w-none">
                        {tiposPorId.get(registro.tipoMantenimientoId)?.nombreMantenimiento ?? '—'}
                      </span>
                    </td>
                    <td className="tabular px-3 py-3 font-semibold text-slate-800 sm:px-4">
                      {formatKm(registro.kilometrajeActual)}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 sm:px-4 sm:text-sm">
                      <span className="sm:hidden">{formatFechaCorta(registro.fechaMantenimiento)}</span>
                      <span className="hidden sm:inline">{formatFecha(registro.fechaMantenimiento)}</span>
                    </td>
                    <td className="px-3 py-3 text-right sm:px-4">
                      <button
                        type="button"
                        onClick={() => setAEliminar(registro)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Eliminar registro"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal === 'mantenimiento' ? (
        <AgregarMantenimientoModal
          open
          onClose={() => setModal(null)}
          vehiculo={vehiculo}
          onSaved={recargar}
        />
      ) : null}

      {modal === 'kilometraje' ? (
        <ActualizarKilometrajeModal
          open
          onClose={() => setModal(null)}
          vehiculo={vehiculo}
          onSaved={recargar}
        />
      ) : null}

      {registrando ? (
        <RegistrarMantenimientoModal
          open
          onClose={() => setRegistrando(null)}
          vehiculo={vehiculo}
          tipo={registrando}
          onSaved={recargar}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(aEliminar)}
        title="Eliminar registro"
        message="Se borrara este servicio del historial del vehiculo."
        onConfirm={eliminarRegistro}
        onClose={() => setAEliminar(null)}
      />
    </div>
  )
}
