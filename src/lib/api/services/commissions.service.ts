import { apiClient } from '../api-client'
import type { Commission, CreateCommissionRequest, UpdateCommissionRequest } from '../types'

export class CommissionsService {
  // Admin only - Get all commissions for the business
  static async getCommissions(staffId?: string) {
    const query = staffId ? `?staffId=${encodeURIComponent(staffId)}` : ''
    return apiClient.get<Commission[]>(`/admin/commissions${query}`)
  }

  // Admin only - Create commission
  static async createCommission(data: CreateCommissionRequest) {
    return apiClient.post<Commission>('/admin/commissions', data)
  }

  // Admin only - Update commission
  static async updateCommission(data: UpdateCommissionRequest) {
    return apiClient.patch<Commission>(`/admin/commissions/${data.id}`, {
      staffId: data.staffId,
      type: data.type,
      value: data.value,
      scope: data.scope,
      ...(data.scopeId && { scopeId: data.scopeId })
    })
  }

  // Admin only - Delete commission
  static async deleteCommission(id: string) {
    return apiClient.delete<{ message: string }>(`/admin/commissions/${id}`)
  }
}
