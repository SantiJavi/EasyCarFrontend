import { Badge } from '../ui/Badge.jsx'
import { CalendarIcon, CheckIcon, GaugeIcon, PencilIcon } from '../icons/Icons.jsx'
import { formatFecha, formatKm } from '../../lib/format.js'
import {
  esPorTiempo,
  estadoMantenimiento,
  frecuenciaKmDe,
  frecuenciaMesesDe,
  ultimoRegistroDeTipo,
} from '../../lib/vehiculo.js'

const BARRA = {
  rose: 'bg-rose-500',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-500',
  slate: 'bg-slate-300',
}

export function MantenimientoCard({ tipo, vehiculo, onRegistrar, onEditar, puedeEditar = true }) {
  const estado = estadoMantenimiento(tipo, vehiculo)
  const ultimo = ultimoRegistroDeTipo(vehiculo, tipo.id)
  const progreso = Math.round((estado.progreso ?? 0) * 100)
  const porTiempo = esPorTiempo(tipo)
  const frecuencia = porTiempo ? frecuenciaMesesDe(tipo) : frecuenciaKmDe(tipo)
  const textoFrecuencia = frecuencia
    ? ` · cada ${porTiempo ? `${frecuencia} ${frecuencia === 1 ? 'mes' : 'meses'}` : formatKm(frecuencia)}`
    : ''
  const Icono = estado.motivo === 'tiempo' ? CalendarIcon : GaugeIcon

  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-tight text-slate-900">
            {tipo.nombreMantenimiento}
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {porTiempo ? <CalendarIcon className="h-3.5 w-3.5" /> : <GaugeIcon className="h-3.5 w-3.5" />}
            {porTiempo ? 'Por fecha' : 'Por kilometraje'}
            {textoFrecuencia}
          </p>
        </div>
        <Badge tono={estado.tono}>{estado.etiqueta}</Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Ultimo</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-800">
            {ultimo ? formatKm(ultimo.kilometrajeActual) : '—'}
          </dd>
          <dd className="text-[11px] text-slate-500">
            {ultimo ? formatFecha(ultimo.fechaMantenimiento) : 'sin registros'}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Proximo</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-800">
            {porTiempo
              ? formatFecha(tipo.fechaSiguienteMantenimiento)
              : tipo.kilometrajeObjetivo !== null && tipo.kilometrajeObjetivo !== undefined
                ? formatKm(tipo.kilometrajeObjetivo)
                : '—'}
          </dd>
          <dd className="text-[11px] text-slate-500">{porTiempo ? 'por fecha' : 'por kilometraje'}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${BARRA[estado.tono] ?? BARRA.slate}`}
            style={{ width: `${Math.min(100, Math.max(4, progreso))}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Icono className="h-3.5 w-3.5" />
            {estado.textoRestante ?? 'Sin datos suficientes'}
          </span>
          <span className="text-slate-400">{estado.motivo === 'tiempo' ? 'fecha' : 'km'}</span>
        </div>
        {tipo.observacion ? (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{tipo.observacion}</p>
        ) : null}

        {puedeEditar && (onRegistrar || onEditar) ? (
          <div className="mt-3 flex gap-2">
            {onRegistrar ? (
              <button
                type="button"
                onClick={() => onRegistrar(tipo)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-[13px] font-medium text-white transition hover:bg-slate-800"
              >
                <CheckIcon className="h-4 w-4" />
                Registrar cambio
              </button>
            ) : null}
            {onEditar ? (
              <button
                type="button"
                onClick={() => onEditar(tipo)}
                aria-label={`Editar ${tipo.nombreMantenimiento}`}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <PencilIcon className="h-4 w-4" />
                Editar
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
