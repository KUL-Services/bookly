import { apiClient } from '../api-client'
import type { Branch, CreateBranchRequest, UpdateBranchRequest } from '../types'

export class BranchesService {
  // Admin only - Get branches for admin's business
  static async getBranches() {
    return apiClient.get<Branch[]>('/admin/branches')
  }

  // Admin only - Create branch
  static async createBranch(data: CreateBranchRequest) {
    const { staff, ...branchData } = data as any
    return apiClient.post<Branch>('/admin/branches', branchData)
  }

  // Admin only - Update branch
  static async updateBranch(data: UpdateBranchRequest) {
    const { staff, ...branchData } = data as any
    return apiClient.patch<Branch>('/admin/branches', branchData)
  }

  // Admin only - Toggle active status
  static async updateBranchStatus(id: string, isActive: boolean) {
    return apiClient.patch<Branch>(`/admin/branches/${id}/status`, { isActive })
  }

  // Admin only - Delete branch
  static async deleteBranch(id: string) {
    return apiClient.delete<Branch>(`/admin/branches/${id}`)
  }
}
