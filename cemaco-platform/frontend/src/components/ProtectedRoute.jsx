import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children, requireAdmin }) {
  const { isAuthenticated, isStaff, isAdmin } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  if (!isStaff) {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return children
}
