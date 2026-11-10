import { api } from './client'

export const vehiculosApi = {
  listar: () => api.get('/api/vehiculos'),
  obtener: (id) => api.get(`/api/vehiculos/${id}`),
  crear: (payload) => api.post('/api/vehiculos', payload),
  actualizar: (id, payload) => api.put(`/api/vehiculos/${id}`, payload),
  actualizarKilometraje: (id, kilometrajeActual) =>
    api.patch(`/api/vehiculos/${id}/kilometraje`, { kilometrajeActual }),
  eliminar: (id) => api.delete(`/api/vehiculos/${id}`),
}
