import api from './api'

// Types
export interface RegisterDTO {
  email: string
  username: string
  password: string
  name: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    username: string
    role: 'user' | 'moderator' | 'admin'
    profile: {
      name: string
      bio?: string
      avatar?: string
      skills: string[]
      socialLinks?: {
        github?: string
        linkedin?: string
        twitter?: string
      }
    }
    isEmailVerified: boolean
    createdAt: string
    updatedAt: string
  }
  accessToken: string
  refreshToken: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken?: string
}

// Token storage utilities
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken')
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken')
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  },

  clearTokens: (): void => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}

// Auth API functions
export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await api.post<{ status: string; data: AuthResponse }>('/auth/register', data)
    return response.data.data
  },

  /**
   * Login with email and password
   */
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const response = await api.post<{ status: string; data: AuthResponse }>(
      '/auth/login',
      credentials
    )
    return response.data.data
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await api.post<{ status: string; data: TokenResponse }>('/auth/refresh', {
      refreshToken,
    })
    return response.data.data
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await api.get<{ status: string; data: { user: AuthResponse['user'] } }>(
      '/auth/me'
    )
    return response.data.data.user
  },
}
