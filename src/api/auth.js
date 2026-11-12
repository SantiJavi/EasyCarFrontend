import { api } from './client'

export const authApi = {
  /** POST /auth/login -> { token, tokenType, expiresIn, usuarioId, usuario, email } */
  login: ({ email, password }) => api.post('/auth/login', { email, password }, { auth: false }),

  /** POST /auth/register -> { id, usuario, email }. Requiere el codigo de registro del servidor. */
  register: ({ usuario, email, password, codigo }) =>
    api.post('/auth/register', { usuario, email, password, codigo }, { auth: false }),
}
