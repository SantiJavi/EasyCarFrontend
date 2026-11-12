import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { ErrorAlert } from '../ui/Feedback.jsx'
import { Input, KmInput, Textarea } from '../ui/Field.jsx'
import { Modal } from '../ui/Modal.jsx'
import { TipoFrecuenciaToggle } from './TipoFrecuenciaToggle.jsx'
import { useToast } from '../../hooks/useToast.js'
import { useFormState } from '../../hooks/useFormState.js'
import { formatFecha, formatKm, toInputDate, toIsoDateTime, sumarMeses } from '../../lib/format.js'
import {
  TIPO_VISTA_KM,
  TIPO_VISTA_TIEMPO,
  baseFechaDe,
  baseKmDe,
  esPorTiempo,
  frecuenciaKmDe,
  frecuenciaMesesDe,
  kmActual,
} from '../../lib/vehiculo.js'
import { tiposMantenimientoApi } from '../../api/tiposMantenimiento.js'
import { avisoFrecuenciaKm } from '../../lib/kilometraje.js'

const MS_DIA = 86400000

/** Meses aproximados entre dos fechas, para prellenar la frecuencia de datos viejos. */
function mesesEntre(desde, hasta) {
  if (!hasta) return null
  const dias = Math.round((new Date(hasta) - new Date(desde)) / MS_DIA)
  return dias > 0 ? Math.max(1, Math.round(dias / 30.4375)) : null
}

/**
 * Editar un mantenimiento: la frecuencia es el dato central. El proximo objetivo
 * se recalcula como frecuencia contada desde el ultimo servicio del tipo (o el
 * kilometraje/fecha actual si nunca se hizo), y se puede cambiar el tipo de control.
 */
export function EditarMantenimientoModal({ open, onClose, vehiculo, tipo, onSaved }) {
  const toast = useToast()
  const modoOriginal = esPorTiempo(tipo) ? TIPO_VISTA_TIEMPO : TIPO_VISTA_KM

  const kmVehiculo = kmActual(vehiculo)
  const baseKm = baseKmDe(tipo, vehiculo)
  const baseFecha = baseFechaDe(tipo, vehiculo)

  const { values, setField } = useFormState({
    nombre: tipo?.nombreMantenimiento ?? '',
    observacion: tipo?.observacion ?? '',
    frecuenciaKm: String(
      frecuenciaKmDe(tipo) ??
        (tipo?.kilometrajeObjetivo != null && baseKm != null
          ? Math.max(1, tipo.kilometrajeObjetivo - baseKm)
          : 5000),
    ),
    frecuenciaMeses: String(
      frecuenciaMesesDe(tipo) ?? mesesEntre(baseFecha, tipo?.fechaSiguienteMantenimiento) ?? 6,
    ),
  })

  const [modo, setModo] = useState(modoOriginal)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const fieldErrors = error?.fieldErrors ?? {}
  const porFecha = modo === TIPO_VISTA_TIEMPO
  const cambiaTipo = modo !== modoOriginal

  const frecuenciaKm = Number(values.frecuenciaKm)
  const frecuenciaMeses = Number(values.frecuenciaMeses)
  const proximoKmCalculado =
    baseKm !== null && Number.isFinite(frecuenciaKm) && frecuenciaKm > 0 ? baseKm + frecuenciaKm : null
  const proximaFechaCalculada =
    Number.isFinite(frecuenciaMeses) && frecuenciaMeses > 0
      ? toInputDate(sumarMeses(baseFecha, frecuenciaMeses))
      : null

  async function guardar(event) {
    event.preventDefault()
    setError(null)

    const nombre = values.nombre.trim()
    if (!nombre) {
      setError('Escribe el nombre del mantenimiento')
      return
    }

    let kilometrajeObjetivo = null
    let fechaSiguienteMantenimiento = null
    let nuevaFrecuenciaKm = null
    let nuevaFrecuenciaMeses = null

    if (porFecha) {
      if (!Number.isFinite(frecuenciaMeses) || frecuenciaMeses <= 0) {
        setError('La frecuencia en meses debe ser mayor que 0')
        return
      }
      nuevaFrecuenciaMeses = Math.round(frecuenciaMeses)
      fechaSiguienteMantenimiento = toIsoDateTime(proximaFechaCalculada)
    } else {
      if (!Number.isFinite(frecuenciaKm) || frecuenciaKm <= 0) {
        setError('La frecuencia en kilometros debe ser mayor que 0')
        return
      }
      if (baseKm === null) {
        setError('Primero actualiza el kilometraje del vehiculo')
        return
      }
      nuevaFrecuenciaKm = Math.round(frecuenciaKm)
      kilometrajeObjetivo = baseKm + nuevaFrecuenciaKm
    }

    setGuardando(true)
    try {
      await tiposMantenimientoApi.actualizar(tipo.id, {
        nombreMantenimiento: nombre,
        fechaSiguienteMantenimiento,
        observacion: values.observacion.trim() || null,
        kilometrajeObjetivo,
        frecuenciaKm: nuevaFrecuenciaKm,
        frecuenciaMeses: nuevaFrecuenciaMeses,
        tipoVista: modo,
        vehiculoId: vehiculo.id,
      })
      toast.success(`${nombre} actualizado`)
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
      title="Editar mantenimiento"
      description="Ajusta cada cuanto corresponde el mantenimiento o cambia si se controla por kilometraje o por fecha"
    >
      <form onSubmit={guardar} className="space-y-4" noValidate>
        <ErrorAlert error={error} />

        <Input
          id="nombreMantenimientoEdit"
          label="Nombre"
          placeholder="Aceite"
          value={values.nombre}
          error={fieldErrors.nombreMantenimiento}
          onChange={(event) => setField('nombre', event.target.value)}
          required
        />

        <TipoFrecuenciaToggle
          value={modo}
          onChange={(valor) => {
            setModo(valor)
            setError(null)
          }}
        />

        {porFecha ? (
          <Input
            id="frecuenciaMesesEdit"
            type="number"
            inputMode="numeric"
            min="1"
            label="Cada cuantos meses"
            placeholder="6"
            hint={
              proximaFechaCalculada
                ? `Contando desde ${formatFecha(baseFecha)}: proximo ${formatFecha(toIsoDateTime(proximaFechaCalculada))}`
                : 'Escribe la frecuencia en meses'
            }
            value={values.frecuenciaMeses}
            error={fieldErrors.frecuenciaMeses}
            onChange={(event) => setField('frecuenciaMeses', event.target.value)}
            required
          />
        ) : (
          <KmInput
            id="frecuenciaKmEdit"
            label="Cada cuantos kilometros"
            placeholder="5000"
            hint={
              baseKm === null
                ? 'Aun no hay kilometraje registrado en el vehiculo'
                : `Base: ${formatKm(baseKm)} · proximo ${
                    proximoKmCalculado === null ? '—' : formatKm(proximoKmCalculado)
                  }`
            }
            value={values.frecuenciaKm}
            advertencia={avisoFrecuenciaKm(values.frecuenciaKm)}
            error={fieldErrors.frecuenciaKm}
            onChange={(valor) => setField('frecuenciaKm', valor)}
            required
          />
        )}

        <Textarea
          id="observacionMantenimientoEdit"
          label="Observacion"
          placeholder="Aceite 5W-30, filtro incluido"
          rows={2}
          value={values.observacion}
          onChange={(event) => setField('observacion', event.target.value)}
        />

        {!porFecha && baseKm !== null && proximoKmCalculado !== null && kmVehiculo !== null ? (
          <p className="rounded-xl bg-indigo-50/70 px-3.5 py-2.5 text-xs text-indigo-800">
            {proximoKmCalculado > kmVehiculo
              ? `Proximo cambio a los ${formatKm(proximoKmCalculado)} (faltan ${formatKm(
                  proximoKmCalculado - kmVehiculo,
                )}).`
              : `Con esta frecuencia el cambio ya esta vencido por ${formatKm(
                  kmVehiculo - proximoKmCalculado,
                )}.`}
          </p>
        ) : null}

        {porFecha && proximaFechaCalculada ? (
          <p className="rounded-xl bg-indigo-50/70 px-3.5 py-2.5 text-xs text-indigo-800">
            Proximo cambio el {formatFecha(toIsoDateTime(proximaFechaCalculada))} (cada{' '}
            {Math.round(frecuenciaMeses)} meses).
          </p>
        ) : null}

        {cambiaTipo ? (
          <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
            {porFecha
              ? `Se elimina el objetivo por kilometraje${
                  tipo?.kilometrajeObjetivo !== null && tipo?.kilometrajeObjetivo !== undefined
                    ? ` (${formatKm(tipo.kilometrajeObjetivo)})`
                    : ''
                } y este mantenimiento pasa a controlarse por fecha.`
              : `Se elimina la fecha objetivo${
                  tipo?.fechaSiguienteMantenimiento
                    ? ` (${formatFecha(tipo.fechaSiguienteMantenimiento)})`
                    : ''
                } y este mantenimiento pasa a controlarse por kilometraje.`}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="sm:w-auto" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" className="sm:w-auto" loading={guardando}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  )
}
