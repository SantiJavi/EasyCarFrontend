import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Dialogo modal: en movil entra como hoja inferior, en escritorio centrado.
 * Cierra con Escape o tocando el fondo y bloquea el scroll del documento.
 */
export function Modal({ open, onClose, title, description, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const ancho = size === 'lg' ? 'sm:max-w-2xl' : size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-lg'

  return createPortal(
    <div className="animate-fade fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-rise relative z-10 flex max-h-[92dvh] w-full ${ancho} flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift ring-1 ring-slate-900/5 sm:rounded-3xl`}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" />
        <header className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-4 sm:px-6">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">{title}</h2>
            {description ? <p className="mt-0.5 text-[13px] text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        <div className="overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
