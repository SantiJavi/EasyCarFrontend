import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { ErrorAlert } from '../ui/Feedback.jsx'
import { Input } from '../ui/Field.jsx'
import { Modal } from '../ui/Modal.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { fechaDesdeHoy, formatFecha, formatKm, hoyIso, toIsoDateTime } from '../../lib/format.js'
import { esPorTiempo, kmActual, ultimoRegistroDeTipo } from '../../lib/vehiculo.js'
import { historialesApi } from '../../api/historiales.js'
import { tiposMantenimientoApi } from '../../api/tiposMantenimiento.js'

const MS_DIA = 86400000

/**
 * "Registrar cambio" de un mantenimiento: crea el historial con el kilometraje
 * actual del vehiculo y la fecha de hoy, y fija el nuevo objetivo segun su tipo
 * (proximo km si es por kilometraje, proxima fecha si es por tiempo).
 */
export function RegistrarMantenimientoModal({ open, onClose, vehiculo, tipo, onSaved }) {
  const { session } = useAuth()
  const toast = useToast()

  const kmVehiculo = kmActual(vehiculo)
  const porTiempo = esPorTiempo(tipo)
  const ultimo = ultimoRegistroDeTipo(vehiculo, tipo.id)

  const intervaloKm =
    tipo?.kilometrajeObjetivo != null && ultimo?.kilometrajeActual != null
      ? Math.max(1, tipo.kilometrajeObjetivo - ultimo.kilometrajeActual)
      : null

  const intervaloDias =
    tipo?.fechaSiguienteMantenimiento && ultimo?.fechaMantenimiento
      ? Math.max(
          1,
          Math.round(
            (new Date(tipo.fechaSiguienteMantenimiento) - new Date(ultimo.fechaMantenimiento)) / MS_DIA,
          ),
        )
      : null

  const [proximoKm, setProximoKm] = useState(
    String((kmVehiculo ?? 0) + (intervaloKm ?? 5000)),
  )
  const [proximaFecha, setProximaFecha] = useState(fechaDesdeHoy(intervaloDias ?? 180))
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar(event) {
    event.preventDefault()
    setError(null)

    if (kmVehiculo === null) {
      setError('Primero actualiza el kilometraje del vehiculo')
      return
    }
    if (porTiempo && !proximaFecha) {
      setError('Escribe la proxima fecha')
      return
    }
    if (!porTiempo && (!proximoKm || Number(proximoKm) <= kmVehiculo)) {
      setError(`El proximo kilometraje debe ser mayor que ${formatKm(kmVehiculo)}`)
      return
    }

    setGuardando(true)
    try {
      await historialesApi.crear({
        fechaMantenimiento: hoyIso(),
        kilometrajeActual: kmVehiculo,
        observacion: null,
        tipoMantenimientoId: tipo.id,
        usuarioId: session.usuarioId,
        vehiculoId: vehiculo.id,
      })

      await tiposMantenimientoApi.actualizar(tipo.id, {
        nombreMantenimiento: tipo.nombreMantenimiento,
        fechaSiguienteMantenimiento: porTiempo ? toIsoDateTime(proximaFecha) : null,
        observacion: tipo.observacion ?? null,
        kilometrajeObjetivo: porTiempo ? null : Number(proximoKm),
        tipoVista: tipo.tipoVista ?? 1,
        vehiculoId: vehiculo.id,
      })

      toast.success(`${tipo.nombreMantenimiento} registrado`)
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Registrar ${tipo?.nombreMantenimiento ?? 'mantenimiento'}`}
      description={
        kmVehiculo === null
          ? 'Sin kilometraje registrado'
          : `Se registra con ${formatKm(kmVehiculo)} y la fecha de hoy`
      }
    >
      <form onSubmit={guardar} className="space-y-4" noValidate>
        <ErrorAlert error={error} />

        <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Servicio:</span> hoy
          {tipo?.fechaSiguienteMantenimiento && porTiempo
            ? ` · proxima fecha actual: ${formatFecha(tipo.fechaSiguienteMantenimiento)}`
            : ''}
          {!porTiempo && tipo?.kilometrajeObjetivo != null
            ? ` · proximo km actual: ${formatKm(tipo.kilometrajeObjetivo)}`
            : ''}
        </div>

        {porTiempo ? (
          <Input
            id="proximaFecha"
            type="date"
            label="Proxima fecha"
            value={proximaFecha}
            onChange={(event) => setProximaFecha(event.target.value)}
            required
          />
        ) : (
          <Input
            id="proximoKm"
            type="number"
            inputMode="numeric"
            min="0"
            label="Proximo kilometraje"
            value={proximoKm}
            onChange={(event) => setProximoKm(event.target.value)}
            required
          />
        )}

        <p className="text-xs text-slate-500">
          Se guarda un registro en el historial y se actualiza el proximo objetivo de este
          mantenimiento.
        </p>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="sm:w-auto" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" className="sm:w-auto" loading={guardando}>
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
