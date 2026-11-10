import { api } from './client'

export const authApi = {
  /** POST /auth/login -> { token, tokenType, expiresIn, usuarioId, usuario, email } */
  login: ({ email, password }) => api.post('/auth/login', { email, password }, { auth: false }),

  /** POST /auth/register -> { id, usuario, email } */
  register: ({ usuario, email, password }) =>
    api.post('/auth/register', { usuario, email, password }, { auth: false }),
}
