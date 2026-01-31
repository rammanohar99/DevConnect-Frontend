import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'user' | 'moderator' | 'admin'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Store intended path for redirect after login
    if (!isAuthenticated) {
      sessionStorage.setItem('intendedPath', location.pathname)
    }
  }, [isAuthenticated, location])

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (requiredRole && user) {
    const roleHierarchy = { user: 0, moderator: 1, admin: 2 }
    const userRoleLevel = roleHierarchy[user.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p>You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
