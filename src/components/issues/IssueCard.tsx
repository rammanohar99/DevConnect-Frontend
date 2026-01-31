import { MessageCircle, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Issue } from '../../services/issue.service'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { IssueStatusBadge, IssuePriorityBadge } from './IssueStatusBadge'

interface IssueCardProps {
  issue: Issue
}

export const IssueCard = ({ issue }: IssueCardProps) => {
  // Truncate description for preview
  const descriptionPreview =
    issue.description.length > 150 ? issue.description.substring(0, 150) + '...' : issue.description

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return 'Today'
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Link to={`/issues/${issue._id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <IssueStatusBadge status={issue.status} />
                <IssuePriorityBadge priority={issue.priority} />
              </div>
              <h3 className="text-lg font-bold">{issue.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            {issue.creator.profile.avatar ? (
              <img
                src={issue.creator.profile.avatar}
                alt={issue.creator.profile.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 text-xs font-semibold">
                  {issue.creator.profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span>
              {issue.creator.profile.name} opened {formatDate(issue.createdAt)}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-gray-700 mb-3">{descriptionPreview}</p>

          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {issue.labels.map((label) => (
                <span
                  key={label}
                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {issue.assignees.length > 0 && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div className="flex -space-x-2">
                {issue.assignees.slice(0, 3).map((assignee) => (
                  <div key={assignee._id} className="relative">
                    {assignee.profile.avatar ? (
                      <img
                        src={assignee.profile.avatar}
                        alt={assignee.profile.name}
                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        title={assignee.profile.name}
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center"
                        title={assignee.profile.name}
                      >
                        <span className="text-gray-600 text-xs font-semibold">
                          {assignee.profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {issue.assignees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-semibold">
                      +{issue.assignees.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-600">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{issue.commentCount}</span>
          </div>

          {issue.closedAt && (
            <span className="text-sm text-gray-500">Closed {formatDate(issue.closedAt)}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}
