import { TIPO_VISTA_KM, TIPO_VISTA_TIEMPO } from '../../lib/vehiculo.js'

const OPCIONES = [
  { valor: TIPO_VISTA_KM, etiqueta: 'Por kilometraje' },
  { valor: TIPO_VISTA_TIEMPO, etiqueta: 'Por fecha' },
]

/**
 * Switch de frecuencia compartido por crear y editar mantenimiento.
 * Emite el valor de tipoVista (1 = kilometraje, 2 = fecha).
 */
export function TipoFrecuenciaToggle({ value, onChange, label = 'Tipo de frecuencia' }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-slate-700">{label}</p>
      <div
        className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
        role="group"
        aria-label={label}
      >
        {OPCIONES.map(({ valor, etiqueta }) => {
          const activo = Number(value) === valor
          return (
            <button
              key={valor}
              type="button"
              aria-pressed={activo}
              onClick={() => onChange(valor)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                activo ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {etiqueta}
            </button>
          )
        })}
      </div>
    </div>
  )
}
