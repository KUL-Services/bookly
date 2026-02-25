import { apiClient } from '../api-client'
import type {
  ApiBookingPolicies,
  ApiNotificationSettings,
  ApiPaymentSettings,
  ApiSchedulingSettings,
  BusinessSettings
} from '../types'

export class SettingsService {
  // Get business settings
  static async getSettings() {
    return apiClient.get<BusinessSettings>('/admin/settings')
  }

  // Update business settings
  static async updateSettings(settings: Partial<BusinessSettings>) {
    return apiClient.patch<BusinessSettings>('/admin/settings', settings)
  }

  // Section updates - business settings endpoints
  static async updateSchedulingSettings(settings: Partial<ApiSchedulingSettings>) {
    return apiClient.patch<BusinessSettings>('/business/settings/scheduling', settings)
  }

  static async updateBookingPolicies(settings: Partial<ApiBookingPolicies>) {
    return apiClient.patch<BusinessSettings>('/business/settings/booking-policies', settings)
  }

  static async updateNotificationSettings(settings: Partial<ApiNotificationSettings>) {
    return apiClient.patch<BusinessSettings>('/business/settings/notifications', settings)
  }

  static async updatePaymentSettings(settings: Partial<ApiPaymentSettings>) {
    return apiClient.patch<BusinessSettings>('/business/settings/payment', settings)
  }

  // Admin mirrors
  static async updateSchedulingSettingsAdmin(settings: Partial<ApiSchedulingSettings>) {
    return apiClient.patch<BusinessSettings>('/admin/settings/scheduling', settings)
  }

  static async updateBookingPoliciesAdmin(settings: Partial<ApiBookingPolicies>) {
    return apiClient.patch<BusinessSettings>('/admin/settings/booking-policies', settings)
  }

  static async updateNotificationSettingsAdmin(settings: Partial<ApiNotificationSettings>) {
    return apiClient.patch<BusinessSettings>('/admin/settings/notifications', settings)
  }

  static async updatePaymentSettingsAdmin(settings: Partial<ApiPaymentSettings>) {
    return apiClient.patch<BusinessSettings>('/admin/settings/payment', settings)
  }
}
