import { apiClient } from '../api-client'
import type {
  Notification,
  RegisterPushTokenRequest,
  PushTokenRecord,
  DeletePushTokenRequest,
  DeletePushTokenResponse
} from '../types'

export class NotificationsService {
  // Get all notifications for the authenticated user/business
  static async getNotifications() {
    return apiClient.get<Notification[]>('/notifications')
  }

  // Mark a notification as read
  static async markAsRead(notificationId: string) {
    return apiClient.patch<Notification>(`/notifications/${notificationId}/read`)
  }

  // Register/refresh an FCM token for the current identity.
  static async registerPushToken(data: RegisterPushTokenRequest) {
    return apiClient.post<PushTokenRecord>('/notifications/push-tokens', data)
  }

  // Unregister/deactivate an FCM token for the current identity.
  static async deletePushToken(data: DeletePushTokenRequest) {
    return apiClient.delete<DeletePushTokenResponse>('/notifications/push-tokens', {
      body: JSON.stringify(data)
    })
  }
}
