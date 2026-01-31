import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService, UpdateProfileDTO } from '@/services/user.service'
import { useAuthStore } from '@/stores/authStore'

/**
 * Hook to get user profile by ID
 */
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  })
}

/**
 * Hook to get public profile by ID
 */
export const usePublicProfile = (userId: string) => {
  return useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => userService.getPublicProfile(userId),
    enabled: !!userId,
  })
}

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: UpdateProfileDTO) => {
      if (!user) throw new Error('User not authenticated')
      return userService.updateProfile(user._id || user.id, data)
    },
    onSuccess: (updatedUser) => {
      // Update auth store
      updateUser(updatedUser)

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

/**
 * Hook to upload avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuthStore()

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => {
      if (!user) throw new Error('User not authenticated')
      return userService.uploadAvatar(user._id || user.id, file, onProgress)
    },
    onSuccess: (data) => {
      if (!user) return

      // Update auth store with new avatar URL
      updateUser({
        profile: {
          ...user.profile,
          avatar: data.avatarUrl,
        },
      })

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['user', user._id || user.id] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}
