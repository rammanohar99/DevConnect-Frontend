import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useIssue,
  useUpdateIssueStatus,
  useAddIssueComment,
  useIssueComments,
} from '../../hooks/useIssues'
import { useAuthStore } from '../../stores/authStore'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { IssueStatusBadge, IssuePriorityBadge } from '../../components/issues/IssueStatusBadge'
import { LabelManager } from '../../components/issues/LabelManager'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Loader2, ArrowLeft, MessageCircle } from 'lucide-react'

export const IssueDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [commentContent, setCommentContent] = useState('')

  const { data: issue, isLoading, isError } = useIssue(id!)
  const { data: comments = [] } = useIssueComments(id!)
  const updateStatus = useUpdateIssueStatus()
  const addComment = useAddIssueComment()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (isError || !issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load issue</p>
          <Button onClick={() => navigate('/issues')}>Back to Issues</Button>
        </div>
      </div>
    )
  }

  const handleStatusChange = async (status: 'open' | 'in-progress' | 'closed') => {
    try {
      await updateStatus.mutateAsync({ issueId: issue._id, status })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    try {
      await addComment.mutateAsync({ issueId: issue._id, content: commentContent })
      setCommentContent('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const canEdit = Boolean(
    user && ((user._id || user.id) === issue.creator._id || user.role === 'admin' || user.role === 'moderator')
  )

  // Valid status transitions
  const getValidTransitions = (
    currentStatus: 'open' | 'in-progress' | 'closed'
  ): Array<'open' | 'in-progress' | 'closed'> => {
    const transitions: Record<
      'open' | 'in-progress' | 'closed',
      Array<'open' | 'in-progress' | 'closed'>
    > = {
      open: ['in-progress', 'closed'],
      'in-progress': ['open', 'closed'],
      closed: ['open'],
    }
    return transitions[currentStatus]
  }

  const validTransitions = getValidTransitions(issue.status)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/issues')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Issues
      </Button>

      {/* Issue Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <IssueStatusBadge status={issue.status} />
                <IssuePriorityBadge priority={issue.priority} />
              </div>
              <h1 className="text-3xl font-bold mb-4">{issue.title}</h1>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                {issue.creator.profile.avatar ? (
                  <img
                    src={issue.creator.profile.avatar}
                    alt={issue.creator.profile.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-semibold">
                      {issue.creator.profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-semibold">{issue.creator.profile.name}</span>
                  <span className="text-gray-500">
                    {' '}
                    opened this issue on {formatDate(issue.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Change Dropdown */}
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={updateStatus.isPending}>
                    Change Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {validTransitions.map((status) => (
                    <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                      {status === 'in-progress'
                        ? 'In Progress'
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Labels */}
          <LabelManager issueId={issue._id} labels={issue.labels} canEdit={canEdit} />

          {/* Assignees */}
          {issue.assignees.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Assignees</h4>
              <div className="flex flex-wrap gap-2">
                {issue.assignees.map((assignee) => (
                  <div
                    key={assignee._id}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                  >
                    {assignee.profile.avatar ? (
                      <img
                        src={assignee.profile.avatar}
                        alt={assignee.profile.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-semibold">
                          {assignee.profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm">{assignee.profile.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-xl font-bold">Comments ({issue.commentCount})</h2>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Comment List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
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
                      <span className="font-semibold">{comment.author.profile.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          )}

          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleAddComment} className="mt-6 pt-6 border-t">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add a comment..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={addComment.isPending || !commentContent.trim()}>
                  {addComment.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
