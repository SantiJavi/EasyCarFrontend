import { useRef, useState } from 'react'
import { cn } from '../../lib/cn.js'
import { formatKm, formatearMiles, soloDigitos } from '../../lib/format.js'
import { EyeIcon, EyeOffIcon } from '../icons/Icons.jsx'

const base =
  'w-full rounded-xl border-0 bg-white px-3.5 text-[15px] text-slate-900 ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:bg-slate-50'

function tono(error) {
  return error ? 'ring-rose-300 focus:ring-rose-400' : ''
}

export function Field({ label, htmlFor, hint, error, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="flex items-center gap-1 text-[13px] font-medium text-slate-700">
          {label}
          {required ? <span className="text-rose-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ id, label, hint, error, required, className, ...props }) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <input
        id={id}
        className={cn(base, 'h-11', tono(error), className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </Field>
  )
}

/**
 * Campo de kilometraje: muestra separador de miles (52.500) mientras se escribe,
 * guarda solo digitos y repite el valor en grande para que no se confunda
 * 10.000 con 100.000. `advertencia` es un aviso no bloqueante (ver lib/kilometraje.js).
 */
export function KmInput({
  id,
  label,
  hint,
  error,
  required,
  className,
  value,
  onChange,
  advertencia,
  placeholder,
  maxDigitos = 7,
  ...props
}) {
  const ref = useRef(null)
  const digitos = soloDigitos(value).slice(0, maxDigitos)
  const numero = digitos === '' ? null : Number(digitos)

  function manejarCambio(event) {
    const el = event.target
    const cursor = el.selectionStart ?? el.value.length
    const digitosAntes = soloDigitos(el.value.slice(0, cursor)).length
    const nuevos = soloDigitos(el.value).slice(0, maxDigitos)
    onChange(nuevos)

    // React repinta el valor formateado; devolvemos el cursor tras los mismos digitos
    // y limpiamos cualquier caracter que la mascara haya descartado.
    requestAnimationFrame(() => {
      const campo = ref.current
      if (!campo) return
      const esperado = formatearMiles(nuevos)
      if (campo.value !== esperado) campo.value = esperado
      let posicion = 0
      let vistos = 0
      while (posicion < esperado.length && vistos < digitosAntes) {
        if (/\d/.test(esperado[posicion])) vistos += 1
        posicion += 1
      }
      campo.setSelectionRange(posicion, posicion)
    })
  }

  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={cn(base, 'tabular h-11 pr-10', tono(error), className)}
          aria-invalid={Boolean(error)}
          required={required}
          placeholder={placeholder ? formatearMiles(placeholder) : undefined}
          value={formatearMiles(digitos)}
          onChange={manejarCambio}
          {...props}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
          km
        </span>
      </div>

      {numero ? (
        <p className="tabular flex items-center gap-2 text-[13px] font-semibold text-slate-700">
          {formatKm(numero)}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {digitos.length} cifras
          </span>
        </p>
      ) : null}

      {advertencia ? (
        <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-800">
          {advertencia}
        </p>
      ) : null}
    </Field>
  )
}

/**
 * Campo de contrasena con boton para mostrar u ocultar lo escrito.
 * El boton es type="button" para no disparar el submit del formulario.
 */
export function PasswordInput({ id, label, hint, error, required, className, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn(base, 'h-11 pr-11', tono(error), className)}
          aria-invalid={Boolean(error)}
          required={required}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((valor) => !valor)}
          aria-label={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          aria-pressed={visible}
          title={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          className="absolute inset-y-0 right-1.5 grid w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
        >
          {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  )
}

export function Select({ id, label, hint, error, required, className, children, ...props }) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <select
        id={id}
        className={cn(base, 'h-11 appearance-none pr-9', tono(error), className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
}

export function Textarea({ id, label, hint, error, required, rows = 3, className, ...props }) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        rows={rows}
        className={cn(base, 'resize-none py-2.5', tono(error), className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </Field>
  )
}
