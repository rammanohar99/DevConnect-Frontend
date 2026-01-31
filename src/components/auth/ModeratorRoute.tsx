import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface ModeratorRouteProps {
  children: React.ReactNode
}

/**
 * Protected route component that allows moderators and admins
 */
export const ModeratorRoute = ({ children }: ModeratorRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'moderator' && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
