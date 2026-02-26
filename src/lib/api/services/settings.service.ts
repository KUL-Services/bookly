import { apiClient } from '../api-client'
import type {
  ApiBookingPolicies,
  ApiCalendarSettings,
  ApiCustomerSettings,
  ApiNotificationSettings,
  ApiPaymentSettings,
  ApiBrandingSettings,
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

  static async updateCalendarSettings(settings: Partial<ApiCalendarSettings>) {
    return apiClient.patch<BusinessSettings>('/business/settings/calendar', settings)
  }

  static async updateBrandingSettings(settings: Partial<ApiBrandingSettings>) {
    return apiClient.patch<BusinessSettings>('/business/settings/branding', settings)
  }

  static async updateCustomerSettings(settings: Partial<ApiCustomerSettings>) {
    return apiClient.patch<BusinessSettings>('/business/settings/customer', settings)
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

  static async updateCalendarSettingsAdmin(settings: Partial<ApiCalendarSettings>) {
    return apiClient.patch<BusinessSettings>('/admin/settings/calendar', settings)
  }

  static async updateBrandingSettingsAdmin(settings: Partial<ApiBrandingSettings>) {
    return apiClient.patch<BusinessSettings>('/admin/settings/branding', settings)
  }

  static async updateCustomerSettingsAdmin(settings: Partial<ApiCustomerSettings>) {
    return apiClient.patch<BusinessSettings>('/admin/settings/customer', settings)
  }
}
