import api from './api'

// Types
export interface Post {
  _id: string
  author: {
    _id: string
    username: string
    profile: {
      name: string
      avatar?: string
    }
  }
  title: string
  content: string
  tags: string[]
  likes: string[]
  bookmarks: string[]
  commentCount: number
  viewCount: number
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  author: {
    _id: string
    username: string
    profile: {
      name: string
      avatar?: string
    }
  }
  post?: string
  issue?: string
  content: string
  likes: string[]
  parentComment?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePostDTO {
  title: string
  content: string
  tags?: string[]
  status?: 'draft' | 'published'
}

export interface PostFilters {
  tags?: string[]
  author?: string
  status?: 'draft' | 'published' | 'archived'
}

export interface Pagination {
  page: number
  limit: number
}

export interface PaginatedPosts {
  posts: Post[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export interface SearchFilters {
  tags?: string[]
  sortBy?: 'date' | 'popularity' | 'relevance'
}

// Post API functions
export const postService = {
  /**
   * Create a new post
   */
  createPost: async (data: CreatePostDTO): Promise<Post> => {
    const response = await api.post<{ status: string; data: { post: Post } }>('/posts', data)
    return response.data.data.post
  },

  /**
   * Get a single post by ID
   */
  getPost: async (postId: string): Promise<Post> => {
    const response = await api.get<{ status: string; data: { post: Post } }>(`/posts/${postId}`)
    return response.data.data.post
  },

  /**
   * List posts with pagination and filters
   */
  listPosts: async (filters?: PostFilters, pagination?: Pagination): Promise<PaginatedPosts> => {
    const params = {
      ...filters,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
    }
    const response = await api.get<{ status: string; data: PaginatedPosts }>('/posts', { params })
    // Backend returns { status, data: { posts, total, page, totalPages, hasMore } }
    const result = response.data.data
    console.log('[Post Service] listPosts response:', result)
    
    // Validate response structure
    if (!result || !Array.isArray(result.posts)) {
      console.error('[Post Service] Invalid response structure:', result)
      return {
        posts: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
      }
    }
    
    return result
  },

  /**
   * Like a post
   */
  likePost: async (postId: string): Promise<void> => {
    await api.post(`/posts/${postId}/like`)
  },

  /**
   * Unlike a post
   */
  unlikePost: async (postId: string): Promise<void> => {
    await api.delete(`/posts/${postId}/like`)
  },

  /**
   * Bookmark a post
   */
  bookmarkPost: async (postId: string): Promise<void> => {
    await api.post(`/posts/${postId}/bookmark`)
  },

  /**
   * Unbookmark a post
   */
  unbookmarkPost: async (postId: string): Promise<void> => {
    await api.delete(`/posts/${postId}/bookmark`)
  },

  /**
   * Add a comment to a post
   */
  addComment: async (postId: string, content: string): Promise<Comment> => {
    const response = await api.post<{ status: string; data: { comment: Comment } }>(
      `/posts/${postId}/comments`,
      { content }
    )
    return response.data.data.comment
  },

  /**
   * Get comments for a post
   */
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await api.get<{ status: string; data: { comments: Comment[] } }>(
      `/posts/${postId}/comments`
    )
    return response.data.data.comments
  },

  /**
   * Search posts
   */
  searchPosts: async (
    query: string,
    filters?: SearchFilters,
    pagination?: Pagination
  ): Promise<PaginatedPosts> => {
    const params = {
      q: query,
      ...filters,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
    }
    const response = await api.get<{ status: string; data: PaginatedPosts }>('/posts/search', {
      params,
    })
    const result = response.data.data
    console.log('[Post Service] searchPosts response:', result)
    
    // Validate response structure
    if (!result || !Array.isArray(result.posts)) {
      console.error('[Post Service] Invalid search response structure:', result)
      return {
        posts: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
      }
    }
    
    return result
  },
}
