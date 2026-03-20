import { useEffect, useRef, useState } from 'react'
import { FaPen, FaTrash } from 'react-icons/fa'
import { AdminAlert } from '../../components/AdminAlert'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function apiErrorMessage(err) {
  const d = err?.response?.data
  if (typeof d?.message === 'string') return d.message
  return null
}

export function AdminCategories() {
  const { isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [createError, setCreateError] = useState(null)
  const [editError, setEditError] = useState(null)
  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  const [editOrder, setEditOrder] = useState('0')

  const createDialogRef = useRef(null)
  const editDialogRef = useRef(null)

  async function load() {
    setLoading(true)
    setPageError(null)
    try {
      const { data } = await api.get('/categories')
      setItems(data)
    } catch {
      setPageError('No se pudieron cargar las categorías.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreateModal() {
    setName('')
    setSortOrder('0')
    setCreateError(null)
    setEditError(null)
    createDialogRef.current?.showModal()
  }

  function closeCreateModal() {
    createDialogRef.current?.close()
    setCreateError(null)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setCreateError(null)
    try {
      await api.post('/categories', {
        name: name.trim(),
        sortOrder: Number.parseInt(sortOrder, 10) || 0,
      })
      closeCreateModal()
      await load()
    } catch (err) {
      setCreateError(apiErrorMessage(err) || 'No se pudo crear.')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(p) {
    setEditing(p)
    setEditName(p.name)
    setEditOrder(String(p.sortOrder))
    setEditError(null)
    setCreateError(null)
    editDialogRef.current?.showModal()
  }

  function closeEdit() {
    editDialogRef.current?.close()
    setEditing(null)
    setEditError(null)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    setEditError(null)
    try {
      await api.put(`/categories/${editing.id}`, {
        name: editName.trim(),
        sortOrder: Number.parseInt(editOrder, 10) || 0,
      })
      closeEdit()
      await load()
    } catch (err) {
      setEditError(apiErrorMessage(err) || 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) return
    if (!window.confirm('¿Eliminar esta categoría?')) return
    setPageError(null)
    try {
      await api.delete(`/categories/${id}`)
      await load()
    } catch (err) {
      setPageError(apiErrorMessage(err) || 'No se pudo eliminar.')
    }
  }

  if (loading) return <p className="admin-loading">Cargando…</p>

  return (
    <section className="admin-categories admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Categorías</h1>
          <p className="muted role-hint">
            {isAdmin
              ? 'Puedes crear, editar y eliminar categorías.'
              : 'Puedes crear y editar; solo un administrador elimina categorías con inventario vacío.'}
          </p>
        </div>
        <button type="button" className="btn-cemaco" onClick={openCreateModal}>
          + Agregar categoría
        </button>
      </div>

      <AdminAlert
        message={pageError}
        onDismiss={() => setPageError(null)}
        className="admin-alert--page"
      />

      {items.length === 0 ? (
        <p className="muted admin-empty-hint">Sin categorías. Crea la primera con el botón de arriba.</p>
      ) : (
        <ul className="admin-entity-list admin-entity-list--narrow">
          {items.map((c) => (
            <li key={c.id} className="admin-entity-card admin-entity-card--simple">
              <div className="admin-entity-card__body">
                <p className="admin-entity-card__cat">Orden {c.sortOrder}</p>
                <h2 className="admin-entity-card__title">{c.name}</h2>
              </div>
              <div className="admin-entity-card__actions">
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={() => openEdit(c)}
                  aria-label={`Editar ${c.name}`}
                  title="Editar"
                >
                  <FaPen />
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn--danger"
                    onClick={() => handleDelete(c.id)}
                    aria-label={`Eliminar ${c.name}`}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <dialog ref={createDialogRef} className="admin-modal" onClose={() => setCreateError(null)}>
        <form className="admin-modal-form product-form" onSubmit={handleCreate}>
          <div className="edit-dialog-head">
            <h2>Nueva categoría</h2>
            <button type="button" className="btn-sm" onClick={closeCreateModal}>
              Cerrar
            </button>
          </div>
          <AdminAlert
            message={createError}
            onDismiss={() => setCreateError(null)}
            className="admin-alert--modal"
          />
          <div className="form-grid">
            <label>
              Nombre *
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Orden
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </label>
          </div>
          <div className="edit-actions">
            <button type="button" className="btn-sm" onClick={closeCreateModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-cemaco btn-cemaco--compact" disabled={saving}>
              {saving ? 'Guardando…' : 'Crear'}
            </button>
          </div>
        </form>
      </dialog>

      <dialog
        ref={editDialogRef}
        className="admin-modal"
        onClose={() => {
          setEditing(null)
          setEditError(null)
        }}
      >
        {editing && (
          <form className="admin-modal-form product-form" onSubmit={handleUpdate}>
            <div className="edit-dialog-head">
              <h2>Editar categoría</h2>
              <button type="button" className="btn-sm" onClick={closeEdit}>
                Cerrar
              </button>
            </div>
            <AdminAlert
              message={editError}
              onDismiss={() => setEditError(null)}
              className="admin-alert--modal"
            />
            <div className="form-grid">
              <label>
                Nombre *
                <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </label>
              <label>
                Orden
                <input type="number" value={editOrder} onChange={(e) => setEditOrder(e.target.value)} />
              </label>
            </div>
            <div className="edit-actions">
              <button type="button" className="btn-sm" onClick={closeEdit}>
                Cancelar
              </button>
              <button type="submit" className="btn-cemaco btn-cemaco--compact" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </section>
  )
}
