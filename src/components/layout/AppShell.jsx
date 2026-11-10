import { Link, Outlet, useNavigate } from 'react-router-dom'
import { CarIcon, LogoutIcon } from '../icons/Icons.jsx'
import { Campanita } from './Campanita.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { iniciales } from '../../lib/format.js'

export function AppShell() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-[0_10px_22px_-12px_rgba(79,70,229,0.95)]">
              <CarIcon className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">EasyCar</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <Campanita />
            <div className="flex items-center gap-2 rounded-full bg-white px-1.5 py-1 ring-1 ring-slate-200/80">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-700">
                {iniciales(session?.usuario ?? session?.email)}
              </span>
              <span className="hidden max-w-[13rem] truncate pr-2 text-[13px] font-medium text-slate-700 sm:block">
                {session?.usuario}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-900/5 hover:text-slate-800"
              aria-label="Cerrar sesion"
              title="Cerrar sesion"
            >
              <LogoutIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pt-9 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
