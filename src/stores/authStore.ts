import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  _id?: string // Optional alias for id (for compatibility)
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
  notificationPreferences?: {
    email?: boolean
    push?: boolean
    postComments?: boolean
    issueUpdates?: boolean
    chatMessages?: boolean
  }
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        // Store tokens in localStorage for API interceptor
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        // Ensure _id is set (alias for id)
        const userWithId = { ...user, _id: user.id }

        set({
          user: userWithId,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
