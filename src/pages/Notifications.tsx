import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { Bell, Check, Filter } from 'lucide-react'

export default function Notifications() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6" />
                <div>
                  <CardTitle>Notifications</CardTitle>
                  {unreadCount > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {filter === 'all' ? 'Show Unread' : 'Show All'}
                </Button>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
                    <Check className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : "You don't have any notifications yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
