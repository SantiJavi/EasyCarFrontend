import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from './toastContext.js'

const ESTILOS = {
  success: 'border-emerald-200/80 bg-emerald-50/95 text-emerald-900',
  error: 'border-rose-200/80 bg-rose-50/95 text-rose-900',
  info: 'border-slate-200/80 bg-white/95 text-slate-800',
}

const ICONO = {
  success: 'M20 6L9 17l-5-5',
  error: 'M12 8v5m0 3h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  info: 'M12 8h.01M11 12h1v4h1',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    ({ type = 'info', message, duration = 3800 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setToasts((current) => [...current, { id, type, message }])
      timers.current.set(id, setTimeout(() => dismiss(id), duration))
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const pendientes = timers.current
    return () => {
      pendientes.forEach(clearTimeout)
      pendientes.clear()
    }
  }, [])

  const value = useMemo(
    () => ({
      push,
      dismiss,
      success: (message) => push({ type: 'success', message }),
      error: (message) => push({ type: 'error', message }),
      info: (message) => push({ type: 'info', message }),
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lift backdrop-blur ${ESTILOS[toast.type] ?? ESTILOS.info}`}
          >
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ICONO[toast.type] ?? ICONO.info} />
            </svg>
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-lg px-1 text-xs font-medium opacity-60 transition hover:opacity-100"
              aria-label="Cerrar notificacion"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
