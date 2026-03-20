import { useEffect, useRef, useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { AdminAlert } from '../../components/AdminAlert'
import { api } from '../../services/api'

function apiErrorMessage(err) {
  const d = err?.response?.data
  if (typeof d?.message === 'string') return d.message
  return null
}

export function AdminUsers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [modalError, setModalError] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Colaborador')
  const [saving, setSaving] = useState(false)

  const dialogRef = useRef(null)

  async function load() {
    setLoading(true)
    setPageError(null)
    try {
      const { data } = await api.get('/users')
      setItems(data)
    } catch {
      setPageError('No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openModal() {
    setEmail('')
    setPassword('')
    setRole('Colaborador')
    setModalError(null)
    dialogRef.current?.showModal()
  }

  function closeModal() {
    dialogRef.current?.close()
    setModalError(null)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setModalError(null)
    try {
      await api.post('/users', {
        email: email.trim(),
        password,
        role,
      })
      closeModal()
      await load()
    } catch (err) {
      setModalError(apiErrorMessage(err) || 'No se pudo crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este usuario?')) return
    setPageError(null)
    try {
      await api.delete(`/users/${id}`)
      await load()
    } catch (err) {
      setPageError(apiErrorMessage(err) || 'No se pudo eliminar.')
    }
  }

  if (loading) return <p className="admin-loading">Cargando…</p>

  return (
    <section className="admin-users admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Usuarios</h1>
          <p className="muted">
            Solo administradores pueden crear o eliminar cuentas de administrador o colaborador.
          </p>
        </div>
        <button type="button" className="btn-cemaco" onClick={openModal}>
          + Agregar usuario
        </button>
      </div>

      <AdminAlert
        message={pageError}
        onDismiss={() => setPageError(null)}
        className="admin-alert--page"
      />

      {items.length === 0 ? (
        <p className="muted admin-empty-hint">No hay usuarios además del tuyo, o aún no se han creado cuentas.</p>
      ) : (
        <ul className="admin-entity-list admin-entity-list--narrow">
          {items.map((u) => (
            <li key={u.id} className="admin-entity-card admin-entity-card--simple">
              <div className="admin-entity-card__body">
                <h2 className="admin-entity-card__title">{u.email}</h2>
                <p className="admin-entity-card__meta">
                  Rol: <strong>{u.role}</strong>
                </p>
              </div>
              <div className="admin-entity-card__actions">
                <button
                  type="button"
                  className="admin-icon-btn admin-icon-btn--danger"
                  onClick={() => handleDelete(u.id)}
                  aria-label={`Eliminar ${u.email}`}
                  title="Eliminar"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dialog ref={dialogRef} className="admin-modal" onClose={() => setModalError(null)}>
        <form className="admin-modal-form product-form" onSubmit={handleCreate}>
          <div className="edit-dialog-head">
            <h2>Nuevo usuario</h2>
            <button type="button" className="btn-sm" onClick={closeModal}>
              Cerrar
            </button>
          </div>
          <AdminAlert
            message={modalError}
            onDismiss={() => setModalError(null)}
            className="admin-alert--modal"
          />
          <div className="form-grid">
            <label>
              Correo *
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </label>
            <label>
              Contraseña *
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
            <label className="span-2">
              Rol *
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Colaborador">Colaborador</option>
                <option value="Admin">Administrador</option>
              </select>
            </label>
          </div>
          <div className="edit-actions">
            <button type="button" className="btn-sm" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-cemaco btn-cemaco--compact" disabled={saving}>
              {saving ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </dialog>
    </section>
  )
}
