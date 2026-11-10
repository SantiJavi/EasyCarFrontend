import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/auth.js'
import { clearSession, getStoredSession, saveSession } from '../api/client.js'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = getStoredSession()
    if (stored?.expiresAt && stored.expiresAt <= Date.now()) {
      clearSession()
      return null
    }
    return stored
  })

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    const next = {
      token: data.token,
      usuarioId: data.usuarioId,
      usuario: data.usuario,
      email: data.email,
      expiresAt: Date.now() + (data.expiresIn ?? 0) * 1000,
    }
    saveSession(next)
    setSession(next)
    return next
  }, [])

  const register = useCallback(
    async ({ usuario, email, password }) => {
      await authApi.register({ usuario, email, password })
      return login(email, password)
    },
    [login],
  )

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('easycar:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('easycar:unauthorized', handleUnauthorized)
  }, [logout])

  const value = useMemo(
    () => ({ session, isAuthenticated: Boolean(session?.token), login, register, logout }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
