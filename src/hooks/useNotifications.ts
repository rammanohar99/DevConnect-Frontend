import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import notificationService from '../services/notification.service'
import socketService from '../services/socket.service'
import type { Notification } from '../components/notifications'
import { useAuthStore } from '../stores/authStore'

/**
 * Hook for managing notifications with real-time updates
 */
export const useNotifications = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    enabled: !!user,
  })

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications'])

      // Optimistically update
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        )
      )

      return { previousNotifications }
    },
    onError: (_err, _notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications'])

      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map((notification) => ({ ...notification, isRead: true }))
      )

      return { previousNotifications }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Set up socket listener for new notifications
  useEffect(() => {
    if (!user) return

    const socket = socketService.getSocket()
    if (!socket) return

    // Join user's notification room
    socketService.joinRoom(`user:${user._id || user.id}`)

    // Listen for new notifications
    const handleNewNotification = (notification: Notification) => {
      console.log('[Notifications] New notification received:', notification)

      // Add to cache
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => [
        notification,
        ...old,
      ])

      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('DevConnect Pro', {
          body: notification.message,
          icon: notification.actor.profile.avatar,
        })
      }
    }

    socketService.on('notification', handleNewNotification)

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Clean up
    return () => {
      socketService.off('notification', handleNewNotification)
    }
  }, [user, queryClient])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  }
}

/**
 * Hook for marking a notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      // Update cache
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        )
      )
    },
  })

  return {
    markAsRead: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export default useNotifications
