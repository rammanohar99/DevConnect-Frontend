import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
} from '@tanstack/react-query'
import {
  postService,
  Post,
  CreatePostDTO,
  PostFilters,
  Pagination,
  SearchFilters,
} from '../services/post.service'
import { useAuthStore } from '../stores/authStore'

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters?: PostFilters) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  search: (query: string, filters?: SearchFilters) =>
    [...postKeys.all, 'search', query, filters] as const,
  comments: (postId: string) => [...postKeys.all, 'comments', postId] as const,
}

/**
 * Hook to fetch a single post
 */
export const usePost = (postId: string, options?: UseQueryOptions<Post>) => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => postService.getPost(postId),
    ...options,
  })
}

/**
 * Hook to fetch posts with pagination
 */
export const usePosts = (filters?: PostFilters, pagination?: Pagination) => {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => postService.listPosts(filters, pagination),
  })
}

/**
 * Hook to fetch posts with infinite scroll
 */
export const useInfinitePosts = (filters?: PostFilters, limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: postKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => postService.listPosts(filters, { page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      // Add safety check for undefined lastPage
      if (!lastPage || typeof lastPage.page !== 'number' || typeof lastPage.totalPages !== 'number') {
        console.error('[useInfinitePosts] Invalid lastPage structure:', lastPage)
        return undefined
      }
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })
}

/**
 * Hook to create a new post
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostDTO) => postService.createPost(data),
    onSuccess: () => {
      // Invalidate posts list to refetch
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

/**
 * Hook to like a post
 */
export const useLikePost = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: (postId: string) => postService.likePost(postId),
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) })

      // Snapshot previous value
      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(postId))

      // Optimistically update
      if (previousPost && user) {
        queryClient.setQueryData<Post>(postKeys.detail(postId), {
          ...previousPost,
          likes: [...previousPost.likes, user._id || user.id],
        })
      }

      return { previousPost }
    },
    onError: (_err, postId, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost)
      }
    },
    onSettled: (_data, _error, postId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
    },
  })
}

/**
 * Hook to unlike a post
 */
export const useUnlikePost = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: (postId: string) => postService.unlikePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) })

      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(postId))

      if (previousPost && user) {
        queryClient.setQueryData<Post>(postKeys.detail(postId), {
          ...previousPost,
          likes: previousPost.likes.filter((id) => id !== (user._id || user.id)),
        })
      }

      return { previousPost }
    },
    onError: (_err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost)
      }
    },
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
    },
  })
}

/**
 * Hook to bookmark a post
 */
export const useBookmarkPost = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: (postId: string) => postService.bookmarkPost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) })

      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(postId))

      if (previousPost && user) {
        queryClient.setQueryData<Post>(postKeys.detail(postId), {
          ...previousPost,
          bookmarks: [...previousPost.bookmarks, user._id || user.id],
        })
      }

      return { previousPost }
    },
    onError: (_err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost)
      }
    },
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
    },
  })
}

/**
 * Hook to unbookmark a post
 */
export const useUnbookmarkPost = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: (postId: string) => postService.unbookmarkPost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) })

      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(postId))

      if (previousPost && user) {
        queryClient.setQueryData<Post>(postKeys.detail(postId), {
          ...previousPost,
          bookmarks: previousPost.bookmarks.filter((id) => id !== (user._id || user.id)),
        })
      }

      return { previousPost }
    },
    onError: (_err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost)
      }
    },
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
    },
  })
}

/**
 * Hook to add a comment to a post
 */
export const useAddComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      postService.addComment(postId, content),
    onSuccess: (_data, variables) => {
      // Invalidate comments and post detail (to update comment count)
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) })
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) })
    },
  })
}

/**
 * Hook to fetch comments for a post
 */
export const useComments = (postId: string) => {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: () => postService.getComments(postId),
  })
}

/**
 * Hook to search posts
 */
export const useSearchPosts = (query: string, filters?: SearchFilters, pagination?: Pagination) => {
  return useQuery({
    queryKey: postKeys.search(query, filters),
    queryFn: () => postService.searchPosts(query, filters, pagination),
    enabled: query.length > 0, // Only search if query is not empty
  })
}

/**
 * Hook to search posts with infinite scroll
 */
export const useInfiniteSearchPosts = (
  query: string,
  filters?: SearchFilters,
  limit: number = 10
) => {
  return useInfiniteQuery({
    queryKey: postKeys.search(query, filters),
    queryFn: ({ pageParam = 1 }) =>
      postService.searchPosts(query, filters, { page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      // Add safety check for undefined lastPage
      if (!lastPage || typeof lastPage.page !== 'number' || typeof lastPage.totalPages !== 'number') {
        console.error('[useInfiniteSearchPosts] Invalid lastPage structure:', lastPage)
        return undefined
      }
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    enabled: query.length > 0,
  })
}
