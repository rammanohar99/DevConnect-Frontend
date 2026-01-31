import React from 'react'
import { NotificationItem, Notification } from './NotificationItem'
import { Button } from '../ui/button'
import { CheckCircle } from 'lucide-react'

interface NotificationListProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onNotificationClick?: (notification: Notification) => void
  isLoading?: boolean
}

/**
 * NotificationList component displays a dropdown list of notifications
 */
export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  isLoading = false,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="w-96 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-xs"
          >
            <CheckCircle className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-2 text-gray-400">
              <CheckCircle className="h-12 w-12" />
            </div>
            <p className="font-medium text-gray-900">You're all caught up!</p>
            <p className="text-sm text-gray-500">No new notifications</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onClick={onNotificationClick}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t bg-gray-50 px-4 py-2 text-center">
          <a
            href="/notifications"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  )
}

export default NotificationList
