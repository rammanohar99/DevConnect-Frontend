import React, { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '../ui/button'
import { NotificationList } from './NotificationList'
import { Notification } from './NotificationItem'

interface NotificationBellProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onNotificationClick?: (notification: Notification) => void
  isLoading?: boolean
}

/**
 * NotificationBell component displays a bell icon with unread count badge
 * and a dropdown list of notifications
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-2 rounded-lg border bg-white shadow-lg"
        >
          <NotificationList
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onNotificationClick={handleNotificationClick}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}

export default NotificationBell
