import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge.jsx'
import { ArrowRightIcon, CarIcon } from '../icons/Icons.jsx'
import { formatKm } from '../../lib/format.js'
import { estadoMantenimiento, kmActual, proximoMantenimiento } from '../../lib/vehiculo.js'
import { esSoloLectura, etiquetaRol, rolDe } from '../../lib/permisos.js'

export function VehiculoCard({ vehiculo }) {
  const km = kmActual(vehiculo)
  const proximo = proximoMantenimiento(vehiculo)
  const estado = proximo ? estadoMantenimiento(proximo, vehiculo) : null
  const anio = vehiculo.fechaMatricula ? new Date(vehiculo.fechaMatricula).getFullYear() : null

  return (
    <Link
      to={`/vehiculos/${vehiculo.id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift hover:ring-indigo-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
            <CarIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-900">
              {vehiculo.nombre || vehiculo.marca}
            </p>
            <p className="truncate text-xs text-slate-500">
              {vehiculo.marca}
              {anio ? ` · ${anio}` : ''}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge tono="slate">{vehiculo.placa}</Badge>
          {rolDe(vehiculo) === 'PROPIETARIO' ? null : (
            <Badge tono={esSoloLectura(vehiculo) ? 'amber' : 'indigo'}>
              {etiquetaRol(rolDe(vehiculo))}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Kilometraje</p>
          <p className="tabular mt-0.5 text-[26px] font-semibold leading-none tracking-tight text-slate-900">
            {km === null ? '—' : formatKm(km)}
          </p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        {proximo ? (
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs text-slate-500">
              Proximo: <span className="font-medium text-slate-700">{proximo.nombreMantenimiento}</span>
            </p>
            <Badge tono={estado.tono}>{estado.etiqueta}</Badge>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Sin mantenimientos programados</p>
        )}
      </div>
    </Link>
  )
}
