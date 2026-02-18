import { apiClient } from '../api-client'
import type { Notification } from '../types'

export class NotificationsService {
  // Get all notifications for the authenticated user/business
  static async getNotifications() {
    return apiClient.get<Notification[]>('/notifications')
  }

  // Mark a notification as read
  static async markAsRead(notificationId: string) {
    return apiClient.patch<Notification>(`/notifications/${notificationId}/read`)
  }
}
