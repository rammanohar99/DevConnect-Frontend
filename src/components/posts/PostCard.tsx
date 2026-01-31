import { Heart, Bookmark, MessageCircle, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Post } from '../../services/post.service'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import {
  useLikePost,
  useUnlikePost,
  useBookmarkPost,
  useUnbookmarkPost,
} from '../../hooks/usePosts'
import { useAuthStore } from '../../stores/authStore'

interface PostCardProps {
  post: Post
}

export const PostCard = ({ post }: PostCardProps) => {
  const user = useAuthStore((state) => state.user)
  const likePost = useLikePost()
  const unlikePost = useUnlikePost()
  const bookmarkPost = useBookmarkPost()
  const unbookmarkPost = useUnbookmarkPost()

  const isLiked = user ? post.likes.includes(user._id || user.id) : false
  const isBookmarked = user ? post.bookmarks.includes(user._id || user.id) : false

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) return

    if (isLiked) {
      unlikePost.mutate(post._id)
    } else {
      likePost.mutate(post._id)
    }
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) return

    if (isBookmarked) {
      unbookmarkPost.mutate(post._id)
    } else {
      bookmarkPost.mutate(post._id)
    }
  }

  // Truncate content for preview
  const contentPreview =
    post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content

  return (
    <Link to={`/posts/${post._id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {post.author.profile.avatar ? (
              <img
                src={post.author.profile.avatar}
                alt={post.author.profile.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {post.author.profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold">{post.author.profile.name}</p>
              <p className="text-sm text-gray-500">@{post.author.username}</p>
            </div>
          </div>
          <h3 className="text-xl font-bold">{post.title}</h3>
        </CardHeader>

        <CardContent>
          <p className="text-gray-700 mb-4">{contentPreview}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="flex items-center gap-1"
              disabled={!user}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{post.likes.length}</span>
            </Button>

            <div className="flex items-center gap-1 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentCount}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-600">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount}</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleBookmark} disabled={!user}>
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
