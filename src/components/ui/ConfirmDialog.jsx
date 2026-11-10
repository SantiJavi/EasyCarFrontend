import { useState } from 'react'
import { Button } from './Button.jsx'
import { Modal } from './Modal.jsx'

export function ConfirmDialog({
  open,
  title = 'Confirmar accion',
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onClose,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err?.message ?? 'No se pudo completar la accion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" description="Esta accion no se puede deshacer">
      <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      {error ? <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-5 flex gap-2 sm:justify-end">
        <Button variant="secondary" className="flex-1 sm:flex-none" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="danger" className="flex-1 sm:flex-none" onClick={handleConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
