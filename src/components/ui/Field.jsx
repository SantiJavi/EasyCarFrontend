import { cn } from '../../lib/cn.js'

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
