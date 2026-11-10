import { Link } from 'react-router-dom'
import { buttonClasses } from '../lib/buttonStyles.js'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600 ring-1 ring-indigo-100">
        Error 404
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Esta pagina no existe</h1>
      <p className="max-w-md text-sm text-slate-500">
        La direccion que abriste no corresponde a ninguna pantalla de EasyCar.
      </p>
      <Link to="/" className={buttonClasses({ className: 'mt-2' })}>
        Volver al inicio
      </Link>
    </div>
  )
}
