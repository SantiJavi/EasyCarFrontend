import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarIcon, GaugeIcon } from '../icons/Icons.jsx'
import { useNotificaciones } from '../../hooks/useNotificaciones.js'
import { cn } from '../../lib/cn.js'

const PUNTO = {
  rose: 'bg-rose-500',
  amber: 'bg-amber-400',
}

export function Campanita() {
  const { alertas, noLeidas, marcarVistas } = useNotificaciones()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef(null)

  useEffect(() => {
    if (!abierto) return undefined

    const onPointerDown = (event) => {
      if (contenedor.current && !contenedor.current.contains(event.target)) setAbierto(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setAbierto(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [abierto])

  function alternar() {
    if (!abierto) marcarVistas()
    setAbierto((valor) => !valor)
  }

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        onClick={alternar}
        aria-label={noLeidas > 0 ? `Notificaciones (${noLeidas} sin ver)` : 'Notificaciones'}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-900/5 hover:text-slate-800"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 15.5V11a6 6 0 10-12 0v4.5L4.5 18h15L18 15.5z" />
          <path d="M10 21a2 2 0 004 0" />
        </svg>
        {noLeidas > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        ) : null}
      </button>

      {abierto ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/20 sm:hidden"
            onClick={() => setAbierto(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Notificaciones"
            className="animate-rise fixed inset-x-3 top-[4.5rem] z-50 overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-slate-900/5 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[22rem]"
          >
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
              <span className="text-[11px] font-medium text-slate-400">
                {alertas.length} {alertas.length === 1 ? 'aviso' : 'avisos'}
              </span>
            </header>

            {alertas.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-700">Todo al dia</p>
                <p className="mt-1 text-xs text-slate-500">
                  No hay mantenimientos vencidos ni proximos.
                </p>
              </div>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto sm:max-h-80">
                {alertas.map((alerta) => {
                  const Icono = alerta.motivo === 'tiempo' ? CalendarIcon : GaugeIcon
                  return (
                    <li key={alerta.clave} className="flex gap-3 px-4 py-3">
                      <span
                        className={cn(
                          'mt-1 h-2 w-2 shrink-0 rounded-full',
                          PUNTO[alerta.tono] ?? 'bg-slate-300',
                        )}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {alerta.etiqueta === 'Vencido' ? 'Te toca' : 'Se acerca'}{' '}
                          {alerta.nombre}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Icono className="h-3.5 w-3.5" />
                          {alerta.motivo === 'tiempo' ? 'Por tiempo' : 'Por kilometraje'} ·{' '}
                          {alerta.detalle}
                        </p>
                        <Link
                          to={`/vehiculos/${alerta.vehiculoId}`}
                          onClick={() => setAbierto(false)}
                          className="mt-1 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          Ver {alerta.nombreVehiculo} ({alerta.placa})
                        </Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
