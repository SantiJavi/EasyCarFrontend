import { cn } from '../../lib/cn.js'

export function Spinner({ label = 'Cargando', className }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm text-slate-500', className)} role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" aria-hidden="true" />
      {label}
    </span>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70">
      <div className="h-3 w-24 rounded-full bg-slate-200" />
      <div className="mt-4 h-6 w-40 rounded-lg bg-slate-200" />
      <div className="mt-6 h-2 w-full rounded-full bg-slate-100" />
      <div className="mt-3 h-3 w-32 rounded-full bg-slate-100" />
    </div>
  )
}

export function EmptyState({ titulo, descripcion, accion, icono }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300/80 bg-white/60 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">{icono}</span>
      <div>
        <p className="text-[15px] font-semibold text-slate-800">{titulo}</p>
        {descripcion ? <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{descripcion}</p> : null}
      </div>
      {accion ? <div className="mt-1">{accion}</div> : null}
    </div>
  )
}

export function ErrorAlert({ error, className }) {
  if (!error) return null
  const mensaje = typeof error === 'string' ? error : (error.message ?? 'Ocurrio un error inesperado')
  const campos = typeof error === 'object' ? error.fieldErrors : null

  return (
    <div className={cn('rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-800', className)} role="alert">
      <p className="font-medium">{mensaje}</p>
      {campos ? (
        <ul className="mt-1 space-y-0.5 text-xs">
          {Object.entries(campos).map(([campo, detalle]) => (
            <li key={campo}>
              <span className="font-semibold">{campo}:</span> {detalle}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
