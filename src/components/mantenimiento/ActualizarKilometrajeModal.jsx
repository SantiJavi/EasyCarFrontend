import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { ErrorAlert } from '../ui/Feedback.jsx'
import { KmInput } from '../ui/Field.jsx'
import { Modal } from '../ui/Modal.jsx'
import { CalendarIcon, GaugeIcon } from '../icons/Icons.jsx'
import { useToast } from '../../hooks/useToast.js'
import { formatKm } from '../../lib/format.js'
import { evaluarTipo, kmActual, ordenarPorVencimiento, tiposDe } from '../../lib/vehiculo.js'
import { vehiculosApi } from '../../api/vehiculos.js'
import { avisoKmActual, avisoKmMenor } from '../../lib/kilometraje.js'

const ESTILO_ESTADO = {
  rose: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-800',
  emerald: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-600',
}

/**
 * Actualiza SOLO el kilometraje del vehiculo (PATCH /api/vehiculos/{id}/kilometraje).
 * No pide mantenimientos: al guardar calcula cual es el que toca con ese kilometraje.
 */
export function ActualizarKilometrajeModal({ open, onClose, vehiculo, onSaved }) {
  const toast = useToast()
  const kmBase = kmActual(vehiculo)
  const tipos = ordenarPorVencimiento(tiposDe(vehiculo), vehiculo)

  const [km, setKm] = useState(kmBase ?? '')
  const [paso, setPaso] = useState('form')
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar(event) {
    event.preventDefault()
    setError(null)

    const valor = Number(km)
    if (km === '' || !Number.isFinite(valor) || valor < 0) {
      setError('Escribe un kilometraje valido')
      return
    }

    setGuardando(true)
    try {
      await vehiculosApi.actualizarKilometraje(vehiculo.id, valor)
      setResultado({
        km: valor,
        evaluados: tipos.map((tipo) => ({
          tipo,
          estado: evaluarTipo(tipo, vehiculo, { km: valor }),
        })),
      })
      setPaso('resultado')
      toast.success('Kilometraje actualizado')
      onSaved?.()
    } catch (err) {
      setError(err)
    } finally {
      setGuardando(false)
    }
  }

  const pendientes = (resultado?.evaluados ?? []).filter(
    (item) => item.estado.tono === 'rose' || item.estado.tono === 'amber',
  )

  // Corregir a la baja se permite siempre; solo se advierte (nunca se bloquea).
  const advertencia = avisoKmMenor(km, kmBase) ?? avisoKmActual(km, kmBase)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={paso === 'form' ? 'Actualizar kilometraje' : 'Que te toca ahora'}
      description={
        paso === 'form'
          ? `Kilometraje actual: ${kmBase === null ? 'sin registros' : formatKm(kmBase)}`
          : `Con ${formatKm(resultado?.km ?? 0)} en el tablero`
      }
    >
      {paso === 'form' ? (
        <form onSubmit={guardar} className="space-y-4" noValidate>
          <ErrorAlert error={error} />

          <KmInput
            id="kmNuevo"
            label="Kilometraje nuevo"
            placeholder="125500"
            value={km}
            onChange={(valor) => setKm(valor)}
            advertencia={advertencia}
            hint="No necesitas marcar mantenimientos: se calcula cual te toca."
            required
          />

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="sm:w-auto" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="sm:w-auto" loading={guardando}>
              Guardar
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {resultado?.evaluados.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Este vehiculo no tiene mantenimientos programados, asi que no hay nada que calcular.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                {pendientes.length === 0
                  ? 'Con este kilometraje ningun mantenimiento esta vencido ni proximo.'
                  : `Con este kilometraje hay ${pendientes.length} ${pendientes.length === 1 ? 'mantenimiento pendiente' : 'mantenimientos pendientes'}.`}
              </p>

              <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {resultado.evaluados.map(({ tipo, estado }) => (
                  <li key={tipo.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {tipo.nombreMantenimiento}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        {estado.motivo === 'tiempo' ? (
                          <CalendarIcon className="h-3.5 w-3.5" />
                        ) : (
                          <GaugeIcon className="h-3.5 w-3.5" />
                        )}
                        {estado.textoRestante ?? 'sin datos suficientes'}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ESTILO_ESTADO[estado.tono] ?? ESTILO_ESTADO.slate}`}
                    >
                      {estado.etiqueta}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-slate-500">
                Para marcarlo como hecho usa "Registrar" en su tarjeta: ahi pones la nueva fecha o el
                nuevo kilometraje.
              </p>
            </>
          )}

          <Button className="w-full" onClick={onClose}>
            Listo
          </Button>
        </div>
      )}
    </Modal>
  )
}
