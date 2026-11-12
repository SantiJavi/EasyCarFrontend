import { CarIcon } from '../icons/Icons.jsx'

/**
 * Marco de las pantallas publicas: panel oscuro con mensaje a la izquierda
 * (solo escritorio) y formulario a la derecha.
 */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="grid-dots absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
            <CarIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">EasyCar</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[32px] font-semibold leading-[1.15] tracking-tight text-white">
            Lleva el control del kilometraje y de cada mantenimiento.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
            Registra cuando cambias el aceite, la banda o las llantas, y EasyCar te dice qué toca
            primero según los kilómetros y la fecha.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {[
              'Varios vehículos en una sola cuenta',
              'Alertas por kilometraje y por fecha',
              'Historial de cada actualización',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">Devsotec</p>
      </aside>

      <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
              <CarIcon className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">EasyCar</span>
          </div>

          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p> : null}

          <div className="mt-7">{children}</div>

          {footer ? <div className="mt-7 text-sm text-slate-600">{footer}</div> : null}
        </div>
      </section>
    </div>
  )
}
