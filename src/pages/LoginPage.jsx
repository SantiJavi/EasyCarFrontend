import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ErrorAlert } from '../components/ui/Feedback.jsx'
import { Input } from '../components/ui/Field.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useFormState } from '../hooks/useFormState.js'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/'

  const { values, setField } = useFormState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, from, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(values.email.trim(), values.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Inicia sesion"
      subtitle="Entra con el email y la contrasena de tu cuenta"
      footer={
        <>
          No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
            Crear una
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <ErrorAlert error={error} />
        <Input
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={values.email}
          onChange={(event) => setField('email', event.target.value)}
          required
        />
        <Input
          id="password"
          type="password"
          label="Contrasena"
          autoComplete="current-password"
          placeholder="********"
          value={values.password}
          onChange={(event) => setField('password', event.target.value)}
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
