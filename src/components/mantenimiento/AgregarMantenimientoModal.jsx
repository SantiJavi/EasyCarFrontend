import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { ErrorAlert } from '../ui/Feedback.jsx'
import { Input, Textarea } from '../ui/Field.jsx'
import { Modal } from '../ui/Modal.jsx'
import { useFormState } from '../../hooks/useFormState.js'
import { formatKm, sumarMeses, toInputDate, toIsoDateTime } from '../../lib/format.js'
import { TIPO_VISTA_KM, TIPO_VISTA_TIEMPO, kmActual } from '../../lib/vehiculo.js'
import { tiposMantenimientoApi } from '../../api/tiposMantenimiento.js'

const VACIO = { nombre: '', frecuencia: '', proximoKm: '', observacion: '' }

/**
 * "Agregar Mantenimiento" del bosquejo.
 * El switch elige el tipo de frecuencia y se guarda en tipoVista:
 *   1 = por kilometraje  -> kilometrajeObjetivo
 *   2 = por tiempo       -> fechaSiguienteMantenimiento
 */
export function AgregarMantenimientoModal({ open, onClose, vehiculo, onSaved }) {
  const kmBase = kmActual(vehiculo)
  const { values, setField } = useFormState(VACIO)
  const [modo, setModo] = useState(TIPO_VISTA_KM)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const fieldErrors = error?.fieldErrors ?? {}
  const porTiempo = modo === TIPO_VISTA_TIEMPO

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    const nombre = values.nombre.trim()
    if (!nombre) {
      setError('Escribe el nombre del mantenimiento')
      return
    }

    let kilometrajeObjetivo = null
    let fechaSiguienteMantenimiento = null

    if (porTiempo) {
      const meses = Number(values.frecuencia)
      if (!Number.isFinite(meses) || meses <= 0) {
        setError('La frecuencia en meses debe ser mayor que 0')
        return
      }
      fechaSiguienteMantenimiento = toIsoDateTime(toInputDate(sumarMeses(new Date(), meses)))
    } else if (kmBase === null) {
      const absoluto = Number(values.proximoKm)
      if (!Number.isFinite(absoluto) || absoluto <= 0) {
        setError('Escribe el proximo kilometraje (aun no hay kilometraje registrado)')
        return
      }
      kilometrajeObjetivo = absoluto
    } else {
      const frecuencia = Number(values.frecuencia)
      if (!Number.isFinite(frecuencia) || frecuencia <= 0) {
        setError('La frecuencia en kilometros debe ser mayor que 0')
        return
      }
      kilometrajeObjetivo = kmBase + frecuencia
    }

    setSaving(true)
    try {
      await tiposMantenimientoApi.crear({
        nombreMantenimiento: nombre,
        fechaSiguienteMantenimiento,
        observacion: values.observacion.trim() || null,
        kilometrajeObjetivo,
        tipoVista: modo,
        vehiculoId: vehiculo.id,
      })
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agregar mantenimiento"
      description="Elige si se controla por kilometraje o por tiempo"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <ErrorAlert error={error} />

        <Input
          id="nombreMantenimiento"
          label="Nombre"
          placeholder="Aceite"
          value={values.nombre}
          error={fieldErrors.nombreMantenimiento}
          onChange={(event) => setField('nombre', event.target.value)}
          required
        />

        <div>
          <p className="mb-1.5 text-[13px] font-medium text-slate-700">Tipo de frecuencia</p>
          <div
            className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
            role="group"
            aria-label="Tipo de frecuencia"
          >
            <button
              type="button"
              aria-pressed={modo === TIPO_VISTA_KM}
              onClick={() => {
                setModo(TIPO_VISTA_KM)
                setError(null)
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                modo === TIPO_VISTA_KM
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Por kilometraje
            </button>
            <button
              type="button"
              aria-pressed={porTiempo}
              onClick={() => {
                setModo(TIPO_VISTA_TIEMPO)
                setError(null)
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                porTiempo ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Por tiempo
            </button>
          </div>
        </div>

        {porTiempo ? (
          <Input
            id="frecuencia"
            type="number"
            inputMode="numeric"
            min="1"
            label="Cada cuantos meses"
            placeholder="6"
            hint="El proximo cambio se calcula desde hoy"
            value={values.frecuencia}
            error={fieldErrors.fechaSiguienteMantenimiento}
            onChange={(event) => setField('frecuencia', event.target.value)}
            required
          />
        ) : kmBase !== null ? (
          <Input
            id="frecuencia"
            type="number"
            inputMode="numeric"
            min="1"
            label="Cada cuantos kilometros"
            placeholder="5000"
            hint={`Base actual: ${formatKm(kmBase)}`}
            value={values.frecuencia}
            error={fieldErrors.kilometrajeObjetivo}
            onChange={(event) => setField('frecuencia', event.target.value)}
            required
          />
        ) : (
          <Input
            id="proximoKm"
            type="number"
            inputMode="numeric"
            min="1"
            label="Proximo kilometraje"
            placeholder="125000"
            hint="Aun no hay kilometraje registrado"
            value={values.proximoKm}
            error={fieldErrors.kilometrajeObjetivo}
            onChange={(event) => setField('proximoKm', event.target.value)}
            required
          />
        )}

        <Textarea
          id="observacionMantenimiento"
          label="Observacion"
          placeholder="Aceite 5W-30, filtro incluido"
          rows={2}
          value={values.observacion}
          onChange={(event) => setField('observacion', event.target.value)}
        />

        {porTiempo && values.frecuencia ? (
          <p className="rounded-xl bg-indigo-50/70 px-3.5 py-2.5 text-xs text-indigo-800">
            Proximo cambio en {values.frecuencia} meses (por fecha).
          </p>
        ) : null}

        {!porTiempo && values.frecuencia && kmBase !== null ? (
          <p className="rounded-xl bg-indigo-50/70 px-3.5 py-2.5 text-xs text-indigo-800">
            Proximo cambio a los {formatKm(Number(kmBase) + Number(values.frecuencia || 0))}.
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="sm:w-auto" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" className="sm:w-auto" loading={saving}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
