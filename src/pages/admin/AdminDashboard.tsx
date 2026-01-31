import { useState } from 'react'
import { SystemMetrics } from '../../components/admin/SystemMetrics'
import { UserManagement } from '../../components/admin/UserManagement'
import { ContentModeration } from '../../components/admin/ContentModeration'
import { useAuditLogs } from '../../hooks/useAdmin'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { FileText, Shield } from 'lucide-react'

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'audit'>(
    'overview'
  )
  const [auditPage, setAuditPage] = useState(1)

  const { data: auditData, isLoading: auditLoading } = useAuditLogs(auditPage, 20)

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'users' as const, label: 'Users', icon: '👥' },
    { id: 'moderation' as const, label: 'Moderation', icon: '🛡️' },
    { id: 'audit' as const, label: 'Audit Logs', icon: '📋' },
  ]

  const formatActionName = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Manage users, moderate content, and monitor system health
          </p>
        </div>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20" onClick={() => setActiveTab('users')}>
                    <div className="text-center">
                      <div className="text-2xl mb-1">👥</div>
                      <div className="text-sm">Manage Users</div>
                    </div>
                  </Button>
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
                  <Button variant="outline" className="h-20" onClick={() => setActiveTab('audit')}>
                    <div className="text-center">
                      <div className="text-2xl mb-1">📋</div>
                      <div className="text-sm">View Audit Logs</div>
                    </div>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'moderation' && <ContentModeration />}

          {activeTab === 'audit' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Audit Logs
                </h2>
              </div>

              {auditLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              )}

              {auditData && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admin
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Target
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auditData.logs.map((log) => (
                          <tr key={log._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.adminId.username}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {formatActionName(log.action)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.targetType}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              <details className="cursor-pointer">
                                <summary className="text-blue-600 hover:text-blue-800">
                                  View Details
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-md">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-700">
                      Showing {(auditPage - 1) * 20 + 1} to{' '}
                      {Math.min(auditPage * 20, auditData.total)} of {auditData.total} logs
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                        disabled={auditPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAuditPage((p) => p + 1)}
                        disabled={auditPage >= auditData.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
