import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
} from '@tanstack/react-query'
import {
  issueService,
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  Pagination,
} from '../services/issue.service'

// Query keys
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filters?: IssueFilters) => [...issueKeys.lists(), filters] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (id: string) => [...issueKeys.details(), id] as const,
  comments: (issueId: string) => [...issueKeys.all, 'comments', issueId] as const,
}

/**
 * Hook to fetch a single issue
 */
export const useIssue = (issueId: string, options?: UseQueryOptions<Issue>) => {
  return useQuery({
    queryKey: issueKeys.detail(issueId),
    queryFn: () => issueService.getIssue(issueId),
    ...options,
  })
}

/**
 * Hook to fetch issues with pagination
 */
export const useIssues = (filters?: IssueFilters, pagination?: Pagination) => {
  return useQuery({
    queryKey: issueKeys.list(filters),
    queryFn: () => issueService.listIssues(filters, pagination),
  })
}

/**
 * Hook to fetch issues with infinite scroll
 */
export const useInfiniteIssues = (filters?: IssueFilters, limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: issueKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => issueService.listIssues(filters, { page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })
}

/**
 * Hook to create a new issue
 */
export const useCreateIssue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateIssueDTO) => issueService.createIssue(data),
    onSuccess: () => {
      // Invalidate issues list to refetch
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
    },
  })
}

/**
 * Hook to update issue status
 */
export const useUpdateIssueStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, status }: { issueId: string; status: Issue['status'] }) =>
      issueService.updateIssueStatus(issueId, status),
    onMutate: async ({ issueId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: issueKeys.detail(issueId) })

      // Snapshot previous value
      const previousIssue = queryClient.getQueryData<Issue>(issueKeys.detail(issueId))

      // Optimistically update
      if (previousIssue) {
        queryClient.setQueryData<Issue>(issueKeys.detail(issueId), {
          ...previousIssue,
          status,
          closedAt: status === 'closed' ? new Date().toISOString() : previousIssue.closedAt,
        })
      }

      return { previousIssue }
    },
    onError: (_err, { issueId }, context) => {
      // Rollback on error
      if (context?.previousIssue) {
        queryClient.setQueryData(issueKeys.detail(issueId), context.previousIssue)
      }
    },
    onSettled: (_data, _error, { issueId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) })
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
    },
  })
}

/**
 * Hook to update issue details
 */
export const useUpdateIssue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: UpdateIssueDTO }) =>
      issueService.updateIssue(issueId, data),
    onSuccess: (_data, variables) => {
      // Invalidate issue detail and lists
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(variables.issueId) })
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
    },
  })
}

/**
 * Hook to assign issue to a user
 */
export const useAssignIssue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, userId }: { issueId: string; userId: string }) =>
      issueService.assignIssue(issueId, userId),
    onSuccess: (_data, variables) => {
      // Invalidate issue detail and lists
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(variables.issueId) })
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
    },
  })
}

/**
 * Hook to unassign issue from a user
 */
export const useUnassignIssue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, userId }: { issueId: string; userId: string }) =>
      issueService.unassignIssue(issueId, userId),
    onSuccess: (_data, variables) => {
      // Invalidate issue detail and lists
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(variables.issueId) })
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
    },
  })
}

/**
 * Hook to add a label to an issue
 */
export const useAddLabel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, label }: { issueId: string; label: string }) =>
      issueService.addLabel(issueId, label),
    onMutate: async ({ issueId, label }) => {
      await queryClient.cancelQueries({ queryKey: issueKeys.detail(issueId) })

      const previousIssue = queryClient.getQueryData<Issue>(issueKeys.detail(issueId))

      if (previousIssue) {
        queryClient.setQueryData<Issue>(issueKeys.detail(issueId), {
          ...previousIssue,
          labels: [...previousIssue.labels, label],
        })
      }

      return { previousIssue }
    },
    onError: (_err, { issueId }, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(issueKeys.detail(issueId), context.previousIssue)
      }
    },
    onSettled: (_data, _error, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) })
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
    },
  })
}

/**
 * Hook to remove a label from an issue
 */
export const useRemoveLabel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, label }: { issueId: string; label: string }) =>
      issueService.removeLabel(issueId, label),
    onMutate: async ({ issueId, label }) => {
      await queryClient.cancelQueries({ queryKey: issueKeys.detail(issueId) })

      const previousIssue = queryClient.getQueryData<Issue>(issueKeys.detail(issueId))

      if (previousIssue) {
        queryClient.setQueryData<Issue>(issueKeys.detail(issueId), {
          ...previousIssue,
          labels: previousIssue.labels.filter((l) => l !== label),
        })
      }

      return { previousIssue }
    },
    onError: (_err, { issueId }, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(issueKeys.detail(issueId), context.previousIssue)
      }
    },
    onSettled: (_data, _error, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) })
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
    },
  })
}

/**
 * Hook to add a comment to an issue
 */
export const useAddIssueComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issueId, content }: { issueId: string; content: string }) =>
      issueService.addComment(issueId, content),
    onSuccess: (_data, variables) => {
      // Invalidate comments and issue detail (to update comment count)
      queryClient.invalidateQueries({ queryKey: issueKeys.comments(variables.issueId) })
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(variables.issueId) })
    },
  })
}

/**
 * Hook to fetch comments for an issue
 */
export const useIssueComments = (issueId: string) => {
  return useQuery({
    queryKey: issueKeys.comments(issueId),
    queryFn: () => issueService.getComments(issueId),
  })
}
