import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { ErrorAlert } from '../components/ui/Feedback.jsx'
import { Input, KmInput } from '../components/ui/Field.jsx'
import { ArrowLeftIcon } from '../components/icons/Icons.jsx'
import { buttonClasses } from '../lib/buttonStyles.js'
import { useFormState } from '../hooks/useFormState.js'
import { vehiculosApi } from '../api/vehiculos.js'
import { avisoKmActual } from '../lib/kilometraje.js'

const ANIO_ACTUAL = new Date().getFullYear()

export function NuevoVehiculoPage() {
  const navigate = useNavigate()
  const { values, setField } = useFormState({
    nombre: '',
    marca: '',
    anio: String(ANIO_ACTUAL),
    placa: '',
    kilometraje: '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const fieldErrors = error?.fieldErrors ?? {}

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const anio = Number(values.anio)
    if (!Number.isInteger(anio) || anio < 1900 || anio > ANIO_ACTUAL + 1) {
      setError('Escribe un año valido')
      setSaving(false)
      return
    }

    const kilometraje = Number(values.kilometraje)
    if (!Number.isFinite(kilometraje) || kilometraje < 0 || values.kilometraje === '') {
      setError('Escribe el kilometraje actual del vehiculo')
      setSaving(false)
      return
    }

    try {
      const vehiculo = await vehiculosApi.crear({
        placa: values.placa.trim().toUpperCase(),
        nombre: values.nombre.trim() || null,
        marca: values.marca.trim(),
        // El bosquejo pide Año: se guarda como fecha de matricula (1 de enero de ese año).
        fechaMatricula: `${anio}-01-01`,
        kilometrajeActual: kilometraje,
      })

      // El API asocia al usuario autenticado como PROPIETARIO al crear el vehiculo.
      navigate(`/vehiculos/${vehiculo.id}`, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
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

      <h1 className="mt-4 text-[26px] font-semibold tracking-tight text-slate-900">Agregar vehiculo</h1>
      <p className="mt-1 text-sm text-slate-500">
        Con estos datos el vehiculo queda asociado a tu cuenta.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:p-6"
        noValidate
      >
        <ErrorAlert error={error} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="nombre"
            label="Nombre"
            placeholder="Mi carro"
            value={values.nombre}
            error={fieldErrors.nombre}
            onChange={(event) => setField('nombre', event.target.value)}
          />
          <Input
            id="marca"
            label="Marca"
            placeholder="Mazda"
            value={values.marca}
            error={fieldErrors.marca}
            onChange={(event) => setField('marca', event.target.value)}
            required
          />
          <Input
            id="anio"
            type="number"
            inputMode="numeric"
            min="1900"
            max={ANIO_ACTUAL + 1}
            label="Año"
            placeholder="2020"
            value={values.anio}
            onChange={(event) => setField('anio', event.target.value)}
            required
          />
          <Input
            id="placa"
            label="Matrícula"
            placeholder="ABC123"
            maxLength={12}
            value={values.placa}
            error={fieldErrors.placa}
            onChange={(event) => setField('placa', event.target.value.toUpperCase())}
            required
          />
          <KmInput
            id="kilometraje"
            label="Kilometraje actual"
            placeholder="125000"
            hint="Con este valor se calcula que mantenimiento te toca"
            value={values.kilometraje}
            advertencia={avisoKmActual(values.kilometraje)}
            error={fieldErrors.kilometrajeActual}
            onChange={(valor) => setField('kilometraje', valor)}
            required
          />
        </div>

        <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-500">
          El kilometraje se puede actualizar despues sin registrar un mantenimiento; los cambios de
          mantenimiento se registran aparte, con su nueva fecha o kilometraje.
        </p>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Link to="/" className={buttonClasses({ variant: 'secondary', className: 'w-full sm:w-auto' })}>
            Cancelar
          </Link>
          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            Guardar vehiculo
          </Button>
        </div>
      </form>
    </div>
  )
}
