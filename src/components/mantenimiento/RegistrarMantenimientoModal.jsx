import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { ErrorAlert } from '../ui/Feedback.jsx'
import { Input, KmInput } from '../ui/Field.jsx'
import { Modal } from '../ui/Modal.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { fechaDesdeHoy, formatFecha, formatKm, sumarMeses, toInputDate, toIsoDateTime } from '../../lib/format.js'
import { esPorTiempo, frecuenciaKmDe, frecuenciaMesesDe, kmActual, ultimoRegistroDeTipo } from '../../lib/vehiculo.js'
import { historialesApi } from '../../api/historiales.js'
import { tiposMantenimientoApi } from '../../api/tiposMantenimiento.js'
import { avisoProximoKm } from '../../lib/kilometraje.js'

const MS_DIA = 86400000

function mesesEntre(desde, hasta) {
  if (!desde || !hasta) return null
  const dias = Math.round((new Date(hasta) - new Date(desde)) / MS_DIA)
  return dias > 0 ? Math.max(1, Math.round(dias / 30.4375)) : null
}

/**
 * "Registrar cambio": guarda el servicio en el historial con el kilometraje actual
 * y la fecha elegida (por defecto hoy, nunca futura) y desplaza el proximo objetivo
 * con la frecuencia configurada del mantenimiento.
 */
export function RegistrarMantenimientoModal({ open, onClose, vehiculo, tipo, onSaved }) {
  const { session } = useAuth()
  const toast = useToast()

  const kmVehiculo = kmActual(vehiculo)
  const porTiempo = esPorTiempo(tipo)
  const ultimo = ultimoRegistroDeTipo(vehiculo, tipo.id)
  const hoy = fechaDesdeHoy(0)

  // Frecuencia configurada; si el registro es viejo se deduce del ultimo intervalo.
  const frecuenciaKm =
    frecuenciaKmDe(tipo) ??
    (tipo?.kilometrajeObjetivo != null && ultimo?.kilometrajeActual != null
      ? Math.max(1, tipo.kilometrajeObjetivo - ultimo.kilometrajeActual)
      : 5000)

  const frecuenciaMeses =
    frecuenciaMesesDe(tipo) ??
    mesesEntre(ultimo?.fechaMantenimiento, tipo?.fechaSiguienteMantenimiento) ??
    6

  const [fechaCambio, setFechaCambio] = useState(hoy)
  const [proximoKm, setProximoKm] = useState(String((kmVehiculo ?? 0) + frecuenciaKm))
  const [proximaFecha, setProximaFecha] = useState(
    toInputDate(sumarMeses(new Date(toIsoDateTime(hoy)), frecuenciaMeses)),
  )
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  function cambiarFecha(valor) {
    setFechaCambio(valor)
    if (porTiempo && valor) {
      setProximaFecha(toInputDate(sumarMeses(new Date(toIsoDateTime(valor)), frecuenciaMeses)))
    }
  }

  async function guardar(event) {
    event.preventDefault()
    setError(null)

    if (kmVehiculo === null) {
      setError('Primero actualiza el kilometraje del vehiculo')
      return
    }
    if (!fechaCambio) {
      setError('Escribe la fecha del servicio')
      return
    }
    if (fechaCambio > hoy) {
      setError('La fecha del servicio no puede ser futura')
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
        fechaMantenimiento: toIsoDateTime(fechaCambio),
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
        frecuenciaKm: porTiempo ? null : frecuenciaKm,
        frecuenciaMeses: porTiempo ? frecuenciaMeses : null,
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
          : `Se registra con ${formatKm(kmVehiculo)} y la fecha que elijas`
      }
    >
      <form onSubmit={guardar} className="space-y-4" noValidate>
        <ErrorAlert error={error} />

        <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Frecuencia:</span>{' '}
          {porTiempo ? `cada ${frecuenciaMeses} meses` : `cada ${formatKm(frecuenciaKm)}`}
          {tipo?.fechaSiguienteMantenimiento && porTiempo
            ? ` · proxima fecha actual: ${formatFecha(tipo.fechaSiguienteMantenimiento)}`
            : ''}
          {!porTiempo && tipo?.kilometrajeObjetivo != null
            ? ` · proximo km actual: ${formatKm(tipo.kilometrajeObjetivo)}`
            : ''}
        </div>

        <Input
          id="fechaCambio"
          type="date"
          label="Fecha del servicio"
          max={hoy}
          hint="Por defecto hoy; podes registrar un cambio hecho en otra fecha (nunca futura)"
          value={fechaCambio}
          onChange={(event) => cambiarFecha(event.target.value)}
          required
        />

        {porTiempo ? (
          <Input
            id="proximaFecha"
            type="date"
            label="Proxima fecha"
            hint={`Se calcula desde la fecha del servicio + ${frecuenciaMeses} meses`}
            value={proximaFecha}
            onChange={(event) => setProximaFecha(event.target.value)}
            required
          />
        ) : (
          <KmInput
            id="proximoKm"
            label="Proximo kilometraje"
            hint={`Se calcula desde el kilometraje actual + ${formatKm(frecuenciaKm)}`}
            value={proximoKm}
            advertencia={avisoProximoKm(proximoKm, { actual: kmVehiculo, frecuencia: frecuenciaKm })}
            onChange={(valor) => setProximoKm(valor)}
            required
          />
        )}

        <p className="text-xs text-slate-500">
          Se guarda un registro en el historial y se mueve el proximo objetivo de este
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
