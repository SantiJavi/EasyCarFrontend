import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ErrorAlert } from '../components/ui/Feedback.jsx'
import { Input } from '../components/ui/Field.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useFormState } from '../hooks/useFormState.js'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { values, setField } = useFormState({
    usuario: '',
    email: '',
    password: '',
    confirmacion: '',
    codigo: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (values.password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres')
      return
    }
    if (values.password !== values.confirmacion) {
      setError('Las contrasenas no coinciden')
      return
    }
    if (!values.codigo.trim()) {
      setError('Escribe el codigo de registro')
      return
    }

    setLoading(true)
    try {
      await register({
        usuario: values.usuario.trim(),
        email: values.email.trim(),
        password: values.password,
        codigo: values.codigo.trim(),
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Alta de usuario"
      subtitle="Registro restringido: necesitas el codigo de registro del administrador"
      footer={
        <>
          Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
            Iniciar sesion
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <ErrorAlert error={error} />
        <Input
          id="usuario"
          label="Nombre de usuario"
          autoComplete="username"
          placeholder="santiago"
          maxLength={100}
          value={values.usuario}
          onChange={(event) => setField('usuario', event.target.value)}
          required
        />
        <Input
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="tu@email.com"
          maxLength={100}
          value={values.email}
          onChange={(event) => setField('email', event.target.value)}
          required
        />
        <Input
          id="password"
          type="password"
          label="Contrasena"
          autoComplete="new-password"
          placeholder="Minimo 8 caracteres"
          minLength={8}
          value={values.password}
          onChange={(event) => setField('password', event.target.value)}
          required
        />
        <Input
          id="confirmacion"
          type="password"
          label="Repite la contrasena"
          autoComplete="new-password"
          value={values.confirmacion}
          onChange={(event) => setField('confirmacion', event.target.value)}
          required
        />
        <Input
          id="codigo"
          label="Codigo de registro"
          autoComplete="off"
          placeholder="Codigo entregado por el administrador"
          value={values.codigo}
          onChange={(event) => setField('codigo', event.target.value)}
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Crear cuenta
        </Button>
      </form>
    </AuthLayout>
  )
}
