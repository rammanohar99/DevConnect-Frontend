import { useSystemMetrics } from '../../hooks/useAdmin'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { RefreshCw } from 'lucide-react'

export const SystemMetrics = () => {
  const { data: metrics, isLoading, error, refetch, isRefetching } = useSystemMetrics()

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">Failed to load system metrics</div>
    )
  }

  if (!metrics) return null

  const metricCards = [
    {
      label: 'Total Users',
      value: metrics.userCount.toLocaleString(),
      icon: '👥',
    },
    {
      label: 'Total Posts',
      value: metrics.postCount.toLocaleString(),
      icon: '📝',
    },
    {
      label: 'Active Users',
      value: metrics.activeUsers.toLocaleString(),
      icon: '🟢',
    },
    {
      label: 'Total Issues',
      value: metrics.issueCount.toLocaleString(),
      icon: '🐛',
    },
    {
      label: 'Total Comments',
      value: metrics.commentCount.toLocaleString(),
      icon: '💬',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Metrics</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Last updated: {metrics ? new Date(metrics.timestamp).toLocaleTimeString() : '-'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{metric.label}</span>
              <span className="text-2xl">{metric.icon}</span>
            </div>
            <div className="text-3xl font-bold">{metric.value}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
