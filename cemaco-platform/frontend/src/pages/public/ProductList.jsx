import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { api, publicAssetUrl } from '../../services/api'

function formatGtq(value) {
  const n = Number(value)
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function monthlyFromPrice(price) {
  const m = Number(price) / 12
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(m)
}

function isNewProduct(createdAtUtc) {
  const t = new Date(createdAtUtc).getTime()
  if (Number.isNaN(t)) return false
  return Date.now() - t < 30 * 24 * 60 * 60 * 1000
}

const swatchPlaceholders = ['#1a1a1a', '#6b7280', '#d1d5db']

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('categoryId')
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const carouselRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    api
      .get('/categories')
      .then(({ data }) => {
        if (!cancelled) setCategories(data || [])
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setItems([])
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await api.get('/catalog/products', {
          params: categoryId ? { categoryId } : {},
        })
        if (!cancelled) setItems(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar el catálogo.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [categoryId])

  const setCategoryFilter = (id) => {
    if (!id) {
      setSearchParams({})
    } else {
      setSearchParams({ categoryId: String(id) })
    }
  }

  const scrollCarousel = (dir) => {
    const el = carouselRef.current
    if (!el) return
    const delta = Math.min(420, el.clientWidth * 0.85)
    el.scrollBy({ left: dir * delta, behavior: 'smooth' })
  }

  if (loading && !error) {
    return (
      <section className="catalog-explore">
        <p className="catalog-loading">Cargando catálogo…</p>
      </section>
    )
  }
  if (error) return <p className="error">{error}</p>

  return (
    <section className="catalog-explore" aria-labelledby="catalog-heading">
      <h1 id="catalog-heading" className="catalog-explore-title">
        Explora el catálogo
      </h1>

      <div className="catalog-pills" role="tablist" aria-label="Filtrar por categoría">
        <button
          type="button"
          role="tab"
          aria-selected={!categoryId}
          className={`catalog-pill${!categoryId ? ' catalog-pill--active' : ''}`}
          onClick={() => setCategoryFilter(null)}
        >
          Todos los productos
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={categoryId === c.id}
            className={`catalog-pill${categoryId === c.id ? ' catalog-pill--active' : ''}`}
            onClick={() => setCategoryFilter(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="catalog-empty">
          {categoryId
            ? 'No hay productos en esta categoría.'
            : 'No hay productos todavía.'}
        </p>
      ) : (
        <div className="catalog-carousel-wrap">
          <div className="catalog-carousel-controls" aria-hidden="true">
            <button
              type="button"
              className="catalog-carousel-btn"
              onClick={() => scrollCarousel(-1)}
              aria-label="Anterior"
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              className="catalog-carousel-btn"
              onClick={() => scrollCarousel(1)}
              aria-label="Siguiente"
            >
              <FaChevronRight />
            </button>
          </div>
          <ul ref={carouselRef} className="catalog-carousel">
            {items.map((p) => {
              const nuevo = isNewProduct(p.createdAtUtc)
              return (
                <li key={p.id} className="catalog-card">
                  <div className="catalog-card-media">
                    {p.imageUrl ? (
                      <img
                        src={publicAssetUrl(p.imageUrl)}
                        alt=""
                        className="catalog-card-img"
                      />
                    ) : (
                      <div className="catalog-card-img catalog-card-img--placeholder" />
                    )}
                  </div>
                  <div className="catalog-card-swatches" aria-hidden="true">
                    {swatchPlaceholders.map((color) => (
                      <span
                        key={color}
                        className="catalog-swatch"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                  {nuevo && <p className="catalog-badge-nuevo">Nuevo</p>}
                  <h2 className="catalog-card-name">{p.name}</h2>
                  <p className="catalog-card-desc">
                    {p.description?.trim() || 'Ideal para tu hogar y tu día a día.'}
                  </p>
                  <p className="catalog-card-price">
                    Desde <span className="catalog-price-num">Q {formatGtq(p.price)}</span>
                    <span className="catalog-price-mo"> o Q {monthlyFromPrice(p.price)}/mes</span>
                  </p>
                  <p className="catalog-card-fin">a 12 meses.**</p>
                  <div className="catalog-card-actions">
                    <Link to={`/product/${p.id}`} className="catalog-btn-primary">
                      Más información
                    </Link>
                    <Link to={`/product/${p.id}`} className="catalog-btn-secondary">
                      Comprar <span aria-hidden>›</span>
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
