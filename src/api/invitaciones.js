import { api } from './client'

export const invitacionesApi = {
  crear: ({ vehiculoId, diasValidez }) => api.post('/api/invitaciones', { vehiculoId, diasValidez }),
  porVehiculo: (vehiculoId) => api.get(`/api/invitaciones/vehiculo/${vehiculoId}`),
  renovar: (id, diasValidez) => api.put(`/api/invitaciones/${id}/renovar`, { diasValidez }),
  revocar: (id) => api.delete(`/api/invitaciones/${id}`),
  canjear: (codigo) => api.post(`/api/invitaciones/canjear/${encodeURIComponent(codigo)}`),
  accesos: (vehiculoId) => api.get(`/api/vehiculos/${vehiculoId}/accesos`),
  cambiarRol: (vehiculoId, usuarioId, rol) =>
    api.put(`/api/vehiculos/${vehiculoId}/accesos/${usuarioId}`, { rol }),
  quitarAcceso: (vehiculoId, usuarioId) =>
    api.delete(`/api/vehiculos/${vehiculoId}/accesos/${usuarioId}`),
}
