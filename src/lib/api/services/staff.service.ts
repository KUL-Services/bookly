import { apiClient } from '../api-client'
import type { Staff, CreateStaffRequest, UpdateStaffRequest } from '../types'

export class StaffService {
  // Admin only - Get staff members for admin's business
  static async getStaff() {
    return apiClient.get<Staff[]>('/staff')
  }

  // Admin only - Create staff member (API spec only supports name and mobile)
  static async createStaff(data: CreateStaffRequest) {
    // Remove branchIds as it's not supported by API spec
    const { branchIds, ...staffData } = data
    return apiClient.post<Staff>('/staff', staffData)
  }

  // Admin only - Update staff member (API spec only supports id, name and mobile)
  static async updateStaff(data: UpdateStaffRequest) {
    // Remove branchIds as it's not supported by API spec
    const { branchIds, ...staffData } = data
    return apiClient.patch<Staff>('/staff', staffData)
  }

  // Admin only - Delete staff member
  static async deleteStaff(id: string) {
    return apiClient.delete<Staff>(`/staff/${id}`)
  }
}