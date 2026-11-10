import { api } from './client'

export const tiposMantenimientoApi = {
  porVehiculo: (vehiculoId) => api.get(`/api/tipos-mantenimiento/vehiculo/${vehiculoId}`),
  crear: (payload) => api.post('/api/tipos-mantenimiento', payload),
  actualizar: (id, payload) => api.put(`/api/tipos-mantenimiento/${id}`, payload),
  eliminar: (id) => api.delete(`/api/tipos-mantenimiento/${id}`),
}
