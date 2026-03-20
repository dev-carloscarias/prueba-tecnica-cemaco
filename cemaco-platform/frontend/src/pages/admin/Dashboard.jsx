import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ICON_PRODUCTS =
  'https://cdn-icons-png.flaticon.com/512/3788/3788182.png'
const ICON_CATEGORIES =
  'https://cdn-icons-png.flaticon.com/512/6724/6724239.png'
const ICON_USERS =
  'https://cdn-icons-png.flaticon.com/512/9131/9131531.png'

export function Dashboard() {
  const { isAdmin } = useAuth()

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Panel de gestión</h1>
        <p className="muted">Administra el catálogo y la configuración desde un solo lugar.</p>
      </div>
      <div className="admin-dashboard-grid">
        <Link to="/admin/productos" className="admin-dash-card">
          <img src={ICON_PRODUCTS} alt="" className="admin-dash-card__icon" width={72} height={72} />
          <span className="admin-dash-card__title">Productos</span>
          <span className="admin-dash-card__desc">Crear, editar y dar de baja artículos del catálogo.</span>
        </Link>
        <Link to="/admin/categorias" className="admin-dash-card">
          <img src={ICON_CATEGORIES} alt="" className="admin-dash-card__icon" width={72} height={72} />
          <span className="admin-dash-card__title">Categorías</span>
          <span className="admin-dash-card__desc">Organizar productos por familia y orden de visualización.</span>
        </Link>
        {isAdmin && (
          <Link to="/admin/usuarios" className="admin-dash-card">
            <img src={ICON_USERS} alt="" className="admin-dash-card__icon" width={72} height={72} />
            <span className="admin-dash-card__title">Usuarios</span>
            <span className="admin-dash-card__desc">Gestionar cuentas de administrador y colaborador.</span>
          </Link>
        )}
      </div>
    </section>
  )
}
