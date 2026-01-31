import { useState } from 'react'
import { SystemMetrics } from '../../components/admin/SystemMetrics'
import { ContentModeration } from '../../components/admin/ContentModeration'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Shield, AlertTriangle } from 'lucide-react'

export const ModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation'>('overview')

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'moderation' as const, label: 'Moderation', icon: '🛡️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Moderator Dashboard</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Moderate content and monitor community health
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Moderator Permissions</h3>
              <p className="text-sm text-blue-800">
                As a moderator, you can hide posts, delete comments, and view system metrics. 
                You cannot manage users or view audit logs (admin only).
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <SystemMetrics />
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-20"
                    onClick={() => setActiveTab('moderation')}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🛡️</div>
                      <div className="text-sm">Moderate Content</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20"
                    onClick={() => window.open('/posts', '_blank')}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📝</div>
                      <div className="text-sm">View All Posts</div>
                    </div>
                  </Button>
                </div>
              </Card>

              {/* Moderator Guidelines */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Moderation Guidelines</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p>Always provide a clear reason when hiding posts or deleting comments</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p>Review content carefully before taking action</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p>Focus on content that violates community guidelines</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <p>Don't moderate based on personal opinions or preferences</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <p>Don't take action without proper justification</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'moderation' && <ContentModeration />}
        </div>
      </div>
    </div>
  )
}
