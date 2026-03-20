import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaStore, FaTruck } from 'react-icons/fa'
import { api, publicAssetUrl } from '../../services/api'

function formatGtq(value) {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

function isNewProduct(createdAtUtc) {
  const t = new Date(createdAtUtc).getTime()
  if (Number.isNaN(t)) return false
  return Date.now() - t < 30 * 24 * 60 * 60 * 1000
}

const colorOptions = [
  { id: 'c1', label: 'Grafito', hex: '#2d2d2d' },
  { id: 'c2', label: 'Plata', hex: '#c4c4c4' },
  { id: 'c3', label: 'Azul', hex: '#001a72' },
]

export function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qty, setQty] = useState(1)
  const [activeThumb, setActiveThumb] = useState(0)
  const [colorId, setColorId] = useState(colorOptions[0].id)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/catalog/products/${id}`)
        if (!cancelled) {
          setProduct(data)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setError('No se encontró el producto.')
          setProduct(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <section className="product-detail">
        <p className="catalog-loading">Cargando producto…</p>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="product-detail">
        <p className="error">{error || 'Producto no disponible.'}</p>
        <Link to="/" className="product-detail-back">
          Volver al catálogo
        </Link>
      </section>
    )
  }

  const mainSrc = product.imageUrl ? publicAssetUrl(product.imageUrl) : ''
  const thumbs = mainSrc ? [mainSrc, mainSrc, mainSrc] : []
  const selectedColor = colorOptions.find((c) => c.id === colorId) || colorOptions[0]
  const nuevo = isNewProduct(product.createdAtUtc)
  const monthly = Number(product.price) / 48

  return (
    <article className="product-detail">
      <nav className="product-detail-breadcrumb" aria-label="Migas de pan">
        <Link to="/">Inicio</Link>
        <span aria-hidden> / </span>
        <span>{product.categoryName}</span>
        <span aria-hidden> / </span>
        <span className="product-detail-breadcrumb-current">{product.name}</span>
      </nav>

      <div className="product-detail-grid">
        <div className="product-detail-gallery">
          <div className="product-detail-hero">
            {mainSrc ? (
              <img src={thumbs[activeThumb] ?? mainSrc} alt="" />
            ) : (
              <div className="product-detail-hero product-detail-hero--empty" />
            )}
          </div>
          {thumbs.length > 0 && (
            <ul className="product-detail-thumbs">
              {thumbs.map((src, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={`product-detail-thumb${activeThumb === i ? ' is-active' : ''}`}
                    onClick={() => setActiveThumb(i)}
                    aria-label={`Vista ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="product-detail-info">
          {nuevo && <p className="product-detail-badge">Nuevo</p>}
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-meta">
            <span>SKU {product.sku}</span>
            <span className="product-detail-meta-sep">·</span>
            <span>Código de barras {product.sku}</span>
          </p>

          <p className="product-detail-price">Q {formatGtq(product.price)}</p>
          <p className="product-detail-price-note">
            Impuestos incluidos. El envío se calcula al finalizar la compra.
          </p>
          <p className="product-detail-finance">
            Q {formatGtq(monthly)} a 48 meses.{' '}
            <a href="#top" className="product-detail-link">
              Acerca del financiamiento ›
            </a>
          </p>

          <div className="product-detail-field">
            <p className="product-detail-label">
              Color — {selectedColor.label}
            </p>
            <div className="product-detail-colors" role="list">
              {colorOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="listitem"
                  className={`product-detail-color${colorId === c.id ? ' is-selected' : ''}`}
                  style={{ background: c.hex }}
                  title={c.label}
                  onClick={() => setColorId(c.id)}
                  aria-label={c.label}
                  aria-pressed={colorId === c.id}
                />
              ))}
            </div>
          </div>

          <div className="product-detail-field">
            <p className="product-detail-label">Modelo</p>
            <div className="product-detail-options">
              <button type="button" className="product-detail-option is-selected">
                Estándar
              </button>
            </div>
          </div>

          <div className="product-detail-field">
            <p className="product-detail-label">Disponibilidad</p>
            <div className="product-detail-options">
              <button type="button" className="product-detail-option is-selected">
                {product.inventory > 0 ? 'En stock' : 'Agotado'}
              </button>
            </div>
          </div>

          {product.description && (
            <p className="product-detail-description">{product.description}</p>
          )}

          <div className="product-detail-qty-row">
            <span className="product-detail-label">Cantidad</span>
            <div className="product-detail-qty">
              <button
                type="button"
                aria-label="Disminuir"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                aria-label="Aumentar"
                onClick={() => setQty((q) => Math.min(Math.max(1, product.inventory), q + 1))}
                disabled={product.inventory <= 0}
              >
                +
              </button>
            </div>
          </div>

          <div className="product-detail-fulfill">
            <p className="product-detail-label">Consíguelo rápido</p>
            <div className="product-detail-fulfill-grid">
              <div className="product-detail-fulfill-item">
                <FaStore aria-hidden />
                <div>
                  <strong>Recogida</strong>
                  <span>Disponible en tiendas participantes</span>
                </div>
              </div>
              <div className="product-detail-fulfill-item">
                <FaTruck aria-hidden />
                <div>
                  <strong>Envío a domicilio</strong>
                  <span>Según zona de entrega</span>
                </div>
              </div>
            </div>
          </div>

          <div className="product-detail-cta">
            <button
              type="button"
              className="product-detail-add"
              disabled={product.inventory <= 0}
            >
              Agregar al carrito
            </button>
            <Link to="/" className="product-detail-back">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
