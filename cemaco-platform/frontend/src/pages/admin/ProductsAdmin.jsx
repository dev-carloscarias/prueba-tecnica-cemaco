import { useEffect, useRef, useState } from 'react'
import { FaPen, FaTrash } from 'react-icons/fa'
import { AdminAlert } from '../../components/AdminAlert'
import { api, publicAssetUrl } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

const emptyForm = () => ({
  categoryId: '',
  name: '',
  description: '',
  price: '',
  sku: '',
  inventory: '0',
  imageUrl: '',
})

function apiErrorMessage(err) {
  const status = err?.response?.status
  if (status === 415) {
    return 'La subida de imagen falló (tipo de contenido). Recarga e inténtalo de nuevo.'
  }
  const d = err?.response?.data
  if (typeof d?.message === 'string') return d.message
  if (d?.title && typeof d.title === 'string') return d.title
  if (d?.errors && typeof d === 'object') return 'Revisa los datos enviados.'
  return null
}

const PUBLIC_STOCK_MIN = 5

function isLowStockInventory(inv) {
  return Number(inv) < PUBLIC_STOCK_MIN
}

function ImagePlaceholder({ previewSrc, fileInputRef, onFileChange, inputId }) {
  return (
    <div
      className="admin-image-placeholder"
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          fileInputRef.current?.click()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="admin-image-placeholder-input"
        aria-label="Seleccionar imagen"
        onChange={onFileChange}
      />
      {previewSrc ? (
        <img src={previewSrc} alt="" className="admin-image-placeholder-img" />
      ) : (
        <div className="admin-image-placeholder-inner">
          <span className="admin-image-placeholder-icon" aria-hidden>
            +
          </span>
          <span className="admin-image-placeholder-text">Imagen del producto</span>
          <span className="admin-image-placeholder-hint">Toca para elegir archivo</span>
        </div>
      )}
    </div>
  )
}

export function ProductsAdmin() {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [createError, setCreateError] = useState(null)
  const [editError, setEditError] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(() => emptyForm())
  const [editFile, setEditFile] = useState(null)
  const [editFilePreview, setEditFilePreview] = useState(null)

  const createDialogRef = useRef(null)
  const editDialogRef = useRef(null)
  const createFileRef = useRef(null)
  const editFileRef = useRef(null)

  useEffect(() => {
    if (!file) {
      setFilePreview(null)
      return
    }
    const u = URL.createObjectURL(file)
    setFilePreview(u)
    return () => URL.revokeObjectURL(u)
  }, [file])

  useEffect(() => {
    if (!editFile) {
      setEditFilePreview(null)
      return
    }
    const u = URL.createObjectURL(editFile)
    setEditFilePreview(u)
    return () => URL.revokeObjectURL(u)
  }, [editFile])

  async function loadAll() {
    setLoading(true)
    setPageError(null)
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
      ])
      setCategories(catRes.data)
      setItems(prodRes.data)
    } catch {
      setPageError('No se pudieron cargar datos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  function openCreateModal() {
    setForm({
      ...emptyForm(),
      categoryId: categories[0]?.id || '',
    })
    setFile(null)
    setCreateError(null)
    setEditError(null)
    createDialogRef.current?.showModal()
  }

  function closeCreateModal() {
    createDialogRef.current?.close()
    setFile(null)
    setForm(emptyForm())
    setCreateError(null)
  }

  async function uploadIfNeeded(selectedFile) {
    if (!selectedFile) return null
    const body = new FormData()
    body.append('file', selectedFile)
    const { data } = await api.post('/upload/product-image', body)
    return data.url
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.categoryId) {
      setCreateError('Selecciona una categoría.')
      return
    }
    setSaving(true)
    setCreateError(null)
    try {
      let imageUrl = form.imageUrl.trim() || null
      if (file) {
        imageUrl = await uploadIfNeeded(file)
      }
      await api.post('/products', {
        categoryId: form.categoryId,
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        sku: form.sku.trim(),
        inventory: Number.parseInt(form.inventory, 10) || 0,
        imageUrl,
      })
      closeCreateModal()
      await loadAll()
    } catch (err) {
      setCreateError(apiErrorMessage(err) || 'No se pudo crear el producto.')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(p) {
    setEditing(p)
    setEditForm({
      categoryId: p.categoryId,
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      sku: p.sku,
      inventory: String(p.inventory),
      imageUrl: p.imageUrl ?? '',
    })
    setEditFile(null)
    setEditError(null)
    setCreateError(null)
    editDialogRef.current?.showModal()
  }

  function closeEdit() {
    editDialogRef.current?.close()
    setEditing(null)
    setEditFile(null)
    setEditError(null)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (!editing) return
    if (!editForm.categoryId) {
      setEditError('Selecciona una categoría.')
      return
    }
    setSaving(true)
    setEditError(null)
    try {
      let imageUrl = editForm.imageUrl.trim() || null
      if (editFile) {
        imageUrl = await uploadIfNeeded(editFile)
      }
      await api.put(`/products/${editing.id}`, {
        categoryId: editForm.categoryId,
        name: editForm.name,
        description: editForm.description || null,
        price: Number(editForm.price),
        sku: editForm.sku.trim(),
        inventory: Number.parseInt(editForm.inventory, 10) || 0,
        imageUrl,
      })
      closeEdit()
      await loadAll()
    } catch (err) {
      setEditError(apiErrorMessage(err) || 'No se pudo actualizar el producto.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) return
    if (!window.confirm('¿Eliminar este producto?')) return
    setPageError(null)
    try {
      await api.delete(`/products/${id}`)
      await loadAll()
    } catch {
      setPageError('No se pudo eliminar (solo administrador).')
    }
  }

  const createPreviewDisplay =
    filePreview ||
    (form.imageUrl.trim() ? publicAssetUrl(form.imageUrl.trim()) : null)

  const editPreviewDisplay =
    editFilePreview ||
    (editing?.imageUrl && !editFile ? publicAssetUrl(editing.imageUrl) : null)

  if (loading) return <p className="admin-loading">Cargando…</p>

  return (
    <section className="admin-products admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Gestión de productos</h1>
          <p className="muted role-hint">
            {isAdmin
              ? 'Tu rol: Administrador — puedes crear, editar y eliminar.'
              : 'Tu rol: Colaborador — puedes crear y editar; no eliminar.'}
          </p>
        </div>
        <button type="button" className="btn-cemaco" onClick={openCreateModal}>
          + Agregar producto
        </button>
      </div>

      <AdminAlert
        message={pageError}
        onDismiss={() => setPageError(null)}
        className="admin-alert--page"
      />

      {items.length === 0 ? (
        <p className="muted admin-empty-hint">Sin productos. Usa «Agregar producto» para comenzar.</p>
      ) : (
        <ul className="admin-entity-list">
          {items.map((p) => (
            <li
              key={p.id}
              className={`admin-entity-card${isLowStockInventory(p.inventory) ? ' admin-entity-card--low-stock' : ''}`}
            >
              <div className="admin-entity-card__media">
                {p.imageUrl ? (
                  <img src={publicAssetUrl(p.imageUrl)} alt="" />
                ) : (
                  <div className="admin-entity-card__placeholder" />
                )}
              </div>
              <div className="admin-entity-card__body">
                {isLowStockInventory(p.inventory) && (
                  <p className="admin-low-stock-msg" role="status">
                    Producto con inventario bajo
                  </p>
                )}
                <p className="admin-entity-card__cat">{p.categoryName}</p>
                <h2 className="admin-entity-card__title">{p.name}</h2>
                <p className="admin-entity-card__meta">
                  SKU {p.sku} · Q {Number(p.price).toFixed(2)} · Stock {p.inventory}
                </p>
              </div>
              <div className="admin-entity-card__actions">
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={() => openEdit(p)}
                  aria-label={`Editar ${p.name}`}
                  title="Editar"
                >
                  <FaPen />
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn--danger"
                    onClick={() => handleDelete(p.id)}
                    aria-label={`Eliminar ${p.name}`}
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

      <dialog
        ref={createDialogRef}
        className="admin-modal"
        onClose={() => {
          setFile(null)
          setForm(emptyForm())
          setCreateError(null)
        }}
      >
        <form className="admin-modal-form product-form" onSubmit={handleCreate}>
          <div className="edit-dialog-head">
            <h2>Nuevo producto</h2>
            <button type="button" className="btn-sm" onClick={closeCreateModal}>
              Cerrar
            </button>
          </div>
          <AdminAlert
            message={createError}
            onDismiss={() => setCreateError(null)}
            className="admin-alert--modal"
          />
          <ImagePlaceholder
            previewSrc={createPreviewDisplay}
            fileInputRef={createFileRef}
            inputId="create-product-image"
            onFileChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setForm((f) => ({ ...f, imageUrl: '' }))
            }}
          />
          <label className="span-2 admin-url-fallback">
            O pega URL de imagen externa
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => {
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
                setFile(null)
              }}
              disabled={Boolean(file)}
              placeholder="https://…"
            />
          </label>
          <div className="form-grid">
            <label className="span-2">
              Categoría *
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                required
              >
                <option value="">— Seleccionar —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nombre *
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <label>
              SKU *
              <input
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                required
              />
            </label>
            <label className="span-2">
              Descripción
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <label>
              Precio *
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
            </label>
            <label>
              Inventario *
              <input
                type="number"
                min="0"
                value={form.inventory}
                onChange={(e) => setForm((f) => ({ ...f, inventory: e.target.value }))}
                required
              />
            </label>
          </div>
          <div className="edit-actions">
            <button type="button" className="btn-sm" onClick={closeCreateModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-cemaco btn-cemaco--compact" disabled={saving}>
              {saving ? 'Guardando…' : 'Crear producto'}
            </button>
          </div>
        </form>
      </dialog>

      <dialog
        ref={editDialogRef}
        className="admin-modal"
        onClose={() => {
          setEditing(null)
          setEditFile(null)
          setEditError(null)
        }}
      >
        {editing && (
          <form className="admin-modal-form product-form" onSubmit={handleUpdate}>
            <div className="edit-dialog-head">
              <h2>Editar producto</h2>
              <button type="button" className="btn-sm" onClick={closeEdit}>
                Cerrar
              </button>
            </div>
            <AdminAlert
              message={editError}
              onDismiss={() => setEditError(null)}
              className="admin-alert--modal"
            />
            <ImagePlaceholder
              previewSrc={editPreviewDisplay}
              fileInputRef={editFileRef}
              inputId="edit-product-image"
              onFileChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
            />
            <label className="span-2 admin-url-fallback">
              O URL de imagen externa
              <input
                type="url"
                value={editForm.imageUrl}
                onChange={(e) => {
                  setEditForm((f) => ({ ...f, imageUrl: e.target.value }))
                  setEditFile(null)
                }}
                disabled={Boolean(editFile)}
                placeholder="https://…"
              />
            </label>
            <div className="form-grid">
              <label className="span-2">
                Categoría *
                <select
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm((f) => ({ ...f, categoryId: e.target.value }))}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nombre *
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                SKU *
                <input
                  value={editForm.sku}
                  onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))}
                  required
                />
              </label>
              <label className="span-2">
                Descripción
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label>
                Precio *
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </label>
              <label>
                Inventario *
                <input
                  type="number"
                  min="0"
                  value={editForm.inventory}
                  onChange={(e) => setEditForm((f) => ({ ...f, inventory: e.target.value }))}
                  required
                />
              </label>
            </div>
            <div className="edit-actions">
              <button type="button" className="btn-sm" onClick={closeEdit}>
                Cancelar
              </button>
              <button type="submit" className="btn-cemaco btn-cemaco--compact" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </section>
  )
}
