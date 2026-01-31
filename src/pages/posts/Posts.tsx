import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PostList } from '../../components/posts/PostList'
import { SearchBar } from '../../components/posts/SearchBar'
import { TagFilter } from '../../components/posts/TagFilter'
import { SortOptions, SortOption } from '../../components/posts/SortOptions'
import { Button } from '../../components/ui/button'
import { useAuthStore } from '../../stores/authStore'
import { useInfiniteSearchPosts } from '../../hooks/usePosts'
import { PostCard } from '../../components/posts/PostCard'

export const Posts = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)

  // Get initial values from URL params
  const initialQuery = searchParams.get('q') || ''
  const initialTags = searchParams.get('tags')?.split(',').filter(Boolean) || []
  const initialSort = (searchParams.get('sort') as SortOption) || 'date'

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)
  const [sortBy, setSortBy] = useState<SortOption>(initialSort)

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (searchQuery) {
      params.set('q', searchQuery)
    }

    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','))
    }

    if (sortBy !== 'date') {
      params.set('sort', sortBy)
    }

    setSearchParams(params, { replace: true })
  }, [searchQuery, selectedTags, sortBy, setSearchParams])

  // Use search if query exists, otherwise use regular list
  const isSearching = searchQuery.length > 0
  const searchResults = useInfiniteSearchPosts(searchQuery, {
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    sortBy,
  })

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags)
  }

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Posts</h1>
            {user && (
              <Link to="/posts/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              onSearch={handleSearchChange}
              initialValue={searchQuery}
              placeholder="Search posts by title or content..."
            />
          </div>

          {/* Sort Options */}
          <div className="mb-6 flex justify-end">
            <SortOptions currentSort={sortBy} onSortChange={handleSortChange} />
          </div>

          {/* Posts List or Search Results */}
          {isSearching ? (
            <div>
              {searchResults.isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.isError && (
                <div className="text-center py-8">
                  <p className="text-red-500">Error loading search results</p>
                </div>
              )}

              {searchResults.data && searchResults.data.pages && (
                <div className="space-y-4">
                  {searchResults.data.pages.flatMap((page) => page?.posts || []).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No posts found matching your search</p>
                    </div>
                  ) : (
                    <>
                      {searchResults.data.pages
                        .flatMap((page) => page?.posts || [])
                        .map((post) => (
                          <PostCard key={post._id} post={post} />
                        ))}

                      {searchResults.hasNextPage && (
                        <div className="text-center py-4">
                          <Button
                            onClick={() => searchResults.fetchNextPage()}
                            disabled={searchResults.isFetchingNextPage}
                            variant="outline"
                          >
                            {searchResults.isFetchingNextPage ? 'Loading...' : 'Load More'}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <PostList
              filters={{
                tags: selectedTags.length > 0 ? selectedTags : undefined,
              }}
            />
          )}
        </div>

        {/* Sidebar - Filters */}
        <div className="lg:w-80">
          <div className="sticky top-4">
            <TagFilter selectedTags={selectedTags} onTagsChange={handleTagsChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
