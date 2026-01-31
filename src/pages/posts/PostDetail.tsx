import { useParams, useNavigate } from 'react-router-dom'
import { Heart, Bookmark, Eye, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  usePost,
  useLikePost,
  useUnlikePost,
  useBookmarkPost,
  useUnbookmarkPost,
} from '../../hooks/usePosts'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { CommentSection } from '../../components/posts/CommentSection'

export const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const { data: post, isLoading, isError, error } = usePost(postId!)
  const likePost = useLikePost()
  const unlikePost = useUnlikePost()
  const bookmarkPost = useBookmarkPost()
  const unbookmarkPost = useUnbookmarkPost()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-3/4 mb-4 rounded"></div>
          <div className="bg-gray-200 h-64 rounded"></div>
        </div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500">{error?.message || 'Post not found'}</p>
            <Button onClick={() => navigate('/posts')} className="mt-4">
              Back to Posts
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLiked = user ? post.likes.includes(user._id || user.id) : false
  const isBookmarked = user ? post.bookmarks.includes(user._id || user.id) : false

  const handleLike = () => {
    if (!user) return
    if (isLiked) {
      unlikePost.mutate(post._id)
    } else {
      likePost.mutate(post._id)
    }
  }

  const handleBookmark = () => {
    if (!user) return
    if (isBookmarked) {
      unbookmarkPost.mutate(post._id)
    } else {
      bookmarkPost.mutate(post._id)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Post Card */}
      <Card>
        <CardHeader>
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            {post.author.profile.avatar ? (
              <img
                src={post.author.profile.avatar}
                alt={post.author.profile.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-lg">
                  {post.author.profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-lg">{post.author.profile.name}</p>
              <p className="text-sm text-gray-500">@{post.author.username}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={!user}
                className="flex items-center gap-2"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{post.likes.length}</span>
              </Button>

              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="w-5 h-5" />
                <span>{post.viewCount}</span>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleBookmark} disabled={!user}>
              <Bookmark
                className={`w-5 h-5 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`}
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Post Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Metadata */}
          <div className="mt-8 pt-4 border-t text-sm text-gray-500">
            <p>
              Published on{' '}
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {post.updatedAt !== post.createdAt && (
              <p>
                Last updated on{' '}
                {new Date(post.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="mt-8">
        <CommentSection postId={post._id} />
      </div>
    </div>
  )
}
