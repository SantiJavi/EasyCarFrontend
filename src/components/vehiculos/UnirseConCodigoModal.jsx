import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { ErrorAlert } from '../ui/Feedback.jsx'
import { Input } from '../ui/Field.jsx'
import { Modal } from '../ui/Modal.jsx'
import { useToast } from '../../hooks/useToast.js'
import { invitacionesApi } from '../../api/invitaciones.js'

const LARGO_CODIGO = 8

/**
 * Canjea un codigo de acceso: el usuario autenticado queda como colaborador del
 * vehiculo compartido.
 */
export function UnirseConCodigoModal({ open, onClose, onJoined }) {
  const toast = useToast()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function unirse(event) {
    event.preventDefault()
    setError(null)
    const limpio = codigo.trim().toUpperCase()

    if (limpio.length !== LARGO_CODIGO) {
      setError(`El codigo tiene ${LARGO_CODIGO} caracteres`)
      return
    }

    setEnviando(true)
    try {
      const acceso = await invitacionesApi.canjear(limpio)
      toast.success(`Ahora tienes acceso a ${acceso.nombre || acceso.placa}`)
      setCodigo('')
      onJoined?.(acceso)
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Unirme con un codigo"
      description="Pide el codigo a la persona que comparte el vehiculo"
    >
      <form onSubmit={unirse} className="space-y-4" noValidate>
        <ErrorAlert error={error} />

        <Input
          id="codigoAcceso"
          label="Codigo"
          placeholder="K7M2PQX9"
          value={codigo}
          maxLength={LARGO_CODIGO + 2}
          autoComplete="off"
          autoCapitalize="characters"
          onChange={(event) => setCodigo(event.target.value.toUpperCase())}
          className="font-mono text-lg tracking-[0.25em]"
          hint="Ocho caracteres, sin espacios"
          required
        />

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="sm:w-auto" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" className="sm:w-auto" loading={enviando}>
            Unirme
          </Button>
        </div>
      </form>
    </Modal>
  )
}
