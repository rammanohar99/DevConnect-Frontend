import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as adminService from '../services/admin.service'
import { GetUserListParams, UpdateUserRoleData, HideContentData } from '../services/admin.service'

/**
 * Hook to fetch paginated user list with filters
 */
export const useAdminUsers = (params: GetUserListParams = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getUserList(params),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to update user role
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRoleData }) =>
      adminService.updateUserRole(userId, data),
    onSuccess: () => {
      // Invalidate user list queries to refetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

/**
 * Hook to hide/archive a post
 */
export const useHidePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data?: HideContentData }) =>
      adminService.hidePost(postId, data),
    onSuccess: () => {
      // Invalidate post queries
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}

/**
 * Hook to delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data?: HideContentData }) =>
      adminService.deleteComment(commentId, data),
    onSuccess: () => {
      // Invalidate post and comment queries
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}

/**
 * Hook to fetch system metrics
 */
export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: adminService.getSystemMetrics,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
  })
}

/**
 * Hook to fetch audit logs
 */
export const useAuditLogs = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs', page, limit],
    queryFn: () => adminService.getAuditLogs(page, limit),
    staleTime: 30000, // 30 seconds
  })
}
