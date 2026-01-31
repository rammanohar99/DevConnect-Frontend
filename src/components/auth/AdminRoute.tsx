import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * Protected route component that only allows admin users
 */
export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
