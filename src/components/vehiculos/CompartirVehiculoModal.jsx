import { useState } from 'react'
import { Badge } from '../ui/Badge.jsx'
import { Button } from '../ui/Button.jsx'
import { ErrorAlert } from '../ui/Feedback.jsx'
import { Select } from '../ui/Field.jsx'
import { Modal } from '../ui/Modal.jsx'
import { useApiResource } from '../../hooks/useApiResource.js'
import { useToast } from '../../hooks/useToast.js'
import { formatFecha } from '../../lib/format.js'
import { ROL } from '../../lib/permisos.js'
import { invitacionesApi } from '../../api/invitaciones.js'

const DIAS = [1, 7, 15, 30, 90]
const TONO_ESTADO = { VIGENTE: 'emerald', EXPIRADA: 'slate', REVOCADA: 'rose' }

/**
 * Comparte el vehiculo: genera codigos con la vigencia elegida, los renueva o
 * revoca, y administra el rol de cada persona con acceso.
 */
export function CompartirVehiculoModal({ open, onClose, vehiculo, onSaved }) {
  const toast = useToast()
  const invitaciones = useApiResource(() => invitacionesApi.porVehiculo(vehiculo.id), [vehiculo.id])
  const accesos = useApiResource(() => invitacionesApi.accesos(vehiculo.id), [vehiculo.id])

  const [dias, setDias] = useState('7')
  const [error, setError] = useState(null)
  const [creando, setCreando] = useState(false)
  const [ocupado, setOcupado] = useState(null)

  async function generar() {
    setError(null)
    setCreando(true)
    try {
      await invitacionesApi.crear({ vehiculoId: vehiculo.id, diasValidez: Number(dias) })
      toast.success('Codigo generado')
      invitaciones.reload()
    } catch (err) {
      setError(err)
    } finally {
      setCreando(false)
    }
  }

  async function renovar(invitacion) {
    setError(null)
    setOcupado(invitacion.id)
    try {
      await invitacionesApi.renovar(invitacion.id, Number(dias))
      toast.success('Codigo renovado')
      invitaciones.reload()
    } catch (err) {
      setError(err)
    } finally {
      setOcupado(null)
    }
  }

  async function revocar(invitacion) {
    setError(null)
    setOcupado(invitacion.id)
    try {
      await invitacionesApi.revocar(invitacion.id)
      toast.info('Codigo revocado')
      invitaciones.reload()
    } catch (err) {
      setError(err)
    } finally {
      setOcupado(null)
    }
  }

  async function copiar(codigo) {
    try {
      await navigator.clipboard.writeText(codigo)
      toast.success('Codigo copiado')
    } catch {
      toast.info(`Codigo: ${codigo}`)
    }
  }

  async function cambiarRol(acceso, rol) {
    setError(null)
    setOcupado(acceso.usuarioId)
    try {
      await invitacionesApi.cambiarRol(vehiculo.id, acceso.usuarioId, rol)
      toast.success(`Rol de ${acceso.usuario} actualizado`)
      accesos.reload()
      onSaved?.()
    } catch (err) {
      setError(err)
    } finally {
      setOcupado(null)
    }
  }

  async function quitar(acceso) {
    setError(null)
    setOcupado(acceso.usuarioId)
    try {
      await invitacionesApi.quitarAcceso(vehiculo.id, acceso.usuarioId)
      toast.info(`${acceso.usuario} ya no tiene acceso`)
      accesos.reload()
      onSaved?.()
    } catch (err) {
      setError(err)
    } finally {
      setOcupado(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Compartir vehiculo"
      description="Quien tenga el codigo puede ver y administrar este vehiculo mientras el codigo siga vigente"
    >
      <div className="space-y-6">
        <ErrorAlert error={error ?? invitaciones.error} />

        <section>
          <h3 className="text-[13px] font-semibold text-slate-800">Generar un codigo</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Elegi cuanto dura. Podes renovarlo despues sin cambiar el codigo.
          </p>
          <div className="mt-3 flex items-end gap-2">
            <Select
              id="diasValidez"
              label="Vigencia"
              value={dias}
              onChange={(event) => setDias(event.target.value)}
              className="max-w-[10rem]"
            >
              {DIAS.map((valor) => (
                <option key={valor} value={valor}>
                  {valor === 1 ? '1 dia' : `${valor} dias`}
                </option>
              ))}
            </Select>
            <Button onClick={generar} loading={creando} className="mb-0.5">
              Generar codigo
            </Button>
          </div>

          <ul className="mt-4 space-y-2">
            {(invitaciones.data ?? []).length === 0 ? (
              <li className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Todavia no generaste ningun codigo.
              </li>
            ) : null}

            {(invitaciones.data ?? []).map((invitacion) => (
              <li
                key={invitacion.id}
                className="flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-lg font-semibold tracking-[0.2em] text-slate-900">
                    {invitacion.codigo}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <Badge tono={TONO_ESTADO[invitacion.estado] ?? 'slate'}>{invitacion.estado}</Badge>
                    {invitacion.estado === 'VIGENTE'
                      ? `Vence en ${invitacion.diasRestantes} ${invitacion.diasRestantes === 1 ? 'dia' : 'dias'}`
                      : `Vencia el ${formatFecha(invitacion.expiraEn)}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="secondary" onClick={() => copiar(invitacion.codigo)}>
                    Copiar
                  </Button>
                  {invitacion.estado !== 'REVOCADA' ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={ocupado === invitacion.id}
                        onClick={() => renovar(invitacion)}
                      >
                        Renovar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={ocupado === invitacion.id}
                        onClick={() => revocar(invitacion)}
                      >
                        Revocar
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-[13px] font-semibold text-slate-800">Personas con acceso</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Colaborador puede editar; solo lectura puede consultar el vehiculo sin cambiar nada.
          </p>

          <ul className="mt-3 divide-y divide-slate-100 rounded-2xl ring-1 ring-slate-200">
            {(accesos.data ?? []).map((acceso) => {
              const esDuenio = acceso.rol === ROL.PROPIETARIO
              return (
                <li key={acceso.usuarioId} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{acceso.usuario}</p>
                    <p className="truncate text-xs text-slate-500">{acceso.email}</p>
                  </div>
                  {esDuenio ? (
                    <Badge tono="indigo">Propietario</Badge>
                  ) : (
                    <>
                      <Select
                        id={`rol-${acceso.usuarioId}`}
                        aria-label={`Rol de ${acceso.usuario}`}
                        value={acceso.rol}
                        disabled={ocupado === acceso.usuarioId}
                        onChange={(event) => cambiarRol(acceso, event.target.value)}
                        className="w-[9.5rem]"
                      >
                        <option value={ROL.COLABORADOR}>Colaborador</option>
                        <option value={ROL.LECTURA}>Solo lectura</option>
                      </Select>
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={ocupado === acceso.usuarioId}
                        onClick={() => quitar(acceso)}
                      >
                        Quitar
                      </Button>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <div className="flex justify-end pt-1">
          <Button variant="secondary" onClick={onClose}>
            Listo
          </Button>
        </div>
      </div>
    </Modal>
  )
}
