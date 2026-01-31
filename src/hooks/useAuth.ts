import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService, RegisterDTO, LoginDTO, tokenStorage } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterDTO) => authService.register(data),
    onSuccess: (response) => {
      // Store auth data
      setAuth(response.user, response.accessToken, response.refreshToken)

      // Navigate to home
      navigate('/')
    },
  })
}

/**
 * Hook for user login
 */
export const useLogin = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (credentials: LoginDTO) => authService.login(credentials),
    onSuccess: (response) => {
      // Store auth data
      setAuth(response.user, response.accessToken, response.refreshToken)

      // Navigate to intended page or home
      const intendedPath = sessionStorage.getItem('intendedPath') || '/'
      sessionStorage.removeItem('intendedPath')
      navigate(intendedPath)
    },
  })
}

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clearAuth } = useAuthStore()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear auth state
      clearAuth()

      // Clear all queries
      queryClient.clear()

      // Navigate to home
      navigate('/')
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      clearAuth()
      queryClient.clear()
      navigate('/')
    },
  })
}

/**
 * Hook to get current user data
 * Automatically fetches user on mount if authenticated
 */
export const useCurrentUser = () => {
  const { isAuthenticated, user, setAuth, clearAuth } = useAuthStore()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const accessToken = tokenStorage.getAccessToken()
      const refreshToken = tokenStorage.getRefreshToken()

      if (!accessToken || !refreshToken) {
        clearAuth()
        throw new Error('No tokens found')
      }

      try {
        const userData = await authService.getCurrentUser()

        // Update store with fresh user data
        setAuth(userData, accessToken, refreshToken)

        return userData
      } catch (error) {
        // If fetching user fails, clear auth
        clearAuth()
        throw error
      }
    },
    enabled: isAuthenticated && !!user,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to initialize auth on app load
 * Checks for stored tokens and fetches user data
 */
export const useInitializeAuth = () => {
  const { setAuth, clearAuth } = useAuthStore()

  return useQuery({
    queryKey: ['initializeAuth'],
    queryFn: async () => {
      const accessToken = tokenStorage.getAccessToken()
      const refreshToken = tokenStorage.getRefreshToken()

      if (!accessToken || !refreshToken) {
        clearAuth()
        return null
      }

      try {
        const userData = await authService.getCurrentUser()
        setAuth(userData, accessToken, refreshToken)
        return userData
      } catch (error) {
        // If token is invalid, try to refresh
        try {
          const tokenResponse = await authService.refreshToken(refreshToken)
          tokenStorage.setTokens(
            tokenResponse.accessToken,
            tokenResponse.refreshToken || refreshToken
          )

          const userData = await authService.getCurrentUser()
          setAuth(userData, tokenResponse.accessToken, tokenResponse.refreshToken || refreshToken)
          return userData
        } catch (refreshError) {
          // Refresh failed, clear auth
          clearAuth()
          return null
        }
      }
    },
    retry: false,
    staleTime: Infinity, // Only run once on mount
  })
}

/**
 * Main auth hook that provides all auth functionality
 */
export const useAuth = () => {
  const { user, isAuthenticated } = useAuthStore()
  const login = useLogin()
  const register = useRegister()
  const logout = useLogout()

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    isLoading: login.isPending || register.isPending || logout.isPending,
  }
}
