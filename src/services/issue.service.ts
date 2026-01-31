import api from './api'
import { Comment } from './post.service'

// Types
export interface Issue {
  _id: string
  creator: {
    _id: string
    username: string
    profile: {
      name: string
      avatar?: string
    }
  }
  title: string
  description: string
  status: 'open' | 'in-progress' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  labels: string[]
  assignees: Array<{
    _id: string
    username: string
    profile: {
      name: string
      avatar?: string
    }
  }>
  commentCount: number
  createdAt: string
  updatedAt: string
  closedAt?: string
}

export interface CreateIssueDTO {
  title: string
  description: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  labels?: string[]
}

export interface UpdateIssueDTO {
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export interface IssueFilters {
  status?: 'open' | 'in-progress' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  labels?: string[]
  assignee?: string
  creator?: string
}

export interface Pagination {
  page: number
  limit: number
}

export interface PaginatedIssues {
  issues: Issue[]
  total: number
  page: number
  totalPages: number
}

// Issue API functions
export const issueService = {
  /**
   * Create a new issue
   */
  createIssue: async (data: CreateIssueDTO): Promise<Issue> => {
    const response = await api.post<{ status: string; data: { issue: Issue } }>('/issues', data)
    return response.data.data.issue
  },

  /**
   * Get a single issue by ID
   */
  getIssue: async (issueId: string): Promise<Issue> => {
    const response = await api.get<{ status: string; data: { issue: Issue } }>(`/issues/${issueId}`)
    return response.data.data.issue
  },

  /**
   * List issues with pagination and filters
   */
  listIssues: async (filters?: IssueFilters, pagination?: Pagination): Promise<PaginatedIssues> => {
    const params = {
      ...filters,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
    }
    const response = await api.get<{ status: string; data: PaginatedIssues }>('/issues', { params })
    return response.data.data
  },

  /**
   * Update issue status
   */
  updateIssueStatus: async (issueId: string, status: Issue['status']): Promise<Issue> => {
    const response = await api.patch<{ status: string; data: { issue: Issue } }>(
      `/issues/${issueId}/status`,
      { status }
    )
    return response.data.data.issue
  },

  /**
   * Update issue details
   */
  updateIssue: async (issueId: string, data: UpdateIssueDTO): Promise<Issue> => {
    const response = await api.patch<{ status: string; data: { issue: Issue } }>(
      `/issues/${issueId}`,
      data
    )
    return response.data.data.issue
  },

  /**
   * Assign issue to a user
   */
  assignIssue: async (issueId: string, userId: string): Promise<Issue> => {
    const response = await api.post<{ status: string; data: { issue: Issue } }>(
      `/issues/${issueId}/assign`,
      { userId }
    )
    return response.data.data.issue
  },

  /**
   * Unassign issue from a user
   */
  unassignIssue: async (issueId: string, userId: string): Promise<Issue> => {
    const response = await api.delete<{ status: string; data: { issue: Issue } }>(
      `/issues/${issueId}/assign/${userId}`
    )
    return response.data.data.issue
  },

  /**
   * Add label to issue
   */
  addLabel: async (issueId: string, label: string): Promise<Issue> => {
    const response = await api.post<{ status: string; data: { issue: Issue } }>(
      `/issues/${issueId}/labels`,
      { label }
    )
    return response.data.data.issue
  },

  /**
   * Remove label from issue
   */
  removeLabel: async (issueId: string, label: string): Promise<Issue> => {
    const response = await api.delete<{ status: string; data: { issue: Issue } }>(
      `/issues/${issueId}/labels/${label}`
    )
    return response.data.data.issue
  },

  /**
   * Add a comment to an issue
   */
  addComment: async (issueId: string, content: string): Promise<Comment> => {
    const response = await api.post<{ status: string; data: { comment: Comment } }>(
      `/issues/${issueId}/comments`,
      { content }
    )
    return response.data.data.comment
  },

  /**
   * Get comments for an issue
   */
  getComments: async (issueId: string): Promise<Comment[]> => {
    const response = await api.get<{ status: string; data: { comments: Comment[] } }>(
      `/issues/${issueId}/comments`
    )
    return response.data.data.comments
  },
}
