import { api } from './client'

export const historialesApi = {
  crear: (payload) => api.post('/api/historiales', payload),
  eliminar: (id) => api.delete(`/api/historiales/${id}`),
}
