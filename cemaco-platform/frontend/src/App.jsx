import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLogin } from './pages/admin/Login'
import { Dashboard } from './pages/admin/Dashboard'
import { ProductsAdmin } from './pages/admin/ProductsAdmin'
import { AdminCategories } from './pages/admin/AdminCategories'
import { AdminUsers } from './pages/admin/AdminUsers'
import { ProductList } from './pages/public/ProductList'
import { ProductDetail } from './pages/public/ProductDetail'
import './App.css'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute>
              <ProductsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <ProtectedRoute>
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
