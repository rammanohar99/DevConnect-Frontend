import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MessageCircle, Heart } from 'lucide-react'
import { useComments, useAddComment } from '../../hooks/usePosts'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface CommentSectionProps {
  postId: string
}

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
})

type CommentFormData = z.infer<typeof commentSchema>

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const user = useAuthStore((state) => state.user)
  const { data: comments, isLoading, isError } = useComments(postId)
  const addComment = useAddComment()
  const [isCommenting, setIsCommenting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  })

  const onSubmit = async (data: CommentFormData) => {
    try {
      await addComment.mutateAsync({
        postId,
        content: data.content,
      })
      reset()
      setIsCommenting(false)
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments {comments && `(${comments.length})`}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Add Comment Form */}
        {user ? (
          <div className="mb-6">
            {!isCommenting ? (
              <Button onClick={() => setIsCommenting(true)} variant="outline" className="w-full">
                Add a comment
              </Button>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <textarea
                  {...register('content')}
                  placeholder="Write your comment..."
                  className={`w-full min-h-[100px] p-3 border rounded-md ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting || addComment.isPending} size="sm">
                    {isSubmitting || addComment.isPending ? 'Posting...' : 'Post Comment'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCommenting(false)
                      reset()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                {addComment.isError && (
                  <p className="text-red-500 text-sm">Failed to post comment. Please try again.</p>
                )}
              </form>
            )}
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
            <p className="text-gray-600">Please log in to comment</p>
          </div>
        )}

        {/* Comments List */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-20 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {isError && <p className="text-red-500 text-center py-4">Failed to load comments</p>}

        {comments && comments.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}

        {comments && comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="p-4 border border-gray-200 rounded-lg">
                {/* Comment Author */}
                <div className="flex items-center gap-3 mb-3">
                  {comment.author.profile.avatar ? (
                    <img
                      src={comment.author.profile.avatar}
                      alt={comment.author.profile.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-semibold">
                        {comment.author.profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{comment.author.profile.name}</p>
                    <p className="text-xs text-gray-500">@{comment.author.username}</p>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-gray-700 mb-2">{comment.content}</p>

                {/* Comment Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{comment.likes.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
