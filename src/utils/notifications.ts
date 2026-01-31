/**
 * Notification utility for browser notifications and sounds
 */

import { playNotificationSound as playSound } from './soundGenerator'

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

/**
 * Show a browser notification
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options,
    })

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000)

    // Handle click - focus the window
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }
}

/**
 * Play notification sound
 */
export const playNotificationSound = (): void => {
  playSound()
}

/**
 * Show notification for new chat message
 */
export const showMessageNotification = (
  senderName: string,
  message: string,
  chatId: string
): void => {
  // Don't show notification if window is focused and user is viewing this chat
  const isWindowFocused = document.hasFocus()
  const currentPath = window.location.pathname
  const isViewingChat = currentPath === '/chat'

  // Always play sound for new messages
  playNotificationSound()

  // Only show browser notification if window is not focused or user is not viewing chat
  if (!isWindowFocused || !isViewingChat) {
    showNotification(`New message from ${senderName}`, {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      tag: `chat-${chatId}`, // Prevents duplicate notifications for same chat
      requireInteraction: false,
      silent: true, // We're playing our own sound
    })
  }
}

/**
 * Check if notifications are supported and enabled
 */
export const areNotificationsEnabled = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted'
}

/**
 * Initialize notifications on app load
 */
export const initializeNotifications = async (): Promise<void> => {
  // Request permission on first load
  const permission = await requestNotificationPermission()
  
  if (permission === 'granted') {
    console.log('✅ Notifications enabled')
  } else {
    console.log('⚠️ Notifications disabled')
  }
}
