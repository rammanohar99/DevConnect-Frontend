import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Bell, Heart, MessageCircle, AtSign, AlertCircle } from 'lucide-react'

export interface Notification {
  _id: string
  recipient: string
  type: 'like' | 'comment' | 'mention' | 'issue_assigned' | 'message'
  actor: {
    _id: string
    username: string
    profile: {
      avatar?: string
      name: string
    }
  }
  resource?: {
    type: 'post' | 'issue' | 'comment' | 'message'
    id: string
  }
  message: string
  isRead: boolean
  createdAt: string
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (notificationId: string) => void
  onClick?: (notification: Notification) => void
}

/**
 * NotificationItem component displays a single notification
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClick,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'mention':
        return <AtSign className="h-5 w-5 text-purple-500" />
      case 'issue_assigned':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'message':
        return <Bell className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return ''
    }
  }

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id)
    }
    onClick?.(notification)
  }

  return (
    <div
      className={`flex cursor-pointer gap-3 border-b p-4 transition-colors hover:bg-gray-50 ${
        !notification.isRead ? 'bg-blue-50' : 'bg-white'
      }`}
      onClick={handleClick}
    >
      {/* Actor avatar */}
      <div className="flex-shrink-0">
        {notification.actor.profile.avatar ? (
          <img
            src={notification.actor.profile.avatar}
            alt={notification.actor.username}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-700">
            {notification.actor.profile.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Notification content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 pt-1">{getIcon()}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{notification.actor.profile.name}</span>{' '}
              {notification.message}
            </p>
            <p className="mt-1 text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  )
}

export default NotificationItem
