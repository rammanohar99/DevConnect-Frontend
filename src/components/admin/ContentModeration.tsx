import { useState } from 'react'
import { useHidePost, useDeleteComment } from '../../hooks/useAdmin'
import { usePosts } from '../../hooks/usePosts'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from 'sonner'
import { Trash2, EyeOff, AlertTriangle } from 'lucide-react'

interface ContentModerationProps {
  onSuccess?: () => void
}

export const ContentModeration = ({ onSuccess }: ContentModerationProps) => {
  const [postId, setPostId] = useState('')
  const [commentId, setCommentId] = useState('')
  const [postReason, setPostReason] = useState('')
  const [commentReason, setCommentReason] = useState('')
  const [selectedView, setSelectedView] = useState<'manual' | 'browse'>('browse')

  const hidePostMutation = useHidePost()
  const deleteCommentMutation = useDeleteComment()

  // Fetch recent posts for browsing
  const { data: postsData } = usePosts(undefined, { page: 1, limit: 10 })

  const handleHidePost = async (id?: string, reason?: string) => {
    const targetId = id || postId.trim()
    const targetReason = reason || postReason

    if (!targetId) {
      toast.error('Please enter a post ID')
      return
    }

    try {
      await hidePostMutation.mutateAsync({
        postId: targetId,
        data: { reason: targetReason || undefined },
      })
      setPostId('')
      setPostReason('')
      onSuccess?.()
      toast.success('Post hidden successfully', {
        description: targetReason || 'No reason provided',
      })
    } catch (error: any) {
      toast.error('Failed to hide post', {
        description: error.response?.data?.message || 'An error occurred',
      })
    }
  }

  const handleDeleteComment = async (id?: string, reason?: string) => {
    const targetId = id || commentId.trim()
    const targetReason = reason || commentReason

    if (!targetId) {
      toast.error('Please enter a comment  ID')
      return
    }

    try {
      await deleteCommentMutation.mutateAsync({
        commentId: targetId,
        data: { reason: targetReason || undefined },
      })
      setCommentId('')
      setCommentReason('')
      onSuccess?.()
      toast.success('Comment deleted successfully', {
        description: targetReason || 'No reason provided',
      })
    } catch (error: any) {
      toast.error('Failed to delete comment', {
        description: error.response?.data?.message || 'An error occurred',
      })
    }
  }

  const confirmHidePost = (postId: string, postTitle: string) => {
    const reason = prompt(`Enter reason for hiding "${postTitle}":`)
    if (reason !== null) {
      handleHidePost(postId, reason)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Content Moderation</h2>
            <div className="flex gap-2">
              <Button
                variant={selectedView === 'browse' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('browse')}
              >
                Browse Content
              </Button>
              <Button
                variant={selectedView === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('manual')}
              >
                Manual Entry
              </Button>
            </div>
          </div>

          {selectedView === 'manual' && (
            <>
              {/* Hide Post Section */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <EyeOff className="h-5 w-5" />
                  Hide Post
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Post ID
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter post ID to hide"
                      value={postId}
                      onChange={(e) => setPostId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason (optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Reason for hiding this post"
                      value={postReason}
                      onChange={(e) => setPostReason(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => handleHidePost()}
                    disabled={hidePostMutation.isPending}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {hidePostMutation.isPending ? 'Hiding...' : 'Hide Post'}
                  </Button>
                </div>
              </div>

              {/* Delete Comment Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Comment
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment ID
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter comment ID to delete"
                      value={commentId}
                      onChange={(e) => setCommentId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason (optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Reason for deleting this comment"
                      value={commentReason}
                      onChange={(e) => setCommentReason(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => handleDeleteComment()}
                    disabled={deleteCommentMutation.isPending}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete Comment'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {selectedView === 'browse' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Posts</h3>

              {postsData && postsData.posts.length > 0 ? (
                <div className="space-y-3">
                  {postsData.posts.map((post) => (
                    <Card key={post._id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg mb-1 truncate">{post.title}</h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>By @{post.author.username}</span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{post.likes.length} likes</span>
                            <span>•</span>
                            <span>{post.commentCount} comments</span>
                          </div>
                          {post.tags.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {post.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmHidePost(post._id, post.title)}
                            disabled={hidePostMutation.isPending}
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/posts/${post._id}`, '_blank')}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No posts found</p>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Hidden posts will be archived and no longer visible to users.
              Deleted comments are permanently removed. These actions are logged in the audit
              trail.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
