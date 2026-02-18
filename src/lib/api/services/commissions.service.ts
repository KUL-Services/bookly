import { apiClient } from '../api-client'
import type { Commission, CreateCommissionRequest } from '../types'

export class CommissionsService {
  // Admin only - Get all commissions for the business
  static async getCommissions() {
    return apiClient.get<Commission[]>('/admin/commissions')
  }

  // Admin only - Create commission
  static async createCommission(data: CreateCommissionRequest) {
    return apiClient.post<Commission>('/admin/commissions', data)
  }

  // Admin only - Delete commission
  static async deleteCommission(id: string) {
    return apiClient.delete<{ message: string }>(`/admin/commissions/${id}`)
  }
}
