import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AdminLogin() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const data = await login(email, password)
      if (data.role !== 'Admin' && data.role !== 'Colaborador') {
        logout()
        setError('Cuenta no autorizada para gestión de productos.')
        return
      }
      navigate('/admin')
    } catch {
      setError('Credenciales inválidas.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <h1>Gestión de productos</h1>
      <p className="muted login-lead">
        Ingreso para administradores y colaboradores. El catálogo público no requiere cuenta.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Correo
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Entrar'}
        </button>
      </form>
      <p className="hint muted">
        Usuarios demo:· Admin: admin@cemaco.com ·  Password: Admin123! · Colaborador: colaborador@cemaco.com · Password: Colaborador123!
      </p>
    </section>
  )
}
