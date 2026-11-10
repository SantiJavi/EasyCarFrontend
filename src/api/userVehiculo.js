import { api } from './client'

export const userVehiculoApi = {
  porUsuario: (usuarioId) => api.get(`/api/user-vehiculo/usuario/${usuarioId}`),
  crear: ({ usuarioId, vehiculoId }) => api.post('/api/user-vehiculo', { usuarioId, vehiculoId }),
}
