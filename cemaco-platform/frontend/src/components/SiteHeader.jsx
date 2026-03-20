import { Link } from 'react-router-dom'
import { FaBars, FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth'

const LOGO_URL = 'https://cemacogt.vtexassets.com/arquivos/CemacoLogo.png'

export function SiteHeader() {
  const { isStaff, isAdmin, logout } = useAuth()

  return (
    <header className="site-header">
      <div className="announcement-bar">
        <div className="announcement-inner">
          <p className="announcement-title">Envío gratis a todo el país.</p>
          <button type="button" className="announcement-link">
            Ver restricciones
          </button>
        </div>
      </div>

      <div className="main-nav-bar">
        <div className="main-nav-inner">
          <button type="button" className="icon-btn main-nav-menu" aria-label="Menú">
            <FaBars />
          </button>
          <Link to="/" className="main-nav-logo-link">
            <img src={LOGO_URL} alt="Cemaco" className="main-nav-logo" />
          </Link>
          <div className="main-nav-actions">
            {isStaff && (
              <nav className="staff-nav" aria-label="Gestión">
                <Link to="/admin">Panel</Link>
                <Link to="/admin/productos">Productos</Link>
                <Link to="/admin/categorias">Categorías</Link>
                {isAdmin && <Link to="/admin/usuarios">Usuarios</Link>}
                <button type="button" className="link-btn staff-logout" onClick={() => logout()}>
                  Salir
                </button>
              </nav>
            )}
            <Link to={isStaff ? '/admin' : '/admin/login'} className="main-nav-login">
              <FaUser aria-hidden />
              <span>{isStaff ? 'Mi cuenta' : 'Iniciar sesión'}</span>
            </Link>
            <button type="button" className="icon-btn cart-btn" aria-label="Carrito">
              <FaShoppingCart />
            </button>
          </div>
        </div>
        <div className="search-wrap">
          <form
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <input type="search" className="search-input" placeholder="Buscar" aria-label="Buscar" />
            <button type="submit" className="search-submit" aria-label="Buscar">
              <FaSearch />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
