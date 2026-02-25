import { apiClient } from '../api-client'
import type { Staff, CreateStaffRequest, UpdateStaffRequest, BookingModeStatus } from '../types'

export class StaffService {
  // Admin only - Get staff members for admin's business
  static async getStaff() {
    return apiClient.get<Staff[]>('/admin/staff')
  }

  // Admin only - Create staff member
  static async createStaff(data: CreateStaffRequest) {
    return apiClient.post<Staff>('/admin/staff', data)
  }

  // Admin only - Update staff member
  static async updateStaff(data: UpdateStaffRequest) {
    return apiClient.patch<Staff>('/admin/staff', data)
  }

  // Admin only - Delete staff member
  static async deleteStaff(id: string) {
    return apiClient.delete<{ message: string }>(`/admin/staff/${id}`)
  }

  // Admin only - Cancel pending booking mode transition
  static async cancelBookingModeTransition(id: string) {
    return apiClient.delete<Staff>(`/admin/staff/${id}/booking-mode-transition`)
  }

  // Admin only - Get booking mode scheduling status
  static async getBookingModeStatus(id: string) {
    return apiClient.get<BookingModeStatus>(`/admin/staff/${id}/booking-mode-status`)
  }
}
