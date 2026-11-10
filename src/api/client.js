/**
 * Cliente HTTP unico.
 * - Adjunta el JWT cuando hay sesion.
 * - Normaliza los errores del backend ({status, message, fieldErrors}).
 * - En un 401 de una peticion autenticada emite 'easycar:unauthorized'
 *   (el AuthProvider escucha y cierra la sesion).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const STORAGE_KEY = 'easycar.session'

export class ApiError extends Error {
  constructor({ status, message, fieldErrors = null }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function getStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY)
}

function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }

  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    const token = getStoredSession()?.token
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) return null

  const text = await response.text()
  const payload = text ? parseJson(text) : null

  if (!response.ok) {
    if (response.status === 401 && auth) {
      window.dispatchEvent(new CustomEvent('easycar:unauthorized'))
    }
    throw new ApiError({
      status: response.status,
      message: payload?.message ?? `No se pudo completar la peticion (${response.status})`,
      fieldErrors: payload?.fieldErrors ?? null,
    })
  }

  return payload
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
