import { Issue } from '../../services/issue.service'

interface IssueStatusBadgeProps {
  status: Issue['status']
  className?: string
}

export const IssueStatusBadge = ({ status, className = '' }: IssueStatusBadgeProps) => {
  const statusConfig = {
    open: {
      label: 'Open',
      className: 'bg-green-100 text-green-700 border-green-300',
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    closed: {
      label: 'Closed',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
  }

  const config = statusConfig[status]

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  )
}

interface IssuePriorityBadgeProps {
  priority: Issue['priority']
  className?: string
}

export const IssuePriorityBadge = ({ priority, className = '' }: IssuePriorityBadgeProps) => {
  const priorityConfig = {
    low: {
      label: 'Low',
      className: 'bg-gray-100 text-gray-700',
    },
    medium: {
      label: 'Medium',
      className: 'bg-yellow-100 text-yellow-700',
    },
    high: {
      label: 'High',
      className: 'bg-orange-100 text-orange-700',
    },
    critical: {
      label: 'Critical',
      className: 'bg-red-100 text-red-700',
    },
  }

  const config = priorityConfig[priority]

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${config.className} ${className}`}>
      {config.label}
    </span>
  )
}
