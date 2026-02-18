import { apiClient } from '../api-client'
import type { BusinessSettings } from '../types'

export class SettingsService {
  // Get business settings
  static async getSettings() {
    return apiClient.get<BusinessSettings>('/admin/settings')
  }

  // Update business settings
  static async updateSettings(settings: Partial<BusinessSettings>) {
    return apiClient.patch<BusinessSettings>('/admin/settings', settings)
  }
}
