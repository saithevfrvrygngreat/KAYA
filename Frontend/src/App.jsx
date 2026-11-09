import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import CustomizeIndexPage from './pages/CustomizeIndexPage'
import CustomizePage from './pages/CustomizePage'
import DesignPreviewPage from './pages/DesignPreviewPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import AIDesignerPage from './pages/AIDesignerPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

export default function App() {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customize" element={<CustomizeIndexPage />} />
        <Route path="/products/:id/customize" element={<CustomizePage />} />
        <Route path="/designs/:id/preview" element={<DesignPreviewPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<LoginPage initialForgot={true} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ai-designer" element={<AIDesignerPage />} />
        <Route path="/orders/:id" element={<OrderConfirmationPage />} />
        <Route path="/orders/confirmation" element={<OrderConfirmationPage />} />
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

