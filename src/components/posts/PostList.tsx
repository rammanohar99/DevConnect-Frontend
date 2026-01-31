import { useEffect, useRef } from 'react'
import { useInfinitePosts } from '../../hooks/usePosts'
import { PostFilters } from '../../services/post.service'
import { PostCard } from './PostCard'
import { Button } from '../ui/button'

interface PostListProps {
  filters?: PostFilters
}

export const PostList = ({ filters }: PostListProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfinitePosts(filters)

  const observerTarget = useRef<HTMLDivElement>(null)

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading posts: {error.message}</p>
      </div>
    )
  }

  const posts = data?.pages.flatMap((page) => page?.posts || []) || []

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-10" />

      {isFetchingNextPage && (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading more posts...</p>
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">No more posts to load</p>
        </div>
      )}

      {/* Fallback button for browsers without Intersection Observer */}
      {hasNextPage && !isFetchingNextPage && (
        <div className="text-center py-4">
          <Button onClick={() => fetchNextPage()} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
