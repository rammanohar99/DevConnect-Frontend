import api from './api'

export interface User {
  _id: string
  email: string
  username: string
  role: 'user' | 'moderator' | 'admin'
  profile: {
    name: string
    bio?: string
    avatar?: string
    skills: string[]
  }
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface GetUserListParams {
  page?: number
  limit?: number
  role?: 'user' | 'moderator' | 'admin'
  search?: string
}

export interface PaginatedUsers {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateUserRoleData {
  role: 'user' | 'moderator' | 'admin'
}

export interface HideContentData {
  reason?: string
}

export interface SystemMetrics {
  userCount: number
  postCount: number
  activeUsers: number
  issueCount: number
  commentCount: number
  timestamp: string
}

export interface AuditLogEntry {
  _id: string
  adminId: {
    _id: string
    username: string
    email: string
  }
  action: string
  targetType: 'user' | 'post' | 'comment' | 'issue'
  targetId: string
  details: Record<string, any>
  timestamp: string
}

export interface PaginatedAuditLogs {
  logs: AuditLogEntry[]
  total: number
  page: number
  totalPages: number
}

/**
 * Get paginated list of users with optional filters
 */
export const getUserList = async (params: GetUserListParams = {}): Promise<PaginatedUsers> => {
  const response = await api.get<{ status: string; data: PaginatedUsers }>('/admin/users', {
    params,
  })
  return response.data.data
}

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, data: UpdateUserRoleData): Promise<User> => {
  const response = await api.patch<{ status: string; data: { user: User } }>(
    `/admin/users/${userId}/role`,
    data
  )
  return response.data.data.user
}

/**
 * Hide/archive a post
 */
export const hidePost = async (postId: string, data: HideContentData = {}): Promise<void> => {
  await api.delete(`/admin/posts/${postId}`, { data })
}

/**
 * Delete a comment
 */
export const deleteComment = async (
  commentId: string,
  data: HideContentData = {}
): Promise<void> => {
  await api.delete(`/admin/comments/${commentId}`, { data })
}

/**
 * Get system metrics
 */
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const response = await api.get<{ status: string; data: { metrics: SystemMetrics } }>(
    '/admin/metrics'
  )
  return response.data.data.metrics
}

/**
 * Get audit logs with pagination
 */
export const getAuditLogs = async (
  page: number = 1,
  limit: number = 50
): Promise<PaginatedAuditLogs> => {
  const response = await api.get<{ status: string; data: PaginatedAuditLogs }>(
    '/admin/audit-logs',
    {
      params: { page, limit },
    }
  )
  return response.data.data
}
