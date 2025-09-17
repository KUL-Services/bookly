import { apiClient } from '../api-client'
import type { Staff, CreateStaffRequest, UpdateStaffRequest } from '../types'

export class StaffService {
  // Admin only - Get staff members for admin's business
  static async getStaff() {
    return apiClient.get<Staff[]>('/staff')
  }

  // Admin only - Create staff member
  static async createStaff(data: CreateStaffRequest) {
    return apiClient.post<Staff>('/staff', data)
  }

  // Admin only - Update staff member
  static async updateStaff(data: UpdateStaffRequest) {
    return apiClient.patch<Staff>('/staff', data)
  }

  // Admin only - Delete staff member
  static async deleteStaff(id: string) {
    return apiClient.delete<Staff>(`/staff/${id}`)
  }
}