import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EXCLUSIVE_ADMIN_EMAIL = 'nandinigottipati2004@gmail.com'

export default function AdminRoute() {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin || user.email?.toLowerCase().trim() !== EXCLUSIVE_ADMIN_EMAIL) return <Navigate to="/" replace />
  return <Outlet />
}

