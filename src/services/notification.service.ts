import api from './api'
import { Notification } from '../components/notifications'

export interface GetNotificationsParams {
  isRead?: boolean
  page?: number
  limit?: number
}

/**
 * Notification service for API calls
 */
class NotificationService {
  /**
   * Get user's notifications
   */
  async getNotifications(params?: GetNotificationsParams): Promise<Notification[]> {
    const response = await api.get<{ status: string; data: { notifications: Notification[] } }>(
      '/notifications',
      { params }
    )
    return response.data.data.notifications
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`)
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all')
  }
}

export const notificationService = new NotificationService()
export default notificationService
