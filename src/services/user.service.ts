import api from './api'

// Types
export interface UpdateProfileDTO {
  name?: string
  bio?: string
  skills?: string[]
  socialLinks?: {
    github?: string
    linkedin?: string
    twitter?: string
  }
}

export interface ChangePasswordDTO {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  postComments: boolean
  issueUpdates: boolean
  chatMessages: boolean
}

export interface UserProfile {
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
  notificationPreferences?: NotificationPreferences
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface PublicProfile {
  id: string
  username: string
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
  createdAt: string
}

// User API functions
export const userService = {
  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<UserProfile> => {
    const response = await api.get<{ status: string; data: { user: UserProfile } }>(
      `/users/${userId}`
    )
    return response.data.data.user
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: string, data: UpdateProfileDTO): Promise<UserProfile> => {
    const response = await api.put<{ status: string; data: { user: UserProfile } }>(
      `/users/${userId}/profile`,
      data
    )
    return response.data.data.user
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post<{ status: string; data: { avatarUrl: string } }>(
      `/users/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      }
    )

    return response.data.data
  },

  /**
   * Get public profile
   */
  getPublicProfile: async (userId: string): Promise<PublicProfile> => {
    const response = await api.get<{ status: string; data: { user: PublicProfile } }>(
      `/users/${userId}/public`
    )
    return response.data.data.user
  },

  /**
   * Change password
   */
  changePassword: async (userId: string, data: ChangePasswordDTO): Promise<UserProfile> => {
    const response = await api.put<{ status: string; data: { user: UserProfile } }>(
      `/users/${userId}/password`,
      data
    )
    return response.data.data.user
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<UserProfile> => {
    const response = await api.patch<{ status: string; data: { user: UserProfile } }>(
      `/users/${userId}/settings/notifications`,
      preferences
    )
    return response.data.data.user
  },
}
